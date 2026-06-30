import React, { useState, useEffect } from 'react';
import axiosClient from './api/axiosClient';
import AuthModule from './modules/AuthModule';
import PreferencesModule from './modules/PreferencesModule';
import DraftFormModule from './modules/DraftFormModule';

function App() {
  const [healthStatus, setHealthStatus] = useState('Checking...');
  const [toasts, setToasts] = useState([]);

  // Toast dispatch utility
  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  // Check backend server connection on startup
  useEffect(() => {
    // Calling '/health' since Axios baseURL is already '/api'.
    // This correctly resolves to '/api/health'.
    axiosClient.get('/health')
      .then((res) => {
        if (res.data && res.data.status === 'healthy') {
          setHealthStatus('Connected');
          showToast('Successfully connected to backend API server.', 'success');
        } else {
          setHealthStatus('Degraded');
          showToast('Backend connection established, but status is unusual.', 'warning');
        }
      })
      .catch((err) => {
        console.error('Backend connection error:', err);
        setHealthStatus('Disconnected');
        showToast('Cannot connect to backend server. Make sure it is running.', 'error');
      });
  }, []);

  return (
    <div className="min-h-screen bg-background text-gray-100 flex flex-col font-sans selection:bg-blue-500/30 selection:text-white">
      {/* Top Banner Navigation Header */}
      <header className="h-16 border-b border-white/5 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50 flex items-center justify-between px-6">
        <div className="flex items-center space-x-3">
          <span className="text-xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
            Web Storage Architecture Demo
          </span>
          <span className="text-[10px] uppercase font-mono tracking-widest px-2 py-0.5 rounded bg-white/10 border border-white/5 text-gray-400">
            Education Sandbox
          </span>
        </div>
        
        {/* Backend Status indicator */}
        <div className="flex items-center space-x-2 text-sm bg-white/5 border border-white/5 px-3 py-1 rounded-full">
          <span className="text-xs text-gray-400">API Server:</span>
          <span className={`h-2 w-2 rounded-full ${
            healthStatus === 'Connected' ? 'bg-emerald-500' :
            healthStatus === 'Checking...' ? 'bg-amber-500 animate-pulse' : 'bg-rose-500'
          }`} />
          <span className={`font-mono text-xs ${
            healthStatus === 'Connected' ? 'text-emerald-400' :
            healthStatus === 'Checking...' ? 'text-amber-400' : 'text-rose-400'
          }`}>
            {healthStatus}
          </span>
        </div>
      </header>

      {/* Main Split Layout Grid */}
      <main className="flex-1 max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-10 gap-6 p-6">
        
        {/* Left Workspace Panel (60% equivalent) */}
        <section className="lg:col-span-6 space-y-6 flex flex-col">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold tracking-tight text-white">Interactive Workspace</h1>
            <span className="text-xs text-gray-400">Step through modules from top to bottom</span>
          </div>

          {/* Demonstration module cards */}
          <div className="space-y-6 flex-1">
            {/* 1. HttpOnly Cookie Module */}
            <AuthModule showToast={showToast} />

            {/* 2. LocalStorage Preferences Module */}
            <PreferencesModule showToast={showToast} />

            {/* 3. SessionStorage Isolation Module */}
            <DraftFormModule showToast={showToast} />

            {/* 4. IndexedDB Heavy Duty Module */}
            <div className="glass-panel p-6 border-t-4 border-module-indexed">
              <h2 className="text-lg font-bold text-white mb-2 flex items-center space-x-2">
                <span className="h-2 w-2 rounded-full bg-module-indexed shadow-lg shadow-green-500/50" />
                <span>4. IndexedDB Heavy Duty Module</span>
              </h2>
              <p className="text-sm text-gray-400 mb-4">
                Demonstrates high-volume database queries and UI thread offloading using Web Workers.
              </p>
              <div className="p-8 border border-dashed border-white/10 rounded-lg flex flex-col items-center justify-center text-center">
                <span className="text-xs text-gray-500 font-mono mb-2">INDEXEDDB_MODULE_PLACEHOLDER</span>
                <p className="text-xs text-gray-400 max-w-xs">100k products catalog worker demo will load in Step 05.</p>
              </div>
            </div>

            {/* 5. Cache Storage Asset Caching Module */}
            <div className="glass-panel p-6 border-t-4 border-module-cache">
              <h2 className="text-lg font-bold text-white mb-2 flex items-center space-x-2">
                <span className="h-2 w-2 rounded-full bg-module-cache shadow-lg shadow-cyan-500/50" />
                <span>5. Cache Storage Asset Caching Module</span>
              </h2>
              <p className="text-sm text-gray-400 mb-4">
                Demonstrates request interception and network latency comparisons using Service Workers.
              </p>
              <div className="p-8 border border-dashed border-white/10 rounded-lg flex flex-col items-center justify-center text-center">
                <span className="text-xs text-gray-500 font-mono mb-2">CACHE_LOADER_MODULE_PLACEHOLDER</span>
                <p className="text-xs text-gray-400 max-w-xs">PWA asset loader and fetch caching analytics will load in Step 06.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Right Sticky Inspector Panel (40% equivalent) */}
        <section className="lg:col-span-4 space-y-6 lg:h-[calc(100vh-8rem)] lg:sticky lg:top-24 flex flex-col">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold tracking-tight text-white">Storage Inspector</h1>
            <span className="text-xs text-gray-400">Live Monitor</span>
          </div>

          {/* Inspector Panel content placeholder */}
          <div className="glass-panel p-6 flex-1 flex flex-col items-center justify-center text-center border-white/5">
            <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6 text-gray-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-gray-300 mb-1">Inspector Dashboard Offline</h3>
            <p className="text-xs text-gray-500 max-w-xs mb-4">
              The live telemetry observer and raw data inspector will be fully set up in Step 07.
            </p>
            <button
              onClick={() => showToast('Test notification triggered!', 'info')}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-medium transition active:scale-95"
            >
              Test Micro-Interaction Toast
            </button>
          </div>
        </section>

      </main>

      {/* Floating Animated Toast Container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col space-y-3 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`px-4 py-3 rounded-lg shadow-lg border text-sm font-medium transition-all duration-300 animate-slide-in pointer-events-auto flex items-center space-x-2 ${
              toast.type === 'success' ? 'bg-emerald-950/80 border-emerald-500/30 text-emerald-300' :
              toast.type === 'error' ? 'bg-rose-950/80 border-rose-500/30 text-rose-300' :
              toast.type === 'warning' ? 'bg-amber-950/80 border-amber-500/30 text-amber-300' :
              'bg-slate-900/80 border-white/10 text-gray-300'
            }`}
          >
            <span className="flex-1">{toast.message}</span>
          </div>
        ))}
      </div>

      {/* Embedded CSS animations keyframes for toast */}
      <style>{`
        @keyframes slide-in {
          from {
            transform: translateY(1rem);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.25s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
      `}</style>
    </div>
  );
}

export default App;
