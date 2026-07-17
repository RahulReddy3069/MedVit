import React, { useState, useEffect } from 'react';
import { adminDashboardService } from '../services/api';
import { useToast } from '../App';

const AdminRegistry = () => {
  const { showToast } = useToast();
  const [usersMetadata, setUsersMetadata] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMetadata = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await adminDashboardService.getUsersMetadata('admin-01');
        setUsersMetadata(data);
      } catch (err) {
        console.error(err);
        const errMsg = 'Failed to fetch user registry metadata.';
        setError(errMsg);
        showToast(errMsg, 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMetadata();
  }, []);

  const patientsCount = usersMetadata.filter(u => u.role === 'Patient').length;
  const doctorsCount = usersMetadata.filter(u => u.role === 'Doctor').length;
  const adminsCount = usersMetadata.filter(u => u.role === 'Admin').length;

  return (
    <div className="bg-slate-50 min-h-screen py-8 px-4 sm:px-6 lg:px-8 space-y-6">
      
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider bg-slate-700 px-2.5 py-1 rounded-full">
            Operations Audit Center
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-2">
            User Registry Registry
          </h2>
          <p className="text-sm text-slate-350 max-w-xl mt-1">
            Browse registered patient, doctor, and admin profiles and verify system usage logs.
          </p>
        </div>
      </div>

      {/* Premium Dashboard Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm space-y-1">
          <span className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider">Total Registered</span>
          <p className="text-sm font-extrabold text-slate-800">{usersMetadata.length} Accounts</p>
        </div>
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm space-y-1">
          <span className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider">Patient Accounts</span>
          <p className="text-sm font-extrabold text-primary-700">{patientsCount} Patients</p>
        </div>
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm space-y-1">
          <span className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider">Doctor Accounts</span>
          <p className="text-sm font-extrabold text-emerald-700">{doctorsCount} Doctors</p>
        </div>
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm space-y-1">
          <span className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider">Admin Users</span>
          <p className="text-sm font-extrabold text-slate-850">{adminsCount} Admins</p>
        </div>
      </div>

      {/* Registry Metadata Table */}
      <div className="bg-white border border-slate-200 p-6 sm:p-8 rounded-3xl shadow-sm space-y-6">
        <div>
          <h3 className="font-bold text-slate-800 text-base">Registered Profiles</h3>
          <p className="text-xs text-slate-500 font-semibold">User creation details and subscription tiers</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-650 font-bold">
            ⚠️ {error}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-100">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">User ID</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">System Role</th>
                  <th className="py-3 px-4">Subscription Plan</th>
                  <th className="py-3 px-4">Register Date</th>
                  <th className="py-3 px-4">Last Login Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                {usersMetadata.map((usr) => (
                  <tr key={usr.userId}>
                    <td className="py-3 px-4 font-mono">{usr.userId}</td>
                    <td className="py-3 px-4 text-slate-900">{usr.email}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                        usr.role === 'Admin' ? 'bg-slate-100 text-slate-700' :
                        usr.role === 'Doctor' ? 'bg-emerald-50 text-emerald-700' : 'bg-primary-50 text-primary-700'
                      }`}>
                        {usr.role}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                        usr.subscription === 'Premium' ? 'bg-yellow-50 text-yellow-750 border border-yellow-200' : 'bg-slate-50 text-slate-450'
                      }`}>
                        {usr.subscription}
                      </span>
                    </td>
                    <td className="py-3 px-4">{usr.registeredAt}</td>
                    <td className="py-3 px-4 font-mono text-[10px]">{usr.lastLoginTimestamp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};

export default AdminRegistry;
