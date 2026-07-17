import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services/api';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const userString = localStorage.getItem('user');
  let user = null;
  
  try {
    user = userString ? JSON.parse(userString) : null;
  } catch (e) {
    console.error('Error parsing user details', e);
  }

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path ? 'bg-primary-600 text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900';
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/80 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 font-bold text-xl text-primary-700 tracking-tight transition-colors hover:text-primary-800">
              <svg className="w-8 h-8 text-primary-600 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 10.5bc-.48 0-.93-.19-1.27-.53L12 4.24l-5.73 5.73c-.34.34-.79.53-1.27.53-.97 0-1.75-.78-1.75-1.75 0-.48.19-.93.53-1.27L10.73.53c.7-.7 1.84-.7 2.54 0l6.95 6.95c.34.34.53.79.53 1.27 0 .97-.78 1.75-1.75 1.75zM12 22a9.96 9.96 0 0 1-7.07-2.93L12 12l7.07 7.07A9.96 9.96 0 0 1 12 22z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-3-3v6" />
              </svg>
              <span>MedVitals<span className="font-light text-slate-500">HMS</span></span>
            </Link>

            {token && (
              <div className="hidden md:flex items-center gap-2">
                <Link to="/" className={`px-3-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive('/')}`}>
                  Home
                </Link>
                {role === 'Patient' && (
                  <Link to="/patient" className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive('/patient')}`}>
                    Patient Portal
                  </Link>
                )}
                {role === 'Doctor' && (
                  <Link to="/doctor" className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive('/doctor')}`}>
                    Doctor Portal
                  </Link>
                )}
                {role === 'Admin' && (
                  <Link to="/admin" className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive('/admin')}`}>
                    Admin Dashboard
                  </Link>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            {token ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-sm font-semibold text-slate-800">{user?.name || 'User'}</span>
                  <span className="text-xs text-slate-500 font-medium px-2 py-0.5 bg-slate-100 rounded-full border border-slate-200/50 mt-0.5">{role}</span>
                </div>
                <div className="h-9 w-9 rounded-full bg-primary-100 border border-primary-200 flex items-center justify-center text-primary-700 font-semibold shadow-inner">
                  {(user?.name || role || 'U').charAt(0).toUpperCase()}
                </div>
                <button
                  onClick={handleLogout}
                  className="ml-2 flex items-center justify-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-700 text-sm font-medium rounded-lg border border-slate-200 hover:border-red-200 transition-all duration-200 shadow-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Log Out</span>
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center justify-center gap-1.5 px-5  py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-lg shadow-sm hover:shadow transition-all duration-200"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
