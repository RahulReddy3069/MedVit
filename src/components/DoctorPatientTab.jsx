import React, { useState, useEffect } from 'react';
import { doctorDashboardService } from '../services/api';

const DoctorPatientTab = () => {
  const [patients, setPatients] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPatients = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await doctorDashboardService.getAssignedPatients();
        setPatients(data);
      } catch (err) {
        console.error('Error fetching assigned patients:', err);
        setError('Unable to fetch assigned patients list. Please check API server.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPatients();
  }, []);

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.condition.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <svg className="animate-spin h-8 w-8 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 p-6 rounded-3xl text-sm font-semibold">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tab Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-800">My Patients</h3>
          <p className="text-sm text-slate-500 font-medium">List of active patients assigned to your care</p>
        </div>
        <div className="relative w-full sm:w-72">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Search by name or condition..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm"
          />
        </div>
      </div>

      {filteredPatients.length === 0 ? (
        <div className="bg-slate-50 border border-slate-200 p-8 rounded-3xl text-center text-slate-500 font-medium">
          No matching patients found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPatients.map((patient) => (
            <div
              key={patient.id}
              className="bg-white border border-slate-200 hover:border-slate-350 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Patient Profile */}
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-primary-50 border border-primary-100 rounded-xl flex items-center justify-center font-bold text-primary-700 text-sm">
                    {patient.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-base">{patient.name}</h4>
                    <span className="text-xs text-slate-500 font-medium">{patient.email}</span>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-3 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="block text-slate-400 font-semibold uppercase">Age</span>
                    <span className="font-bold text-slate-700">{patient.age} Yrs</span>
                  </div>
                  <div>
                    <span className="block text-slate-400 font-semibold uppercase">Last Visit</span>
                    <span className="font-semibold text-slate-700">{patient.lastVisit}</span>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-100/50 p-3 rounded-xl">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Primary Diagnosis</span>
                  <span className="text-xs font-semibold text-slate-800">{patient.condition}</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => alert(`View details of patient: ${patient.name}`)}
                  className="w-full py-2 bg-slate-50 hover:bg-primary-50 border border-slate-200 hover:border-primary-200 text-slate-700 hover:text-primary-700 text-xs font-bold rounded-lg transition-all duration-150"
                >
                  View Case Files
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DoctorPatientTab;
