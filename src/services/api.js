import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

// Central Axios client
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token and tier configurations
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const userString = localStorage.getItem('user');
    
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    if (userString) {
      try {
        const user = JSON.parse(userString);
        // Include subscription headers to simulate Spring security roles
        if (user.subscription) {
          config.headers['X-Subscription-Tier'] = user.subscription;
        }
      } catch (e) {
        console.error('Error parsing user details', e);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const ENABLE_MOCK_FALLBACK = true;

// Mock database simulating geolocations, doctor distances, and subscription tiers
const mockDb = {
  doctors: [
    { id: 'doc-1', fullName: 'Dr. Sarah Jenkins', specialization: 'General Physician', phoneNumber: '+1-555-0192', lat: 37.7749, lng: -122.4194 }, // ~0.0 km (Within 5, 10, 15 km)
    { id: 'doc-2', fullName: 'Dr. Marcus Vance', specialization: 'Dermatologist', phoneNumber: '+1-555-0283', lat: 37.7950, lng: -122.4400 }, // ~2.8 km (Within 5, 10, 15 km)
    { id: 'doc-3', fullName: 'Dr. Elena Rostova', specialization: 'Pediatrician', phoneNumber: '+1-555-0348', lat: 37.7200, lng: -122.4800 }, // ~8.2 km (Within 10, 15 km only)
    { id: 'doc-4', fullName: 'Dr. David Kim', specialization: 'General Physician', phoneNumber: '+1-555-0421', lat: 37.6600, lng: -122.4900 }  // ~14.1 km (Within 15 km only)
  ],
  sessions: [],
  activeDoctorRequests: [], // Active matchmaking requests
  auditLogs: [
    { id: 'log-1', adminUserId: 'admin-01', actionPerformed: 'Admin Login', targetSessionId: null, ipAddress: '127.0.0.1', timestamp: '2026-07-14 21:00:00' },
    { id: 'log-2', adminUserId: 'admin-01', actionPerformed: 'Queried Registration Metadata Grid', targetSessionId: null, ipAddress: '127.0.0.1', timestamp: '2026-07-14 21:05:00' }
  ],
  users: [
    { userId: 'pat-01', email: 'patient@hospital.com', role: 'Patient', subscription: 'Standard', registeredAt: '2026-07-10', lastLoginTimestamp: '2026-07-14 21:30:00' },
    { userId: 'doc-02', email: 'doctor@hospital.com', role: 'Doctor', subscription: 'Standard', registeredAt: '2026-07-11', lastLoginTimestamp: '2026-07-14 21:30:00' },
    { userId: 'adm-03', email: 'admin@hospital.com', role: 'Admin', subscription: 'Standard', registeredAt: '2026-07-09', lastLoginTimestamp: '2026-07-14 21:30:00' }
  ]
};

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Haversine formula to compute distance in km between coordinates
const getDistanceKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Real Production WebSocket Connection Handler with automatic local storage fallback
let wsClientInstance = null;

export const webSocketManager = {
  connect: (userId, onEventReceived) => {
    try {
      const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8080/ws';
      wsClientInstance = new WebSocket(`${wsUrl}?userId=${userId}`);
      
      wsClientInstance.onopen = () => {
        console.log('Production WebSocket connection established');
      };
      
      wsClientInstance.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          onEventReceived(data);
        } catch (e) {
          console.error('Error parsing production websocket event', e);
        }
      };

      wsClientInstance.onclose = () => {
        console.log('Production WebSocket connection closed');
      };

      wsClientInstance.onerror = (error) => {
        console.warn('Real WS connection error. Running in Local Storage Mock mode.', error);
      };
    } catch (e) {
      console.warn('WS initialization failed. Running in Local Storage Mock mode.');
    }
  },

  disconnect: () => {
    if (wsClientInstance) {
      wsClientInstance.close();
      wsClientInstance = null;
    }
  },

  sendEvent: (eventPayload) => {
    if (wsClientInstance && wsClientInstance.readyState === WebSocket.OPEN) {
      wsClientInstance.send(JSON.stringify(eventPayload));
      return true;
    }
    return false;
  }
};

// Event system to simulate WebSockets/SSE callbacks between patient and doctor
const eventCallbacks = {
  onNewRequest: null,     // Doctor listens to new requests
  onSessionAccepted: null, // Patient listens to acceptance
  onSessionRejected: null  // Patient listens to rejection
};

// Storage database helpers to sync matchmaking sessions across different browser tabs
const getSessionsFromStorage = () => {
  try {
    const data = localStorage.getItem('hms_active_sessions');
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

const saveSessionsToStorage = (sessions) => {
  localStorage.setItem('hms_active_sessions', JSON.stringify(sessions));
};

// Cross-tab Event Synchronizer
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === 'hms_ws_request') {
      try {
        const data = JSON.parse(e.newValue);
        if (data && data.type === 'NEW_REQUEST' && eventCallbacks.onNewRequest) {
          eventCallbacks.onNewRequest(data.payload);
        }
      } catch (err) {
        console.error('Error parsing cross-tab request event', err);
      }
    } else if (e.key === 'hms_ws_response') {
      try {
        const data = JSON.parse(e.newValue);
        if (data && eventCallbacks.onSessionAccepted) {
          if (data.type === 'REQUEST_ACCEPTED') {
            eventCallbacks.onSessionAccepted(data.payload);
          } else if (data.type === 'REQUEST_REJECTED' && eventCallbacks.onSessionRejected) {
            eventCallbacks.onSessionRejected(data.payload);
          }
        }
      } catch (err) {
        console.error('Error parsing cross-tab response event', err);
      }
    }
  });
}


export const authService = {
  login: async (email, password) => {
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      return response.data;
    } catch (error) {
      if (ENABLE_MOCK_FALLBACK && (!error.response || error.code === 'ERR_NETWORK')) {
        await delay(500);
        
        // Match standard users or dynamically registered users
        const registeredUser = mockDb.users.find(u => u.email.toLowerCase() === email.toLowerCase());
        
        const credentials = {
          'admin@hospital.com': { token: 'mock-admin-token', role: 'Admin', name: 'System Admin', subscription: 'Standard' },
          'doctor@hospital.com': { token: 'mock-doctor-token', role: 'Doctor', name: 'Dr. Marcus Vance', subscription: 'Standard' },
          'patient@hospital.com': { token: 'mock-patient-token', role: 'Patient', name: 'John Doe', subscription: 'Standard' }
        };

        const match = credentials[email.toLowerCase()] || (registeredUser ? {
          token: 'mock-dynamic-' + registeredUser.role.toLowerCase() + '-token',
          role: registeredUser.role,
          name: email.split('@')[0],
          subscription: registeredUser.subscription
        } : null);

        if (match && password === email.split('@')[0] + '123') {
          return {
            token: match.token,
            role: match.role,
            user: { email, name: match.name, subscription: match.subscription }
          };
        } else {
          const authError = new Error('Invalid email or password. (For dynamic accounts, use <username>@hospital.com and <username>123)');
          authError.response = { status: 401 };
          throw authError;
        }
      }
      throw error;
    }
  },

  register: async (registerPayload) => {
    try {
      const response = await apiClient.post('/auth/register', registerPayload);
      return response.data;
    } catch (error) {
      if (ENABLE_MOCK_FALLBACK && (!error.response || error.code === 'ERR_NETWORK')) {
        await delay(500);
        
        const { email, role, name, subscription, specialization, phoneNumber, lat, lng } = registerPayload;
        
        const userId = 'user-' + Date.now();
        const newUser = {
          userId,
          email,
          role,
          subscription: role === 'Patient' ? (subscription || 'Standard') : 'Standard',
          registeredAt: new Date().toISOString().split('T')[0],
          lastLoginTimestamp: new Date().toISOString()
        };
        mockDb.users.push(newUser);
        
        if (role === 'Doctor') {
          const newDoc = {
            id: userId,
            fullName: name || email.split('@')[0],
            specialization: specialization || 'General Physician',
            phoneNumber: phoneNumber || '+1-555-9999',
            lat: parseFloat(lat) || 37.7749,
            lng: parseFloat(lng) || -122.4194
          };
          mockDb.doctors.push(newDoc);
        }
        
        return { success: true, user: newUser };
      }
      throw error;
    }
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
  }
};

export const doctorService = {
  // Proximity-based search using latitude, longitude, and km radius
  searchDoctors: async (lat, lng, radiusKm, specialty) => {
    try {
      const response = await apiClient.get('/doctors/search', {
        params: { lat, lng, radiusKm, specialty }
      });
      return response.data;
    } catch (error) {
      if (ENABLE_MOCK_FALLBACK && (!error.response || error.code === 'ERR_NETWORK')) {
        await delay(400);

        // Fetch user metadata for subscription checks
        const userString = localStorage.getItem('user');
        let subscription = 'Standard';
        try {
          if (userString) subscription = JSON.parse(userString).subscription || 'Standard';
        } catch (e) {}

        const parsedLat = parseFloat(lat);
        const parsedLng = parseFloat(lng);

        return mockDb.doctors
          .map(doc => {
            // Relocate mock doctors near the patient if coordinates differ from default San Francisco (37.7749, -122.4194)
            const sfLat = 37.7749;
            const sfLng = -122.4194;
            const dLat = doc.lat - sfLat;
            const dLng = doc.lng - sfLng;

            // If query is outside SF, center the mock doctors around patient's geolocation
            const queryIsNearSf = Math.abs(parsedLat - sfLat) < 0.5 && Math.abs(parsedLng - sfLng) < 0.5;
            const targetLat = queryIsNearSf ? doc.lat : (parsedLat + dLat);
            const targetLng = queryIsNearSf ? doc.lng : (parsedLng + dLng);

            const distance = getDistanceKm(parsedLat, parsedLng, targetLat, targetLng);
            return { ...doc, lat: targetLat, lng: targetLng, distance };
          })
          .filter(doc => doc.distance <= radiusKm && (!specialty || doc.specialization === specialty))
          .map(doc => {
            // Apply phone masking for standard users
            const isPremium = subscription === 'Premium';
            return {
              id: doc.id,
              fullName: doc.fullName,
              specialization: doc.specialization,
              latitude: doc.lat,
              longitude: doc.lng,
              distance: doc.distance,
              phoneNumber: isPremium ? doc.phoneNumber : '★-★★★-★★★-' + doc.phoneNumber.substring(doc.phoneNumber.length - 4),
              premiumUnlocked: isPremium
            };
          });
      }
      throw error;
    }
  }
};

export const consultationService = {
  // Register callbacks to simulate websocket SSE pipelines
  registerDoctorListener: (callback) => {
    eventCallbacks.onNewRequest = callback;
  },
  registerPatientListener: (callback) => {
    eventCallbacks.onSessionAccepted = callback;
  },
  registerPatientRejectionListener: (callback) => {
    eventCallbacks.onSessionRejected = callback;
  },

  submitRequest: async (patientId, doctorId, symptoms, attachments) => {
    try {
      const formData = new FormData();
      formData.append('patientId', patientId);
      formData.append('doctorId', doctorId);
      formData.append('symptoms', symptoms);
      if (attachments && attachments.length > 0) {
        for (let i = 0; i < attachments.length; i++) {
          formData.append('attachments', attachments[i]);
        }
      }
      const response = await apiClient.post('/consultations/request', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // Send live websocket event if connected
      webSocketManager.sendEvent({
        type: 'NEW_REQUEST',
        payload: response.data
      });

      return response.data;
    } catch (error) {
      if (ENABLE_MOCK_FALLBACK && (!error.response || error.code === 'ERR_NETWORK')) {
        await delay(500);
        
        const now = new Date();
        const expiresAt = new Date(now.getTime() + 5 * 60 * 1000).toISOString(); // 5-minute countdown

        const newRequest = {
          sessionId: 'sess-' + Date.now(),
          patientId,
          patientName: 'John Doe',
          symptoms,
          expiresAt,
          status: 'Pending',
          attachmentsCount: attachments ? attachments.length : 0
        };

        // Write request to persistent storage so doctor's tab can find it
        const sessions = getSessionsFromStorage();
        sessions.push(newRequest);
        saveSessionsToStorage(sessions);

        // Notify local listener if running in same window
        if (eventCallbacks.onNewRequest) {
          setTimeout(() => {
            eventCallbacks.onNewRequest(newRequest);
          }, 300);
        }

        // Emit cross-tab storage notification
        localStorage.setItem('hms_ws_request', JSON.stringify({
          type: 'NEW_REQUEST',
          payload: newRequest,
          timestamp: Date.now()
        }));

        return newRequest;
      }
      throw error;
    }
  },

  acceptRequest: async (sessionId) => {
    try {
      const response = await apiClient.post(`/consultations/${sessionId}/accept`);
      
      // Send live websocket acceptance event
      webSocketManager.sendEvent({
        type: 'REQUEST_ACCEPTED',
        payload: response.data
      });

      return response.data;
    } catch (error) {
      if (ENABLE_MOCK_FALLBACK && (!error.response || error.code === 'ERR_NETWORK')) {
        await delay(400);
        
        const sessions = getSessionsFromStorage();
        const session = sessions.find(s => s.sessionId === sessionId);
        if (session) {
          session.status = 'Active';
          saveSessionsToStorage(sessions);
          
          // Trigger local callback
          if (eventCallbacks.onSessionAccepted) {
            setTimeout(() => {
              eventCallbacks.onSessionAccepted(session);
            }, 300);
          }

          // Trigger cross-tab storage event
          localStorage.setItem('hms_ws_response', JSON.stringify({
            type: 'REQUEST_ACCEPTED',
            payload: session,
            timestamp: Date.now()
          }));
        }
        return session;
      }
      throw error;
    }
  },

  rejectRequest: async (sessionId) => {
    try {
      const response = await apiClient.post(`/consultations/${sessionId}/reject`);
      
      // Send live websocket rejection event
      webSocketManager.sendEvent({
        type: 'REQUEST_REJECTED',
        payload: { sessionId }
      });

      return response.data;
    } catch (error) {
      if (ENABLE_MOCK_FALLBACK && (!error.response || error.code === 'ERR_NETWORK')) {
        await delay(300);
        const sessions = getSessionsFromStorage();
        const session = sessions.find(s => s.sessionId === sessionId);
        if (session) {
          session.status = 'Rejected';
          saveSessionsToStorage(sessions);

          // Trigger cross-tab storage event
          localStorage.setItem('hms_ws_response', JSON.stringify({
            type: 'REQUEST_REJECTED',
            payload: session,
            timestamp: Date.now()
          }));
        }
        return session;
      }
      throw error;
    }
  }
};

export const adminDashboardService = {
  getUsersMetadata: async (adminId) => {
    try {
      const response = await apiClient.get('/admin/users-metadata', { params: { adminId } });
      return response.data;
    } catch (error) {
      if (ENABLE_MOCK_FALLBACK && (!error.response || error.code === 'ERR_NETWORK')) {
        await delay(500);
        // Expose registration metadata only, strictly omit chats and symptoms
        return mockDb.users;
      }
      throw error;
    }
  },

  exportAuditLogs: async (adminId) => {
    try {
      const response = await apiClient.get('/admin/audit-logs/export', {
        params: { adminId },
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      if (ENABLE_MOCK_FALLBACK && (!error.response || error.code === 'ERR_NETWORK')) {
        await delay(400);
        // Generate mock CSV excluding chats
        const csvRows = [
          'LogID,AdminUserID,ActionPerformed,TargetSessionID,IPAddress,Timestamp',
          'log-1,admin-01,Admin Login,NULL,127.0.0.1,2026-07-14 21:00:00',
          'log-2,admin-01,Queried Registration Metadata Grid,NULL,127.0.0.1,2026-07-14 21:05:00',
          `log-3,admin-01,Triggered Legal CSV Export Flow,NULL,127.0.0.1,${new Date().toISOString()}`
        ];
        const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
        return blob;
      }
      throw error;
    }
  }
};

export default apiClient;
