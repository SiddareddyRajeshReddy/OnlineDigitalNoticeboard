import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI, announcementAPI, categoryAPI } from '../lib/api';

function AdminDashboard({ user, setUser }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('committees');
  const [stats, setStats] = useState({});
  const [announcements, setAnnouncements] = useState([]);
  const [pendingCommittees, setPendingCommittees] = useState([]);
  const [pendingAnnouncements, setPendingAnnouncements] = useState([]);
  const [pendingCategories, setPendingCategories] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [expiredAnnouncements, setExpiredAnnouncements] = useState([]);
  const [rejectedAnnouncements, setRejectedAnnouncements] = useState([]);
  const [rejectedCategories, setRejectedCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [showAddAdmin, setShowAddAdmin] = useState(false);
  const [adminForm, setAdminForm] = useState({ email: '', name: '', password: '', phone: '' });
  const [adminLoading, setAdminLoading] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchStats = async () => {
    try {
      const response = await adminAPI.getDashboardStats();
      setStats(response.stats || {});
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      if (activeTab === 'committees') {
        const response = await adminAPI.getPendingCommittees();
        setPendingCommittees(response.data || []);
      } else if (activeTab === 'announcements') {
        const response = await adminAPI.getPendingAnnouncements();
        setPendingAnnouncements(response.data || []);
      } else if (activeTab === 'categories') {
        const response = await categoryAPI.getPending();
        setPendingCategories(response.data || []);
      } else if (activeTab === 'allCategories') {
        const response = await categoryAPI.getAll();
        setAllCategories(response.data || []);
      } else if (activeTab === 'published') {
        const response = await announcementAPI.getPublished();
        setAnnouncements(response.data || []);
      } else if (activeTab === 'expired') {
        const response = await adminAPI.getExpiredAnnouncements();
        setExpiredAnnouncements(response.data || []);
      } else if (activeTab === 'rejectedAnnouncements') {
        const response = await adminAPI.getRejectedAnnouncements();
        setRejectedAnnouncements(response.data || []);
      } else if (activeTab === 'rejectedCategories') {
        const response = await adminAPI.getRejectedCategories();
        setRejectedCategories(response.data || []);
      }
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    try {
      await adminAPI.logout();
      setUser(null);
      navigate('/admin/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const handleApproveCommittee = async (id) => {
    try {
      await adminAPI.approveCommittee(id);
      setSuccess('Committee member approved');
      fetchData();
      fetchStats();
    } catch (err) { setError(err.message); }
  };

  const handleRejectCommittee = async (id) => {
    if (!window.confirm('Reject this committee member?')) return;
    try {
      await adminAPI.rejectCommittee(id);
      setSuccess('Committee member rejected');
      fetchData();
      fetchStats();
    } catch (err) { setError(err.message); }
  };

  const handleApproveAnnouncement = async (id) => {
    try {
      await adminAPI.approveAnnouncement(id);
      setSuccess('Announcement published');
      fetchData();
      fetchStats();
    } catch (err) { setError(err.message); }
  };

  const handleRejectAnnouncement = async (id) => {
    if (!window.confirm('Reject this announcement?')) return;
    try {
      await adminAPI.rejectAnnouncement(id);
      setSuccess('Announcement rejected');
      fetchData();
      fetchStats();
    } catch (err) { setError(err.message); }
  };

  const handleApproveCategory = async (id) => {
    try {
      await categoryAPI.approve(id);
      setSuccess('Category approved');
      fetchData();
      fetchStats();
    } catch (err) { setError(err.message); }
  };

  const handleRejectCategory = async (id) => {
    if (!window.confirm('Reject this category?')) return;
    try {
      await categoryAPI.reject(id);
      setSuccess('Category rejected');
      fetchData();
      fetchStats();
    } catch (err) { setError(err.message); }
  };

  const handleDeleteAnnouncement = async (id) => {
    if (!window.confirm('Delete this announcement?')) return;
    try {
      await announcementAPI.delete(id);
      setSuccess('Announcement deleted');
      fetchData();
      fetchStats();
    } catch (err) { setError(err.message); }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Permanently delete this category?')) return;
    try {
      await categoryAPI.delete(id);
      setSuccess('Category deleted successfully');
      fetchData();
      fetchStats();
    } catch (err) { setError(err.message); }
  };

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!adminForm.email || !adminForm.name || !adminForm.password) {
      return setError('Email, name, and password are required');
    }
    if (adminForm.password.length <= 6) {
      return setError('Password must be more than 6 characters');
    }
    setAdminLoading(true);
    try {
      await adminAPI.addAdmin(adminForm);
      setSuccess('New admin added');
      setAdminForm({ email: '', name: '', password: '', phone: '' });
      setShowAddAdmin(false);
    } catch (err) { setError(err.message); }
    setAdminLoading(false);
  };

  const tabs = [
    { id: 'committees', label: `Pending Committees${stats.pending_committees ? ` (${stats.pending_committees})` : ''}` },
    { id: 'announcements', label: `Pending Announcements${stats.pending_announcements ? ` (${stats.pending_announcements})` : ''}` },
    { id: 'categories', label: `Pending Categories${stats.pending_categories ? ` (${stats.pending_categories})` : ''}` },
    { id: 'published', label: `Active Announcements${stats.active_announcements ? ` (${stats.active_announcements})` : ''}` },
    { id: 'allCategories', label: `Active Categories${stats.active_categories ? ` (${stats.active_categories})` : ''}` },
    { id: 'expired', label: `Expired${stats.expired_announcements ? ` (${stats.expired_announcements})` : ''}` },
    { id: 'rejectedAnnouncements', label: `Rejected Announcements${stats.rejected_announcements ? ` (${stats.rejected_announcements})` : ''}` },
    { id: 'rejectedCategories', label: `Rejected Categories${stats.rejected_categories ? ` (${stats.rejected_categories})` : ''}` },
    { id: 'admins', label: 'Manage Admins' },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-red-700 rounded flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <h1 className="text-lg font-bold text-gray-800">Admin Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user?.name}</span>
            <button onClick={handleLogout} className="text-sm text-gray-600 hover:text-red-700">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg border-2 border-yellow-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Pending Requests</span>
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-bold rounded">
                Awaiting
              </span>
            </div>
            <p className="text-3xl font-bold text-yellow-600">
              {(stats.pending_committees || 0) + (stats.pending_announcements || 0) + (stats.pending_categories || 0)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {stats.pending_committees || 0} committees · {stats.pending_announcements || 0} announcements · {stats.pending_categories || 0} categories
            </p>
          </div>

          <div className="bg-white p-4 rounded-lg border-2 border-green-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Active</span>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-bold rounded">
                Live
              </span>
            </div>
            <p className="text-3xl font-bold text-green-600">
              {(stats.active_announcements || 0) + (stats.active_categories || 0)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {stats.active_announcements || 0} announcements · {stats.active_categories || 0} categories
            </p>
          </div>

          <div className="bg-white p-4 rounded-lg border-2 border-orange-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Expired</span>
              <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-bold rounded">
                Past Due
              </span>
            </div>
            <p className="text-3xl font-bold text-orange-600">
              {stats.expired_announcements || 0}
            </p>
            <p className="text-xs text-gray-500 mt-1">Announcements</p>
          </div>

          <div className="bg-white p-4 rounded-lg border-2 border-red-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Rejected</span>
              <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-bold rounded">
                Declined
              </span>
            </div>
            <p className="text-3xl font-bold text-red-600">
              {(stats.rejected_announcements || 0) + (stats.rejected_categories || 0)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {stats.rejected_announcements || 0} announcements · {stats.rejected_categories || 0} categories
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-gray-200 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px whitespace-nowrap ${activeTab === tab.id
                  ? 'border-red-700 text-red-700'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
                }`}
            >
              {tab.label}
            </button>
          ))}
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

        {/* Tab Content - Committees */}
        {activeTab === 'committees' && (
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h2 className="font-semibold text-gray-800">Pending Committee Approvals</h2>
            </div>
            {loading ? (
              <div className="p-8 text-center text-gray-500">Loading...</div>
            ) : pendingCommittees.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No pending approvals</div>
            ) : (
              <div className="divide-y divide-gray-200">
                {pendingCommittees.map((c) => (
                  <div key={c.committee_id} className="p-4 flex justify-between items-center">
                    <div>
                      <h3 className="font-medium text-gray-900">{c.full_name}</h3>
                      <p className="text-sm text-gray-600">{c.email}</p>
                      <p className="text-sm text-gray-500">Phone: {c.phone}</p>
                      <p className="text-xs text-gray-400">
                        Registered: {new Date(c.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleApproveCommittee(c.committee_id)}
                        className="px-4 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700">
                        Approve
                      </button>
                      <button onClick={() => handleRejectCommittee(c.committee_id)}
                        className="px-4 py-2 text-sm border border-red-300 text-red-600 rounded hover:bg-red-50">
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab Content - Pending Announcements */}
        {activeTab === 'announcements' && (
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h2 className="font-semibold text-gray-800">Pending Announcement Approvals</h2>
            </div>
            {loading ? (
              <div className="p-8 text-center text-gray-500">Loading...</div>
            ) : pendingAnnouncements.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No pending announcements</div>
            ) : (
              <div className="divide-y divide-gray-200">
                {pendingAnnouncements.map((a) => (
                  <div key={a.announcement_id} className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-gray-900">{a.title}</h3>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${a.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                              a.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                                a.priority === 'medium' ? 'bg-blue-100 text-blue-700' :
                                  'bg-gray-100 text-gray-700'
                            }`}>{a.priority}</span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{a.content}</p>
                        <div className="flex gap-4 text-xs text-gray-500">
                          <span>By: {a.announcer_name || 'Unknown'}</span>
                          {a.category_name && (
                            <span
                              className="px-2 py-0.5 rounded font-medium"
                              style={{ backgroundColor: a.color_code + '20', color: a.color_code }}
                            >
                              {a.category_name}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button onClick={() => handleApproveAnnouncement(a.announcement_id)}
                          className="px-4 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700">
                          Approve
                        </button>
                        <button onClick={() => handleRejectAnnouncement(a.announcement_id)}
                          className="px-4 py-2 text-sm border border-red-300 text-red-600 rounded hover:bg-red-50">
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Continue with other tabs... (categories, allCategories, published, expired, rejected) */}
        {/* The rest of the tab content remains similar but I'll include key ones */}

        {/* Expired Announcements Tab */}
        {activeTab === 'expired' && (
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h2 className="font-semibold text-gray-800">Expired Announcements</h2>
            </div>
            {loading ? (
              <div className="p-8 text-center text-gray-500">Loading...</div>
            ) : expiredAnnouncements.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No expired announcements</div>
            ) : (
              <div className="divide-y divide-gray-200">
                {expiredAnnouncements.map((a) => (
                  <div key={a.announcement_id} className="p-4 flex justify-between items-start bg-orange-50">
                    <div>
                      <h3 className="font-medium text-gray-900">{a.title}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2">{a.content}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Expired: {new Date(a.expires_at).toLocaleDateString()}
                      </p>
                    </div>
                    <button onClick={() => handleDeleteAnnouncement(a.announcement_id)}
                      className="px-3 py-1 text-sm text-red-600 border border-red-300 rounded hover:bg-red-50">
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Rejected Announcements Tab */}
        {activeTab === 'rejectedAnnouncements' && (
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h2 className="font-semibold text-gray-800">Rejected Announcements</h2>
            </div>
            {loading ? (
              <div className="p-8 text-center text-gray-500">Loading...</div>
            ) : rejectedAnnouncements.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No rejected announcements</div>
            ) : (
              <div className="divide-y divide-gray-200">
                {rejectedAnnouncements.map((a) => (
                  <div key={a.announcement_id} className="p-4 flex justify-between items-start bg-red-50">
                    <div>
                      <h3 className="font-medium text-gray-900">{a.title}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2">{a.content}</p>
                      <div className="flex gap-4 text-xs text-gray-500 mt-2">
                        <span>By: {a.announcer_name}</span>
                        {a.rejected_by_name && <span>Rejected by: {a.rejected_by_name}</span>}
                      </div>
                    </div>
                    <button onClick={() => handleDeleteAnnouncement(a.announcement_id)}
                      className="px-3 py-1 text-sm text-red-600 border border-red-300 rounded hover:bg-red-100">
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {activeTab === 'categories' && (
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h2 className="font-semibold text-gray-800">Pending Category Approvals</h2>
            </div>
            {loading ? (
              <div className="p-8 text-center text-gray-500">Loading...</div>
            ) : pendingCategories.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No pending categories</div>
            ) : (
              <div className="divide-y divide-gray-200">
                {pendingCategories.map((c) => (
                  <div key={c.category_id} className="p-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded flex items-center justify-center text-white font-bold text-lg"
                        style={{ backgroundColor: c.color_code || '#6b7280' }}
                      >
                        {c.dept_associated?.substring(0, 2)}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{c.name}</h3>
                        <p className="text-sm text-gray-600">Dept: {c.dept_associated}</p>
                        <p className="text-xs text-gray-500">By: {c.created_by_name}</p>
                        <p className="text-xs text-gray-400">
                          Color: <span className="font-mono">{c.color_code}</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleApproveCategory(c.category_id)}
                        className="px-4 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700">
                        Approve
                      </button>
                      <button onClick={() => handleRejectCategory(c.category_id)}
                        className="px-4 py-2 text-sm border border-red-300 text-red-600 rounded hover:bg-red-50">
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'allCategories' && (
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h2 className="font-semibold text-gray-800">All Approved Categories</h2>
            </div>
            {loading ? (
              <div className="p-8 text-center text-gray-500">Loading...</div>
            ) : allCategories.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No approved categories yet</div>
            ) : (
              <div className="divide-y divide-gray-200">
                {allCategories.map((c) => (
                  <div key={c.category_id} className="p-4 flex justify-between items-center hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded flex items-center justify-center text-white font-bold text-lg"
                        style={{ backgroundColor: c.color_code || '#6b7280' }}
                      >
                        {c.dept_associated?.substring(0, 2)}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{c.name}</h3>
                        <p className="text-sm text-gray-600">Department: {c.dept_associated}</p>
                        <p className="text-xs text-gray-400">
                          Color: <span className="font-mono">{c.color_code}</span>
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteCategory(c.category_id)}
                      className="px-3 py-1 text-sm text-red-600 border border-red-300 rounded hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'published' && (
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h2 className="font-semibold text-gray-800">Published Announcements</h2>
            </div>
            {loading ? (
              <div className="p-8 text-center text-gray-500">Loading...</div>
            ) : announcements.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No published announcements</div>
            ) : (
              <div className="divide-y divide-gray-200">
                {announcements.map((a) => (
                  <div key={a.announcement_id} className="p-4 flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900">{a.title}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2">{a.content}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Published: {new Date(a.published_at).toLocaleDateString()}
                      </p>
                    </div>
                    <button onClick={() => handleDeleteAnnouncement(a.announcement_id)}
                      className="px-3 py-1 text-sm text-red-600 border border-red-300 rounded hover:bg-red-50">
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'admins' && (
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="font-semibold text-gray-800">Manage Admins</h2>
              <button onClick={() => setShowAddAdmin(!showAddAdmin)}
                className="px-4 py-2 bg-red-700 text-white text-sm rounded hover:bg-red-800">
                Add Admin
              </button>
            </div>
            {showAddAdmin && (
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <form onSubmit={handleAddAdmin} className="space-y-4 max-w-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                      <input type="text" value={adminForm.name}
                        onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-red-500 focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                      <input type="email" value={adminForm.email}
                        onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-red-500 focus:outline-none" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                      <input type="password" value={adminForm.password}
                        onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-red-500 focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <input type="tel" value={adminForm.phone}
                        onChange={(e) => setAdminForm({ ...adminForm, phone: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-red-500 focus:outline-none" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button type="submit" disabled={adminLoading}
                      className="px-4 py-2 bg-red-700 text-white rounded hover:bg-red-800 disabled:opacity-50">
                      {adminLoading ? 'Adding...' : 'Add Admin'}
                    </button>
                    <button type="button" onClick={() => setShowAddAdmin(false)}
                      className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50">
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
            <div className="p-8 text-center text-gray-500">
              Use the button above to add new administrators
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default AdminDashboard;