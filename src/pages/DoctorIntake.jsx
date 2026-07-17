import React, { useState, useEffect, useRef } from 'react';
import { consultationService } from '../services/api';
import { useAuth, useToast } from '../App';

// Acceptance Timer Request Card Component (handles drift on backgrounding)
const IncomingRequestCard = ({ request, onAccept, onDecline }) => {
  const { sessionId, patientName, symptoms, expiresAt, attachmentsCount } = request;

  const calculateSecondsRemaining = () => {
    const difference = new Date(expiresAt) - new Date();
    return Math.max(0, Math.floor(difference / 1000));
  };

  const [secondsLeft, setSecondsLeft] = useState(calculateSecondsRemaining());
  const timerRef = useRef(null);

  useEffect(() => {
    const tick = () => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          onDecline(sessionId, true); // Auto-decline when timer expires
          return 0;
        }
        return prev - 1;
      });
    };

    timerRef.current = setInterval(tick, 1000);

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        const realRemaining = calculateSecondsRemaining();
        setSecondsLeft(realRemaining);
        if (realRemaining <= 0) {
          clearInterval(timerRef.current);
          onDecline(sessionId, true);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(timerRef.current);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [expiresAt, sessionId, onDecline]);

  const formatTime = (totalSec) => {
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const getTimerColorClass = () => {
    if (secondsLeft > 180) return 'bg-emerald-50 text-emerald-700 border-emerald-250';
    if (secondsLeft > 60) return 'bg-amber-50 text-amber-700 border-amber-250';
    return 'bg-red-50 text-red-700 border-red-250 animate-pulse';
  };

  return (
    <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-lg w-full max-w-md space-y-5 animate-fadeIn">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Consultation Request</span>
        <div className={`px-3 py-1 border text-sm font-extrabold rounded-full ${getTimerColorClass()}`}>
          ⏳ {formatTime(secondsLeft)}
        </div>
      </div>

      <div className="space-y-1">
        <h4 className="text-lg font-bold text-slate-800">{patientName}</h4>
        <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-2xl">
          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Symptoms Description</span>
          <p className="text-xs text-slate-700 font-semibold leading-relaxed line-clamp-3">"{symptoms}"</p>
        </div>
      </div>

      {attachmentsCount > 0 && (
        <div className="flex items-center gap-1.5 text-xs font-bold text-primary-600 bg-primary-50 px-3 py-1.5 rounded-xl border border-primary-200/50">
          📎 Connected Files: {attachmentsCount} photo(s)
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 pt-2">
        <button
          onClick={() => onDecline(sessionId, false)}
          className="w-full py-2.5 bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-700 text-xs font-bold rounded-xl border border-slate-200 hover:border-red-200 transition-all duration-200"
        >
          Decline
        </button>
        <button
          onClick={() => onAccept(sessionId)}
          className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-xl shadow-md transition-all duration-200"
        >
          Accept
        </button>
      </div>
    </div>
  );
};

const DoctorIntake = () => {
  const [incomingRequest, setIncomingRequest] = useState(null);
  const [activeSession, setActiveSession] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [currentMessageText, setCurrentMessageText] = useState('');
  const [statusMessage, setStatusMessage] = useState('Workspace active. Listening for real-time patient requests...');
  
  const { showToast } = useToast();

  // Restore state and subscribe to websocket simulation callbacks on mount
  useEffect(() => {
    try {
      const data = localStorage.getItem('hms_active_sessions');
      if (data) {
        const parsed = JSON.parse(data);
        const pending = parsed.find(s => s.status === 'Pending');
        const active = parsed.find(s => s.status === 'Active');

        if (pending) {
          setIncomingRequest(pending);
          setStatusMessage('ALERT: Received a new consultation request! Accept guardrail active.');
        } else if (active) {
          setActiveSession(active);
          setStatusMessage('Connected with patient. Clinical session active.');
          setChatMessages([
            { id: 1, sender: 'System', text: 'Secured encryption keys loaded. Admin logs restricted to metadata.' },
            { id: 2, sender: 'Patient', text: `Hello Doctor, I sent my symptoms regarding: "${active.symptoms}".` }
          ]);
        }
      }
    } catch (e) {
      console.error('Error restoring doctor session', e);
    }

    consultationService.registerDoctorListener((req) => {
      setIncomingRequest(req);
      setStatusMessage('ALERT: Received a new consultation request! Accept guardrail active.');
      showToast('ALERT: Received a new patient consultation request!', 'info');
    });
  }, []);

  const handleAccept = async (sessionId) => {
    try {
      const sess = await consultationService.acceptRequest(sessionId);
      setActiveSession(sess);
      setIncomingRequest(null);
      setStatusMessage('Connected with patient. Clinical session active.');
      setChatMessages([
        { id: 1, sender: 'System', text: 'Secured encryption keys loaded. Admin logs restricted to metadata.' },
        { id: 2, sender: 'Patient', text: `Hello Doctor, I sent my symptoms regarding: "${incomingRequest?.symptoms || sess?.symptoms}".` }
      ]);
      showToast('Intake request accepted. Chat session connected.', 'success');
    } catch (err) {
      console.error(err);
      setStatusMessage('Failed to accept session.');
      showToast('Failed to accept session.', 'error');
    }
  };

  const handleDecline = async (sessionId, isTimeout = false) => {
    try {
      await consultationService.rejectRequest(sessionId);
      setIncomingRequest(null);
      const declineMsg = isTimeout ? 'Request expired (5-minute Acceptance timer exceeded).' : 'Request declined.';
      setStatusMessage(declineMsg);
      showToast(declineMsg, isTimeout ? 'error' : 'info');
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!currentMessageText.trim()) return;
    setChatMessages([...chatMessages, { id: Date.now(), sender: 'Doctor', text: currentMessageText }]);
    setCurrentMessageText('');
    
    setTimeout(() => {
      setChatMessages(prev => [...prev, { 
        id: Date.now() + 1, 
        sender: 'Patient', 
        text: 'Thank you doctor. I have updated my notes.' 
      }]);
    }, 1000);
  };

  return (
    <div className="bg-slate-50 min-h-screen py-8 px-4 sm:px-6 lg:px-8 space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-800 text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden">
        <div className="absolute -right-4 -bottom-16 w-32 h-32 bg-white/10 rounded-full filter blur-xl"></div>
        <div className="relative z-10 space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider bg-white/20 px-2.5 py-1 rounded-full">
            Doctor Workspace
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-2">
            Intake & Alerts
          </h2>
          <p className="text-sm text-emerald-100 max-w-xl">
            Accept real-time intakes, manage consultation timers, and connect with waiting patients.
          </p>
        </div>
      </div>

      {/* Premium Dashboard Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm space-y-1">
          <span className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider">Queue status</span>
          <p className="text-sm font-extrabold text-slate-800">Workspace Active</p>
        </div>
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm space-y-1">
          <span className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider">Pending Intakes</span>
          <p className={`text-sm font-extrabold ${incomingRequest ? 'text-red-700 animate-pulse' : 'text-slate-500'}`}>
            {incomingRequest ? '1 Patient Waiting' : '0 Alerts'}
          </p>
        </div>
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm space-y-1">
          <span className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider">Active Patient</span>
          <p className="text-sm font-extrabold text-slate-800">
            {activeSession ? activeSession.patientName : 'None Connected'}
          </p>
        </div>
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm space-y-1">
          <span className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider">Link Protocol</span>
          <p className="text-sm font-extrabold text-emerald-700">Real-time WS-T</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Workspace notification and active case */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 p-5 rounded-3xl shadow-sm flex items-center gap-3">
            <span className="flex h-2.5 w-2.5 bg-emerald-500 rounded-full animate-ping"></span>
            <span className="text-xs font-bold text-slate-600">{statusMessage}</span>
          </div>

          {incomingRequest ? (
            <div className="flex justify-center md:justify-start">
              <IncomingRequestCard
                request={incomingRequest}
                onAccept={handleAccept}
                onDecline={handleDecline}
              />
            </div>
          ) : !activeSession ? (
            <div className="bg-white border border-slate-200 p-8 rounded-3xl text-center text-slate-400 font-semibold shadow-sm">
              Waiting for incoming consultation requests...
            </div>
          ) : null}

          {activeSession && (
            <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm space-y-5">
              <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
                <h4 className="font-bold text-slate-800 text-sm">Consultation Diagnostics & Rx</h4>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-250">
                  Active Clinical Workspace
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <span className="block text-xs font-bold text-slate-450 uppercase tracking-wider mb-1">Case Intake symptoms</span>
                  <p className="text-xs text-slate-650 bg-slate-50 border border-slate-100 p-3 rounded-xl font-medium italic">
                    "{activeSession.symptoms}"
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-450 uppercase tracking-wider">Clinical Prescriptions (Rx)</label>
                  <textarea
                    rows="3"
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-xs font-semibold"
                    placeholder="e.g. Paracetamol 500mg as needed for fever..."
                  ></textarea>
                </div>

                <button
                  onClick={() => {
                    // Update session status in storage to prevent stale active screens on reload
                    try {
                      const data = localStorage.getItem('hms_active_sessions');
                      if (data) {
                        const parsed = JSON.parse(data);
                        const current = parsed.find(s => s.sessionId === activeSession.sessionId);
                        if (current) {
                          current.status = 'Completed';
                          localStorage.setItem('hms_active_sessions', JSON.stringify(parsed));
                        }
                      }
                    } catch (e) {}
                    
                    showToast('Prescription details saved to clinical archives!', 'success');
                    setActiveSession(null);
                    setChatMessages([]);
                    setStatusMessage('Consultation complete. Listening for next patient requests...');
                  }}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow transition-all"
                >
                  Complete Consultation & Save Rx
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Encrypted Chat Session Console */}
        <div className="lg:col-span-1">
          {activeSession ? (
            <div className="bg-white border border-slate-200 rounded-3xl shadow-lg flex flex-col h-[520px] overflow-hidden">
              <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm">Patient Session: {activeSession.patientName}</h4>
                  <span className="text-[10px] text-slate-450 font-semibold uppercase">Secured Tunnel</span>
                </div>
                <span className="text-[10px] font-bold bg-emerald-650 px-2 py-0.5 rounded-full">
                  {activeSession.status}
                </span>
              </div>

              <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50">
                {chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col max-w-[80%] ${
                      msg.sender === 'Doctor' ? 'ml-auto items-end' : 'mr-auto items-start'
                    }`}
                  >
                    <span className="text-[10px] text-slate-400 font-bold mb-0.5">{msg.sender}</span>
                    <div
                      className={`p-3 rounded-2xl text-xs font-semibold leading-relaxed ${
                        msg.sender === 'Doctor'
                          ? 'bg-emerald-650 text-white rounded-tr-none'
                          : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-100 bg-white flex gap-2">
                <input
                  type="text"
                  value={currentMessageText}
                  onChange={(e) => setCurrentMessageText(e.target.value)}
                  className="flex-1 px-3 py-2 border border-slate-200 rounded-xl focus:outline-none text-xs"
                  placeholder="Type message response..."
                />
                <button
                  type="submit"
                  className="px-3 bg-emerald-650 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl"
                >
                  Send
                </button>
              </form>

              <button
                onClick={() => {
                  try {
                    const data = localStorage.getItem('hms_active_sessions');
                    if (data) {
                      const parsed = JSON.parse(data);
                      const current = parsed.find(s => s.sessionId === activeSession.sessionId);
                      if (current) {
                        current.status = 'Completed';
                        localStorage.setItem('hms_active_sessions', JSON.stringify(parsed));
                      }
                    }
                  } catch (e) {}
                  
                  showToast('Consultation session terminated. Case archived.', 'info');
                  setActiveSession(null);
                  setChatMessages([]);
                  setStatusMessage('Consultation complete. Listening for next patient requests...');
                }}
                className="py-2.5 bg-slate-900 hover:bg-slate-950 text-slate-400 text-[10px] font-bold text-center border-t border-slate-800"
              >
                Terminate Session
              </button>
            </div>
          ) : (
            <div className="bg-slate-100 border border-dashed border-slate-355 rounded-3xl h-[520px] flex items-center justify-center p-6 text-center text-xs text-slate-400 font-semibold shadow-inner">
              Establish a direct session with a patient to unlock the secured chat console.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

export default DoctorIntake;
