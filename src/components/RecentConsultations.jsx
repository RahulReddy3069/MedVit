import React, { useState, useEffect } from 'react';
import { doctorDashboardService } from '../services/api';

const RecentConsultations = () => {
  const [consultations, setConsultations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeConsultation, setActiveConsultation] = useState(null);
  const [updatedPrescription, setUpdatedPrescription] = useState('');

  useEffect(() => {
    const fetchConsultations = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await doctorDashboardService.getRecentConsultations();
        setConsultations(data);
      } catch (err) {
        console.error('Error fetching recent consultations:', err);
        setError('Unable to fetch recent consultations. Please check API server.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchConsultations();
  }, []);

  const handleUpdateSubmit = (e) => {
    e.preventDefault();
    // Simulate updating in-memory state
    const updated = consultations.map(c => {
      if (c.id === activeConsultation.id) {
        return { ...c, prescription: updatedPrescription };
      }
      return c;
    });
    setConsultations(updated);
    setActiveConsultation(null);
    setUpdatedPrescription('');
    alert('Prescription details updated successfully (Mock)!');
  };

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
      <div>
        <h3 className="text-xl font-bold text-slate-800">Recent Consultations</h3>
        <p className="text-sm text-slate-500 font-medium">Log of recent clinical checks and consultations you administered</p>
      </div>

      {consultations.length === 0 ? (
        <div className="bg-slate-50 border border-slate-200 p-8 rounded-3xl text-center text-slate-500 font-medium">
          No recent consultations logged.
        </div>
      ) : (
        <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-4 px-6">Consultation Date</th>
                  <th className="py-4 px-6">Patient Name</th>
                  <th className="py-4 px-6">Diagnosis</th>
                  <th className="py-4 px-6">Prescribed Rx</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
                {consultations.map((consultation) => (
                  <tr key={consultation.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-6 font-semibold text-slate-800">{consultation.date}</td>
                    <td className="py-4 px-6 font-medium text-slate-700">{consultation.patientName}</td>
                    <td className="py-4 px-6">
                      <span className="px-2.5 py-1 bg-slate-100 border border-slate-200 text-slate-700 text-xs font-medium rounded-full">
                        {consultation.diagnosis}
                      </span>
                    </td>
                    <td className="py-4 px-6 max-w-xs truncate">{consultation.prescription}</td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 border border-emerald-250 text-emerald-700">
                        {consultation.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => {
                          setActiveConsultation(consultation);
                          setUpdatedPrescription(consultation.prescription);
                        }}
                        className="px-3.5 py-1.5 bg-primary-50 hover:bg-primary-100 text-primary-700 hover:text-primary-800 text-xs font-bold rounded-lg border border-primary-200/40 transition-all duration-150"
                      >
                        Update Rx
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Update Prescription Modal */}
      {activeConsultation && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 w-full max-w-md rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 relative animate-zoomIn">
            <button
              onClick={() => setActiveConsultation(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div>
              <h4 className="text-xl font-bold text-slate-800">Update Rx & Notes</h4>
              <p className="text-xs text-slate-500 font-medium">Update prescription details for {activeConsultation.patientName}</p>
            </div>

            <form onSubmit={handleUpdateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Diagnosis
                </label>
                <input
                  type="text"
                  disabled
                  value={activeConsultation.diagnosis}
                  className="w-full px-3.5 py-2 border border-slate-200 bg-slate-50 rounded-xl text-sm font-semibold text-slate-700 cursor-not-allowed"
                />
              </div>

              <div>
                <label htmlFor="prescription" className="block text-xs font-bold text-slate-450 uppercase tracking-wider mb-1.5">
                  Prescribed Medications
                </label>
                <textarea
                  id="prescription"
                  rows="4"
                  required
                  value={updatedPrescription}
                  onChange={(e) => setUpdatedPrescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm placeholder-slate-400"
                  placeholder="e.g. Amoxicillin 500mg 3x daily..."
                ></textarea>
              </div>

              <div className="flex gap-3 justify-end pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveConsultation(null)}
                  className="px-4.5 py-2 text-sm font-bold text-slate-500 hover:text-slate-700 border border-slate-200 hover:bg-slate-50 rounded-xl transition-all duration-150"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4.5 py-2 text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 rounded-xl shadow-sm hover:shadow transition-all duration-150"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecentConsultations;
