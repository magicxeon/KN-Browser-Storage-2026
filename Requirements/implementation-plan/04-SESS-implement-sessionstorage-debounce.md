[← Back to Storage Comparison Overview](file:///d:/development/KT-AXA/IndexDB/Requirements/implementation-plan/00-OVERVIEW-storage-comparison.md)

# 04-SESS-implement-sessionstorage-debounce

This document outlines the step-by-step implementation plan for the SessionStorage (State Isolation & Debouncing) Module, upgraded with **Neon Orange theme styling** and **I/O optimization analytics**.

## 1. Goal Description
Demonstrate the isolation properties of `SessionStorage` (independent data scopes per tab context) and teach developers how to prevent I/O blocking during high-frequency client inputs (such as typing) by utilizing `Debouncing`.

## 2. Design & UX/UI Specifications
*   **Theme Color**: Neon Orange (`#F97316`) used for highlights, alerts, and counters.
*   **Card Background**: `.glass-panel` with a subtle top border glow in Neon Orange.
*   **Educational Context**: Explanation of SessionStorage scope (tab-bound lifespan, 5MB limitation, synchronous performance hits).
*   **Debounce Efficiency Dashboard**:
    *   **Dual Counters**: Side-by-side comparison of **Total Keystrokes** (green/blue indicator) vs. **Disk Writes** (orange indicator).
    *   **I/O Efficiency Meter**: A radial progress bar showing the percentage of database writes saved by debouncing:
        $$\text{Efficiency} = \left(1 - \frac{\text{Disk Writes}}{\text{Keystrokes}}\right) \times 100\%$$
    *   **Visual Activity Log**: A streaming chart showing when keystrokes happen compared to when actual SessionStorage writes occur.

## 3. Proposed Changes

### 3.1 Hooks & Helpers
*   **[MODIFY] [useSessionStorage.js](file:///d:/development/KT-AXA/IndexDB/frontend/src/hooks/useSessionStorage.js)**
    *   Expose helper state to fetch current values.

### 3.2 Component
*   **[NEW] [DraftFormModule.jsx](file:///d:/development/KT-AXA/IndexDB/frontend/src/modules/DraftFormModule.jsx)**
    *   Text area styled with sleek dark colors, borders glowing Neon Orange on focus.
    *   **Logic**:
        *   Keystrokes increment local typing state immediately.
        *   On typing, a 500ms debounce window initiates.
        *   When the timer fires, the value writes to `sessionStorage` and triggers a Toast: *"Draft saved to SessionStorage!"*.
    *   **Interactive Analytics Panel**:
        *   Displays the Dual Counters.
        *   Renders the I/O Efficiency Meter.
        *   Plots a simple dot-based horizontal timeline showing Keystrokes vs Writes to visually teach the delay mechanism.

---

## 4. Step-by-Step Task List

- [ ] Create `useSessionStorage.js` hook
- [ ] Build the layout for `DraftFormModule.jsx` using `.glass-panel`
  - [ ] Add neon orange border-top styling
  - [ ] Write educational notes regarding SessionStorage scope
  - [ ] Design the text area with focus glow effects (`focus:shadow-orange-500/20`)
- [ ] Implement the Debounce tracking state
  - [ ] Create Keystrokes counter and Disk Writes counter
  - [ ] Build the timeline logger array
  - [ ] Calculate the I/O efficiency percentage
- [ ] Render the visual analytics dashboard (Efficiency Meter and Timeline chart)
- [ ] Add the "Open in New Tab" verification helper
- [ ] Mount module in `App.jsx`.

---

## 5. Verification Plan

### Manual Verification
1. Start typing in the text box. Verify that the **Keystrokes** counter increments with every letter, while the **Disk Writes** counter remains stable.
2. Pause typing. After 500ms:
   - Verify **Disk Writes** increases by 1.
   - Confirm Toast alert pops up in the corner.
   - Verify the **I/O Efficiency** radial bar indicates high efficiency (e.g. > 90%).
3. Inspect the visual timeline: verify that a single write dot appears after a group of typing dots.
4. Click **Open in New Tab** and verify the text area is empty in the new session.
