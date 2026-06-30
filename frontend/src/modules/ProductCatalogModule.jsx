import React, { useState, useEffect, useRef } from 'react';
import { initDB, getProductsPaged, searchProducts, clearAllProducts, getProductCount } from '../hooks/useIndexedDB';

function ProductCatalogModule({ showToast }) {
  const [useWorker, setUseWorker] = useState(true);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [executionTime, setExecutionTime] = useState(null);
  const [blockedTime, setBlockedTime] = useState(0);
  
  // Search and Pagination states
  const [searchQuery, setSearchQuery] = useState('');
  const [productsList, setProductsList] = useState([]);
  const [searchTime, setSearchTime] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Kept small for clean UI rendering

  const [logs, setLogs] = useState([]);
  const isGeneratingRef = useRef(false);
  const workerRef = useRef(null);

  const [spinnerAngle, setSpinnerAngle] = useState(0);

  // Rotate spinner via JS main thread to ensure it freezes when V8 is blocked
  useEffect(() => {
    let animFrame;
    const rotate = () => {
      // If generating, spin fast (10deg/frame), else spin slowly (1.5deg/frame)
      const speed = isGeneratingRef.current ? 10 : 1.5;
      setSpinnerAngle((prev) => (prev + speed) % 360);
      animFrame = requestAnimationFrame(rotate);
    };
    animFrame = requestAnimationFrame(rotate);
    return () => cancelAnimationFrame(animFrame);
  }, []);

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [{ timestamp, message, type }, ...prev]);
  };

  useEffect(() => {
    updateProductCount();
    // Pre-initialize Schema
    initDB();
  }, []);

  const updateProductCount = async () => {
    try {
      const count = await getProductCount();
      setTotalCount(count);
      // Retrieve first page if items exist
      if (count > 0) {
        loadPage(1);
      } else {
        setProductsList([]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadPage = async (page) => {
    try {
      const items = await getProductsPaged(page, itemsPerPage);
      setProductsList(items);
      setCurrentPage(page);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearch = async (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    
    if (val.trim() === '') {
      updateProductCount();
      setSearchTime(null);
      return;
    }

    const start = performance.now();
    try {
      const results = await searchProducts(val, itemsPerPage);
      const end = performance.now();
      setProductsList(results);
      setSearchTime(end - start);
    } catch (err) {
      console.error(err);
    }
  };

  // Measures frame drops by checking gaps in requestAnimationFrame timing loops
  const startFrameTracking = () => {
    let lastTime = performance.now();
    let totalBlock = 0;
    
    const checkFrame = () => {
      if (!isGeneratingRef.current) return;
      const now = performance.now();
      const delta = now - lastTime;
      
      // Gaps larger than 40ms indicate frame drop stutter (Main Thread locked)
      if (delta > 40) {
        totalBlock += (delta - 16.67);
        setBlockedTime(Math.round(totalBlock));
      }
      lastTime = now;
      requestAnimationFrame(checkFrame);
    };
    
    requestAnimationFrame(checkFrame);
  };

  const handleGenerate = () => {
    if (useWorker) {
      runOnWorker();
    } else {
      runOnMainThread();
    }
  };

  // Mode 1: Offload to Web Worker (Perfectly responsive)
  const runOnWorker = () => {
    setBlockedTime(0);
    setProgress(0);
    setLoading(true);
    setExecutionTime(null);
    isGeneratingRef.current = true;
    startFrameTracking();

    addLog('SPAWN: Instantiating Web Worker background script dataWorker.js...', 'security');
    
    // Vite syntax to load ES web workers
    workerRef.current = new Worker(
      new URL('../workers/dataWorker.js', import.meta.url),
      { type: 'module' }
    );

    workerRef.current.postMessage({ action: 'GENERATE' });

    workerRef.current.onmessage = (e) => {
      const { action, percent, timeElapsed, error } = e.data;
      
      if (action === 'PROGRESS') {
        setProgress(percent);
      } else if (action === 'COMPLETE') {
        setExecutionTime(timeElapsed);
        setProgress(100);
        isGeneratingRef.current = false;
        setLoading(false);
        addLog(`SUCCESS: 100,000 items saved in background in ${timeElapsed}ms.`, 'success');
        showToast('IndexedDB synced smoothly via Web Worker!', 'success');
        updateProductCount();
        workerRef.current.terminate();
      } else if (action === 'ERROR') {
        addLog(`ERROR: Web Worker insertion failed: ${error}`, 'error');
        isGeneratingRef.current = false;
        setLoading(false);
        workerRef.current.terminate();
      }
    };
  };

  // Mode 2: Run directly in Main Thread (Will freeze screen and animations)
  const runOnMainThread = async () => {
    setBlockedTime(0);
    setProgress(0);
    setLoading(true);
    setExecutionTime(null);
    isGeneratingRef.current = true;
    startFrameTracking();

    addLog('WARNING: Starting Main Thread generation (100k items block)...', 'warning');
    
    // Delay slightly to let React UI register loading state before browser lock
    setTimeout(async () => {
      const startTime = performance.now();
      
      try {
        // Simulate heavy CPU-bound data parsing/preparation workload (e.g., JSON parsing 100,000 records)
        // This blocks the Main Thread and stops CSS animations and frame paints
        addLog('Simulating heavy CPU data parsing (2000ms V8 lock)...', 'warning');
        const blockStart = performance.now();
        while (performance.now() - blockStart < 2000) {
          // Synchronous busy-wait
        }

        const db = await initDB();
        const tx = db.transaction('products', 'readwrite');
        const store = tx.objectStore('products');
        const categories = ['Electronics', 'Clothing', 'Books', 'Home & Kitchen', 'Automotive', 'Sports'];
        
        // V8 loops through items and schedules asynchronous IndexedDB writes
        for (let i = 0; i < 100000; i++) {
          const category = categories[i % categories.length];
          const product = {
            id: i + 1,
            name: `Product ${i + 1} - Premium Ax-${category} Device`,
            price: Math.round((19.99 + Math.random() * 1500) * 100) / 100,
            category: category,
            createdAt: new Date(Date.now() - Math.random() * 1000000000).toISOString()
          };
          store.put(product);
          
          // Force update progress bar simulation periodically (UI won't paint it though!)
          if (i % 20000 === 0) {
            setProgress(Math.round((i / 100000) * 100));
          }
        }
        
        await tx.done;
        const endTime = performance.now();
        const elapsed = Math.round(endTime - startTime);
        
        setExecutionTime(elapsed);
        setProgress(100);
        addLog(`SUCCESS: 100k items saved on Main Thread in ${elapsed}ms.`, 'success');
        showToast('Products saved! UI frozen during loop.', 'warning');
      } catch (err) {
        addLog(`ERROR: Main thread write failed: ${err.message}`, 'error');
      } finally {
        isGeneratingRef.current = false;
        setLoading(false);
        updateProductCount();
      }
    }, 150);
  };

  const handleClear = async () => {
    setLoading(true);
    addLog('Dropping IndexedDB entries...', 'warning');
    try {
      await clearAllProducts();
      setTotalCount(0);
      setProductsList([]);
      setSearchQuery('');
      setExecutionTime(null);
      setBlockedTime(0);
      setProgress(0);
      addLog('SUCCESS: Database products store cleared.', 'success');
      showToast('IndexedDB entries cleared.', 'info');
    } catch (err) {
      addLog('ERROR: Clear database action failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel p-6 border-t-4 border-module-indexed relative overflow-hidden transition-all duration-300">
      
      {/* Title Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-white flex items-center space-x-2">
          <span className="h-2 w-2 rounded-full bg-module-indexed shadow-lg shadow-green-500/50" />
          <span>4. IndexedDB Heavy Duty Module</span>
        </h2>
        <span className="text-xs bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded-full font-mono font-medium">
          INDEXEDDB
        </span>
      </div>

      <p className="text-xs text-gray-400 mb-6 leading-relaxed">
        IndexedDB is a promise-based transactional database designed for large binary or structured datasets.
        To avoid locking the browser UI, we offload heavy calculations and write loops to a <strong>Web Worker</strong>.
      </p>

      {/* Grid panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Left Side: Performance comparison triggers */}
        <div className="space-y-4">
          
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Thread Sandbox Controls</span>
            
            {/* Spinning orbital loader */}
            <div className="flex items-center space-x-2">
              <span className="text-[10px] text-gray-500 font-mono">Main Thread:</span>
              <div className="relative w-5 h-5">
                <div 
                  style={{ transform: `rotate(${spinnerAngle}deg)` }}
                  className="w-full h-full rounded-full border-2 border-dashed border-green-500/40 border-t-green-500" 
                />
              </div>
            </div>
          </div>

          {/* Toggle Switch */}
          <div className="bg-slate-950 p-1.5 rounded-lg border border-white/5 flex">
            <button
              onClick={() => setUseWorker(true)}
              disabled={loading}
              className={`flex-1 py-1.5 text-xs font-bold rounded-md transition ${
                useWorker 
                  ? 'bg-module-indexed text-slate-950 shadow-md shadow-green-500/10 font-bold' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              🚀 Web Worker Mode
            </button>
            <button
              onClick={() => setUseWorker(false)}
              disabled={loading}
              className={`flex-1 py-1.5 text-xs font-bold rounded-md transition ${
                !useWorker 
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-500/10 font-bold' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              ⚠️ Main Thread Mode
            </button>
          </div>

          {/* Generating triggers */}
          <div className="flex space-x-2">
            <button
              onClick={handleGenerate}
              disabled={loading}
              className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase transition active:scale-95 ${
                useWorker 
                  ? 'bg-module-indexed hover:bg-green-600 text-slate-950 shadow-md shadow-green-500/20' 
                  : 'bg-rose-500 hover:bg-rose-600 text-white shadow-md shadow-rose-500/20'
              } disabled:opacity-50`}
            >
              {loading ? `Writing... ${progress}%` : 'Generate 100k Products'}
            </button>

            <button
              onClick={handleClear}
              disabled={loading}
              className="px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-bold transition active:scale-95 text-gray-300"
            >
              Clear DB
            </button>
          </div>

          {/* Telemetry diagnostics progress meters */}
          <div className="p-3 bg-white/5 border border-white/5 rounded-xl space-y-2">
            <span className="text-[10px] uppercase font-mono tracking-wider text-gray-500 block">Performance Telemetry</span>
            
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-gray-500 block text-[9px] uppercase font-mono">Write Time</span>
                <span className="font-bold text-white font-mono text-sm">
                  {executionTime ? `${(executionTime / 1000).toFixed(2)}s` : 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-gray-500 block text-[9px] uppercase font-mono">UI Freeze Stutter</span>
                <span className={`font-mono text-sm font-black ${blockedTime > 100 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {blockedTime > 0 ? `${blockedTime}ms` : '0ms (Smooth)'}
                </span>
              </div>
            </div>

            {/* Progress bar */}
            {loading && (
              <div className="pt-1.5">
                <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden border border-white/5">
                  <div 
                    className={`h-full rounded-full transition-all duration-300 ${useWorker ? 'bg-module-indexed' : 'bg-rose-500'}`} 
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Product search / Paginated catalog visualizer */}
        <div className="flex flex-col h-[340px]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Query database catalog ({totalCount.toLocaleString()} items)
            </span>
          </div>

          {/* Search box input */}
          <div className="relative mb-3">
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearch}
              disabled={loading || totalCount === 0}
              className="w-full bg-slate-950 border border-white/10 rounded-lg pl-3 pr-24 py-1.5 text-xs text-gray-100 focus:outline-none focus:border-green-500/50 transition"
              placeholder={totalCount > 0 ? "Search by prefix (e.g. Product 99)" : "Database is currently empty"}
            />
            {searchTime !== null && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                time: {searchTime.toFixed(2)}ms
              </span>
            )}
          </div>

          {/* Product grid list */}
          <div className="flex-1 bg-slate-950 border border-white/5 rounded-lg overflow-y-auto p-2.5 font-mono text-[9px] space-y-1.5">
            {productsList.length === 0 ? (
              <span className="text-gray-600 italic block text-center pt-24">
                {loading ? 'Inserting records...' : 'No catalog items loaded. Click generate.'}
              </span>
            ) : (
              <div className="space-y-1">
                <div className="grid grid-cols-12 gap-1 font-bold text-gray-500 border-b border-white/5 pb-1">
                  <span className="col-span-2">ID</span>
                  <span className="col-span-6">Name</span>
                  <span className="col-span-2 text-right">Price</span>
                  <span className="col-span-2 text-right">Category</span>
                </div>
                {productsList.map((prod) => (
                  <div key={prod.id} className="grid grid-cols-12 gap-1 text-gray-300 py-0.5 border-b border-white/5 last:border-b-0 hover:bg-white/5 transition px-0.5 rounded">
                    <span className="col-span-2 text-gray-500">#{prod.id}</span>
                    <span className="col-span-6 truncate font-semibold">{prod.name}</span>
                    <span className="col-span-2 text-right text-emerald-400">${prod.price.toFixed(2)}</span>
                    <span className="col-span-2 text-right text-cyan-400 truncate">{prod.category}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pagination controls */}
          {totalCount > itemsPerPage && searchQuery.trim() === '' && (
            <div className="flex items-center justify-between text-[10px] mt-2.5 text-gray-400">
              <button
                disabled={currentPage === 1 || loading}
                onClick={() => loadPage(currentPage - 1)}
                className="px-2.5 py-1 bg-white/5 hover:bg-white/10 rounded border border-white/5 disabled:opacity-30 active:scale-95 font-bold transition"
              >
                Previous
              </button>
              <span className="font-mono">
                Page {currentPage} of {Math.ceil(totalCount / itemsPerPage)}
              </span>
              <button
                disabled={currentPage >= Math.ceil(totalCount / itemsPerPage) || loading}
                onClick={() => loadPage(currentPage + 1)}
                className="px-2.5 py-1 bg-white/5 hover:bg-white/10 rounded border border-white/5 disabled:opacity-30 active:scale-95 font-bold transition"
              >
                Next
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default ProductCatalogModule;
