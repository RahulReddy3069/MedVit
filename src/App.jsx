import React, { createContext, useContext, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate, useLocation } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';

// Patient Sub-Pages
import PatientDoctors from './pages/PatientDoctors';
import PatientAppointments from './pages/PatientAppointments';
import PatientMedications from './pages/PatientMedications';
import PatientBilling from './pages/PatientBilling';

// Doctor Sub-Pages
import DoctorIntake from './pages/DoctorIntake';
import DoctorPatients from './pages/DoctorPatients';
import DoctorLogs from './pages/DoctorLogs';

// Admin Sub-Pages
import AdminRegistry from './pages/AdminRegistry';
import AdminLogs from './pages/AdminLogs';
import AdminExport from './pages/AdminExport';

import { authService } from './services/api';

// 1. AUTHENTICATION CONTEXT PROVIDER
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [role, setRole] = useState(localStorage.getItem('role') || null);
  const [user, setUser] = useState(() => {
    try {
      const u = localStorage.getItem('user');
      return u ? JSON.parse(u) : null;
    } catch (e) {
      return null;
    }
  });

  const login = (authToken, authRole, userData) => {
    localStorage.setItem('token', authToken);
    localStorage.setItem('role', authRole);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(authToken);
    setRole(authRole);
    setUser(userData);
  };

  const logout = () => {
    authService.logout();
    setToken(null);
    setRole(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, role, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

// 2. TOAST NOTIFICATION CONTEXT PROVIDER
const ToastContext = createContext(null);

const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const colors = {
    success: 'bg-emerald-50 border-emerald-250 text-emerald-800 shadow-emerald-100/50',
    error: 'bg-red-50 border-red-250 text-red-800 shadow-red-100/50',
    info: 'bg-primary-50 border-primary-250 text-primary-800 shadow-primary-100/50'
  };

  const icons = {
    success: '✓',
    error: '⚠️',
    info: 'ℹ'
  };

  return (
    <div className={`flex items-center gap-3 px-4 py-3.5 border rounded-2xl shadow-lg transition-all duration-300 pointer-events-auto ${colors[type]}`}>
      <span className="font-extrabold text-sm flex-shrink-0">{icons[type]}</span>
      <p className="text-xs font-bold leading-relaxed">{message}</p>
      <button onClick={onClose} className="text-slate-400 hover:text-slate-700 font-bold text-xs ml-auto pl-2">×</button>
    </div>
  );
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  
  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter(t => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);

// Side Navigation Layout Shell for authenticated workspaces
const SideNavShell = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { role, user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path 
      ? 'bg-primary-600 text-white shadow-md' 
      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900';
  };

  // Close mobile drawer on routing updates
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans">
      
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-white border-b md:border-b-0 md:border-r border-slate-200 flex-shrink-0 flex flex-col justify-between">
        
        {/* Header Branding & Mobile Toggle */}
        <div className="p-4 md:p-6 flex items-center justify-between border-b border-slate-100 md:border-b-0">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl text-primary-700 tracking-tight">
            <svg className="w-8 h-8 text-primary-600" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 10.5h-5.5V5c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v5.5H5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5h5.5V20c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-5.5H19c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5z" />
            </svg>
            <span>Consult<span className="font-light text-slate-500">App</span></span>
          </Link>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-1.5 border border-slate-200 rounded-xl text-slate-650 hover:bg-slate-50 transition-colors"
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>

        {/* Nav Items */}
        <div className={`p-6 flex-1 space-y-8 md:block ${menuOpen ? 'block' : 'hidden'}`}>
          <nav className="space-y-1.5">
            <span className="block text-[10px] font-bold text-slate-440 uppercase tracking-wider mb-2">Main Menu</span>
            <Link to="/" className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${isActive('/')}`}>
              🏠 Home
            </Link>
            
            {role === 'Patient' && (
              <>
                <Link to="/patient/doctors" className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${isActive('/patient/doctors')}`}>
                  👨‍⚕️ Find Doctors
                </Link>
                <Link to="/patient/appointments" className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${isActive('/patient/appointments')}`}>
                  📅 Appointments
                </Link>
                <Link to="/patient/medications" className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${isActive('/patient/medications')}`}>
                  💊 Medications
                </Link>
                <Link to="/patient/billing" className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${isActive('/patient/billing')}`}>
                  💳 Billing & Invoices
                </Link>
              </>
            )}
            {role === 'Doctor' && (
              <>
                <Link to="/doctor/intake" className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${isActive('/doctor/intake')}`}>
                  🩺 Intake Alerts
                </Link>
                <Link to="/doctor/patients" className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${isActive('/doctor/patients')}`}>
                  👥 Patients List
                </Link>
                <Link to="/doctor/logs" className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${isActive('/doctor/logs')}`}>
                  📝 Consultation Logs
                </Link>
              </>
            )}
            {role === 'Admin' && (
              <>
                <Link to="/admin/registry" className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${isActive('/admin/registry')}`}>
                  🛡️ Registry Metadata
                </Link>
                <Link to="/admin/logs" className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${isActive('/admin/logs')}`}>
                  📊 Hospital Logs
                </Link>
                <Link to="/admin/export" className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${isActive('/admin/export')}`}>
                  📂 Dispute Export
                </Link>
              </>
            )}
          </nav>
        </div>

        {/* User Card & Logout */}
        <div className={`p-6 border-t border-slate-200 space-y-4 md:block ${menuOpen ? 'block' : 'hidden'}`}>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary-100 border border-primary-200 flex items-center justify-center text-primary-750 font-bold shadow-inner">
              {(user?.name || role || 'U').charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <span className="block text-sm font-bold text-slate-800 truncate">{user?.name || 'User'}</span>
              <span className="block text-xs font-semibold text-slate-500 truncate">{role} - {user?.subscription || 'Standard'}</span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-700 text-sm font-bold rounded-xl border border-slate-200 hover:border-red-200 transition-all duration-200 shadow-sm"
          >
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main Workspace Frame */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <Routes>
            {/* Public Landing Pages */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />

            {/* Patient sub-routes */}
            <Route
              path="/patient"
              element={<Navigate to="/patient/doctors" replace />}
            />
            <Route
              path="/patient/doctors"
              element={
                <ProtectedRoute allowedRoles={['Patient']}>
                  <SideNavShell>
                    <PatientDoctors />
                  </SideNavShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/patient/appointments"
              element={
                <ProtectedRoute allowedRoles={['Patient']}>
                  <SideNavShell>
                    <PatientAppointments />
                  </SideNavShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/patient/medications"
              element={
                <ProtectedRoute allowedRoles={['Patient']}>
                  <SideNavShell>
                    <PatientMedications />
                  </SideNavShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/patient/billing"
              element={
                <ProtectedRoute allowedRoles={['Patient']}>
                  <SideNavShell>
                    <PatientBilling />
                  </SideNavShell>
                </ProtectedRoute>
              }
            />

            {/* Doctor sub-routes */}
            <Route
              path="/doctor"
              element={<Navigate to="/doctor/intake" replace />}
            />
            <Route
              path="/doctor/intake"
              element={
                <ProtectedRoute allowedRoles={['Doctor']}>
                  <SideNavShell>
                    <DoctorIntake />
                  </SideNavShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/doctor/patients"
              element={
                <ProtectedRoute allowedRoles={['Doctor']}>
                  <SideNavShell>
                    <DoctorPatients />
                  </SideNavShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/doctor/logs"
              element={
                <ProtectedRoute allowedRoles={['Doctor']}>
                  <SideNavShell>
                    <DoctorLogs />
                  </SideNavShell>
                </ProtectedRoute>
              }
            />

            {/* Admin sub-routes */}
            <Route
              path="/admin"
              element={<Navigate to="/admin/registry" replace />}
            />
            <Route
              path="/admin/registry"
              element={
                <ProtectedRoute allowedRoles={['Admin']}>
                  <SideNavShell>
                    <AdminRegistry />
                  </SideNavShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/logs"
              element={
                <ProtectedRoute allowedRoles={['Admin']}>
                  <SideNavShell>
                    <AdminLogs />
                  </SideNavShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/export"
              element={
                <ProtectedRoute allowedRoles={['Admin']}>
                  <SideNavShell>
                    <AdminExport />
                  </SideNavShell>
                </ProtectedRoute>
              }
            />

            {/* Wildcard Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
};

export default App;
