# Web Storage Architecture & Security Sandbox

An interactive educational monorepo designed to demonstrate the runtime mechanics, storage limits, thread blockages, and security characteristics of modern browser storage mechanisms.

This project is built as a hands-on learning sandbox comparing:
1. **HttpOnly Cookies** (Secured Auth Contexts)
2. **LocalStorage** (Cross-Tab Synced States)
3. **SessionStorage** (Isolated Tab Sessions & I/O Debouncing)
4. **IndexedDB** (Heavy Datasets & Web Worker Thread Concurrency)
5. **Cache Storage** (Offline PWA Asset Interception via Service Workers)

---

## 🚀 System Architecture

The sandbox is split into a **Frontend Client** (Vite + React) and a **Backend API Server** (Express) to illustrate real-world network requests, cookie security controls, and cross-site scripting (XSS) / cross-site request forgery (CSRF) attack vectors.

```
                                  +------------------------------------+
                                  |         Browser Client             |
                                  |        (localhost:5173)            |
                                  +-----------------+------------------+
                                                    |
                         +--------------------------+--------------------------+
                         |                          |                          |
                         v                          v                          v
             +-----------+-----------+  +-----------+-----------+  +-----------+-----------+
             |    Main UI Thread     |  |    Web Worker Thread  |  |    Service Worker     |
             |       (React)         |  |   (dataWorker.js)     |  |       (sw.js)         |
             +-----------+-----------+  +-----------+-----------+  +-----------+-----------+
                         |                          |                          |
         +---------------+---------------+          v                          v
         v               v               v    [(IndexedDB)]             [(Cache Storage)]
  [(Cookies)]    [(LocalStorage)] [(SessionStorage)]
         ^
         | (HttpOnly GET/POST Requests)
         v
+--------+---------------------------+
|       Node.js Express Server      |
|          (localhost:7400)         |
+-----------------------------------+
```

---

## 🛠️ Tech Stack & Key Configurations

- **Frontend**: React (Vite-powered), Tailwind CSS, `idb` wrapper, Axios client (with credentials support).
- **Backend**: Node.js, Express, JSON Web Token (JWT) cookies, CORS middleware.
- **Proxy**: Vite configuration configured to forward `/api` requests to proxy port `7400` dynamically, maintaining same-origin integrity for cookie management.

---

## 📁 Directory Structure

```
web-storage-demo/
├── backend/                  # Node.js API Server
│   ├── middleware/
│   │   └── authMiddleware.js # JWT Validator
│   ├── .env                  # Port and Secrets config
│   ├── package.json
│   └── server.js             # API Endpoints
└── frontend/                 # React Client Application
    ├── public/
    │   ├── mock-data/        # Heavy mockup image asset folder
    │   └── sw.js             # Service Worker Cache interceptor
    ├── src/
    │   ├── api/
    │   │   └── axiosClient.js# Injects CSRF headers and credentials
    │   ├── components/
    │   │   └── StorageOverviewCard.jsx # Storage matrix comparison
    │   ├── dashboard/
    │   │   ├── JsonViewer.jsx# Collapsible syntax-highlighted JSON Tree
    │   │   └── StorageInspector.jsx # Storage gauges & Observer loop
    │   ├── hooks/
    │   │   ├── useIndexedDB.js
    │   │   ├── useLocalStorage.js
    │   │   └── useSessionStorage.js
    │   ├── modules/
    │   │   ├── AuthModule.jsx          # Cookie module & simulators
    │   │   ├── PreferencesModule.jsx   # LocalStorage cross-tab sync
    │   │   ├── DraftFormModule.jsx     # Session debouncing & isolations
    │   │   ├── ProductCatalogModule.jsx# IndexedDB generator & V8 lock
    │   │   └── AssetLoaderModule.jsx   # Cache benchmarking
    │   ├── styles/
    │   │   └── glassmorphism.css
    │   ├── App.jsx
    │   └── main.jsx
    ├── .env                  # Frontend ports config
    ├── tailwind.config.js
    └── vite.config.js
```

---

## ⚙️ Setup & Installation

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed (v16+ recommended).

### 1. Setup Environments
Create `.env` configurations in both directory roots (these should already be preconfigured in your workspace):
- **backend/.env**:
  ```env
  PORT=7400
  JWT_SECRET=super_secured_secret_key_102
  ```
- **frontend/.env**:
  ```env
  VITE_PORT=5173
  VITE_API_URL=http://localhost:7400
  ```

### 2. Install Dependencies
Run npm installations in both scopes:
```bash
# In backend/
cd backend
npm install

# In frontend/
cd ../frontend
npm install
```

### 3. Copy Caching Demo Asset
To test Cache Storage interception, copy the generated technology background image to the frontend public mock data folder:
```powershell
# Run in project root (Windows Powershell)
Copy-Item "C:\Users\punya\.gemini\antigravity-ide\brain\546f83fb-859d-40bc-a5a4-eb3dd65c0037\heavy_image_1782793953861.png" "frontend/public/mock-data/heavy-image.png"
```

---

## 🚦 Running the Applications

Open two separate terminals:

### Start Backend Server
```bash
cd backend
npm run dev
```
*App will start listening on port `7400`.*

### Start Frontend Server
```bash
cd frontend
npm run dev
```
*Vite local server will host client on port `5173`.*

---

## 🎓 Educational Sandbox Guide

### Module 1: HttpOnly Cookies (Security Boundary)
- **Concept**: Demonstrates how authorization tokens should be stored out of reach of client-side Javascript.
- **Demo Flow**:
  1. Click **Login** to authorize.
  2. Click **Simulate XSS**: Notice that `document.cookie` returns nothing because the cookie is marked `HttpOnly`.
  3. Click **Simulate CSRF Attack**: Tries to call `/api/profile` omitting the CSRF headers. Express rejects it with a `403 Forbidden` response despite cookies being automatically attached.

### Module 2: LocalStorage (State Persistence & Sync)
- **Concept**: Persistent key-value storage synced across all browser windows.
- **Demo Flow**:
  1. Click **Open Duplicate Tab** and place the windows side-by-side.
  2. Toggle themes (Dark/Light/Solarized) in tab 1.
  3. Observe that tab 2 synchronizes instantly, and its border flashes **Neon Red** as the `storage` event handler intercepts the cross-tab notification.

### Module 3: SessionStorage (Isolation & I/O Tuning)
- **Concept**: Data isolated strictly per browser tab session. Shows debouncing techniques to prevent Main Thread locking.
- **Demo Flow**:
  1. Type in the text draft area. Observe the I/O timeline dots.
  2. Notice how the input is debounced by 500ms, minimizing disk writes.
  3. Click **Open with Session Clone**: Observe that browser clones current values to the child window.
  4. Click **Open with noopener**: Observe that window opens empty (Isolated Session).

### Module 4: IndexedDB (Workers vs Main Thread)
- **Concept**: Large transactional stores. Illustrates browser lockups due to massive main thread calculations.
- **Demo Flow**:
  1. Toggle to **⚠️ Main Thread Mode** -> Click **Generate 100k Products**.
     - Observe the green dashed loader spinner **stops rotating completely (freezes)** for 2 seconds because the V8 main thread is blocked. The telemetry records the exact freeze milliseconds.
  2. Clear database -> Toggle to **🚀 Web Worker Mode** -> Click **Generate**.
     - Observe the spinner **continues to rotate smoothly at 60fps** because data prep and writes are offloaded to `dataWorker.js`.
  3. Type in the search box to test prefix range indexes (`searchProducts` completes in **< 5ms**).

### Module 5: Cache Storage (Instant Offline Assets)
- **Concept**: Service Worker interceptor caching static files.
- **Demo Flow**:
  1. Click **Fetch Heavy Image** (First Load): Serves from network (`[Network]` indicator, ~300ms latency).
  2. Click **Fetch Heavy Image** again (Second Load): Serves from Cache Storage (`[Cache-Storage]` indicator, ~2ms latency).
  3. Speedup factor bar displays performance gains (e.g. `200x Faster!`).

### Storage Inspector (Live Telemetry Monitor)
- Located on the right panel. It runs a 1-second polling loop checking sizes.
- Displays color-coded progress bars tracking capacity thresholds (LocalStorage: Neon Red, SessionStorage: Neon Orange, IndexedDB: Neon Green, Cache Storage: Icy Cyan).
- Renders an interactive **JSON Tree Viewer** colorizing values and offering folding collapse nodes.
- Click **💥 Clear All Storages** to wipe all databases and cookies simultaneously.
