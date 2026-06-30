[← Back to Storage Comparison Overview](file:///d:/development/KT-AXA/IndexDB/Requirements/implementation-plan/00-OVERVIEW-storage-comparison.md)

# 06-CACHE-implement-serviceworker-caching

This document outlines the step-by-step implementation plan for the Cache Storage (Service Worker & Asset Caching) Module, upgraded with **Icy Cyan theme styling** and **latency comparative analytics**.

## 1. Goal Description
Demonstrate how `Cache Storage` managed by a `Service Worker` intercepts network calls to instantly serve static assets. Provide an interactive educational console showing the latency differences between fetching assets from network servers versus local cache systems.

## 2. Design & UX/UI Specifications
*   **Theme Color**: Icy Cyan (`#06B6D4`) used for highlights, charts, and loading indicators.
*   **Card Background**: `.glass-panel` with a subtle top border glow in Icy Cyan.
*   **Service Worker State Badge**: Dynamic status indicator (Unregistered (red) -> Registering (orange) -> Active & Intercepting (cyan)).
*   **Latency Comparative Chart**:
    *   Side-by-side or stacked horizontal bar charts comparing **Network Latency** (red/gray bar) vs. **Cache Latency** (cyan bar).
    *   Clearly display millisecond values (e.g., `1200ms` vs `4ms`) and percentage speedups (e.g. `99.6% faster`).

## 3. Proposed Changes

### 3.1 Service Worker
*   **[MODIFY] [sw.js](file:///d:/development/KT-AXA/IndexDB/frontend/public/sw.js)**
    *   Listens to `fetch` events. Intercepts files inside the `/mock-data/` directory.
    *   Implements the **Cache-First, Network Fallback** pattern: checks cache, falls back to network, and dynamically caches new requests in `v1-asset-cache`.

### 3.2 Component
*   **[NEW] [AssetLoaderModule.jsx](file:///d:/development/KT-AXA/IndexDB/frontend/src/modules/AssetLoaderModule.jsx)**
    *   Registers service worker on mounting, updating status state.
    *   **Controls**:
        *   **Fetch Heavy Image** button: queries a large test asset (e.g. 5MB image inside `/mock-data/`).
        *   **Purge Image Cache** button: resets the experiment.
    *   **Educational latency tracker**:
        *   Measures fetch start/stop using high-precision timers (`performance.now()`).
        *   Renders the Latency Comparative Chart.
        *   Prints descriptive logs: *"Request intercepted by Service Worker. Serving from Cache Storage: Success."*
        *   Fires Toast notification: *"Asset retrieved in [X] ms!"*.

---

## 4. Step-by-Step Task List

- [ ] Place mock image file in `frontend/public/mock-data/heavy-image.jpg`
- [ ] Create Service Worker interception code in `sw.js`
- [ ] Build the layout for `AssetLoaderModule.jsx` using `.glass-panel`
  - [ ] Add icy cyan border-top styling
  - [ ] Write educational notes regarding Service Worker fetch interception
  - [ ] Build the dynamic Service Worker State Badge
- [ ] Implement image fetching with high-resolution timer (`performance.now()`)
- [ ] Add the Latency Comparative Chart component
- [ ] Implement the Cache Purging trigger
- [ ] Mount in `App.jsx`.

---

## 5. Verification Plan

### Manual Verification
1. Load the page, confirm Service Worker State Badge shows "Active & Intercepting" in cyan.
2. Click **Fetch Heavy Image** (First Load):
   - Image displays, source logs "Network", loading time is recorded (e.g. 850ms).
   - Horizontal Network latency bar renders.
3. Click **Fetch Heavy Image** (Second Load):
   - Image displays instantly, source logs "Cache Storage", loading time records (e.g. 3ms).
   - Cyan Cache latency bar renders side-by-side with Network bar, highlighting speed differences.
4. Click **Purge Image Cache** and observe Toast notification. Refetch, and confirm it runs via network again.
