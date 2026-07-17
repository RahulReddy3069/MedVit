import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { doctorService, consultationService } from '../services/api';
import { useAuth, useToast } from '../App';

const PatientDoctors = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  
  // Proximity & Filter states
  const [radius, setRadius] = useState(15);
  const [specialization, setSpecialization] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // Patient coordinates
  const [latitude, setLatitude] = useState(37.7749);
  const [longitude, setLongitude] = useState(-122.4194);
  const [isLocating, setIsLocating] = useState(false);

  // Selection & Intake states
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [symptoms, setSymptoms] = useState('');
  const [attachedFiles, setAttachedFiles] = useState([]);
  const fileInputRef = useRef(null);

  // Active Session details
  const [activeSession, setActiveSession] = useState(null);
  const [sessionStatusMessage, setSessionStatusMessage] = useState('');
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);

  // Fetch real-time user location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude);
          setLongitude(position.coords.longitude);
          setIsLocating(false);
          showToast('Updated patient coordinates to your real-time position.', 'success');
        },
        (error) => {
          console.warn('Geolocation error:', error);
          setIsLocating(false);
          showToast('Location access denied. Using default coordinates (San Francisco).', 'info');
        },
        { enableHighAccuracy: true, timeout: 6000, maximumAge: 0 }
      );
    } else {
      showToast('Geolocation is not supported by your browser.', 'warning');
    }
  }, []);

  // Fetch doctors
  const fetchDoctors = async () => {
    setIsSearching(true);
    try {
      const data = await doctorService.searchDoctors(latitude, longitude, radius, specialization);
      setDoctors(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, [radius, specialization, latitude, longitude]);

  // Restore active session state from localStorage database on mount
  useEffect(() => {
    try {
      const data = localStorage.getItem('hms_active_sessions');
      if (data) {
        const parsed = JSON.parse(data);
        const active = parsed.find(s => s.patientId === 'pat-01' && (s.status === 'Pending' || s.status === 'Active'));
        if (active) {
          setActiveSession(active);
          if (active.status === 'Active') {
            setSessionStatusMessage('Your request was accepted! Active chat session is waiting.');
          } else {
            setSessionStatusMessage('Waiting for doctor response (5-minute Acceptance countdown active)...');
          }
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // WebSockets callbacks for matchmaking lifecycle (Accept / Reject triggers)
  useEffect(() => {
    consultationService.registerPatientListener((acceptedSession) => {
      setActiveSession(acceptedSession);
      setSessionStatusMessage('Your request was accepted! Active chat session is waiting.');
      showToast('Alert: Your request has been accepted by the doctor!', 'success');
    });

    consultationService.registerPatientRejectionListener(() => {
      setActiveSession(null);
      setSelectedDoctor(null);
      setSymptoms('');
      setAttachedFiles([]);
      setSessionStatusMessage('Matchmaking request was declined or expired. Please select another doctor.');
      showToast('Notification: Matchmaking request declined or expired.', 'error');
    });
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files) {
      const filesArr = Array.from(e.target.files);
      setAttachedFiles([...attachedFiles, ...filesArr]);
    }
  };

  const removeAttachment = (index) => {
    setAttachedFiles(attachedFiles.filter((_, i) => i !== index));
  };

  const handleSendRequestSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDoctor) return;
    
    setIsSubmittingRequest(true);
    setSessionStatusMessage('Sending intake files to the doctor... Matchmaking timer started.');
    showToast('Dispatching intake files to the doctor...', 'info');

    try {
      const sess = await consultationService.submitRequest('pat-01', selectedDoctor.id, symptoms, attachedFiles);
      setActiveSession(sess);
      setSessionStatusMessage('Waiting for doctor response (5-minute Acceptance countdown active)...');
      showToast('Request sent successfully! 5-minute accept window active.', 'success');
    } catch (err) {
      console.error(err);
      setSessionStatusMessage('Request dispatch failed.');
      showToast('Intake transmission failed. Check connection.', 'error');
    } finally {
      setIsSubmittingRequest(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen py-8 px-4 sm:px-6 lg:px-8 space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider bg-white/20 px-2.5 py-1 rounded-full">
            {user?.subscription} Patient Tier
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-2">
            Find Doctors
          </h2>
          <p className="text-sm text-primary-100 max-w-xl">
            Locate specialists close to your coordinates and submit consultation requests.
          </p>
        </div>
        <div className="bg-white/10 border border-white/20 px-4 py-2 rounded-2xl text-xs font-semibold flex items-center gap-1.5">
          {isLocating ? (
            <span className="animate-pulse">🛰️ retrieving location...</span>
          ) : (
            <>📍 coordinates: {latitude.toFixed(4)}, {longitude.toFixed(4)}</>
          )}
        </div>
      </div>

      {/* Premium Dashboard Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm space-y-1">
          <span className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider">Account Tier</span>
          <p className="text-sm font-extrabold text-slate-800">{user?.subscription || 'Standard'} Plan</p>
        </div>
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm space-y-1">
          <span className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider">Specialty Search</span>
          <p className="text-sm font-extrabold text-slate-800">{specialization || 'All Specialists'}</p>
        </div>
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm space-y-1">
          <span className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider">Search Radius</span>
          <p className="text-sm font-extrabold text-slate-800">{radius} km Range</p>
        </div>
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm space-y-1">
          <span className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider">Physicians Found</span>
          <p className="text-sm font-extrabold text-primary-700">{doctors.length} Doctors</p>
        </div>
      </div>

      {/* Grid Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Doctors Directory List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-bold text-slate-800 text-base">Specialist Search</h3>
                <p className="text-xs text-slate-500 font-semibold">Proximity radius filtering</p>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <select
                  value={radius}
                  onChange={(e) => setRadius(parseInt(e.target.value))}
                  className="px-3 py-1.5 border border-slate-200 bg-white rounded-xl text-xs font-bold text-slate-650"
                >
                  <option value={5}>Within 5 km</option>
                  <option value={10}>Within 10 km</option>
                  <option value={15}>Within 15 km</option>
                </select>

                <select
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  className="px-3 py-1.5 border border-slate-200 bg-white rounded-xl text-xs font-bold text-slate-650"
                >
                  <option value="">All Specialties</option>
                  <option value="General Physician">General Physician</option>
                  <option value="Dermatologist">Dermatologist</option>
                  <option value="Pediatrician">Pediatrician</option>
                </select>
              </div>
            </div>

            {isSearching ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            ) : doctors.length === 0 ? (
              <div className="text-center py-12 text-slate-400 font-medium">
                No doctors found within {radius} km.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {doctors.map((doc) => (
                  <div
                    key={doc.id}
                    onClick={() => {
                      if (!activeSession) setSelectedDoctor(doc);
                    }}
                    className={`border p-4 rounded-2xl cursor-pointer transition-all ${
                      selectedDoctor?.id === doc.id
                        ? 'border-primary-500 bg-primary-50/30 ring-1 ring-primary-500'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    } ${activeSession ? 'opacity-60 cursor-not-allowed' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 bg-primary-100 rounded-xl flex items-center justify-center text-primary-750 font-extrabold text-xs">
                        {doc.fullName.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm">{doc.fullName}</h4>
                        <span className="text-xs text-slate-500 font-medium">{doc.specialization}</span>
                      </div>
                    </div>

                    <div className="border-t border-slate-100 pt-3 mt-4 space-y-1 text-xs font-semibold text-slate-600">
                      <div className="flex justify-between">
                        <span>Distance</span>
                        <span className="text-slate-800">{doc.distance.toFixed(1)} km</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Contact</span>
                        <span className="text-slate-800">{doc.phoneNumber}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Proximity Intake Action Panel */}
        <div className="lg:col-span-1">
          {activeSession ? (
            <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm text-center space-y-4">
              <h3 className="font-bold text-slate-800 text-base">Active Consultation</h3>
              <p className="text-xs text-slate-500 font-semibold">{sessionStatusMessage}</p>
              
              {activeSession.status === 'Active' ? (
                <button
                  onClick={() => navigate('/patient/appointments')}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow transition-all animate-pulse"
                >
                  💬 Open Chat Room
                </button>
              ) : (
                <div className="py-2.5 bg-slate-100 text-slate-500 text-xs font-bold rounded-xl border border-slate-200">
                  ⏳ Awaiting Doctor Accept
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm space-y-5">
              <div>
                <h3 className="font-bold text-slate-800 text-base">Intake Form</h3>
                <p className="text-xs text-slate-500 font-medium">Select a physician to request consultation</p>
              </div>

              {selectedDoctor && (
                <div className="bg-primary-50 border border-primary-100 p-3 rounded-xl flex items-center justify-between">
                  <span className="text-xs font-bold text-primary-800">Target: {selectedDoctor.fullName}</span>
                  <button onClick={() => setSelectedDoctor(null)} className="text-xs text-slate-400 font-bold hover:text-slate-700">Clear</button>
                </div>
              )}

              <form onSubmit={handleSendRequestSubmit} className="space-y-4">
                <div>
                  <label htmlFor="symptoms-text" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Describe Symptoms
                  </label>
                  <div className="border border-slate-300 rounded-xl bg-white focus-within:ring-2 focus-within:ring-primary-500/20 focus-within:border-primary-500 transition-all overflow-hidden">
                    <textarea
                      id="symptoms-text"
                      required
                      rows="4"
                      value={symptoms}
                      onChange={(e) => setSymptoms(e.target.value)}
                      className="w-full px-3 py-2 focus:outline-none text-xs placeholder-slate-450 border-0 resize-none bg-transparent"
                      placeholder="e.g. persistent fever or skin rash..."
                    ></textarea>
                    
                    <div className="flex items-center justify-between border-t border-slate-100 p-2 bg-slate-50">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="p-1 hover:bg-slate-200 text-slate-500 rounded-lg transition-colors flex items-center gap-1"
                      >
                        📎 <span className="text-[10px] font-bold">Attach Photo</span>
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <span className="text-[10px] text-slate-400 font-medium">
                        {attachedFiles.length} file(s)
                      </span>
                    </div>
                  </div>
                </div>

                {attachedFiles.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {attachedFiles.map((file, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-700 text-[10px] font-semibold rounded-lg">
                        <span className="truncate max-w-[80px]">{file.name}</span>
                        <button type="button" onClick={() => removeAttachment(idx)} className="text-red-500 font-bold">×</button>
                      </span>
                    ))}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!selectedDoctor || isSubmittingRequest}
                  className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-xl shadow transition-all disabled:opacity-50"
                >
                  {isSubmittingRequest ? 'Sending Intake...' : 'Send Request'}
                </button>
              </form>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

export default PatientDoctors;
