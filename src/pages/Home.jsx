import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  const getDashboardLink = () => {
    if (!token) return '/login';
    if (role === 'Patient') return '/patient';
    if (role === 'Doctor') return '/doctor';
    if (role === 'Admin') return '/admin';
    return '/';
  };

  return (
    <div className="bg-slate-50 min-h-[calc(100vh-4rem)] flex flex-col justify-between">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary-50 text-primary-700 text-xs font-semibold rounded-full border border-primary-200/50">
            <span className="h-2 w-2 bg-primary-500 rounded-full animate-ping"></span>
            Smart Healthcare Solutions
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-none">
            Integrated Hospital <span className="text-primary-600">Management</span> Dashboard
          </h1>
          
          <p className="text-lg text-slate-600 max-w-xl">
            A comprehensive, secure, and modern clinic operations system. Access instant appointment scheduling, medical histories, patient details, and global hospital consultations.
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <Link
              to={getDashboardLink()}
              className="px-6 py-3.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
            >
              {token ? 'Go to Dashboard' : 'Access Your Portal'}
            </Link>
            {!token && (
              <Link
                to="/login"
                className="px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-800 font-semibold rounded-xl border border-slate-200 hover:border-slate-300 shadow-sm transition-all duration-300"
              >
                Learn More
              </Link>
            )}
          </div>
        </div>

        {/* Hero Graphic / Stats card */}
        <div className="relative flex justify-center items-center">
          <div className="absolute inset-0 bg-gradient-to-tr from-primary-400/20 to-brand-400/10 rounded-3xl filter blur-2xl"></div>
          <div className="relative bg-white/70 backdrop-blur border border-slate-200/80 p-8 rounded-3xl shadow-xl w-full max-w-md space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <span className="font-bold text-slate-800 text-lg">Hospital At A Glance</span>
              <span className="h-2.5 w-2.5 bg-green-500 rounded-full"></span>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <span className="block text-2xl font-bold text-slate-800">4,200+</span>
                <span className="text-xs font-semibold text-slate-500">Patients Serviced</span>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <span className="block text-2xl font-bold text-slate-800">98.4%</span>
                <span className="text-xs font-semibold text-slate-500">Satisfaction Rate</span>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <span className="block text-2xl font-bold text-slate-800">25+</span>
                <span className="text-xs font-semibold text-slate-500">Expert Doctors</span>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <span className="block text-2xl font-bold text-slate-800">24/7</span>
                <span className="text-xs font-semibold text-slate-500">Emergency Support</span>
              </div>
            </div>

            <div className="bg-primary-50 border border-primary-100 p-4 rounded-xl flex items-center gap-3">
              <svg className="w-6 h-6 text-primary-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-xs text-primary-800 font-medium">
                Java API connected to <b>http://localhost:8080/api</b> with automatic bearer token authorization headers.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Cards Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-slate-200">
        <h2 className="text-3xl font-extrabold text-slate-900 text-center mb-12">
          Role-Based Access Portals
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Patient Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="h-12 w-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mb-6 font-semibold">
                PT
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Patient Portal</h3>
              <p className="text-slate-600 text-sm mb-6">
                Book clinic visits, view medical diagnostic histories, download prescriptions, check billing statements, and request secure digital checkouts.
              </p>
            </div>
            <Link
              to={token && role === 'Patient' ? '/patient' : '/login'}
              className="text-primary-600 hover:text-primary-700 text-sm font-semibold inline-flex items-center gap-1 group"
            >
              Access Patient Dashboard
              <span className="transition-transform group-hover:translate-x-1">&rarr;</span>
            </Link>
          </div>

          {/* Doctor Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="h-12 w-12 rounded-xl bg-green-50 border border-green-100 flex items-center justify-center text-green-600 mb-6 font-semibold">
                DR
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Doctor Portal</h3>
              <p className="text-slate-600 text-sm mb-6">
                Manage assigned patient lists, view daily consultation queues, check previous diagnostics, submit prescriptions, and track patient progress.
              </p>
            </div>
            <Link
              to={token && role === 'Doctor' ? '/doctor' : '/login'}
              className="text-primary-600 hover:text-primary-700 text-sm font-semibold inline-flex items-center gap-1 group"
            >
              Access Doctor Dashboard
              <span className="transition-transform group-hover:translate-x-1">&rarr;</span>
            </Link>
          </div>

          {/* Admin Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="h-12 w-12 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 mb-6 font-semibold">
                AD
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Hospital Admin</h3>
              <p className="text-slate-600 text-sm mb-6">
                Monitor global clinic operations, view all consolidated visits across departments, review doctor assignments, and track billing and invoices.
              </p>
            </div>
            <Link
              to={token && role === 'Admin' ? '/admin' : '/login'}
              className="text-primary-600 hover:text-primary-700 text-sm font-semibold inline-flex items-center gap-1 group"
            >
              Access Admin Dashboard
              <span className="transition-transform group-hover:translate-x-1">&rarr;</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm">
          &copy; 2026 MedVitals HMS. Built with React, Tailwind CSS, and Axios.
        </div>
      </footer>
    </div>
  );
};

export default Home;
