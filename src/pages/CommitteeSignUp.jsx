import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { committeeAPI } from '../lib/api';

const CommitteeSignup = () => {
  const [form, setForm] = useState({
    email: '',
    full_name: '',
    password: '',
    phone: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.email || !form.full_name || !form.password || !form.phone) {
      return setError('All fields are required');
    }
    if (form.password.length <= 6) {
      return setError('Password must be more than 6 characters');
    }
    if (form.phone.length < 10) {
      return setError('Phone number must be at least 10 digits');
    }

    setLoading(true);
    try {
      const response = await committeeAPI.signup(form);
      setSuccess(response.message);
      setForm({ email: '', full_name: '', password: '', phone: '' });
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex justify-between max-w-6xl mx-auto">
          <h1 className="text-lg font-bold text-gray-800">
            NIT Sikkim Digital Notice Board
          </h1>
          <Link
            to="/"
            className="text-sm text-black hover:underline"
          >
            Announcements
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-white border border-gray-200 rounded-lg p-8 shadow-sm">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Committee Registration
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            Register to post announcements on the notice board
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                name="full_name"
                value={form.full_name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-red-500 focus:border-transparent focus:outline-none"
                placeholder="Dr. John Doe"
              />
            </div>

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
                placeholder="name@nitsikkim.ac.in"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-red-500 focus:border-transparent focus:outline-none"
                placeholder="9876543210"
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
              <p className="mt-1 text-xs text-gray-500">
                Must be more than 6 characters
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 bg-red-700 text-white rounded font-medium hover:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Registering...' : 'Register'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/committee/login" className="text-red-700 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
};

export default CommitteeSignup;