import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { adminAPI } from '../lib/api';

const AdminLogin = ({ setUser }) => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.email || !form.password) {
      return setError('All fields are required');
    }
    if (form.password.length <= 6) {
      return setError('Password must be more than 6 characters');
    }

    setLoading(true);
    try {
      const response = await adminAPI.login(form);
      setUser(response.user);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-lg font-bold text-gray-800">
            Digital Notice Board
          </h1>
          <div className="flex justify-end items-center gap-6">
            <Link
              to="/"
              className="text-sm text-black hover:underline"
            >
              Announcements
            </Link>
            <Link
              to="/committee/login"
              className="text-sm text-red-700 hover:underline"
            >
              Committee Login
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-white border border-gray-200 rounded-lg p-8 shadow-sm">
          <div className="mb-6">
            <span className="inline-block px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded">
              ADMIN ACCESS
            </span>
          </div>

          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Admin Login
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            Administrative access only
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-red-500 focus:border-transparent focus:outline-none"
                placeholder="admin@nitsikkim.ac.in"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-red-500 focus:border-transparent focus:outline-none"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 bg-red-700 text-white rounded font-medium hover:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default AdminLogin;