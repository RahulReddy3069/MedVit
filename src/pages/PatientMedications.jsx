import React, { useState } from 'react';
import { useToast } from '../App';

const PatientMedications = () => {
  const { showToast } = useToast();
  const [medications] = useState([
    { id: 'med-1', name: 'Amoxicillin 500mg', dosage: '1 capsule three times daily', doctorName: 'Dr. Sarah Jenkins', datePrescribed: '2026-07-12', diagnosis: 'Bacterial Pharyngitis', status: 'Completed' },
    { id: 'med-2', name: 'Ibuprofen 400mg', dosage: '1 tablet every 6 hours as needed', doctorName: 'Dr. Sarah Jenkins', datePrescribed: '2026-07-12', diagnosis: 'Sore throat pain relief', status: 'Completed' },
    { id: 'med-3', name: 'Cetirizine 10mg', dosage: '1 tablet once daily before bed', doctorName: 'Dr. David Kim', datePrescribed: '2026-07-14', diagnosis: 'Allergic Rhinitis / Hay Fever', status: 'Active' }
  ]);

  const activeCount = medications.filter(m => m.status === 'Active').length;

  return (
    <div className="bg-slate-50 min-h-screen py-8 px-4 sm:px-6 lg:px-8 space-y-6">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden flex justify-between items-center">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider bg-white/20 px-2.5 py-1 rounded-full">
            Clinical Prescriptions
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-2">
            My Medications
          </h2>
          <p className="text-sm text-primary-100 max-w-xl mt-1">
            Review prescriptions, intake schedules, and guidelines issued by your attending doctors.
          </p>
        </div>
      </div>

      {/* Premium Dashboard Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm space-y-1">
          <span className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider">Total Prescribed</span>
          <p className="text-sm font-extrabold text-slate-800">{medications.length} Items</p>
        </div>
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm space-y-1">
          <span className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider">Active Course</span>
          <p className="text-sm font-extrabold text-emerald-700">{activeCount} Prescriptions</p>
        </div>
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm space-y-1">
          <span className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider">Dispenser Slip</span>
          <p className="text-sm font-extrabold text-slate-800">Authorized E-Rx</p>
        </div>
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm space-y-1">
          <span className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider">Pharmacy pickup</span>
          <p className="text-sm font-extrabold text-slate-800">Ready</p>
        </div>
      </div>

      {/* Medications Log Card */}
      <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm space-y-4">
        <div>
          <h3 className="font-bold text-slate-800 text-base">Active & Past Medications</h3>
          <p className="text-xs text-slate-500 font-semibold font-sans">Authorized pharmacy dispensing slips</p>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-100">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Date Issued</th>
                <th className="py-3 px-4">Medication Name</th>
                <th className="py-3 px-4">Dosage Instructions</th>
                <th className="py-3 px-4">Attending Doctor</th>
                <th className="py-3 px-4">Indication/Diagnosis</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
              {medications.map((med) => (
                <tr key={med.id}>
                  <td className="py-3 px-4">{med.datePrescribed}</td>
                  <td className="py-3 px-4 font-bold text-primary-700">{med.name}</td>
                  <td className="py-3 px-4">{med.dosage}</td>
                  <td className="py-3 px-4">{med.doctorName}</td>
                  <td className="py-3 px-4 italic text-slate-500">{med.diagnosis}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                      med.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {med.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default PatientMedications;
