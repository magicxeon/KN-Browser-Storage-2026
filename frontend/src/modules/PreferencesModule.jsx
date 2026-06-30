import React, { useState, useEffect } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';

function PreferencesModule({ showToast }) {
  const [theme, setTheme] = useLocalStorage('theme', 'dark');
  const [syncLogs, setSyncLogs, rawLogs, setRawLogs] = useLocalStorage('theme', 'dark');
  // Note: useLocalStorage returns [storedValue, setValue, syncLogs, setSyncLogs]
  const [storedTheme, setStoredTheme, syncLogsList, setSyncLogsList] = useLocalStorage('theme', 'dark');

  const [animateFlash, setAnimateFlash] = useState(false);

  // Trigger visual flash and toast alert when a cross-tab sync occurs
  useEffect(() => {
    if (syncLogsList.length > 0) {
      setAnimateFlash(true);
      showToast('Synced theme change from another tab!', 'success');
      const timer = setTimeout(() => setAnimateFlash(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [syncLogsList]);

  const selectTheme = (newTheme) => {
    setStoredTheme(newTheme);
    showToast(`Theme updated to ${newTheme}! Saved to LocalStorage.`, 'info');
  };

  const openNewTab = () => {
    window.open(window.location.href, '_blank');
    showToast('Opening duplicate window for cross-tab sync test...', 'info');
  };

  const clearLogs = () => {
    setSyncLogsList([]);
  };

  // Maps theme values to Tailwind color class outputs for the preview box
  const getThemePreviewStyles = () => {
    switch (storedTheme) {
      case 'light':
        return 'bg-gray-100 text-gray-900 border-gray-300';
      case 'solarized':
        return 'bg-amber-50/95 text-amber-900 border-amber-200';
      case 'dark':
      default:
        return 'bg-slate-950 text-slate-100 border-slate-800';
    }
  };

  return (
    <div className="glass-panel p-6 border-t-4 border-module-local relative overflow-hidden transition-all duration-300">
      
      {/* Title */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-white flex items-center space-x-2">
          <span className="h-2 w-2 rounded-full bg-module-local shadow-lg shadow-red-500/50" />
          <span>2. LocalStorage Preferences Module</span>
        </h2>
        <span className="text-xs bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-full font-mono font-medium">
          LOCAL
        </span>
      </div>

      <p className="text-xs text-gray-400 mb-6 leading-relaxed">
        LocalStorage provides persistent key-value storage that survives page refreshes and browser restarts.
        Tabs of the same origin share this storage and can coordinate instantly using the <code>storage</code> event listener.
      </p>

      {/* Main split dashboard content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Left Side: Theme selections and Preview */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Theme Selector</span>
            <div className="flex items-center space-x-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] text-gray-500 font-mono">Sync Listener Active</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { id: 'dark', label: 'Dark Mode', style: 'bg-slate-800 text-white hover:bg-slate-700' },
              { id: 'light', label: 'Light Mode', style: 'bg-white text-slate-900 hover:bg-gray-100' },
              { id: 'solarized', label: 'Solarized Mode', style: 'bg-amber-100 text-amber-900 hover:bg-amber-200' }
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => selectTheme(opt.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition active:scale-95 border ${
                  storedTheme === opt.id 
                    ? 'border-red-500/80 shadow-md shadow-red-500/20' 
                    : 'border-white/10'
                } ${opt.style}`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Theme Dynamic Preview Frame */}
          <div className={`p-4 rounded-xl border transition-all duration-500 ${getThemePreviewStyles()}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[9px] uppercase tracking-wider opacity-60 font-bold">Theme Preview Box</span>
              <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-black/10">
                active: {storedTheme}
              </span>
            </div>
            <h4 className="text-sm font-bold mb-1">Interactive Card Component</h4>
            <p className="text-xs opacity-80 leading-relaxed">
              This card's styling reactively maps to the <code>theme</code> key stored inside the LocalStorage database.
            </p>
          </div>

          {/* Utility Tab Launcher */}
          <button
            onClick={openNewTab}
            className="w-full py-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-lg text-xs font-bold transition active:scale-95 shadow-md shadow-white/5 hover:shadow-white/10"
          >
            💻 Open Duplicate Tab (Test Cross-Tab Sync)
          </button>
        </div>

        {/* Right Side: Cross-Tab Sync Console Logger */}
        <div className="flex flex-col h-[280px]">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Cross-Tab Sync Console</span>
            <button
              onClick={clearLogs}
              className="text-[9px] text-gray-500 hover:text-gray-400 font-mono tracking-wider"
            >
              CLEAR CONSOLE
            </button>
          </div>

          <div className={`flex-1 bg-slate-950 border rounded-lg p-3 font-mono text-[10px] overflow-y-auto space-y-2 select-text transition-all duration-300 ${
            animateFlash 
              ? 'border-red-500 shadow-lg shadow-red-500/20 bg-red-950/10' 
              : 'border-white/5'
          }`}>
            {syncLogsList.length === 0 ? (
              <div className="text-center pt-20 space-y-2">
                <span className="text-gray-600 italic block">No cross-tab sync events captured yet.</span>
                <p className="text-[9px] text-gray-600 max-w-[180px] mx-auto leading-normal">
                  Open another tab of this site, select a theme, and watch events stream here in real-time!
                </p>
              </div>
            ) : (
              syncLogsList.map((log, idx) => (
                <div key={idx} className="leading-relaxed border-b border-white/5 pb-1.5 last:border-b-0">
                  <div className="flex items-center justify-between text-gray-500 mb-0.5">
                    <span>[{log.timestamp}]</span>
                    <span className="text-[8px] max-w-[120px] truncate" title={log.url}>tab: {log.url.split('/').pop() || 'localhost'}</span>
                  </div>
                  <div>
                    <span className="text-red-400 font-semibold">STORAGE EVENT: </span>
                    <span className="text-gray-300">key "{log.key}" modified</span>
                  </div>
                  <div className="text-gray-400 mt-0.5 flex space-x-2">
                    <span>old: <code className="text-amber-500 font-bold">"{log.oldValue}"</code></span>
                    <span>→</span>
                    <span>new: <code className="text-emerald-500 font-bold font-semibold">"{log.newValue}"</code></span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default PreferencesModule;
