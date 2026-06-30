import React, { useState, useEffect, useRef } from 'react';
import useSessionStorage from '../hooks/useSessionStorage';

function DraftFormModule({ showToast }) {
  const [sessionDraft, setSessionDraft] = useSessionStorage('draft_note', '');
  const [inputText, setInputText] = useState(sessionDraft);
  
  // Performance Analytics counters
  const [keystrokes, setKeystrokes] = useState(0);
  const [diskWrites, setDiskWrites] = useState(0);
  
  // Streaming event logs for visualization
  const [eventTimeline, setEventTimeline] = useState([]);
  
  const isInitialMount = useRef(true);

  // Debouncing effect: Wait 500ms after the user stops typing to write to SessionStorage
  useEffect(() => {
    // Skip logging on initial load mounting
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // Trigger timer if local input differs from stored session draft
    const delayTimer = setTimeout(() => {
      setSessionDraft(inputText);
      setDiskWrites((w) => w + 1);
      
      // Log storage write event on timeline
      setEventTimeline((prev) => [
        ...prev.slice(-19), // Keep only the last 20 events
        { id: Date.now(), type: 'write', label: 'Write' }
      ]);
      
      showToast('Draft written to SessionStorage!', 'success');
    }, 500);

    return () => clearTimeout(delayTimer);
  }, [inputText]);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInputText(val);
    setKeystrokes((k) => k + 1);
    
    // Log keystroke event on timeline
    setEventTimeline((prev) => [
      ...prev.slice(-19), // Keep only the last 20 events
      { id: Date.now(), type: 'key', label: 'Key' }
    ]);
  };

  const handleReset = () => {
    setInputText('');
    setSessionDraft('');
    setKeystrokes(0);
    setDiskWrites(0);
    setEventTimeline([]);
    showToast('Draft reset and SessionStorage cleared.', 'info');
  };

  const openNewTab = (useNoopener) => {
    if (useNoopener) {
      window.open(window.location.href, '_blank', 'noopener');
      showToast('Opening tab with noopener (Isolated Session).', 'success');
    } else {
      window.open(window.location.href, '_blank');
      showToast('Opening tab with standard window.open (Cloned Session).', 'info');
    }
  };

  // Calculate percentage of write cycles saved
  const calculateEfficiency = () => {
    if (keystrokes === 0) return 100;
    const ratio = (1 - diskWrites / keystrokes) * 100;
    return Math.max(0, Math.round(ratio));
  };

  return (
    <div className="glass-panel p-6 border-t-4 border-module-session relative overflow-hidden transition-all duration-300">
      
      {/* Title */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-white flex items-center space-x-2">
          <span className="h-2 w-2 rounded-full bg-module-session shadow-lg shadow-orange-500/50" />
          <span>3. SessionStorage Isolation Module</span>
        </h2>
        <span className="text-xs bg-orange-500/10 text-orange-400 border border-orange-500/20 px-2 py-0.5 rounded-full font-mono font-medium">
          SESSION
        </span>
      </div>

      <p className="text-xs text-gray-400 mb-6 leading-relaxed">
        SessionStorage is isolated to the specific browser tab. Opening a new tab creates a fresh session.
        Additionally, SessionStorage writes are synchronous and block the Main Thread—we deploy <strong>Debouncing</strong> to bundle rapid inputs into a single disk write.
        <br />
        <span className="text-[10px] text-amber-500 font-medium mt-1.5 block">
          💡 <strong>Educational Note:</strong> Modern browsers clone parent SessionStorage if spawned via standard <code>window.open</code>. We bypass this behavior by using the <code>noopener</code> flag to ensure a 100% clean, isolated session tab.
        </span>
      </p>

      {/* Main split dashboard content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Left Side: Draft Editor Form */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Live Draft Note Editor</span>
            <button
              onClick={handleReset}
              className="text-[10px] text-gray-500 hover:text-gray-400 font-mono"
            >
              RESET DRAFT
            </button>
          </div>

          <textarea
            value={inputText}
            onChange={handleInputChange}
            className="w-full h-32 bg-slate-950 border border-white/10 rounded-lg p-3 text-xs text-gray-100 focus:outline-none focus:border-orange-500/50 focus:shadow-md focus:shadow-orange-500/10 transition leading-relaxed resize-none"
            placeholder="Start typing draft note here... Observe counter changes as you type."
          />

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => openNewTab(false)}
              className="py-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-lg text-[10px] sm:text-xs font-bold transition active:scale-95 shadow-md shadow-white/5"
              title="Clones parent sessionStorage into the new tab"
            >
              💻 Open with Session Clone
            </button>
            <button
              onClick={() => openNewTab(true)}
              className="py-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-lg text-[10px] sm:text-xs font-bold transition active:scale-95 shadow-md shadow-white/5"
              title="Spawns new tab with noopener to block cloning"
            >
              🔒 Open with noopener
            </button>
          </div>
        </div>

        {/* Right Side: I/O Debounce Efficiency Dashboard */}
        <div className="flex flex-col space-y-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">I/O Debounce Dashboard</span>
          
          {/* Counters Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-white/5 border border-white/5 rounded-xl text-center">
              <span className="text-[10px] uppercase font-mono tracking-wider text-gray-500">Keystrokes</span>
              <div className="text-2xl font-black text-blue-400 mt-1 font-mono">{keystrokes}</div>
              <span className="text-[8px] text-gray-600 block mt-0.5">Keyboard Triggers</span>
            </div>

            <div className="p-3 bg-white/5 border border-white/5 rounded-xl text-center">
              <span className="text-[10px] uppercase font-mono tracking-wider text-gray-500">Disk Writes</span>
              <div className="text-2xl font-black text-orange-400 mt-1 font-mono">{diskWrites}</div>
              <span className="text-[8px] text-gray-600 block mt-0.5">SessionStorage Writes</span>
            </div>
          </div>

          {/* Efficiency Bar Meter */}
          <div className="p-3 bg-white/5 border border-white/5 rounded-xl">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold text-gray-300">Disk Access Reduction</span>
              <span className="font-bold text-orange-400 font-mono text-xs">{calculateEfficiency()}% saved</span>
            </div>
            <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-white/5">
              <div 
                className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full transition-all duration-500" 
                style={{ width: `${calculateEfficiency()}%` }}
              />
            </div>
            <span className="text-[8px] text-gray-600 block mt-1.5 leading-normal">
              Formula: (1 - Disk Writes / Keystrokes) * 100. Higher percentage indicates better UI responsiveness.
            </span>
          </div>

          {/* Live Horizontal Streaming Timeline */}
          <div className="flex-1 flex flex-col justify-end">
            <span className="text-[10px] uppercase font-mono tracking-wider text-gray-500 mb-1.5 block">Streaming Activity Monitor</span>
            <div className="h-10 bg-slate-950 border border-white/5 rounded-lg flex items-center justify-start px-3 space-x-1.5 overflow-x-hidden relative">
              {eventTimeline.length === 0 ? (
                <span className="text-[9px] text-gray-600 italic font-mono select-none block w-full text-center">Waiting for keyboard activity...</span>
              ) : (
                eventTimeline.map((ev) => (
                  <div
                    key={ev.id}
                    className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[7px] font-bold font-mono transition-all duration-300 ${
                      ev.type === 'write' 
                        ? 'bg-orange-500 text-slate-950 shadow-md shadow-orange-500/50 scale-110' 
                        : 'bg-blue-900/60 text-blue-300 border border-blue-500/20'
                    }`}
                    title={ev.label}
                  >
                    {ev.type === 'write' ? 'W' : 'K'}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default DraftFormModule;
