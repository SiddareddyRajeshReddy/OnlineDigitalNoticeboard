import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { announcementAPI } from '../lib/api';
import { Bell, ExternalLink, Calendar, User, Clock } from 'lucide-react';

const PriorityBadge = ({ priority }) => {
  const styles = {
    low: 'bg-gray-100 text-gray-600',
    medium: 'bg-blue-100 text-blue-700',
    high: 'bg-orange-100 text-orange-700',
    urgent: 'bg-red-100 text-red-700'
  };
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${styles[priority] || 'bg-gray-100'}`}>
      {priority}
    </span>
  );
};

// Helper function to determine if color is light or dark
const isLightColor = (hexColor) => {
  if (!hexColor) return true;
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 155;
};

const PublicAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [allAnnouncements, setAllAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  useEffect(() => {
    filterAnnouncements();
  }, [selectedCategory, allAnnouncements]);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const response = await announcementAPI.getPublished();
      setAllAnnouncements(response.data || []);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load announcements');
    }
    setLoading(false);
  };

  const filterAnnouncements = () => {
    if (!selectedCategory) {
      setAnnouncements(allAnnouncements);
    } else {
      const filtered = allAnnouncements.filter(
        (a) => a.category_id === selectedCategory
      );
      setAnnouncements(filtered);
    }
  };

  // Get unique categories from all announcements
  const categories = Array.from(
    new Map(
      allAnnouncements
        .filter((a) => a.category_name && a.category_id)
        .map((a) => [
          a.category_id, 
          { 
            id: a.category_id, 
            name: a.category_name, 
            color: a.color_code || '#6b7280' 
          }
        ])
    ).values()
  );

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-6xl mx-auto px-6 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Bell className="w-8 h-8 text-red-700" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Institute's</h1>
                  <p className="text-sm text-gray-500">Digital Notice Board</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Link
                  to="/committee/login"
                  className="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                >
                  Committee Login
                </Link>
                <Link
                  to="/admin/login"
                  className="px-4 py-2 text-sm bg-red-700 text-white rounded hover:bg-red-800 transition-colors"
                >
                  Admin Login
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Banner */}
        <div className="bg-gradient-to-r from-red-700 to-red-600 text-white py-12 shadow-lg">
          <div className="max-w-6xl mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold mb-2">Announcements & Notices</h2>
            <p className="text-red-100">Stay updated with the latest news from NIT Sikkim</p>
          </div>
        </div>

        <main className="max-w-6xl mx-auto px-6 py-8">
          {/* Category Filter */}
          {categories.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Filter by Category</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`px-4 py-2 text-sm rounded-lg font-medium transition-all ${
                    !selectedCategory
                      ? 'bg-red-700 text-white shadow-md scale-105'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All Categories ({allAnnouncements.length})
                </button>
                {categories.map((cat) => {
                  const count = allAnnouncements.filter(a => a.category_id === cat.id).length;
                  const isActive = selectedCategory === cat.id;
                  const textColor = isActive && !isLightColor(cat.color) ? 'white' : 'gray-800';
                  
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-4 py-2 text-sm rounded-lg font-medium transition-all ${
                        isActive ? 'shadow-md scale-105' : 'hover:scale-105'
                      }`}
                      style={{
                        backgroundColor: isActive ? cat.color : cat.color + '20',
                        color: isActive ? (isLightColor(cat.color) ? '#1f2937' : 'white') : cat.color,
                        borderWidth: '2px',
                        borderColor: cat.color
                      }}
                    >
                      {cat.name} ({count})
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
              <p className="font-medium">Error</p>
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Loading */}
          {loading ? (
            <div className="text-center py-16">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-red-700"></div>
              <p className="mt-4 text-gray-500">Loading announcements...</p>
            </div>
          ) : announcements.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-lg shadow-sm border border-gray-200">
              <Bell className="w-20 h-20 mx-auto mb-4 text-gray-300" />
              <p className="text-xl font-semibold text-gray-700 mb-2">
                {selectedCategory
                  ? 'No announcements in this category'
                  : 'No announcements at this time'}
              </p>
              <p className="text-gray-500">Check back later for updates</p>
            </div>
          ) : (
            <div className="grid gap-5">
              {announcements.map((announcement) => {
                const categoryColor = announcement.color_code || '#6b7280';
                const isLight = isLightColor(categoryColor);
                
                return (
                  <div
                    key={announcement.announcement_id}
                    className="bg-white rounded-lg border-2 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                    style={{
                      borderLeftWidth: '6px',
                      borderLeftColor: categoryColor
                    }}
                  >
                    {/* Color-coded header bar */}
                    <div 
                      className="px-6 py-3"
                      style={{
                        backgroundColor: categoryColor + '15',
                        borderBottom: `2px solid ${categoryColor}30`
                      }}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3 flex-wrap">
                          {announcement.category_name && (
                            <span
                              className="px-4 py-1.5 rounded-full text-sm font-bold shadow-sm"
                              style={{
                                backgroundColor: categoryColor,
                                color: isLight ? '#1f2937' : 'white'
                              }}
                            >
                              {announcement.category_name}
                            </span>
                          )}
                          <PriorityBadge priority={announcement.priority} />
                        </div>
                        {announcement.url && (
                          <a
                            href={announcement.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-sm font-medium text-red-700 hover:text-red-800 hover:underline transition-colors"
                          >
                            <ExternalLink className="w-4 h-4" />
                            View Details
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-3 leading-tight">
                        {announcement.title}
                      </h3>

                      <p className="text-gray-700 mb-4 whitespace-pre-wrap leading-relaxed">
                        {announcement.content}
                      </p>

                      {/* Footer metadata */}
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 pt-4 border-t-2 border-gray-100">
                        {announcement.announcer_name && (
                          <span className="flex items-center gap-1.5 font-medium">
                            <User className="w-4 h-4 text-gray-500" />
                            {announcement.announcer_name}
                          </span>
                        )}
                        {announcement.published_at && (
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            {new Date(announcement.published_at).toLocaleDateString('en-IN', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                        )}
                        {announcement.expires_at && (
                          <span className="flex items-center gap-1.5 text-orange-600 font-medium">
                            <Clock className="w-4 h-4" />
                            Expires: {new Date(announcement.expires_at).toLocaleDateString('en-IN')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
      
      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16 py-8 shadow-inner">
        <div className="max-w-6xl mx-auto px-6 text-center text-sm text-gray-600">
          <p className="font-medium">© {new Date().getFullYear()} Online Institute's Digital Notice Board System</p>
          <p className="text-gray-500 mt-1">All rights reserved.</p>
        </div>
      </footer>
    </>
  );
};

export default PublicAnnouncements;