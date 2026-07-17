import React, { useState } from 'react';

const AdminLogs = () => {
  const [logs] = useState([
    { id: 'sess-100293', patientId: 'pat-01', doctorId: 'doc-02', status: 'Completed', requestTime: '2026-07-12 10:00:05', acceptedTime: '2026-07-12 10:01:20', endedTime: '2026-07-12 10:15:30' },
    { id: 'sess-100348', patientId: 'pat-05', doctorId: 'doc-02', status: 'Completed', requestTime: '2026-07-12 11:24:12', acceptedTime: '2026-07-12 11:25:02', endedTime: '2026-07-12 11:45:00' },
    { id: 'sess-100412', patientId: 'pat-02', doctorId: 'doc-03', status: 'Expired', requestTime: '2026-07-14 14:30:00', acceptedTime: '-', endedTime: '2026-07-14 14:35:00' }
  ]);

  return (
    <div className="bg-slate-50 min-h-screen py-8 px-4 sm:px-6 lg:px-8 space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider bg-slate-700 px-2.5 py-1 rounded-full">
            Operations Auditing
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-2">
            Hospital Consultation Logs
          </h2>
          <p className="text-sm text-slate-350 max-w-xl mt-1">
            Global metadata monitoring. Chat scripts, photos, and symptoms are completely encrypted.
          </p>
        </div>
      </div>

      {/* Premium Dashboard Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm space-y-1">
          <span className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider">Total Handshakes</span>
          <p className="text-sm font-extrabold text-slate-800">{logs.length} Sessions</p>
        </div>
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm space-y-1">
          <span className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider">Completed Sessions</span>
          <p className="text-sm font-extrabold text-emerald-700">2 Completed</p>
        </div>
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm space-y-1">
          <span className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider">Expired Matches</span>
          <p className="text-sm font-extrabold text-red-750">1 Expired</p>
        </div>
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm space-y-1">
          <span className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider">Privacy Standard</span>
          <p className="text-sm font-extrabold text-slate-850">Zero-Knowledge</p>
        </div>
      </div>

      {/* Security Statement */}
      <div className="bg-emerald-50 border border-emerald-250 text-emerald-900 p-5 rounded-3xl space-y-2.5">
        <div className="flex items-center gap-2">
          <span className="text-lg">🛡️</span>
          <h4 className="font-extrabold text-sm uppercase tracking-wider">Zero-Knowledge Adherence Log</h4>
        </div>
        <p className="text-xs font-semibold leading-relaxed text-emerald-800">
          This panel displays structural session keys and handshake timestamps only. No clinical diagnoses, messages, or photo assets are visible.
        </p>
      </div>

      {/* Logs Table */}
      <div className="bg-white border border-slate-200 p-6 sm:p-8 rounded-3xl shadow-sm space-y-4">
        <div>
          <h3 className="font-bold text-slate-800 text-base">Global Session Ledger</h3>
          <p className="text-xs text-slate-500 font-semibold font-sans">Audit trail of system handshakes</p>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-100">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Session UUID</th>
                <th className="py-3 px-4">Patient Key</th>
                <th className="py-3 px-4">Doctor Key</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Intake Request Time</th>
                <th className="py-3 px-4">Handshake Accept Time</th>
                <th className="py-3 px-4">Consultation End Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-slate-800">{log.id}</td>
                  <td className="py-3 px-4 font-mono">{log.patientId}</td>
                  <td className="py-3 px-4 font-mono">{log.doctorId}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                      log.status === 'Completed' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono">{log.requestTime}</td>
                  <td className="py-3 px-4 font-mono">{log.acceptedTime}</td>
                  <td className="py-3 px-4 font-mono">{log.endedTime}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default AdminLogs;
