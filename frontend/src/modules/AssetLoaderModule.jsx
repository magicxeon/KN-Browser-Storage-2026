import React, { useState, useEffect } from 'react';

function AssetLoaderModule({ showToast }) {
  const [swStatus, setSwStatus] = useState('Unregistered');
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Latency metrics
  const [fetchTime, setFetchTime] = useState(null);
  const [fetchSource, setFetchSource] = useState(null);
  const [networkLatency, setNetworkLatency] = useState(0);
  const [cacheLatency, setCacheLatency] = useState(0);
  
  const [logs, setLogs] = useState([]);

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [{ timestamp, message, type }, ...prev]);
  };

  // Register Service Worker on component mount
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      setSwStatus('Registering...');
      addLog('Registering Service Worker "/sw.js" at root scope...', 'info');
      
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          setSwStatus('Active & Intercepting');
          addLog('SUCCESS: Service Worker registered and active.', 'success');
          
          // Listen to controllerchange to claim clients on reload
          navigator.serviceWorker.addEventListener('controllerchange', () => {
            addLog('Service Worker controller changed. Client claimed.', 'security');
          });
        })
        .catch((error) => {
          setSwStatus('Registration Failed');
          addLog(`ERROR: Service Worker registration failed: ${error.message}`, 'error');
        });
    } else {
      setSwStatus('Not Supported');
      addLog('WARNING: Service Workers are not supported in this browser.', 'error');
    }
  }, []);

  const handleFetchImage = async () => {
    setLoading(true);
    setImageUrl(null);
    setFetchTime(null);
    setFetchSource(null);

    const assetPath = '/mock-data/heavy-image.png';
    addLog(`Initiating HTTP GET query for "${assetPath}"...`, 'info');
    
    const startTime = performance.now();
    try {
      // Configure 'no-store' to bypass the browser's native HTTP cache.
      // This forces the request to the Service Worker interceptor without changing the URL,
      // allowing consistent Cache Storage matches.
      const response = await fetch(assetPath, { cache: 'no-store' });
      
      if (!response.ok) {
        throw new Error(`Server returned status code: ${response.status}`);
      }

      const blob = await response.blob();
      const endTime = performance.now();
      const duration = Math.round(endTime - startTime);

      // Read custom header injected by Service Worker to identify source
      const source = response.headers.get('X-Source') || 'Network (Browser cache fallback)';
      
      setFetchTime(duration);
      setFetchSource(source);
      setImageUrl(URL.createObjectURL(blob));

      addLog(`SUCCESS: Resource retrieved in ${duration}ms from [${source}].`, 'success');
      showToast(`Asset loaded in ${duration}ms from ${source}!`, 'success');

      // Update benchmarking variables
      if (source.includes('Cache')) {
        setCacheLatency(duration);
      } else {
        setNetworkLatency(duration);
      }
    } catch (error) {
      console.error(error);
      addLog(`ERROR: Failed to retrieve asset: ${error.message}`, 'error');
      showToast('Asset load failed. Confirm mock image is copied.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePurgeCache = async () => {
    setLoading(true);
    addLog('Deleting Cache Storage "v1-asset-cache" stores...', 'warning');
    
    try {
      if ('caches' in window) {
        const deleted = await caches.delete('v1-asset-cache');
        if (deleted) {
          setCacheLatency(0);
          setFetchTime(null);
          setFetchSource(null);
          setImageUrl(null);
          addLog('SUCCESS: Cache "v1-asset-cache" removed from storage.', 'success');
          showToast('Image cache purged successfully.', 'info');
        } else {
          addLog('INFO: Cache did not exist or was already empty.', 'info');
        }
      }
    } catch (error) {
      addLog(`ERROR: Failed to purge caches: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const clearLogs = () => setLogs([]);

  // Calculate percentage speed difference
  const calculateSpeedup = () => {
    if (networkLatency === 0 || cacheLatency === 0) return 0;
    const factor = (networkLatency / cacheLatency);
    return Math.round(factor);
  };

  return (
    <div className="glass-panel p-6 border-t-4 border-module-cache relative overflow-hidden transition-all duration-300">
      
      {/* Title */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-white flex items-center space-x-2">
          <span className="h-2 w-2 rounded-full bg-module-cache shadow-lg shadow-cyan-500/50" />
          <span>5. Cache Storage Asset Caching Module</span>
        </h2>
        <span className="text-xs bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2 py-0.5 rounded-full font-mono font-medium">
          CACHE
        </span>
      </div>

      <p className="text-xs text-gray-400 mb-6 leading-relaxed">
        Cache Storage caches network Request/Response pairs. Implemented via a <strong>Service Worker</strong>, 
        it intercepts browser fetch events to serve assets locally (instant sub-millisecond offline loading).
      </p>

      {/* Grid container */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Left Side: Interceptor Controls and Latency Chart */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Caching Sandbox Controls</span>
            
            {/* SW Status Badge */}
            <div className="flex items-center space-x-1.5">
              <span className={`h-2 w-2 rounded-full ${
                swStatus.includes('Active') ? 'bg-cyan-500 animate-pulse' :
                swStatus.includes('Registering') ? 'bg-amber-500 animate-pulse' : 'bg-rose-500'
              }`} />
              <span className={`text-[10px] font-mono font-semibold ${
                swStatus.includes('Active') ? 'text-cyan-400' :
                swStatus.includes('Registering') ? 'text-amber-400' : 'text-rose-400'
              }`}>
                SW: {swStatus}
              </span>
            </div>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={handleFetchImage}
              disabled={loading || swStatus === 'Unregistered'}
              className="flex-1 py-2 bg-module-cache hover:bg-cyan-600 text-slate-950 font-bold rounded-lg text-xs uppercase tracking-wider transition active:scale-95 shadow-md shadow-cyan-500/10 disabled:opacity-50"
            >
              {loading ? 'Fetching...' : 'Fetch Heavy Image'}
            </button>
            <button
              onClick={handlePurgeCache}
              disabled={loading}
              className="px-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-bold transition active:scale-95 text-gray-300"
            >
              Purge Cache
            </button>
          </div>

          {/* Latency Comparative Chart Dashboard */}
          <div className="p-3 bg-white/5 border border-white/5 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-mono tracking-wider text-gray-500">Latency Benchmark (ms)</span>
              {calculateSpeedup() > 0 && (
                <span className="text-[10px] font-mono font-black text-cyan-400 animate-pulse">
                  {calculateSpeedup()}x Faster Load Time!
                </span>
              )}
            </div>

            {/* Network Latency Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-mono text-gray-400">
                <span>First Load (Network)</span>
                <span className="font-bold text-amber-500">{networkLatency > 0 ? `${networkLatency}ms` : 'N/A'}</span>
              </div>
              <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden border border-white/5">
                <div 
                  className="h-full bg-amber-500 rounded-full transition-all duration-500" 
                  style={{ width: `${networkLatency > 0 ? Math.min(100, (networkLatency / 1500) * 100) : 0}%` }}
                />
              </div>
            </div>

            {/* Cache Latency Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-mono text-gray-400">
                <span>Second Load (Cache Storage)</span>
                <span className="font-bold text-cyan-400">{cacheLatency > 0 ? `${cacheLatency}ms` : 'N/A'}</span>
              </div>
              <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden border border-white/5">
                <div 
                  className="h-full bg-cyan-400 rounded-full transition-all duration-500" 
                  style={{ width: `${cacheLatency > 0 ? Math.max(1.5, Math.min(100, (cacheLatency / 1500) * 100)) : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Image Canvas & Log telemetries */}
        <div className="flex flex-col h-[320px] space-y-3">
          
          {/* Loaded Image Preview Box */}
          <div className="h-44 bg-slate-950 border border-white/5 rounded-lg flex items-center justify-center relative overflow-hidden select-none">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt="Retrieved heavy background"
                className="w-full h-full object-cover transition duration-500 animate-fade-in"
              />
            ) : (
              <div className="text-center p-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-8 h-8 text-gray-600 mx-auto mb-2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375 0 11-.75 0 .375 0 01.75 0z" />
                </svg>
                <span className="text-[10px] text-gray-500 block">No asset loaded yet. Click Fetch Heavy Image.</span>
              </div>
            )}
            
            {fetchSource && (
              <span className={`absolute bottom-3 left-3 text-[9px] font-mono uppercase px-2 py-0.5 rounded border ${
                fetchSource.includes('Cache') 
                  ? 'bg-cyan-950/80 border-cyan-500/30 text-cyan-400' 
                  : 'bg-amber-950/80 border-amber-500/30 text-amber-400'
              }`}>
                {fetchSource}
              </span>
            )}
          </div>

          {/* Caching Logs Console */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] uppercase font-mono tracking-wider text-gray-500">Interceptor Logs</span>
              <button
                onClick={clearLogs}
                className="text-[9px] text-gray-500 hover:text-gray-400 font-mono tracking-wider"
              >
                CLEAR
              </button>
            </div>
            
            <div className="flex-1 bg-slate-950 border border-white/5 rounded-lg p-2 font-mono text-[9px] overflow-y-auto space-y-1.5">
              {logs.length === 0 ? (
                <span className="text-gray-600 italic block text-center pt-8">Console idle...</span>
              ) : (
                logs.map((log, idx) => (
                  <div key={idx} className="leading-relaxed border-b border-white/5 pb-1 last:border-b-0">
                    <span className="text-gray-600">[{log.timestamp}]</span>{' '}
                    <span className={
                      log.type === 'success' ? 'text-cyan-400' :
                      log.type === 'error' ? 'text-rose-400' :
                      log.type === 'warning' ? 'text-amber-400' :
                      'text-gray-400'
                    }>
                      {log.message}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fadeIn 0.4s ease-in-out forwards;
        }
      `}</style>
    </div>
  );
}

export default AssetLoaderModule;
