import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { committeeAPI, announcementAPI, categoryAPI } from '../lib/api';

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
  const [activeTab, setActiveTab] = useState('announcements');
  const [announcements, setAnnouncements] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filter, setFilter] = useState('all');
  
  // Category form state
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    dept_associated: '',
    color_code: '#6b7280'
  });
  const [categoryLoading, setCategoryLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'announcements') {
      fetchAnnouncements();
    } else if (activeTab === 'categories') {
      fetchMyCategories();
    }
  }, [activeTab, filter]);

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

  const fetchMyCategories = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await categoryAPI.getMy();
      setCategories(response.data || []);
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

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!categoryForm.name || !categoryForm.dept_associated) {
      return setError('Category name and department are required');
    }
    
    if (categoryForm.dept_associated.length > 4) {
      return setError('Department code must be 4 characters or less');
    }
    
    setCategoryLoading(true);
    try {
      await categoryAPI.create(categoryForm);
      setSuccess('Category created and submitted for approval');
      setCategoryForm({ name: '', dept_associated: '', color_code: '#6b7280' });
      setShowCategoryForm(false);
      fetchMyCategories();
    } catch (err) {
      setError(err.message);
    }
    setCategoryLoading(false);
  };

  const counts = {
    all: announcements.length,
    draft: announcements.filter(a => a.status === 'draft').length,
    pending: announcements.filter(a => a.status === 'pending').length,
    published: announcements.filter(a => a.status === 'published').length,
    rejected: announcements.filter(a => a.status === 'rejected').length
  };

  const categoryCounts = {
    all: categories.length,
    pending: categories.filter(c => c.status === 'pending').length,
    approved: categories.filter(c => c.status === 'approved').length,
    rejected: categories.filter(c => c.status === 'rejected').length
  };

  return (
    <div className="min-h-screen bg-gray-100">
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
            <button onClick={handleLogout} className="text-sm text-gray-600 hover:text-red-700">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Tab Navigation */}
        <div className="flex gap-1 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('announcements')}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
              activeTab === 'announcements'
                ? 'border-red-700 text-red-700'
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            Announcements
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
              activeTab === 'categories'
                ? 'border-red-700 text-red-700'
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            Categories
          </button>
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

        {/* Announcements Tab */}
        {activeTab === 'announcements' && (
          <>
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
                            <h3 className="font-medium text-gray-900">{announcement.title}</h3>
                            <StatusBadge status={announcement.status} />
                            <PriorityBadge priority={announcement.priority} />
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                            {announcement.content}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            {announcement.category_name && (
                              <span
                                className="px-2 py-0.5 rounded font-medium"
                                style={{ 
                                  backgroundColor: announcement.color_code + '20', 
                                  color: announcement.color_code 
                                }}
                              >
                                {announcement.category_name}
                              </span>
                            )}
                            <span>Created: {new Date(announcement.created_at).toLocaleDateString()}</span>
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
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="text-gray-600 text-sm mb-1">Total</div>
                <p className="text-2xl font-semibold">{categoryCounts.all}</p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="text-yellow-600 text-sm mb-1">Pending</div>
                <p className="text-2xl font-semibold">{categoryCounts.pending}</p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="text-green-600 text-sm mb-1">Approved</div>
                <p className="text-2xl font-semibold">{categoryCounts.approved}</p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="text-red-600 text-sm mb-1">Rejected</div>
                <p className="text-2xl font-semibold">{categoryCounts.rejected}</p>
              </div>
            </div>

            <div className="flex justify-end mb-6">
              <button
                onClick={() => setShowCategoryForm(!showCategoryForm)}
                className="px-4 py-2 bg-red-700 text-white rounded hover:bg-red-800"
              >
                + New Category
              </button>
            </div>

            {showCategoryForm && (
              <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
                <h3 className="text-lg font-semibold mb-4">Create New Category</h3>
                <form onSubmit={handleCategorySubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category Name *
                      </label>
                      <input
                        type="text"
                        value={categoryForm.name}
                        onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-red-500 focus:outline-none"
                        placeholder="e.g., Academic Notice"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Department Code * (Max 4 chars)
                      </label>
                      <input
                        type="text"
                        maxLength={4}
                        value={categoryForm.dept_associated}
                        onChange={(e) => setCategoryForm({ ...categoryForm, dept_associated: e.target.value.toUpperCase() })}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-red-500 focus:outline-none"
                        placeholder="e.g., CSE"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Color Code
                    </label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="color"
                        value={categoryForm.color_code}
                        onChange={(e) => setCategoryForm({ ...categoryForm, color_code: e.target.value })}
                        className="h-10 w-20 border border-gray-300 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={categoryForm.color_code}
                        onChange={(e) => setCategoryForm({ ...categoryForm, color_code: e.target.value })}
                        className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-red-500 focus:outline-none"
                        placeholder="#6b7280"
                      />
                      <div
                        className="w-10 h-10 rounded border border-gray-300"
                        style={{ backgroundColor: categoryForm.color_code }}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={categoryLoading}
                      className="px-4 py-2 bg-red-700 text-white rounded hover:bg-red-800 disabled:opacity-50"
                    >
                      {categoryLoading ? 'Creating...' : 'Create Category'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCategoryForm(false)}
                      className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="bg-white rounded-lg border border-gray-200">
              {loading ? (
                <div className="p-8 text-center text-gray-500">Loading...</div>
              ) : categories.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  No categories found. Create your first category!
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {categories.map((category) => (
                    <div key={category.category_id} className="p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-12 h-12 rounded flex items-center justify-center text-white font-bold text-lg"
                            style={{ backgroundColor: category.color_code }}
                          >
                            {category.dept_associated?.substring(0, 2)}
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">{category.name}</h3>
                            <p className="text-sm text-gray-600">Dept: {category.dept_associated}</p>
                            <p className="text-xs text-gray-500">
                              Created: {new Date(category.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <StatusBadge status={category.status} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default CommitteeDashboard;