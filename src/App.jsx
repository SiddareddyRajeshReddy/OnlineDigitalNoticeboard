import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { committeeAPI } from './lib/api';

// Import Pages
import CommitteeLogin from './pages/CommitteeLogin';
import CommitteeSignup from './pages/CommitteeSignUp';
import CommitteeDashboard from './pages/CommitteeDashboard';
import AnnouncementForm from './pages/AnnouncementForm';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import PublicAnnouncements from './pages/PublicAnnouncements';

// Protected Route Component
const ProtectedRoute = ({ children, user, requiredType }) => {
  if (!user) {
    return <Navigate to={requiredType === 'admin' ? '/admin/login' : '/committee/login'} replace />;
  }
  if (requiredType && user.type !== requiredType) {
    return <Navigate to="/" replace />;
  }
  return children;
};

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // This endpoint returns user data for both committee and admin
      // based on the auth_token cookie
      const response = await committeeAPI.getCurrentUser();
      if (response.user) {
        setUser(response.user);
      }
    } catch (err) {
      // Not logged in or token expired
      setUser(null);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<PublicAnnouncements />} />
        
        {/* Committee Auth Routes */}
        <Route 
          path="/committee/login" 
          element={
            user?.type === 'committee' 
              ? <Navigate to="/committee/dashboard" replace /> 
              : user?.type === 'admin'
              ? <Navigate to="/admin/dashboard" replace />
              : <CommitteeLogin setUser={setUser} />
          } 
        />
        <Route 
          path="/committee/signup" 
          element={
            user?.type === 'committee' 
              ? <Navigate to="/committee/dashboard" replace /> 
              : user?.type === 'admin'
              ? <Navigate to="/admin/dashboard" replace />
              : <CommitteeSignup />
          } 
        />
        
        {/* Committee Protected Routes */}
        <Route 
          path="/committee/dashboard" 
          element={
            <ProtectedRoute user={user} requiredType="committee">
              <CommitteeDashboard user={user} setUser={setUser} />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/committee/announcements/create" 
          element={
            <ProtectedRoute user={user} requiredType="committee">
              <AnnouncementForm user={user} />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/committee/announcements/edit/:id" 
          element={
            <ProtectedRoute user={user} requiredType="committee">
              <AnnouncementForm user={user} />
            </ProtectedRoute>
          } 
        />
        
        {/* Admin Auth Routes */}
        <Route 
          path="/admin/login" 
          element={
            user?.type === 'admin' 
              ? <Navigate to="/admin/dashboard" replace /> 
              : user?.type === 'committee'
              ? <Navigate to="/committee/dashboard" replace />
              : <AdminLogin setUser={setUser} />
          } 
        />
        
        {/* Admin Protected Routes */}
        <Route 
          path="/admin/dashboard" 
          element={
            <ProtectedRoute user={user} requiredType="admin">
              <AdminDashboard user={user} setUser={setUser} />
            </ProtectedRoute>
          } 
        />
        
        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;