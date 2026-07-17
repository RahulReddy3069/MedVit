# Walkthrough - Unified Consultation App (Desktop Workspace)

We have successfully migrated and set up the unified frontend and backend codebase directly inside the folder:
📂 **`C:\Users\rahul\Desktop\my-test-app`**

---

## 📁 Project Directory Layout

The application folders have been structured as follows:
```
C:\Users\rahul\Desktop\my-test-app\
├── package.json                # Frontend package dependencies configuration
├── index.html                  # Main React page entrypoint with custom SEO title
├── tailwind.config.js          # Tailwind CSS layout configurations
├── postcss.config.js           # PostCSS configuration
├── src/                        # React Frontend source folder
│   ├── main.jsx                # Render entrypoint
│   ├── App.jsx                 # Side Navigation Workspace Shell & Protected Routing
│   ├── index.css               # Base Tailwind imports & Google Font
│   ├── services/
│   │   └── api.js              # Centralized Axios client & mock events pipeline
│   ├── components/             # Sub-components (AppointmentForm, PatientHistory, etc.)
│   └── pages/                  # Main pages (Home, Login, Dashboard wrappers)
└── backend/                    # Spring Boot Java Backend source folder
    ├── pom.xml                 # Maven packages setup
    ├── src/main/resources/
    │   ├── application.properties # Server database connection config
    │   └── schema.sql          # MySQL database schema script with Spatial Indexes
    └── src/main/java/          # Java Spring Boot source modules
```

---

## 🚀 How to Run the App

1. **Start the Frontend**:
   - Navigate to `C:\Users\rahul\Desktop\my-test-app` in your Command Prompt.
   - Run `npm install` followed by `npm run dev`.
   - Open **`http://localhost:5173`** (or `5174` if `5173` is busy) in your browser.

2. **Start the Backend**:
   - Ensure JDK 17 and MySQL are installed.
   - Initialize the database via the SQL commands in `backend/src/main/resources/schema.sql`.
   - Open and run the backend folder inside your Java IDE or run `./mvnw spring-boot:run` in `backend/`.

---

## 🛠️ Production-Ready Features Added

1. **Reactive Auth Context (`AuthProvider`)**:
   - Centralized authentication state management so login/logout actions update state instantly across the app layout without page reloads.

2. **Dynamic UI Toast Manager (`ToastProvider`)**:
   - Fully custom-designed sliding Toast component with micro-animations that replaces default, jarring browser alerts.

3. **Dual WebSocket Strategy**:
   - Real-time communication established over Live WebSockets when connected, with automatic, transparent fallback to simulated, cross-tab synchronized `localStorage` events when offline.

4. **Premium Dashboard Analytics Cards**:
   - Unified analytics panels inserted across all Patient, Doctor, and Admin workspaces representing total consultations, active coordinates, compliance registry states, and medication courses.
