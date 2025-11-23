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

const PublicAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    fetchAnnouncements();
  }, [selectedCategory]);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      let response;
      if (selectedCategory) {
        response = await announcementAPI.getByCategory(selectedCategory);
      } else {
        response = await announcementAPI.getPublished();
      }
      setAnnouncements(response.data || []);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  // Get unique categories from announcements
  const categories = [...new Set(announcements.map(a => a.category_name).filter(Boolean))];

  return (
    <>
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Bell className="w-8 h-8 text-red-700" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">NIT Sikkim</h1>
                <p className="text-sm text-gray-500">Digital Notice Board</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Link
                to="/committee/login"
                className="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50"
              >
                Committee Login
              </Link>
              <Link
                to="/admin/login"
                className="px-4 py-2 text-sm bg-red-700 text-white rounded hover:bg-red-800"
              >
                Admin Login
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <div className="bg-red-700 text-white py-12">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-2">Announcements & Notices</h2>
          <p className="text-red-100">Stay updated with the latest news from NIT Sikkim</p>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Category Filter */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-3 py-1.5 text-sm rounded ${
                !selectedCategory
                  ? 'bg-red-700 text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  const ann = announcements.find(a => a.category_name === cat);
                  if (ann?.category_id) setSelectedCategory(ann.category_id);
                }}
                className="px-3 py-1.5 text-sm bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading announcements...</div>
        ) : announcements.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500">No announcements at this time</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {announcements.map((announcement) => (
              <div
                key={announcement.announcement_id}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    {announcement.category_name && (
                      <span
                        className="px-2 py-0.5 rounded text-xs font-medium"
                        style={{
                          backgroundColor: announcement.color_code + '20',
                          color: announcement.color_code
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
                      className="flex items-center gap-1 text-sm text-red-700 hover:underline"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View Details
                    </a>
                  )}
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {announcement.title}
                </h3>

                <p className="text-gray-600 mb-4 whitespace-pre-wrap">
                  {announcement.content}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 pt-4 border-t border-gray-100">
                  {announcement.announcer_name && (
                    <span className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {announcement.announcer_name}
                    </span>
                  )}
                  {announcement.published_at && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(announcement.published_at).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  )}
                  {announcement.expires_at && (
                    <span className="flex items-center gap-1 text-orange-600">
                      <Clock className="w-4 h-4" />
                      Expires: {new Date(announcement.expires_at).toLocaleDateString('en-IN')}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
    </div>
     <footer className="bg-white border-t border-gray-200 mt-12 py-6">
        <div className="max-w-6xl mx-auto px-6 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} National Institute of Technology Sikkim. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
};

export default PublicAnnouncements;