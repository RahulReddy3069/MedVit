import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services/api';
import { useAuth, useToast } from '../App';

const Login = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('Patient'); // Patient, Doctor, Admin
  const [subscription, setSubscription] = useState('Standard'); // Standard or Premium
  
  // Doctor specific fields
  const [specialization, setSpecialization] = useState('General Physician');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [lat, setLat] = useState('37.7749');
  const [lng, setLng] = useState('-122.4194');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { showToast } = useToast();

  const from = location.state?.from?.pathname || '/';

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const data = await authService.login(email, password);
      
      // Store credentials and user payload
      const userPayload = {
        email: data.user.email,
        name: data.user.name,
        subscription: data.role === 'Patient' ? subscription : 'Standard'
      };

      // Trigger Context updates
      login(data.token, data.role, userPayload);
      showToast(`Welcome back, ${data.user.name}!`, 'success');
      
      // Navigate to correct portal
      if (from !== '/' && from !== '/login') {
        navigate(from, { replace: true });
      } else {
        if (data.role === 'Admin') {
          navigate('/admin', { replace: true });
        } else if (data.role === 'Doctor') {
          navigate('/doctor', { replace: true });
        } else if (data.role === 'Patient') {
          navigate('/patient', { replace: true });
        } else {
          navigate('/', { replace: true });
        }
      }
    } catch (err) {
      console.error('Login error details:', err);
      const errMsg = err.message || 'Invalid email or password.';
      setError(errMsg);
      showToast(errMsg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    const payload = {
      email,
      password,
      role,
      name,
      subscription: role === 'Patient' ? subscription : 'Standard',
      specialization: role === 'Doctor' ? specialization : null,
      phoneNumber: role === 'Doctor' ? phoneNumber : null,
      lat: role === 'Doctor' ? parseFloat(lat) : null,
      lng: role === 'Doctor' ? parseFloat(lng) : null
    };

    try {
      await authService.register(payload);
      const successMsg = 'Account created successfully! You can now log in.';
      setSuccess(successMsg);
      showToast(successMsg, 'success');
      setIsRegistering(false);
    } catch (err) {
      console.error('Registration error:', err);
      const errMsg = 'Registration failed. Please check form details.';
      setError(errMsg);
      showToast(errMsg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-100 rounded-full filter blur-3xl opacity-65"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-100 rounded-full filter blur-3xl opacity-65"></div>

      <div className="max-w-md w-full space-y-6 bg-white/80 backdrop-blur p-8 rounded-3xl border border-slate-200 shadow-xl relative z-10">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 rounded-2xl bg-primary-50 border border-primary-100 flex items-center justify-center text-primary-600 mb-4 animate-bounce">
            🩺
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {isRegistering ? 'Create Account' : 'Clinical Portal'}
          </h2>
          <p className="mt-2 text-sm text-slate-500 font-medium">
            {isRegistering ? 'Sign up to register as patient or doctor' : 'Sign in to access your secure portal'}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-xs font-semibold">
            ⚠️ {error}
          </div>
        )}

        {success && (
          <div className="bg-emerald-50 border border-emerald-250 text-emerald-800 p-4 rounded-xl text-xs font-bold">
            ✓ {success}
          </div>
        )}

        {!isRegistering ? (
          /* Sign In Mode Form */
          <form className="space-y-4" onSubmit={handleLoginSubmit}>
            <div className="space-y-3">
              <div>
                <label htmlFor="email" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Email</label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-350 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm"
                  placeholder="you@hospital.com"
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Password</label>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-350 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm"
                  placeholder="••••••••"
                />
              </div>

              {email.toLowerCase().includes('patient') && (
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Select Subscription Tier
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setSubscription('Standard')}
                      className={`py-2 px-4 text-xs font-bold rounded-xl border transition-all ${
                        subscription === 'Standard'
                          ? 'bg-slate-900 border-slate-900 text-white'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      Standard (Free)
                    </button>
                    <button
                      type="button"
                      onClick={() => setSubscription('Premium')}
                      className={`py-2 px-4 text-xs font-bold rounded-xl border transition-all ${
                        subscription === 'Premium'
                          ? 'bg-primary-600 border-primary-600 text-white shadow-sm'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      Premium (Paid)
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold rounded-xl shadow-md transition-all disabled:opacity-75"
            >
              {isLoading ? 'Processing...' : 'Sign In'}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsRegistering(true);
                  setError('');
                  setSuccess('');
                }}
                className="text-xs font-bold text-primary-700 hover:underline"
              >
                Don't have an account? Sign Up
              </button>
            </div>
          </form>
        ) : (
          /* Sign Up Mode Form */
          <form className="space-y-4" onSubmit={handleRegisterSubmit}>
            <div className="space-y-3">
              <div>
                <label htmlFor="reg-email" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Email</label>
                <input
                  id="reg-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-350 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm"
                  placeholder="name@hospital.com"
                />
              </div>

              <div>
                <label htmlFor="reg-password" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Password</label>
                <input
                  id="reg-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-350 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label htmlFor="reg-name" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Full Name</label>
                <input
                  id="reg-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-350 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm"
                  placeholder="Jane Smith"
                />
              </div>

              <div>
                <label htmlFor="reg-role" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Security Role</label>
                <select
                  id="reg-role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-350 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm bg-white"
                >
                  <option value="Patient">Patient</option>
                  <option value="Doctor">Doctor</option>
                </select>
              </div>

              {/* Dynamic inputs based on Role selection */}
              {role === 'Patient' && (
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Select Subscription Tier
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setSubscription('Standard')}
                      className={`py-2 px-4 text-xs font-bold rounded-xl border transition-all ${
                        subscription === 'Standard'
                          ? 'bg-slate-900 border-slate-900 text-white'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      Standard (Free)
                    </button>
                    <button
                      type="button"
                      onClick={() => setSubscription('Premium')}
                      className={`py-2 px-4 text-xs font-bold rounded-xl border transition-all ${
                        subscription === 'Premium'
                          ? 'bg-primary-600 border-primary-600 text-white shadow-sm'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      Premium (Paid)
                    </button>
                  </div>
                </div>
              )}

              {role === 'Doctor' && (
                <div className="space-y-3 p-3 bg-slate-50 border border-slate-100 rounded-2xl">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Doctor Credentials Info</span>
                  
                  <div>
                    <label htmlFor="reg-specialty" className="block text-[10px] font-bold text-slate-500 mb-0.5">Specialization</label>
                    <select
                      id="reg-specialty"
                      value={specialization}
                      onChange={(e) => setSpecialization(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white focus:outline-none"
                    >
                      <option value="General Physician">General Physician</option>
                      <option value="Dermatologist">Dermatologist</option>
                      <option value="Pediatrician">Pediatrician</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="reg-phone" className="block text-[10px] font-bold text-slate-500 mb-0.5">Phone Number</label>
                    <input
                      id="reg-phone"
                      type="text"
                      required
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:outline-none"
                      placeholder="+1-555-0101"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label htmlFor="reg-lat" className="block text-[10px] font-bold text-slate-500 mb-0.5">Latitude</label>
                      <input
                        id="reg-lat"
                        type="number"
                        step="0.0001"
                        required
                        value={lat}
                        onChange={(e) => setLat(e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:outline-none"
                      />
                    </div>
                    <div>
                      <label htmlFor="reg-lng" className="block text-[10px] font-bold text-slate-500 mb-0.5">Longitude</label>
                      <input
                        id="reg-lng"
                        type="number"
                        step="0.0001"
                        required
                        value={lng}
                        onChange={(e) => setLng(e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold rounded-xl shadow-md transition-all disabled:opacity-75"
            >
              {isLoading ? 'Registering...' : 'Register'}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsRegistering(false);
                  setError('');
                  setSuccess('');
                }}
                className="text-xs font-bold text-primary-700 hover:underline"
              >
                Already have an account? Sign In
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;
