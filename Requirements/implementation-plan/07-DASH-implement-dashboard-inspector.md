[← Back to Storage Comparison Overview](file:///d:/development/KT-AXA/IndexDB/Requirements/implementation-plan/00-OVERVIEW-storage-comparison.md)

# 07-DASH-implement-dashboard-inspector

This document outlines the step-by-step implementation plan for the Storage Inspector Dashboard, upgraded with **slide-matching theme variables**, **storage capacity bars**, **empty state layouts**, and a **syntax-highlighted JSON Tree Viewer**.

## 1. Goal Description
Provide an advanced, sticky monitor console on the right side of the split screen that dynamically calculates, visualizes, and formats all browser storage data in real-time. This dashboard serves as the central visual validation interface for students to inspect the internal states of browser databases.

## 2. Design & UX/UI Specifications
*   **Layout**: Sticky right-side panel (40% width) formatted with `.glass-panel` backing.
*   **Storage Capacity Bars**:
    *   Dynamic progress indicators for LocalStorage (Neon Red), SessionStorage (Neon Orange), IndexedDB (Neon Green), and Cache Storage (Icy Cyan).
    *   Displays current size in bytes vs maximum estimated limits (e.g. 5MB for LocalStorage, current quota for IndexedDB).
*   **JSON Tree Viewer (`JsonViewer.jsx`)**:
    *   Recursive node layout using font family `mono` (`Fira Code`).
    *   Color-coded tokens: JSON keys (Blue), Strings (Green), Numbers/Booleans (Orange).
    *   Interactive collapse/expand icons (`>` and `v`).
*   **Empty State Layout**:
    *   If a storage partition contains no data, display a grayed-out layout with a subtle icon and text: *"No active keys in storage. Interact with the modules on the left to populate data."*
*   **Destructive Reset Action**:
    *   Bright red button labeled **"Clear All Browser Storage"** that resets all data across all 5 modules.

## 3. Proposed Changes

### 3.1 Components
*   **[NEW] [JsonViewer.jsx](file:///d:/development/KT-AXA/IndexDB/frontend/src/dashboard/JsonViewer.jsx)**
    *   Accepts raw data objects.
    *   Recursively renders arrays and objects.
    *   Applies distinct Tailwind colors for different data types.
*   **[NEW] [StorageInspector.jsx](file:///d:/development/KT-AXA/IndexDB/frontend/src/dashboard/StorageInspector.jsx)**
    *   Initializes a 1-second interval to recalculate storage sizing.
    *   Estimates sizes by converting keys to byte-blobs.
    *   Renders the Storage Capacity Bars with appropriate color schemes.
    *   Implements the Empty State check.
    *   Implements the global purge method (removing cookie signals, clearing local/session storage, dropping database `ProductCatalogDB`, deleting cache stores) and triggers global Toast: *"All storage records successfully wiped!"*.

---

## 4. Step-by-Step Task List

- [ ] Create recursive JSON Tree component (`JsonViewer.jsx`)
  - [ ] Write node parser logic
  - [ ] Apply Fira Code font classes
  - [ ] Style Keys (Blue), Strings (Green), Numbers/Booleans (Orange)
- [ ] Create `StorageInspector.jsx` container using `.glass-panel`
  - [ ] Implement the 1-second auto-poll watcher loop
  - [ ] Write size calculator handlers for Local, Session, DB, and Caches
  - [ ] Add the colored Storage Capacity Bars
  - [ ] Add Empty State layout conditions
  - [ ] Implement the "Clear All Browser Storage" button
- [ ] Incorporate `StorageInspector` in the right pane of `App.jsx`.

---

## 5. Verification Plan

### Manual Verification
1. Verify the initial state of the Inspector displays the Empty State placeholders for all empty partitions.
2. Select theme options. Verify the LocalStorage capacity bar increases slightly and the JSON Tree viewer displays `{"theme": "solarized"}` with correct syntax highlighting colors.
3. Generate products in IndexedDB. Verify that the IndexedDB card displays the count and size, and nodes can be collapsed/expanded.
4. Click **Clear All Browser Storage**. Verify that all progress bars drop to 0%, Empty States reappear, and a Toast alert is shown.
