import React, { useState } from 'react';
import { useToast } from '../App';

const DoctorLogs = () => {
  const { showToast } = useToast();
  const [selectedLog, setSelectedLog] = useState(null);

  const [logs] = useState([
    { id: 'log-101', date: '2026-07-12', patientName: 'John Doe', symptoms: 'Sore throat and persistent fever for two days', diagnosis: 'Bacterial Pharyngitis', prescription: 'Amoxicillin 500mg (1 cap 3x daily for 7 days), Ibuprofen 400mg' },
    { id: 'log-102', date: '2026-07-14', patientName: 'Alice Smith', symptoms: 'Sneezing, runny nose and itchy eyes', diagnosis: 'Allergic Rhinitis', prescription: 'Cetirizine 10mg once daily before bed' },
    { id: 'log-103', date: '2026-07-15', patientName: 'Robert Johnson', symptoms: 'Routine checkup and prescription refill request', diagnosis: 'Essential Hypertension', prescription: 'Lisinopril 10mg once daily in the morning' }
  ]);

  return (
    <div className="bg-slate-50 min-h-screen py-8 px-4 sm:px-6 lg:px-8 space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-800 text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden">
        <div className="absolute -right-4 -bottom-16 w-32 h-32 bg-white/10 rounded-full filter blur-xl"></div>
        <div className="relative z-10 space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider bg-white/20 px-2.5 py-1 rounded-full">
            Clinical History
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-2">
            Consultation Logs
          </h2>
          <p className="text-sm text-emerald-100 max-w-xl">
            Review completed clinical records, symptoms intakes, and prescriptions history logs.
          </p>
        </div>
      </div>

      {/* Premium Dashboard Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm space-y-1">
          <span className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider">Total Logs</span>
          <p className="text-sm font-extrabold text-slate-800">{logs.length} Consultations</p>
        </div>
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm space-y-1">
          <span className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider">Prescriptions Issued</span>
          <p className="text-sm font-extrabold text-emerald-700">4 Items</p>
        </div>
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm space-y-1">
          <span className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider">Unique Diagnoses</span>
          <p className="text-sm font-extrabold text-slate-800">3 Cases</p>
        </div>
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm space-y-1">
          <span className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider">Clinical Compliance</span>
          <p className="text-sm font-extrabold text-slate-800">HIPAA Compliant</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Logs Table */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm space-y-4">
            <div>
              <h3 className="font-bold text-slate-800 text-base">Archived Consultations</h3>
              <p className="text-xs text-slate-500 font-semibold font-sans">Click on any record to view details</p>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-100">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Log ID</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Patient</th>
                    <th className="py-3 px-4">Diagnosis</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                  {logs.map((log) => (
                    <tr
                      key={log.id}
                      onClick={() => setSelectedLog(log)}
                      className="hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-4 font-bold text-emerald-800">{log.id}</td>
                      <td className="py-3 px-4">{log.date}</td>
                      <td className="py-3 px-4">{log.patientName}</td>
                      <td className="py-3 px-4 italic">{log.diagnosis}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Log Detail Card */}
        <div className="lg:col-span-1">
          {selectedLog ? (
            <div className="bg-white border border-slate-250 p-6 rounded-3xl shadow-lg space-y-5">
              <div className="border-b border-slate-150 pb-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Clinical Case Summary</span>
                <h4 className="font-extrabold text-slate-800 text-base mt-0.5">{selectedLog.id}</h4>
              </div>

              <div className="space-y-4 text-xs font-semibold text-slate-650">
                <div>
                  <span className="block text-[10px] text-slate-400 uppercase mb-1">Patient Name</span>
                  <span className="text-slate-800 font-bold">{selectedLog.patientName}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-slate-400 uppercase mb-1">Intake Symptoms</span>
                  <p className="text-slate-700 italic">"{selectedLog.symptoms}"</p>
                </div>
                <div className="border-t border-slate-100 pt-3">
                  <span className="block text-[10px] text-slate-400 uppercase mb-1">Clinical Diagnosis</span>
                  <span className="text-emerald-700 font-bold">{selectedLog.diagnosis}</span>
                </div>
                <div className="border-t border-slate-100 pt-3">
                  <span className="block text-[10px] text-slate-400 uppercase mb-1">Prescribed Rx</span>
                  <p className="text-slate-800 bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100 font-mono">
                    {selectedLog.prescription}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <button
                  onClick={() => showToast('Generating printable diagnostic case summary...', 'info')}
                  className="w-full py-2 bg-slate-900 hover:bg-slate-950 text-white text-xs font-bold rounded-xl shadow transition-colors"
                >
                  Print Summary
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-slate-100 border border-dashed border-slate-350 rounded-3xl h-[260px] flex items-center justify-center p-6 text-center text-xs text-slate-400 font-semibold shadow-inner">
              Select an archived record from the list to view its full diagnosis summary.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

export default DoctorLogs;
