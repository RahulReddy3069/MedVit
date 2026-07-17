import React, { useState } from 'react';
import { useToast } from '../App';

const DoctorPatients = () => {
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  
  const [patients] = useState([
    { id: 'pat-1', name: 'John Doe', email: 'john.doe@gmail.com', phone: '+1-555-0100', subscription: 'Standard', lastVisit: '2026-07-12', diagnosis: 'Bacterial Pharyngitis' },
    { id: 'pat-2', name: 'Alice Smith', email: 'alice.smith@yahoo.com', phone: '+1-555-0155', subscription: 'Premium', lastVisit: '2026-07-14', diagnosis: 'Allergic Rhinitis' },
    { id: 'pat-3', name: 'Robert Johnson', email: 'robert.j@hotmail.com', phone: '+1-555-0199', subscription: 'Standard', lastVisit: '2026-06-28', diagnosis: 'Hypertension follow-up' }
  ]);

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const premiumCount = patients.filter(p => p.subscription === 'Premium').length;

  return (
    <div className="bg-slate-50 min-h-screen py-8 px-4 sm:px-6 lg:px-8 space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-800 text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden">
        <div className="absolute -right-4 -bottom-16 w-32 h-32 bg-white/10 rounded-full filter blur-xl"></div>
        <div className="relative z-10 space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider bg-white/20 px-2.5 py-1 rounded-full">
            Clinical Records
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-2">
            My Patients
          </h2>
          <p className="text-sm text-emerald-100 max-w-xl">
            Access assigned patient directories, subscription metadata, and check clinical consult history logs.
          </p>
        </div>
      </div>

      {/* Premium Dashboard Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm space-y-1">
          <span className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider">Total Patients</span>
          <p className="text-sm font-extrabold text-slate-800">{patients.length} Registered</p>
        </div>
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm space-y-1">
          <span className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider">Premium Users</span>
          <p className="text-sm font-extrabold text-emerald-700">{premiumCount} Premium</p>
        </div>
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm space-y-1">
          <span className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider">Avg Consultation Time</span>
          <p className="text-sm font-extrabold text-slate-800">14.5 Mins</p>
        </div>
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm space-y-1">
          <span className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider">Clinical Status</span>
          <p className="text-sm font-extrabold text-slate-800">Synchronized</p>
        </div>
      </div>

      {/* Patient Directory Grid list */}
      <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h3 className="font-bold text-slate-800 text-base">Patients Registry</h3>
            <p className="text-xs text-slate-500 font-semibold">Search patient index</p>
          </div>
          
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 w-full sm:max-w-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            placeholder="Search by name or email..."
          />
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-100">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Patient Name</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Contact Phone</th>
                <th className="py-3 px-4">Subscription Tier</th>
                <th className="py-3 px-4">Last Consult Date</th>
                <th className="py-3 px-4">Last Diagnosis Indication</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
              {filteredPatients.map((pat) => (
                <tr key={pat.id} className="hover:bg-slate-50/55 transition-colors">
                  <td className="py-3 px-4 font-bold text-emerald-800">{pat.name}</td>
                  <td className="py-3 px-4">{pat.email}</td>
                  <td className="py-3 px-4">{pat.phone}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                      pat.subscription === 'Premium' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {pat.subscription}
                    </span>
                  </td>
                  <td className="py-3 px-4">{pat.lastVisit}</td>
                  <td className="py-3 px-4 italic text-slate-500">{pat.diagnosis}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default DoctorPatients;
