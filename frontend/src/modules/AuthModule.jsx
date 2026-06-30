import React, { useState } from 'react';
import axiosClient from '../api/axiosClient';

function AuthModule({ showToast }) {
  const [username, setUsername] = useState('JohnDoe');
  const [password, setPassword] = useState('AXApassword123');
  const [user, setUser] = useState(null);
  const [csrfToken, setCsrfToken] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(0); // 0: Idle, 1: Logged In, 2: Access Checked
  const [logs, setLogs] = useState([]);

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, { timestamp, message, type }]);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) return;

    setLoading(true);
    addLog(`POST /api/login sending credentials for "${username}"...`, 'request');

    try {
      const response = await axiosClient.post('/login', { username, password });
      
      if (response.data.success) {
        setUser(response.data.user);
        setCsrfToken(response.data.csrfToken);
        
        // Save the CSRF token in SessionStorage for axios client request interceptors
        window.sessionStorage.setItem('csrf_token', response.data.csrfToken);
        
        addLog(`SUCCESS: Backend returned JWT cookie & anti-CSRF token: "${response.data.csrfToken}"`, 'success');
        addLog('Browser automatically saved access_token HttpOnly cookie.', 'security');
        showToast('Login successful! HttpOnly cookie set.', 'success');
        setActiveStep(1);
      }
    } catch (err) {
      console.error(err);
      addLog(`ERROR: Login request failed.`, 'error');
      showToast('Login failed. Please check backend connection.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFetchProfile = async () => {
    setLoading(true);
    addLog('GET /api/profile requesting data...', 'request');
    addLog('Axios Client attached withCredentials: true. Browser adds cookies automatically.', 'security');

    try {
      const response = await axiosClient.get('/profile');
      
      if (response.data.success) {
        setProfileData(response.data.data);
        addLog(`SUCCESS: Profile retrieved. Secret code: "${response.data.data.secretClearence}"`, 'success');
        showToast('Profile loaded! Credentials verified.', 'success');
        setActiveStep(2);
      }
    } catch (err) {
      console.error(err);
      addLog(`ERROR: Fetch profile failed. (${err.response?.status} ${err.response?.data?.message || err.message})`, 'error');
      showToast('Profile request unauthorized!', 'error');
    } finally {
      setLoading(false);
    }
  };

  const runXssSimulator = () => {
    addLog('XSS ATTACK SIMULATION: Executing "document.cookie" read...', 'warning');
    const localCookies = document.cookie;
    
    // Check if the cookie is accessible by client JavaScript
    if (localCookies && localCookies.includes('access_token')) {
      addLog(`VULNERABILITY DETECTED: Cookies stolen: ${localCookies}`, 'error');
      alert(`XSS Vulnerability! Stolen cookies: ${localCookies}`);
    } else {
      addLog('SHIELD ACTIVE: document.cookie does not contain "access_token". JS access is blocked.', 'success');
      alert(`[XSS Blocked] document.cookie: "${localCookies || '(empty)'}"\n\nHttpOnly cookie access is blocked for client-side JavaScript!`);
    }
  };

  const runCsrfSimulator = async () => {
    addLog('CSRF ATTACK SIMULATION: Attempting unauthorized profile query...', 'warning');
    addLog('CSRF query simulates malicious script triggering requests without the custom anti-CSRF header.', 'security');

    setLoading(true);
    try {
      // Intentionally pass an invalid CSRF header to bypass custom interceptor and force fail
      const response = await axiosClient.get('/profile', {
        headers: {
          'X-CSRF-Token': 'INVALID_FORGED_CSRF_TOKEN'
        }
      });
      addLog(`CSRF SUCCESS? VULNERABILITY! Access granted without token: ${JSON.stringify(response.data.data)}`, 'error');
      showToast('CSRF Attack Succeeded! (Vulnerability!)', 'error');
    } catch (err) {
      console.error(err);
      addLog(`SHIELD ACTIVE: Backend blocked query with status 403. Message: "${err.response?.data?.message}"`, 'success');
      showToast('CSRF Attack Blocked! Security verified.', 'success');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    addLog('POST /api/logout destroying cookie...', 'request');

    try {
      await axiosClient.post('/logout');
      setUser(null);
      setCsrfToken(null);
      setProfileData(null);
      window.sessionStorage.removeItem('csrf_token');
      addLog('SUCCESS: Cookie access_token removed. User logged out.', 'success');
      showToast('Logged out. Credentials cleared.', 'info');
      setActiveStep(0);
    } catch (err) {
      console.error(err);
      addLog('ERROR: Logout request failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const clearLogs = () => setLogs([]);

  return (
    <div className="glass-panel p-6 border-t-4 border-module-cookie relative overflow-hidden transition-all duration-300">
      
      {/* Module Title Banner */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-white flex items-center space-x-2">
          <span className="h-2 w-2 rounded-full bg-module-cookie shadow-lg shadow-blue-500/50" />
          <span>1. HttpOnly Cookie Module</span>
        </h2>
        <span className="text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full font-mono font-medium">
          AUTH
        </span>
      </div>

      <p className="text-xs text-gray-400 mb-6 leading-relaxed">
        HttpOnly cookies block access from JavaScript, protecting session tokens from XSS theft. 
        Because browsers attach cookies automatically to requests, we deploy custom Anti-CSRF headers to block CSRF exploits.
      </p>

      {/* Interactive Stepper Diagram */}
      <div className="grid grid-cols-4 gap-2 mb-6 border-b border-white/5 pb-6">
        {[
          { title: '1. POST Login', desc: 'Sends username', active: true },
          { title: '2. Set-Cookie', desc: 'HttpOnly cookie stored', active: activeStep >= 1 },
          { title: '3. Browser Send', desc: 'Auto attachments', active: activeStep >= 1 },
          { title: '4. Verified Response', desc: 'CSRF token matched', active: activeStep >= 2 }
        ].map((step, idx) => (
          <div key={idx} className="flex flex-col items-center text-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-mono text-xs font-bold transition-all duration-300 mb-2 ${
              step.active 
                ? 'bg-module-cookie text-slate-900 shadow-md shadow-blue-500/30 font-bold scale-105' 
                : 'bg-white/5 border border-white/10 text-gray-500'
            }`}>
              {idx + 1}
            </div>
            <span className={`text-[10px] font-semibold block leading-tight ${step.active ? 'text-blue-400' : 'text-gray-500'}`}>
              {step.title}
            </span>
            <span className="text-[8px] text-gray-600 leading-tight mt-0.5 hidden sm:block">
              {step.desc}
            </span>
          </div>
        ))}
      </div>

      {/* Action panel splits: Left input controls / Right visual console */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Workspace controls */}
        <div className="space-y-4">
          {!user ? (
            <form onSubmit={handleLogin} className="space-y-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Authentication Demo Form</span>
              <div>
                <label className="text-[10px] text-gray-500 uppercase font-mono block mb-1">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-blue-500/50 focus:shadow-md focus:shadow-blue-500/10 transition"
                  placeholder="Enter username"
                  required
                />
              </div>
              <div>
                <label className="text-[10px] text-gray-500 uppercase font-mono block mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-blue-500/50 focus:shadow-md focus:shadow-blue-500/10 transition"
                  placeholder="Enter password"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 bg-module-cookie hover:bg-blue-600 text-slate-950 font-bold rounded-lg text-xs tracking-wider uppercase transition-all duration-300 disabled:opacity-50 active:scale-95 shadow-md shadow-blue-500/10 hover:shadow-blue-500/20"
              >
                {loading ? 'Processing...' : 'Login & Dispatch Cookie'}
              </button>
            </form>
          ) : (
            <div className="space-y-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Security Control Room</span>
              
              <div className="p-3 bg-white/5 border border-white/5 rounded-lg flex items-center justify-between text-xs">
                <div>
                  <div className="font-semibold text-gray-300">Status: <span className="text-emerald-400">Logged In</span></div>
                  <div className="text-[10px] text-gray-500 font-mono">User: {user.username}</div>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-md text-[10px] font-mono transition active:scale-95"
                >
                  LOGOUT
                </button>
              </div>

              {/* Verified actions */}
              <div className="grid grid-cols-1 gap-2">
                <button
                  onClick={handleFetchProfile}
                  disabled={loading}
                  className="py-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-lg text-xs font-bold transition active:scale-95"
                >
                  GET SECURE PROFILE (Cookie + CSRF Check)
                </button>

                <div className="border border-white/5 my-2" />

                {/* Attack simulations */}
                <span className="text-[10px] font-mono uppercase text-rose-400 tracking-wider font-semibold">Attack Simulators</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={runXssSimulator}
                    className="py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 rounded-lg text-xs font-mono transition active:scale-95"
                  >
                    Simulate XSS (Steal Cookie)
                  </button>
                  <button
                    onClick={runCsrfSimulator}
                    disabled={loading}
                    className="py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-lg text-xs font-mono transition active:scale-95"
                  >
                    Simulate CSRF (Fake Query)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Secure Details Output Box */}
          {profileData && (
            <div className="p-3 bg-emerald-950/20 border border-emerald-500/25 rounded-lg text-xs space-y-1">
              <span className="text-[9px] uppercase tracking-wider text-emerald-400 font-bold block">Server Secret Output</span>
              <div className="text-gray-300 font-semibold font-mono">{profileData.secretClearence}</div>
              <div className="text-[10px] text-gray-500 font-mono truncate">CSRF token: {profileData.boundCsrfToken}</div>
            </div>
          )}
        </div>

        {/* Real-time Visual Log Monitor */}
        <div className="flex flex-col h-[280px]">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Simulation Console</span>
            <button
              onClick={clearLogs}
              className="text-[9px] text-gray-500 hover:text-gray-400 font-mono tracking-wider"
            >
              CLEAR CONSOLE
            </button>
          </div>

          <div className="flex-1 bg-slate-950 border border-white/5 rounded-lg p-3 font-mono text-[10px] overflow-y-auto space-y-2 select-text">
            {logs.length === 0 ? (
              <span className="text-gray-600 italic block text-center pt-24">No action logged yet. Use controls to simulate logs.</span>
            ) : (
              logs.map((log, idx) => (
                <div key={idx} className="leading-relaxed border-b border-white/5 pb-1 last:border-b-0">
                  <span className="text-gray-600 font-light mr-1.5">[{log.timestamp}]</span>
                  <span className={`font-semibold ${
                    log.type === 'success' ? 'text-emerald-400' :
                    log.type === 'error' ? 'text-rose-400 font-bold' :
                    log.type === 'warning' ? 'text-amber-400 font-bold' :
                    log.type === 'security' ? 'text-blue-400' :
                    'text-gray-300'
                  }`}>
                    {log.message}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default AuthModule;
