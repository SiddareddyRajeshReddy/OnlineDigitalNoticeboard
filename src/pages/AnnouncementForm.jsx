import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { announcementAPI, categoryAPI } from '../lib/api';

function AnnouncementForm({ user }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [form, setForm] = useState({
    title: '',
    content: '',
    url: '',
    category_id: '',
    priority: 'medium',
    publish_date: '',
    expires_at: ''
  });
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEditing);

  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  useEffect(() => {
    fetchCategories();
    if (isEditing) {
      fetchAnnouncement();
    }
  }, [id]);

  const fetchCategories = async () => {
    try {
      const response = await categoryAPI.getAll();
      setCategories(response.data || []);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const fetchAnnouncement = async () => {
    try {
      const response = await announcementAPI.getById(id);
      const data = response.data;
      setForm({
        title: data.title || '',
        content: data.content || '',
        url: data.url || '',
        category_id: data.category_id || '',
        priority: data.priority || 'medium',
        publish_date: data.publish_date ? data.publish_date.split('T')[0] : '',
        expires_at: data.expires_at ? data.expires_at.split('T')[0] : ''
      });
    } catch (err) {
      setError(err.message);
    }
    setFetchLoading(false);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validateDates = () => {
    const today = new Date().setHours(0, 0, 0, 0);
    
    // Publish date validation
    if (form.publish_date) {
      const publishDate = new Date(form.publish_date).setHours(0, 0, 0, 0);
      if (publishDate < today) {
        setError('Publish date cannot be in the past');
        return false;
      }
    }
    
    // Expiry date validation
    if (form.expires_at) {
      const expiryDate = new Date(form.expires_at).setHours(0, 0, 0, 0);
      
      if (expiryDate < today) {
        setError('Expiry date cannot be in the past');
        return false;
      }
      
      // If both dates are set, expiry must be after publish
      if (form.publish_date) {
        const publishDate = new Date(form.publish_date).setHours(0, 0, 0, 0);
        if (expiryDate <= publishDate) {
          setError('Expiry date must be after publish date');
          return false;
        }
      }
    }
    
    return true;
  };

  const handleSaveDraft = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.title || !form.content) {
      return setError('Title and content are required');
    }

    if (!validateDates()) {
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...form,
        category_id: form.category_id ? parseInt(form.category_id) : null,
        publish_date: form.publish_date || null,
        expires_at: form.expires_at || null
      };

      if (isEditing) {
        await announcementAPI.update(id, payload);
      } else {
        await announcementAPI.create(payload);
      }
      navigate('/committee/dashboard');
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleSaveAndSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.title || !form.content) {
      return setError('Title and content are required');
    }

    if (!validateDates()) {
      return;
    }

    if (!window.confirm('Save and submit this announcement for admin approval?')) return;

    setLoading(true);
    try {
      const payload = {
        ...form,
        category_id: form.category_id ? parseInt(form.category_id) : null,
        publish_date: form.publish_date || null,
        expires_at: form.expires_at || null
      };

      let announcementId = id;
      
      if (isEditing) {
        await announcementAPI.update(id, payload);
      } else {
        const response = await announcementAPI.create(payload);
        announcementId = response.announcementId;
      }

      await announcementAPI.publish(announcementId);
      navigate('/committee/dashboard');
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  if (fetchLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Link to="/committee/dashboard" className="text-gray-600 hover:text-gray-800">
            ← Back
          </Link>
          <h1 className="text-lg font-bold text-gray-800">
            {isEditing ? 'Edit Announcement' : 'Create New Announcement'}
          </h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded">
              {error}
            </div>
          )}

          <form className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-red-500 focus:border-transparent focus:outline-none"
                placeholder="Enter announcement title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Content <span className="text-red-500">*</span>
              </label>
              <textarea
                name="content"
                value={form.content}
                onChange={handleChange}
                rows={8}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-red-500 focus:border-transparent focus:outline-none"
                placeholder="Write your announcement content here..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL (Optional)
                </label>
                <input
                  type="url"
                  name="url"
                  value={form.url}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-red-500 focus:border-transparent focus:outline-none"
                  placeholder="https://example.com/details"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  name="category_id"
                  value={form.category_id}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-red-500 focus:border-transparent focus:outline-none"
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat.category_id} value={cat.category_id}>
                      {cat.name} ({cat.dept_associated})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  name="priority"
                  value={form.priority}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-red-500 focus:border-transparent focus:outline-none"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Publish Date (Optional)
                </label>
                <input
                  type="date"
                  name="publish_date"
                  value={form.publish_date}
                  onChange={handleChange}
                  min={getTodayDate()}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-red-500 focus:border-transparent focus:outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  When should this announcement be visible? (Leave empty for immediate)
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expires At (Optional)
              </label>
              <input
                type="date"
                name="expires_at"
                value={form.expires_at}
                onChange={handleChange}
                min={form.publish_date || getTodayDate()}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-red-500 focus:border-transparent focus:outline-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                When should this announcement stop being visible?
              </p>
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={handleSaveDraft}
                disabled={loading}
                className="px-6 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                {loading ? 'Saving...' : isEditing ? 'Save Changes' : 'Save as Draft'}
              </button>
              <button
                type="button"
                onClick={handleSaveAndSubmit}
                disabled={loading}
                className="px-6 py-2 bg-red-700 text-white rounded font-medium hover:bg-red-800 disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Save & Submit for Approval'}
              </button>
              <Link
                to="/committee/dashboard"
                className="px-6 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 flex items-center"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>

        {/* Info Box */}
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded text-sm text-blue-700">
          <strong>Important:</strong>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Announcements saved as drafts can be edited anytime</li>
            <li>Once submitted, they will be sent to admin for approval</li>
            <li><strong>Publish date:</strong> When the announcement becomes visible (optional, defaults to approval time)</li>
            <li><strong>Expiry date:</strong> When the announcement stops being visible (optional)</li>
            <li>Expiry date must be after publish date</li>
            <li>Announcements are only shown between publish date and expiry date</li>
          </ul>
        </div>
      </main>
    </div>
  );
}

export default AnnouncementForm;