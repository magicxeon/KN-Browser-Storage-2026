# 00-OVERVIEW-storage-comparison

This document serves as the **Overview Conclusion Dashboard**, summarizing the characteristics, performance profiles, security attributes, and educational goals of each browser storage type. Use this page to compare storage mechanisms and navigate directly to their detailed step-by-step implementation plans.

---

## 1. Storage Comparison Matrix

| Storage Type | Recommended Use Case | Capacity | Lifespan | Scope | Blocking (I/O) | Security (XSS protection) | Implementation Plan Link |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **HttpOnly Cookie** | Auth tokens, Session IDs | ~4 KB | Server-defined (Max-Age) | Shared (Same Origin) | Async (Network-bound) | **High** (JS cannot read) | [02-AUTH-httponly-cookie](file:///d:/development/KT-AXA/IndexDB/Requirements/implementation-plan/02-AUTH-implement-httponly-cookie.md) |
| **LocalStorage** | Theme preferences, UI settings | ~5 - 10 MB | Permanent (Until manually cleared) | Shared (Same Origin) | **Sync** (Blocks main thread) | Low (JS readable) | [03-PREF-localstorage](file:///d:/development/KT-AXA/IndexDB/Requirements/implementation-plan/03-PREF-implement-localstorage-crosstab.md) |
| **SessionStorage** | Form drafts, tab-isolated states | ~5 MB | Tab Session (Cleared on tab close) | **Isolated** (Tab-bound) | **Sync** (Blocks main thread) | Low (JS readable) | [04-SESS-sessionstorage](file:///d:/development/KT-AXA/IndexDB/Requirements/implementation-plan/04-SESS-implement-sessionstorage-debounce.md) |
| **IndexedDB** | High-volume structured data, catalogs | Quota-based (GBs) | Permanent (Until manually cleared) | Shared (Same Origin) | Async (Promise-based/Worker) | Low (JS readable) | [05-IDB-indexeddb-worker](file:///d:/development/KT-AXA/IndexDB/Requirements/implementation-plan/05-IDB-implement-indexeddb-worker.md) |
| **Cache Storage** | Assets caching, offline PWA files | Quota-based (GBs) | Permanent (Service Worker managed) | Shared (Same Origin) | Async (Promise-based/Worker) | Low (JS readable) | [06-CACHE-serviceworker](file:///d:/development/KT-AXA/IndexDB/Requirements/implementation-plan/06-CACHE-implement-serviceworker-caching.md) |

---

## 2. Monorepo Setup & Inspector Interface Plans

In addition to the storage types, the workspace environment and monitoring tools are detailed in these plans:
*   [01-CORE-setup-workspace](file:///d:/development/KT-AXA/IndexDB/Requirements/implementation-plan/01-CORE-setup-workspace.md): Setup backend, frontend, dev proxy, and styling.
*   [07-DASH-implement-dashboard-inspector](file:///d:/development/KT-AXA/IndexDB/Requirements/implementation-plan/07-DASH-implement-dashboard-inspector.md): Renders the live monitoring tool, capacity gauges, and expandable JSON Trees.

---

## 3. Storage Type Selection Guide

1. **Need to store credentials?** Use **HttpOnly Cookies** (with Anti-CSRF protections) to keep tokens secure from XSS scripts.
2. **Need to persist small preferences?** Use **LocalStorage**, and ensure you sync changes cross-tabs.
3. **Need to isolate input states to a single tab?** Use **SessionStorage**, but apply *Debounce* methods for typing inputs to keep the UI from stuttering.
4. **Need a heavy offline database?** Use **IndexedDB**, and offload write/parse tasks to a **Web Worker** to keep UI transitions running at a solid 60 FPS.
5. **Need instantly-loading static assets or offline capability?** Use **Cache Storage** in combo with a **Service Worker** to intercept network calls and serve assets locally.
