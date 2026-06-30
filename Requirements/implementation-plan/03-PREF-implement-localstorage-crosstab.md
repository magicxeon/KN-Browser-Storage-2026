[← Back to Storage Comparison Overview](file:///d:/development/KT-AXA/IndexDB/Requirements/implementation-plan/00-OVERVIEW-storage-comparison.md)

# 03-PREF-implement-localstorage-crosstab

This document outlines the step-by-step implementation plan for the LocalStorage (User Preferences) Module, updated with **Neon Red theme styling** and **educational logging mechanics**.

## 1. Goal Description
Demonstrate the persistence of `LocalStorage` and teach developers how to capture cross-tab updates using the browser's native `storage` event. The module will serve as a visual sandbox for configuring theme preferences and observing live data syncing.

## 2. Design & UX/UI Specifications
*   **Theme Color**: Neon Red (`#EF4444`) used for highlights, button hover glows (`hover:shadow-red-500/20`), and active indicators.
*   **Card Background**: `.glass-panel` with a subtle top border glow in Neon Red.
*   **Educational Context**: Section explaining LocalStorage constraints (5MB capacity, synchronous blocking, permanent scope).
*   **Live Synchronization Console**: A visual logger block showing storage events:
    *   Logs: Timestamp, Action Type, Key, Old Value, New Value, and Source Tab URL.
    *   Highlight animation (border flash) when the hook receives a sync event from another tab.

## 3. Proposed Changes

### 3.1 Hooks
*   **[MODIFY] [useLocalStorage.js](file:///d:/development/KT-AXA/IndexDB/frontend/src/hooks/useLocalStorage.js)**
    *   Add callbacks or event dispatching so components can subscribe to storage-event logs (passing details of `oldValue` -> `newValue`).

### 3.2 Component
*   **[NEW] [PreferencesModule.jsx](file:///d:/development/KT-AXA/IndexDB/frontend/src/modules/PreferencesModule.jsx)**
    *   Theme preview box that updates local variables instantly.
    *   **Controls**:
        *   Theme options: **Light**, **Dark**, **Solarized**.
        *   **Open Duplicate Tab** button to launch a side-by-side window.
    *   **Sync Monitor Console**:
        *   Displays a list of recent sync transactions.
        *   If updated from another tab, trigger a temporary glowing border animation around the console to catch the student's eye.
        *   Fire Toast notification: *"Synced theme change from another tab!"*

---

## 4. Step-by-Step Task List

- [ ] Modify `useLocalStorage.js` hook to support event callback notification
- [ ] Build the layout for `PreferencesModule.jsx` using `.glass-panel`
  - [ ] Add neon red border-top styling
  - [ ] Write educational notes regarding LocalStorage limits
  - [ ] Design theme selector buttons with custom glow effects (`shadow-red-500/20`)
- [ ] Create the Live Synchronization Console component
  - [ ] Setup event listener callback printing event updates
  - [ ] Add the CSS flash animation for incoming updates
- [ ] Configure the "Open Duplicate Tab" helper utility
- [ ] Mount module in `App.jsx` and verify persistence and cross-tab triggers.

---

## 5. Verification Plan

### Manual Verification
1. Select **Dark** or **Solarized** theme. Verify the preview card changes style instantly.
2. Click **Open Duplicate Tab** to position two windows next to each other.
3. Switch themes in Tab 1.
   - Confirm Tab 2 updates its theme instantly.
   - Confirm Tab 2 displays a border flash animation and logs: `key: theme, oldValue: [prev], newValue: [curr]` in the console.
   - Confirm Toast displays on Tab 2.
