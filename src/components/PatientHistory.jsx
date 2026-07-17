import React, { useState, useEffect } from 'react';
import { patientService } from '../services/api';

const PatientHistory = ({ refreshKey }) => {
  const [history, setHistory] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVisit, setSelectedVisit] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await patientService.getHistory();
        setHistory(data);
      } catch (err) {
        console.error('History fetch error:', err);
        setError('Could not retrieve medical history logs. Please check API server.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [refreshKey]);

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

  const visits = history?.visits || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-slate-800">Medical History & Records</h3>
          <p className="text-sm text-slate-500 font-medium">Review your diagnoses, prescriptions, bills, and medical receipts</p>
        </div>
      </div>

      {visits.length === 0 ? (
        <div className="bg-white border border-slate-200 p-8 rounded-3xl text-center text-slate-500 font-medium shadow-sm">
          No medical records found. Book an appointment to get started!
        </div>
      ) : (
        <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-4 px-6">Date</th>
                  <th className="py-4 px-6">Physician</th>
                  <th className="py-4 px-6">Diagnosis</th>
                  <th className="py-4 px-6">Prescription</th>
                  <th className="py-4 px-6">Invoice</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
                {visits.map((visit) => (
                  <tr key={visit.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-6 font-semibold text-slate-800">
                      {new Date(visit.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="py-4 px-6">{visit.doctorName}</td>
                    <td className="py-4 px-6">
                      <span className="px-2.5 py-1 bg-slate-100 border border-slate-200 text-slate-700 text-xs font-medium rounded-full">
                        {visit.diagnosis}
                      </span>
                    </td>
                    <td className="py-4 px-6 max-w-xs truncate">{visit.prescription}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-800">${visit.billAmount.toFixed(2)}</span>
                        {visit.paid ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-full">
                            <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full"></span>
                            Paid
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold rounded-full">
                            <span className="h-1.5 w-1.5 bg-amber-500 rounded-full"></span>
                            Unpaid
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => setSelectedVisit(visit)}
                        className="px-3.5 py-1.5 bg-primary-50 hover:bg-primary-100 text-primary-700 hover:text-primary-800 text-xs font-bold rounded-lg border border-primary-200/40 transition-all duration-150"
                      >
                        View Invoice
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Invoice Details Modal */}
      {selectedVisit && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 w-full max-w-lg rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 relative animate-zoomIn">
            <button
              onClick={() => setSelectedVisit(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Receipt Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="font-bold text-primary-700 text-xl tracking-tight">MedVitals Receipt</span>
                <span className="block text-xs font-medium text-slate-400">Invoice ID: INV-{(selectedVisit.id)}</span>
              </div>
              <div className="text-right">
                <span className="block text-sm font-semibold text-slate-800">Date Issued</span>
                <span className="text-xs font-medium text-slate-500">{selectedVisit.date}</span>
              </div>
            </div>

            {/* Receipt Body */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Patient Name</span>
                  <span className="font-semibold text-slate-800">John Doe</span>
                </div>
                <div>
                  <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Attending Doctor</span>
                  <span className="font-semibold text-slate-800">{selectedVisit.doctorName}</span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Clinical Diagnosis & Notes</span>
                <span className="block text-sm font-semibold text-slate-800">{selectedVisit.diagnosis}</span>
                {selectedVisit.prescription && (
                  <div className="pt-2 border-t border-slate-200/50 mt-2">
                    <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Rx Prescribed</span>
                    <span className="block text-xs font-medium text-slate-700 italic">{selectedVisit.prescription}</span>
                  </div>
                )}
              </div>

              {/* Items Table */}
              <div className="space-y-2">
                <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Statement Summary</span>
                <div className="border border-slate-200/60 rounded-xl overflow-hidden text-xs">
                  <div className="flex bg-slate-50 font-bold text-slate-600 border-b border-slate-200 p-2.5">
                    <span className="w-2/3">Service Item</span>
                    <span className="w-1/3 text-right">Price</span>
                  </div>
                  <div className="flex border-b border-slate-100 p-2.5">
                    <span className="w-2/3 text-slate-700">General Consultation</span>
                    <span className="w-1/3 text-right font-semibold text-slate-800">${(selectedVisit.billAmount * 0.6).toFixed(2)}</span>
                  </div>
                  <div className="flex p-2.5">
                    <span className="w-2/3 text-slate-700">Clinical Labs & Rx Dispensing</span>
                    <span className="w-1/3 text-right font-semibold text-slate-800">${(selectedVisit.billAmount * 0.4).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Total Summary */}
              <div className="flex justify-between items-center bg-slate-50 border border-slate-150 p-4 rounded-2xl">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Due</span>
                  <span className="text-2xl font-extrabold text-slate-900">${selectedVisit.billAmount.toFixed(2)}</span>
                </div>
                <div>
                  {selectedVisit.paid ? (
                    <div className="flex flex-col items-end">
                      <span className="px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-xl flex items-center gap-1 shadow-sm">
                        Payment Completed
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold mt-1">Receipt ID: {selectedVisit.id + 999}</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        selectedVisit.paid = true;
                        setSelectedVisit({ ...selectedVisit });
                      }}
                      className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-xl shadow transition-all duration-150"
                    >
                      Process Payment (Mock)
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-2 border-t border-slate-100">
              <button
                onClick={() => setSelectedVisit(null)}
                className="px-4.5 py-2 text-sm font-bold text-slate-500 hover:text-slate-700 border border-slate-200 hover:bg-slate-50 rounded-xl transition-all duration-150"
              >
                Close Receipt
              </button>
              <button
                onClick={() => window.print()}
                className="px-4.5 py-2 text-sm font-bold text-white bg-slate-800 hover:bg-slate-900 rounded-xl transition-all duration-150 flex items-center gap-1.5"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-3a2 2 0 00-2-2H9a2 2 0 00-2 2v3a2 2 0 002 2zm5-12V5a3 3 0 00-3-3H9a3 3 0 00-3 3v4h6z" />
                </svg>
                <span>Print</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientHistory;
