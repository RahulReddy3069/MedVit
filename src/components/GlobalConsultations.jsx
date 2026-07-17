import React, { useState, useEffect } from 'react';
import { adminService } from '../services/api';

const GlobalConsultations = () => {
  const [consultations, setConsultations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('');

  useEffect(() => {
    const fetchGlobalConsultations = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await adminService.getGlobalConsultations();
        setConsultations(data);
      } catch (err) {
        console.error('Error fetching global consultations:', err);
        setError('Unable to fetch hospital-wide consultations. Please check API server.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchGlobalConsultations();
  }, []);

  const filteredConsultations = consultations.filter((c) => {
    const matchesSearch = 
      c.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.diagnosis.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDept = deptFilter === '' || c.department === deptFilter;

    return matchesSearch && matchesDept;
  });

  // Extract unique departments for filter dropdown
  const departments = [...new Set(consultations.map((c) => c.department))];

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
      {/* Filtering Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-800">Global Consultations</h3>
          <p className="text-sm text-slate-500 font-medium">Consolidated monitoring log across all hospital departments</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Department Filter */}
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="px-3.5 py-2 border border-slate-350 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-xs font-semibold text-slate-700"
          >
            <option value="">All Departments</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>

          {/* Text Search */}
          <div className="relative w-full sm:w-64">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search patient, doctor, diagnosis..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-xs"
            />
          </div>
        </div>
      </div>

      {filteredConsultations.length === 0 ? (
        <div className="bg-slate-50 border border-slate-200 p-8 rounded-3xl text-center text-slate-500 font-medium">
          No clinical logs matched the filter constraints.
        </div>
      ) : (
        <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-4 px-6">Scheduled Date</th>
                  <th className="py-4 px-6">Attending Physician</th>
                  <th className="py-4 px-6">Department</th>
                  <th className="py-4 px-6">Patient Name</th>
                  <th className="py-4 px-6">Diagnosis / Intake Reason</th>
                  <th className="py-4 px-6">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
                {filteredConsultations.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-6 font-semibold text-slate-800">{c.date}</td>
                    <td className="py-4 px-6 font-medium text-slate-700">{c.doctorName}</td>
                    <td className="py-4 px-6">
                      <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-700 text-xs font-medium rounded-full">
                        {c.department}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-medium text-slate-700">{c.patientName}</td>
                    <td className="py-4 px-6 italic text-slate-600">{c.diagnosis}</td>
                    <td className="py-4 px-6">
                      {c.status === 'Completed' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 border border-emerald-250 text-emerald-700">
                          {c.status}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 border border-blue-250 text-blue-700">
                          {c.status}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default GlobalConsultations;
