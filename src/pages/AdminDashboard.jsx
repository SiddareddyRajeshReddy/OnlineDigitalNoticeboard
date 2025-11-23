import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI, announcementAPI, categoryAPI } from '../lib/api';

function AdminDashboard({ user, setUser }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('committees');
  const [announcements, setAnnouncements] = useState([]);
  const [pendingCommittees, setPendingCommittees] = useState([]);
  const [pendingAnnouncements, setPendingAnnouncements] = useState([]);
  const [pendingCategories, setPendingCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [showAddAdmin, setShowAddAdmin] = useState(false);
  const [adminForm, setAdminForm] = useState({ email: '', name: '', password: '', phone: '' });
  const [adminLoading, setAdminLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

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
      } else if (activeTab === 'published') {
        const response = await announcementAPI.getPublished();
        setAnnouncements(response.data || []);
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
    } catch (err) { setError(err.message); }
  };

  const handleRejectCommittee = async (id) => {
    if (!window.confirm('Reject this committee member?')) return;
    try {
      await adminAPI.rejectCommittee(id);
      setSuccess('Committee member rejected');
      fetchData();
    } catch (err) { setError(err.message); }
  };

  const handleApproveAnnouncement = async (id) => {
    try {
      await adminAPI.approveAnnouncement(id);
      setSuccess('Announcement published');
      fetchData();
    } catch (err) { setError(err.message); }
  };

  const handleRejectAnnouncement = async (id) => {
    if (!window.confirm('Reject this announcement?')) return;
    try {
      await adminAPI.rejectAnnouncement(id);
      setSuccess('Announcement rejected');
      fetchData();
    } catch (err) { setError(err.message); }
  };

  const handleApproveCategory = async (id) => {
    try {
      await categoryAPI.approve(id);
      setSuccess('Category approved');
      fetchData();
    } catch (err) { setError(err.message); }
  };

  const handleRejectCategory = async (id) => {
    if (!window.confirm('Reject this category?')) return;
    try {
      await categoryAPI.reject(id);
      setSuccess('Category rejected');
      fetchData();
    } catch (err) { setError(err.message); }
  };

  const handleDeleteAnnouncement = async (id) => {
    if (!window.confirm('Delete this announcement?')) return;
    try {
      await announcementAPI.delete(id);
      setSuccess('Announcement deleted');
      fetchData();
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
    { id: 'committees', label: 'Pending Committees' },
    { id: 'announcements', label: 'Pending Announcements' },
    { id: 'categories', label: 'Pending Categories' },
    { id: 'published', label: 'Published' },
    { id: 'admins', label: 'Manage Admins' },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
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

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-gray-200 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px whitespace-nowrap ${
                activeTab === tab.id
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

        {/* Pending Committees */}
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

        {/* Pending Announcements */}
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
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                            a.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                            a.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                            a.priority === 'medium' ? 'bg-blue-100 text-blue-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>{a.priority}</span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{a.content}</p>
                        <div className="flex gap-4 text-xs text-gray-500">
                          <span>By: {a.announcer_name || 'Unknown'}</span>
                          <span>Category: {a.category_name || 'None'}</span>
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

        {/* Pending Categories */}
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
                        className="w-10 h-10 rounded flex items-center justify-center text-white font-bold"
                        style={{ backgroundColor: c.color_code || '#6b7280' }}
                      >
                        {c.dept_associated?.substring(0, 2)}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{c.name}</h3>
                        <p className="text-sm text-gray-600">Dept: {c.dept_associated}</p>
                        <p className="text-xs text-gray-500">By: {c.created_by_name}</p>
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

        {/* Published Announcements */}
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

        {/* Manage Admins */}
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