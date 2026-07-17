import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

/**
 * ProtectedRoute wraps children to enforce authentication and role-based access.
 * 
 * @param {React.ReactNode} children - Component to render if authorized
 * @param {Array<string>} allowedRoles - List of roles permitted to view this route (e.g., ['Admin', 'Doctor', 'Patient'])
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role'); // Expected 'Admin', 'Doctor', or 'Patient'
  const location = useLocation();

  if (!token) {
    // Redirect to login, saving the attempted location for post-auth redirect
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    // Authenticated, but lacks required role. Redirect to their specific dashboard
    if (role === 'Admin') {
      return <Navigate to="/admin" replace />;
    } else if (role === 'Doctor') {
      return <Navigate to="/doctor" replace />;
    } else if (role === 'Patient') {
      return <Navigate to="/patient" replace />;
    } else {
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
