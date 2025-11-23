import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { committeeAPI, announcementAPI } from '../lib/api';

const StatusBadge = ({ status }) => {
  const styles = {
    draft: 'bg-gray-200 text-gray-700',
    pending: 'bg-yellow-200 text-yellow-800',
    approved: 'bg-blue-200 text-blue-800',
    rejected: 'bg-red-200 text-red-800',
    published: 'bg-green-200 text-green-800'
  };
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${styles[status] || 'bg-gray-200'}`}>
      {status}
    </span>
  );
};

const PriorityBadge = ({ priority }) => {
  const styles = {
    low: 'border-gray-400 text-gray-600',
    medium: 'border-blue-400 text-blue-600',
    high: 'border-orange-400 text-orange-600',
    urgent: 'border-red-500 text-red-600'
  };
  return (
    <span className={`px-2 py-0.5 rounded border text-xs font-medium ${styles[priority] || 'border-gray-400'}`}>
      {priority}
    </span>
  );
};

function CommitteeDashboard({ user, setUser }) {
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchAnnouncements();
  }, [filter]);

  const fetchAnnouncements = async () => {
    setLoading(true);
    setError('');
    try {
      let response;
      if (filter === 'all') {
        response = await announcementAPI.getAll();
      } else {
        response = await announcementAPI.getByStatus(filter);
      }
      setAnnouncements(response.data || []);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    try {
      await committeeAPI.logout();
      setUser(null);
      navigate('/committee/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const handleSubmit = async (id) => {
    if (!window.confirm('Submit this announcement for admin approval?')) return;
    try {
      await announcementAPI.publish(id);
      setSuccess('Announcement submitted for approval');
      fetchAnnouncements();
    } catch (err) {
      setError(err.message);
    }
  };

  const counts = {
    all: announcements.length,
    draft: announcements.filter(a => a.status === 'draft').length,
    pending: announcements.filter(a => a.status === 'pending').length,
    published: announcements.filter(a => a.status === 'published').length,
    rejected: announcements.filter(a => a.status === 'rejected').length
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-red-700 rounded flex items-center justify-center">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <h1 className="text-lg font-bold text-gray-800">Committee Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user?.full_name}</span>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-600 hover:text-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-gray-600 text-sm mb-1">Total</div>
            <p className="text-2xl font-semibold">{counts.all}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-gray-600 text-sm mb-1">Drafts</div>
            <p className="text-2xl font-semibold">{counts.draft}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-yellow-600 text-sm mb-1">Pending</div>
            <p className="text-2xl font-semibold">{counts.pending}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-green-600 text-sm mb-1">Published</div>
            <p className="text-2xl font-semibold">{counts.published}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-red-600 text-sm mb-1">Rejected</div>
            <p className="text-2xl font-semibold">{counts.rejected}</p>
          </div>
        </div>

        {/* Actions Row */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-2">
            {['all', 'draft', 'pending', 'published', 'rejected'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 text-sm rounded ${
                  filter === f
                    ? 'bg-red-700 text-white'
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
          <Link
            to="/committee/announcements/create"
            className="px-4 py-2 bg-red-700 text-white rounded hover:bg-red-800"
          >
            + New Announcement
          </Link>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded flex justify-between">
            <span>{error}</span>
            <button onClick={() => setError('')}>×</button>
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded flex justify-between">
            <span>{success}</span>
            <button onClick={() => setSuccess('')}>×</button>
          </div>
        )}

        {/* Announcements List */}
        <div className="bg-white rounded-lg border border-gray-200">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading...</div>
          ) : announcements.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No announcements found. Create your first announcement!
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {announcements.map((announcement) => (
                <div key={announcement.announcement_id} className="p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-gray-900">
                          {announcement.title}
                        </h3>
                        <StatusBadge status={announcement.status} />
                        <PriorityBadge priority={announcement.priority} />
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                        {announcement.content}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        {announcement.category_name && (
                          <span
                            className="px-2 py-0.5 rounded"
                            style={{ 
                              backgroundColor: announcement.color_code + '20', 
                              color: announcement.color_code 
                            }}
                          >
                            {announcement.category_name}
                          </span>
                        )}
                        <span>Created: {new Date(announcement.created_at).toLocaleDateString()}</span>
                        {announcement.expires_at && (
                          <span>Expires: {new Date(announcement.expires_at).toLocaleDateString()}</span>
                        )}
                        {announcement.published_at && (
                          <span>Published: {new Date(announcement.published_at).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      {announcement.status === 'draft' && (
                        <>
                          <Link
                            to={`/committee/announcements/edit/${announcement.announcement_id}`}
                            className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => handleSubmit(announcement.announcement_id)}
                            className="px-3 py-1 text-sm bg-red-700 text-white rounded hover:bg-red-800"
                          >
                            Submit
                          </button>
                        </>
                      )}
                      {announcement.status === 'rejected' && (
                        <Link
                          to={`/committee/announcements/edit/${announcement.announcement_id}`}
                          className="px-3 py-1 text-sm border border-red-300 text-red-600 rounded hover:bg-red-50"
                        >
                          Edit & Resubmit
                        </Link>
                      )}
                      {announcement.status === 'pending' && (
                        <span className="px-3 py-1 text-sm text-gray-500">
                          Awaiting approval
                        </span>
                      )}
                      {announcement.status === 'published' && (
                        <span className="px-3 py-1 text-sm text-green-600">
                          Live
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default CommitteeDashboard;