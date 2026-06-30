[← Back to Storage Comparison Overview](file:///d:/development/KT-AXA/IndexDB/Requirements/implementation-plan/00-OVERVIEW-storage-comparison.md)

# 01-CORE-setup-workspace

This document outlines the step-by-step implementation plan for setting up the monorepo workspace containing the backend server (Node.js/Express) and the frontend application (React + Vite + Tailwind CSS), updated with the **Premium Dark Mode + Glassmorphism** design theme and educational layout requirements.

## 1. Goal Description
Establish the foundational directory structure, configure Tailwind CSS design tokens, import fonts (`Inter`/`Roboto` & `Fira Code`), set up the Glassmorphism stylesheet, and construct the split-screen workspace designed to serve as an interactive browser storage educational tool.

## 2. Directory Structure to Create
```text
web-storage-demo/
├── backend/
│   ├── package.json
│   ├── server.js
│   └── middleware/
│       └── authMiddleware.js
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── public/
    │   └── mock-data/
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── index.css
        ├── api/
        │   └── axiosClient.js
        ├── styles/
        │   └── glassmorphism.css         # Glassmorphism effects
        ├── components/
        │   └── Toast.jsx                 # Toast micro-interactions
        ├── hooks/
        ├── modules/
        └── dashboard/
```

## 3. Configuration & Files Detail

### 3.1 Styling & Fonts Configuration (`frontend/`)
*   **[NEW] [tailwind.config.js](file:///d:/development/KT-AXA/IndexDB/frontend/tailwind.config.js)**
    *   Extend configuration with custom color palette matching slide branding:
    ```javascript
    module.exports = {
      content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
      theme: {
        extend: {
          colors: {
            background: '#121212',
            surface: '#1E293B',
            module: {
              cookie: '#3B82F6',   // Neon Blue
              local: '#EF4444',    // Neon Red
              session: '#F97316',  // Neon Orange
              indexed: '#22C55E',  // Neon Green
              cache: '#06B6D4'     // Icy Cyan
            }
          },
          fontFamily: {
            sans: ['Inter', 'Roboto', 'sans-serif'],
            mono: ['Fira Code', 'monospace']
          }
        }
      },
      plugins: [],
    }
    ```
*   **[NEW] [index.css](file:///d:/development/KT-AXA/IndexDB/frontend/src/index.css)**
    *   Import Google Fonts (`Inter`, `Roboto`, `Fira Code`).
    *   Configure base dark background (`#121212`) and default typography.
*   **[NEW] [glassmorphism.css](file:///d:/development/KT-AXA/IndexDB/frontend/src/styles/glassmorphism.css)**
    *   Create class `.glass-panel` for clean translucent card panels:
    ```css
    .glass-panel {
      background: rgba(30, 41, 59, 0.7);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3);
      border-radius: 16px;
    }
    ```

### 3.2 Toast Component & Context (`frontend/src/components/Toast.jsx`)
*   Create a simple toast notification helper/context allowing modules to trigger alerts (e.g. "Saved to LocalStorage") that animate into the bottom-right corner and disappear after 3 seconds.

### 3.3 Main Layout Setup (`frontend/src/App.jsx`)
*   **Split-Screen Layout**:
    *   **Left Column (60% width)**: Scrollable interactive workspace containing the 5 demo modules stacked vertically.
    *   **Right Column (40% width)**: Sticky storage inspector panel displaying real-time capacities and the interactive JSON Tree Viewer.

---

## 4. Step-by-Step Task List

- [ ] Create `backend` directories and initialize dependencies
- [ ] Configure `frontend` dependencies and settings
  - [ ] Configure Tailwind with custom colors and fonts
  - [ ] Add Google Font imports inside `index.css`
  - [ ] Implement `glassmorphism.css`
  - [ ] Build global `Toast.jsx` provider
- [ ] Build initial `App.jsx` split screen
  - [ ] Left column container (Interactive Workspace)
  - [ ] Right column container (Sticky Storage Inspector Dashboard)
- [ ] Instruction for User: Execute package installations
  - [ ] Install Backend packages: `npm install` inside backend
  - [ ] Install Frontend packages: `npm install` inside frontend
- [ ] Verify Tailwind classes & Glassmorphism panels render correctly.

---

## 5. Verification Plan

### Manual Verification
1. Run both servers (`npm run dev`) and open the application in browser.
2. Verify font styles: UI elements render with Inter/Roboto, and code blocks use Fira Code.
3. Check the layout: confirm Left and Right columns maintain their respective 60/40 widths and the right pane is fixed/sticky when scrolling.
4. Verify that background is dark charcoal (`#121212`) and cards use the transparent blurred glass effect (`.glass-panel`).
