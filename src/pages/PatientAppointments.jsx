import React, { useState, useEffect } from 'react';
import { consultationService } from '../services/api';
import { useAuth, useToast } from '../App';

const PatientAppointments = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  
  // Selection & Active states
  const [activeSession, setActiveSession] = useState(null);
  const [sessionStatusMessage, setSessionStatusMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [currentMessageText, setCurrentMessageText] = useState('');

  // Local mock list of appointments
  const [appointments, setAppointments] = useState([
    { id: 'app-1', doctorName: 'Dr. Sarah Jenkins', date: '2026-07-12', time: '10:00 AM', symptoms: 'Routine health checkup', status: 'Completed' },
    { id: 'app-2', doctorName: 'Dr. David Kim', date: '2026-07-14', time: '02:30 PM', symptoms: 'Seasonal flu symptoms', status: 'Completed' }
  ]);

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
            setSessionStatusMessage('Your request was accepted by the doctor! Chat session is active.');
            setChatMessages([
              { id: 1, sender: 'Doctor', text: 'Hello! I have reviewed your case details. How can I help you today?' }
            ]);
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
      setSessionStatusMessage('Your request was accepted by the doctor! Chat session is active.');
      setChatMessages([
        { id: 1, sender: 'Doctor', text: `Hello! I have reviewed your case details regarding: "${acceptedSession.symptoms}". How can I help you today?` }
      ]);
      showToast('Clinical session established! Connection secure.', 'success');
      
      const newApp = {
        id: acceptedSession.sessionId,
        doctorName: 'Dr. Marcus Vance',
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        symptoms: acceptedSession.symptoms,
        status: 'Active'
      };
      setAppointments(prev => [newApp, ...prev]);
    });

    consultationService.registerPatientRejectionListener(() => {
      setActiveSession(null);
      setSessionStatusMessage('');
      setChatMessages([]);
      showToast('Your request was declined or expired.', 'error');
    });
  }, []);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!currentMessageText.trim()) return;
    setChatMessages([...chatMessages, { id: Date.now(), sender: 'Patient', text: currentMessageText }]);
    setCurrentMessageText('');
    
    setTimeout(() => {
      setChatMessages(prev => [...prev, { 
        id: Date.now() + 1, 
        sender: 'Doctor', 
        text: 'Understood. We will discuss this during our direct session.' 
      }]);
    }, 1000);
  };

  const handleExitWorkspace = () => {
    // Set status to Completed in storage on exit
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

    setActiveSession(null);
    setChatMessages([]);
    setSessionStatusMessage('');
    showToast('Secure room terminated. Case summary archived.', 'info');
  };

  return (
    <div className="bg-slate-50 min-h-screen py-8 px-4 sm:px-6 lg:px-8 space-y-6">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden flex justify-between items-center">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider bg-white/20 px-2.5 py-1 rounded-full">
            Active Records
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-2">
            Consultations & Appointments
          </h2>
          <p className="text-sm text-primary-100 max-w-xl mt-1">
            Access previous diagnosis summaries and open your real-time secure consultation rooms.
          </p>
        </div>
      </div>

      {/* Premium Dashboard Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm space-y-1">
          <span className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider">Total Consultations</span>
          <p className="text-sm font-extrabold text-slate-800">{appointments.length} Visits</p>
        </div>
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm space-y-1">
          <span className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider">Active Workspace</span>
          <p className={`text-sm font-extrabold ${activeSession ? 'text-primary-650' : 'text-slate-500'}`}>
            {activeSession ? activeSession.status : 'None Active'}
          </p>
        </div>
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm space-y-1">
          <span className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider">Attending Doctor</span>
          <p className="text-sm font-extrabold text-slate-800">
            {activeSession ? 'Dr. Marcus Vance' : 'None Assigned'}
          </p>
        </div>
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm space-y-1">
          <span className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider">Connection Integrity</span>
          <p className="text-sm font-extrabold text-emerald-700">Secured SSL-T</p>
        </div>
      </div>

      {/* Main Grid split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Appointments table list */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm space-y-4">
            <div>
              <h3 className="font-bold text-slate-800 text-base">Consultation Log</h3>
              <p className="text-xs text-slate-500 font-semibold">Track scheduling and connection states</p>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-100">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Doctor</th>
                    <th className="py-3 px-4">Symptoms Description</th>
                    <th className="py-3 px-4">Match Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                  {appointments.map((app) => (
                    <tr key={app.id}>
                      <td className="py-3 px-4">{app.date}</td>
                      <td className="py-3 px-4">{app.doctorName}</td>
                      <td className="py-3 px-4 truncate max-w-xs">{app.symptoms}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                          app.status === 'Active' ? 'bg-primary-50 text-primary-700 border border-primary-200' :
                          app.status === 'Completed' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {app.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Chat Console workspace panel */}
        <div className="lg:col-span-1">
          {activeSession ? (
            <div className="bg-white border border-slate-200 rounded-3xl shadow-lg flex flex-col h-[520px] overflow-hidden">
              <div className="bg-slate-900 text-white p-4 flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-sm">Active Session</h4>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase">Secured Room</span>
                  </div>
                  <span className="text-[10px] font-bold bg-primary-600 px-2 py-0.5 rounded-full">
                    {activeSession.status}
                  </span>
                </div>
                <span className="text-[10px] text-slate-300 italic">{sessionStatusMessage}</span>
              </div>

              <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50">
                {chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col max-w-[80%] ${
                      msg.sender === 'Patient' ? 'ml-auto items-end' : 'mr-auto items-start'
                    }`}
                  >
                    <span className="text-[10px] text-slate-400 font-bold mb-0.5">{msg.sender}</span>
                    <div
                      className={`p-3 rounded-2xl text-xs font-semibold leading-relaxed ${
                        msg.sender === 'Patient'
                          ? 'bg-primary-600 text-white rounded-tr-none'
                          : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>

              {activeSession.status === 'Active' && (
                <div className="p-3 border-t border-slate-100 bg-slate-50 space-y-2">
                  {user.subscription === 'Premium' ? (
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => alert(`Video Call unlocked`)}
                          className="py-1.5 bg-primary-100 hover:bg-primary-200 text-primary-750 text-xs font-bold rounded-lg transition-colors"
                        >
                          🎥 Video Call
                        </button>
                        <button
                          onClick={() => alert(`Voice Call unlocked`)}
                          className="py-1.5 bg-primary-100 hover:bg-primary-200 text-primary-750 text-xs font-bold rounded-lg transition-colors"
                        >
                          📞 Voice Call
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-2 border border-slate-200 bg-slate-150 rounded-xl">
                      <span className="block text-[10px] text-slate-500 font-bold text-center">
                        ⚠️ Free Tier: Text Chat Only. Calling Features locked.
                      </span>
                    </div>
                  )}
                </div>
              )}

              <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-100 bg-white flex gap-2">
                <input
                  type="text"
                  disabled={activeSession.status !== 'Active'}
                  value={currentMessageText}
                  onChange={(e) => setCurrentMessageText(e.target.value)}
                  className="flex-1 px-3 py-2 border border-slate-200 rounded-xl focus:outline-none text-xs"
                  placeholder={activeSession.status === 'Active' ? 'Type Message...' : 'Waiting for doctor accept...'}
                />
                <button
                  type="submit"
                  disabled={activeSession.status !== 'Active'}
                  className="px-3 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-xl"
                >
                  Send
                </button>
              </form>

              <button
                onClick={handleExitWorkspace}
                className="py-2 bg-slate-900 hover:bg-slate-950 text-slate-400 text-[10px] font-bold text-center border-t border-slate-800"
              >
                Exit Workspace & Complete
              </button>
            </div>
          ) : (
            <div className="bg-slate-100 border border-dashed border-slate-350 rounded-3xl h-[520px] flex items-center justify-center p-6 text-center text-xs text-slate-400 font-semibold shadow-inner">
              Establish a direct session from the Find Doctors tab to unlock the real-time chat console.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

export default PatientAppointments;
