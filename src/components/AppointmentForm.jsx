import React, { useState, useEffect } from 'react';
import { doctorService, appointmentService } from '../services/api';

const AppointmentForm = ({ onAppointmentBooked }) => {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [symptoms, setSymptoms] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingDoctors, setIsFetchingDoctors] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  // Fetch doctors on mount
  useEffect(() => {
    const fetchDoctors = async () => {
      setIsFetchingDoctors(true);
      setError(null);
      try {
        const data = await doctorService.getDoctors();
        setDoctors(data);
      } catch (err) {
        console.error('Error fetching doctors:', err);
        setError('Could not load the list of doctors. Please check API server.');
      } finally {
        setIsFetchingDoctors(false);
      }
    };

    fetchDoctors();
  }, []);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    setIsLoading(true);

    const appointmentData = {
      doctorId: selectedDoctorId,
      date: appointmentDate,
      time: appointmentTime,
      symptoms: symptoms
    };

    try {
      await appointmentService.bookAppointment(appointmentData);
      setMessage({ type: 'success', text: 'Appointment booked successfully!' });
      
      // Clear form fields
      setSelectedDoctorId('');
      setAppointmentDate('');
      setAppointmentTime('');
      setSymptoms('');

      // Trigger dashboard reload if callback is provided
      if (onAppointmentBooked) {
        onAppointmentBooked();
      }
    } catch (err) {
      console.error('Booking error:', err);
      setError('Failed to book the appointment. Please check API server or form details.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200/80 p-6 sm:p-8 rounded-3xl shadow-sm space-y-6">
      <div>
        <h3 className="text-xl font-bold text-slate-800">Schedule a Consultation</h3>
        <p className="text-sm text-slate-500 font-medium">Select your doctor, preferred slot, and share your reason for visit</p>
      </div>

      {message && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl text-sm flex items-start gap-2.5">
          <svg className="w-5 h-5 text-emerald-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-semibold">{message.text}</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-2xl text-sm flex items-start gap-2.5">
          <svg className="w-5 h-5 text-red-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-semibold">{error}</span>
        </div>
      )}

      <form onSubmit={handleFormSubmit} className="space-y-4">
        <div>
          <label htmlFor="doctor" className="block text-sm font-semibold text-slate-700 mb-1.5">
            Select Healthcare Provider
          </label>
          <select
            id="doctor"
            required
            value={selectedDoctorId}
            onChange={(e) => setSelectedDoctorId(e.target.value)}
            disabled={isFetchingDoctors}
            className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm bg-white disabled:bg-slate-50 disabled:text-slate-400"
          >
            <option value="">{isFetchingDoctors ? 'Loading providers...' : 'Choose a doctor...'}</option>
            {doctors.map((doc) => (
              <option key={doc.id} value={doc.id}>
                {doc.name} - {doc.specialty}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="date" className="block text-sm font-semibold text-slate-700 mb-1.5">
              Preferred Date
            </label>
            <input
              id="date"
              type="date"
              required
              min={new Date().toISOString().split('T')[0]}
              value={appointmentDate}
              onChange={(e) => setAppointmentDate(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm"
            />
          </div>

          <div>
            <label htmlFor="time" className="block text-sm font-semibold text-slate-700 mb-1.5">
              Preferred Time
            </label>
            <select
              id="time"
              required
              value={appointmentTime}
              onChange={(e) => setAppointmentTime(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm bg-white"
            >
              <option value="">Choose a time slot...</option>
              <option value="09:00 AM">09:00 AM</option>
              <option value="10:00 AM">10:00 AM</option>
              <option value="11:00 AM">11:00 AM</option>
              <option value="02:00 PM">02:00 PM</option>
              <option value="03:00 PM">03:00 PM</option>
              <option value="04:00 PM">04:00 PM</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="symptoms" className="block text-sm font-semibold text-slate-700 mb-1.5">
            Brief Symptoms / Reason for Visit
          </label>
          <textarea
            id="symptoms"
            rows="3"
            required
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm placeholder-slate-400"
            placeholder="Describe your symptoms or reason for consulting the doctor..."
          ></textarea>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow-sm hover:shadow transition-all duration-200 disabled:opacity-75 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Booking...</span>
            </>
          ) : (
            'Book Appointment'
          )}
        </button>
      </form>
    </div>
  );
};

export default AppointmentForm;
