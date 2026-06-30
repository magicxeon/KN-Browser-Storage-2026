import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import JsonViewer from './JsonViewer';
import { getProductCount, clearAllProducts } from '../hooks/useIndexedDB';

function StorageInspector({ showToast }) {
  const [cookieActive, setCookieActive] = useState(false);
  
  // Storage data states
  const [localStorageData, setLocalStorageData] = useState({});
  const [sessionStorageData, setSessionStorageData] = useState({});
  const [dbCount, setDbCount] = useState(0);
  const [cachedItems, setCachedItems] = useState([]);

  // Calculated byte sizes
  const [localSize, setLocalSize] = useState(0);
  const [sessionSize, setSessionSize] = useState(0);
  const [dbSize, setDbSize] = useState(0);
  const [cacheSize, setCacheSize] = useState(0);

  // Polling observer loop to fetch data from all storage compartments every 1 second
  useEffect(() => {
    const pollStorage = async () => {
      // 1. Calculate LocalStorage metadata
      const local = {};
      let localBytes = 0;
      try {
        for (let i = 0; i < window.localStorage.length; i++) {
          const key = window.localStorage.key(i);
          const val = window.localStorage.getItem(key);
          let parsedVal = '';
          if (val) {
            try {
              parsedVal = JSON.parse(val);
            } catch (e) {
              parsedVal = val; // Fallback to raw string if JSON parsing fails
            }
          }
          local[key] = parsedVal;
          localBytes += (key.length + (val ? val.length : 0)) * 2; // UTF-16 characters = 2 bytes
        }
        setLocalStorageData(local);
        setLocalSize(localBytes);
      } catch (err) {
        console.error('[StorageInspector] LocalStorage error:', err);
      }

      // 2. Calculate SessionStorage metadata
      const session = {};
      let sessionBytes = 0;
      try {
        for (let i = 0; i < window.sessionStorage.length; i++) {
          const key = window.sessionStorage.key(i);
          const val = window.sessionStorage.getItem(key);
          let parsedVal = '';
          if (val) {
            try {
              parsedVal = JSON.parse(val);
            } catch (e) {
              parsedVal = val; // Fallback to raw string if JSON parsing fails
            }
          }
          session[key] = parsedVal;
          sessionBytes += (key.length + (val ? val.length : 0)) * 2;
        }
        setSessionStorageData(session);
        setSessionSize(sessionBytes);

        // Deduce cookie status from CSRF token presence in session
        setCookieActive(!!session['csrf_token']);
      } catch (err) {
        console.error('[StorageInspector] SessionStorage error:', err);
      }

      // 3. Calculate IndexedDB metadata
      try {
        const count = await getProductCount();
        setDbCount(count);
        // Estimate 240 bytes per product item (name, category, price, id)
        setDbSize(count * 240);
      } catch (err) {
        console.error(err);
      }

      // 4. Calculate Cache Storage metadata
      try {
        if ('caches' in window) {
          const cache = await caches.open('v1-asset-cache');
          const requests = await cache.keys();
          const list = requests.map(req => req.url.split('/').pop());
          setCachedItems(list);
          
          // Estimate around 5.4MB if target image is cached
          setCacheSize(list.length > 0 ? list.length * 5703634 : 0);
        }
      } catch (err) {
        console.error(err);
      }
    };

    pollStorage();
    const interval = setInterval(pollStorage, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleClearAll = async () => {
    if (!confirm('Are you sure you want to clear all storage domains? This resets the entire demo.')) {
      return;
    }

    try {
      // Clear HTTP session on backend
      await axiosClient.post('/logout').catch(err => console.log('Cookie logout failed.'));

      // Clear local storage mechanisms
      window.localStorage.clear();
      window.sessionStorage.clear();

      // Clear IndexedDB
      await clearAllProducts();

      // Clear Cache Storage
      if ('caches' in window) {
        await caches.delete('v1-asset-cache');
      }

      showToast('All browser storage successfully wiped!', 'success');
      
      // Delay slightly and reload page to completely reset states
      setTimeout(() => {
        window.location.reload();
      }, 800);
    } catch (error) {
      console.error(error);
      showToast('Clear action failed.', 'error');
    }
  };

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="glass-panel p-6 flex-1 flex flex-col min-h-0 border-white/5 relative">
      
      {/* Header bar controls */}
      <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Live Telemetry Dashboard</span>
        <button
          onClick={handleClearAll}
          className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-md text-[10px] font-bold transition active:scale-95 shadow-md shadow-rose-500/5"
        >
          💥 Clear All Storages
        </button>
      </div>

      {/* Main scrollable body segments */}
      <div className="flex-1 overflow-y-auto space-y-5 pr-1 min-h-0">
        
        {/* 1. HttpOnly Cookies */}
        <div className="p-3 bg-white/5 border border-white/5 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-white flex items-center space-x-1.5">
              <span className={`h-2 w-2 rounded-full bg-module-cookie ${cookieActive ? 'animate-pulse' : ''}`} />
              <span>HttpOnly Cookies</span>
            </span>
            <span className={`text-[10px] font-mono font-bold uppercase ${cookieActive ? 'text-blue-400' : 'text-gray-500'}`}>
              {cookieActive ? 'Verified JWT Active' : 'Absent'}
            </span>
          </div>
          <p className="text-[10px] text-gray-500 leading-normal">
            Stored in browser backend. Client JS is blocked from inspecting cookies for protection.
          </p>
        </div>

        {/* 2. Local Storage */}
        <div className="p-3 bg-white/5 border border-white/5 rounded-xl space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-white flex items-center space-x-1.5">
              <span className="h-2 w-2 rounded-full bg-module-local" />
              <span>LocalStorage</span>
            </span>
            <span className="font-mono text-gray-400 text-[10px]">{formatSize(localSize)} / 5MB</span>
          </div>
          
          {/* Capacity Progress Bar */}
          <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden border border-white/5">
            <div 
              className="h-full bg-module-local transition-all duration-500" 
              style={{ width: `${Math.min(100, (localSize / (5 * 1024 * 1024)) * 100)}%` }}
            />
          </div>

          {/* JSON Tree Viewer */}
          <div className="p-2 bg-slate-950/80 rounded border border-white/5 min-h-[50px] max-h-[140px] overflow-y-auto">
            {Object.keys(localStorageData).length === 0 ? (
              <span className="text-[9px] text-gray-600 italic block text-center pt-3 select-none">Empty storage</span>
            ) : (
              <JsonViewer data={localStorageData} name="localStorage" />
            )}
          </div>
        </div>

        {/* 3. Session Storage */}
        <div className="p-3 bg-white/5 border border-white/5 rounded-xl space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-white flex items-center space-x-1.5">
              <span className="h-2 w-2 rounded-full bg-module-session" />
              <span>SessionStorage</span>
            </span>
            <span className="font-mono text-gray-400 text-[10px]">{formatSize(sessionSize)} / 5MB</span>
          </div>
          
          {/* Capacity Progress Bar */}
          <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden border border-white/5">
            <div 
              className="h-full bg-module-session transition-all duration-500" 
              style={{ width: `${Math.min(100, (sessionSize / (5 * 1024 * 1024)) * 100)}%` }}
            />
          </div>

          {/* JSON Tree Viewer */}
          <div className="p-2 bg-slate-950/80 rounded border border-white/5 min-h-[50px] max-h-[140px] overflow-y-auto">
            {Object.keys(sessionStorageData).length === 0 ? (
              <span className="text-[9px] text-gray-600 italic block text-center pt-3 select-none">Empty storage</span>
            ) : (
              <JsonViewer data={sessionStorageData} name="sessionStorage" />
            )}
          </div>
        </div>

        {/* 4. IndexedDB */}
        <div className="p-3 bg-white/5 border border-white/5 rounded-xl space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-white flex items-center space-x-1.5">
              <span className="h-2 w-2 rounded-full bg-module-indexed" />
              <span>IndexedDB (products)</span>
            </span>
            <span className="font-mono text-gray-400 text-[10px]">{formatSize(dbSize)} / 50MB</span>
          </div>
          
          {/* Capacity Progress Bar */}
          <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden border border-white/5">
            <div 
              className="h-full bg-module-indexed transition-all duration-500" 
              style={{ width: `${Math.min(100, (dbSize / (50 * 1024 * 1024)) * 100)}%` }}
            />
          </div>

          {/* Record descriptions */}
          <div className="p-2 bg-slate-950/80 rounded border border-white/5 min-h-[50px] max-h-[140px] overflow-y-auto flex flex-col justify-center">
            {dbCount === 0 ? (
              <span className="text-[9px] text-gray-600 italic block text-center select-none">Database store empty</span>
            ) : (
              <div className="text-[10px] font-mono text-gray-300 pl-1">
                <div>database: <span className="text-emerald-400">"ProductCatalogDB"</span></div>
                <div>objectStore: <span className="text-emerald-400">"products"</span></div>
                <div>recordsCount: <span className="text-amber-500 font-bold">{dbCount.toLocaleString()}</span></div>
                <div className="text-[8px] text-gray-500 mt-1">Schema indices bound on [name, category]</div>
              </div>
            )}
          </div>
        </div>

        {/* 5. Cache Storage */}
        <div className="p-3 bg-white/5 border border-white/5 rounded-xl space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-white flex items-center space-x-1.5">
              <span className="h-2 w-2 rounded-full bg-module-cache" />
              <span>Cache Storage</span>
            </span>
            <span className="font-mono text-gray-400 text-[10px]">{formatSize(cacheSize)} / 50MB</span>
          </div>
          
          {/* Capacity Progress Bar */}
          <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden border border-white/5">
            <div 
              className="h-full bg-module-cache transition-all duration-500" 
              style={{ width: `${Math.min(100, (cacheSize / (50 * 1024 * 1024)) * 100)}%` }}
            />
          </div>

          {/* Cached URLs display list */}
          <div className="p-2 bg-slate-950/80 rounded border border-white/5 min-h-[50px] max-h-[140px] overflow-y-auto">
            {cachedItems.length === 0 ? (
              <span className="text-[9px] text-gray-600 italic block text-center pt-3 select-none">No cached assets</span>
            ) : (
              <div className="font-mono text-[9px] text-gray-400 pl-1">
                <span className="text-blue-400 font-semibold">cache: "v1-asset-cache"</span>
                <div className="mt-1 space-y-0.5">
                  {cachedItems.map((item, idx) => (
                    <div key={idx} className="text-emerald-400 truncate">
                      📦 {item} <span className="text-[8px] text-gray-600 font-mono">(~5.4MB PNG)</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default StorageInspector;
