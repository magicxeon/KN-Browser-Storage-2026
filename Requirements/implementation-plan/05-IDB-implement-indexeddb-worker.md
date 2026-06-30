[← Back to Storage Comparison Overview](file:///d:/development/KT-AXA/IndexDB/Requirements/implementation-plan/00-OVERVIEW-storage-comparison.md)

# 05-IDB-implement-indexeddb-worker

This document outlines the step-by-step implementation plan for the IndexedDB (Heavy-Duty Processing & Web Worker) Module, upgraded with **Neon Green theme styling** and an **interactive thread-blocking comparison tool**.

## 1. Goal Description
Demonstrate the massive storage capacity of `IndexedDB` and provide an interactive educational sandbox showing the difference between executing heavy calculations on the browser's Main Thread (freezing the UI) versus offloading to a `Web Worker` (background thread).

## 2. Design & UX/UI Specifications
*   **Theme Color**: Neon Green (`#22C55E`) used for status metrics, progress bars, and button hover glows (`hover:shadow-green-500/20`).
*   **Card Background**: `.glass-panel` with a subtle top border glow in Neon Green.
*   **Main Thread Active Indicator**: A highly fluid CSS orbital loading spinner running at 60fps.
*   **Educational Thread Selector (Toggle)**:
    1. **"Direct Main Thread Execution"**: Generates and writes 100k products in the main thread (intentionally freezing the orbital spinner to demonstrate UI blocking).
    2. **"Offloaded Web Worker Execution"** (Recommended): Generates and writes in the background, keeping the spinner completely smooth.
*   **Metrics & Logs**:
    *   Time elapsed indicator (seconds/milliseconds).
    *   Main Thread Block time (measured in ms using `requestAnimationFrame` latency detection).

## 3. Proposed Changes

### 3.1 Web Worker
*   **[MODIFY] [dataWorker.js](file:///d:/development/KT-AXA/IndexDB/frontend/src/workers/dataWorker.js)**
    *   Generates 100k mock items, opens db, and writes in chunks of 5,000.
    *   Dispatches progress updates and end events.

### 3.2 Hooks & Services
*   **[NEW] [useIndexedDB.js](file:///d:/development/KT-AXA/IndexDB/frontend/src/hooks/useIndexedDB.js)**
    *   Standard wrapper for opening IndexedDB database `ProductCatalogDB` with `idb`.
    *   Creates a `products` Object Store with keyPath `id`, and adds indices for `name` and `category`.
    *   Exposes search function utilizing index range scans.

### 3.3 Component
*   **[NEW] [ProductCatalogModule.jsx](file:///d:/development/KT-AXA/IndexDB/frontend/src/modules/ProductCatalogModule.jsx)**
    *   Layout displays the 60fps orbital spinner, progress indicators, search bar, and results list.
    *   **Controls**:
        *   **Execution Mode Toggle**: Main Thread vs Web Worker.
        *   **Generate 100,000 Products** button.
        *   **Search Box**: Instantly queries IndexedDB using key-range filters.
    *   **Performance Monitor**:
        *   Displays execution time.
        *   Tracks and displays frame drops (stutter) using a `requestAnimationFrame` loop.
        *   Shows Toast on completion: *"100,000 products synced to IndexedDB!"*.

---

## 4. Step-by-Step Task List

- [ ] Write schema configuration in `useIndexedDB.js`
- [ ] Create `dataWorker.js` background generation script
- [ ] Create UI inside `ProductCatalogModule.jsx` using `.glass-panel`
  - [ ] Add neon green border-top styling
  - [ ] Add the execution toggle switch (Main Thread vs Web Worker)
  - [ ] Build the 60fps orbital loader animation
- [ ] Write the Main Thread execution function (to generate & insert directly in React context)
- [ ] Write the Web Worker trigger handler
- [ ] Implement the `requestAnimationFrame` frame-lag detector to show thread block durations
- [ ] Implement the Search and Pagination list displaying product results
- [ ] Mount in `App.jsx` and verify animations and database states.

---

## 5. Verification Plan

### Manual Verification
1. Open the panel and watch the orbital spinner rotate smoothly.
2. Select **Offloaded Web Worker Execution** and click **Generate 100,000 Products**.
   - Verify the progress bar counts to 100%.
   - Verify the orbital spinner continues to rotate **perfectly smoothly** (60fps) with **0ms** thread block reported.
3. Select **Direct Main Thread Execution** and click **Generate 100,000 Products**.
   - Verify the orbital spinner **stops completely** for a few seconds.
   - Verify the thread block report records a major lag (e.g. `2400ms locked`).
4. Type in the Search Box. Confirm results are returned in milliseconds.
