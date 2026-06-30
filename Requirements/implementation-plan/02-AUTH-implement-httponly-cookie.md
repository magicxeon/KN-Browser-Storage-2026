[← Back to Storage Comparison Overview](file:///d:/development/KT-AXA/IndexDB/Requirements/implementation-plan/00-OVERVIEW-storage-comparison.md)

# 02-AUTH-implement-httponly-cookie

This document outlines the step-by-step implementation plan for the HttpOnly Cookie (Authentication) Module, upgraded with **Neon Blue theme styling** and **educational visualization tools**.

## 1. Goal Description
Demonstrate the security advantages of using `HttpOnly` cookies for token management. Create an interactive educational card that teaches developers how cookies prevent XSS theft and how to defend against CSRF attacks using header tokens.

## 2. Design & UX/UI Specifications
*   **Theme Color**: Neon Blue (`#3B82F6`) used for borders, button hover glows (`hover:shadow-blue-500/20`), and status badges.
*   **Card Background**: `.glass-panel` with a subtle top border glow in Neon Blue.
*   **Educational Flow Indicator**: An interactive visual stepper inside the card displaying:
    1. **Login Request** -> 2. **Set-Cookie (HttpOnly)** -> 3. **Automatic Token Attachment** -> 4. **Protected Profile Request**.
*   **Interactive Simulation Console**: An on-screen output box that prints step-by-step explanations of the security actions as they occur.

## 3. Proposed Changes

### 3.1 Backend Enhancements
*   **[MODIFY] [server.js](file:///d:/development/KT-AXA/IndexDB/backend/server.js)**
    *   `/api/login`: Generates a JWT token, sets `access_token` in cookie: `{ httpOnly: true, secure: false, sameSite: 'Strict' }`. Returns user data and an in-memory anti-CSRF token `csrfToken`.
    *   `/api/profile`: Validates the `access_token` cookie and checks for the presence of the header `X-CSRF-Token` matching the session/token.
    *   `/api/logout`: Resets the cookie and returns success.

### 3.2 Frontend Components
*   **[NEW] [AuthModule.jsx](file:///d:/development/KT-AXA/IndexDB/frontend/src/modules/AuthModule.jsx)**
    *   **Educational Stepper**: Highlights active nodes depending on auth state (e.g., node 2 lit up when cookie is saved, node 3 lit up when fetching profile).
    *   **Interactive Control Panel**:
        *   **Login Button**: Triggers `/api/login`, stores `csrfToken` in state, shows a Toast message: *"Successfully logged in! HttpOnly Cookie set by browser."*
        *   **Get Profile Button**: Requests profile data. Shows network request stats and status.
        *   **XSS Attack Simulator Button**: Runs script to alert `document.cookie`. Visualizes the failure to access the token with a warning dialog explaining: *"XSS Blocked: JS cannot read HttpOnly cookies."*
        *   **CSRF Attack Simulator Button**: Executes a request bypassing the `X-CSRF-Token` header. The server rejects it (`403 Forbidden`). Shows a console log: *"CSRF blocked by backend: anti-CSRF token missing in headers."*
        *   **Logout Button**: Clears status, updates stepper back to initial state, triggers Toast: *"Logged out. Cookie cleared."*

---

## 4. Step-by-Step Task List

- [ ] Implement backend server authorization routes with anti-CSRF validations
- [ ] Configure `axiosClient` with `withCredentials: true`
- [ ] Build the UI Layout for `AuthModule.jsx` using `.glass-panel`
  - [ ] Add neon blue border-top styling
  - [ ] Design the interactive 4-step Educational Stepper
  - [ ] Build the simulation console logger to display descriptive security logs
- [ ] Add the control buttons with custom hover glows (`shadow-blue-500/20`)
- [ ] Implement XSS simulator executing client-side cookie reads
- [ ] Implement CSRF simulator omitting request headers
- [ ] Mount module and test with Toast notifications.

---

## 5. Verification Plan

### Manual Verification
1. Click **Login** and watch the Educational Stepper light up to "Set-Cookie (HttpOnly)". Confirm Toast popup displays.
2. Click **XSS Attack Simulator**. Verify that a dialog alerts `document.cookie` is empty (or does not contain `access_token`), showing an educational message about HttpOnly protection.
3. Click **CSRF Attack Simulator**. Verify the console displays a failed network response (`403 Forbidden`) because the required header was omitted.
4. Click **Get Profile**. Verify that profile details are retrieved because the browser automatically attached the cookie.
