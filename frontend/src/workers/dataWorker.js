// Background thread worker for generating and writing massive data to IndexedDB
self.onmessage = function (e) {
  if (e.data.action === 'GENERATE') {
    const totalCount = 100000;
    const batchSize = 5000;
    const categories = ['Electronics', 'Clothing', 'Books', 'Home & Kitchen', 'Automotive', 'Sports'];
    
    // Open connection natively inside the worker context
    const request = indexedDB.open('ProductCatalogDB', 1);
    
    request.onupgradeneeded = function (event) {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('products')) {
        const store = db.createObjectStore('products', { keyPath: 'id' });
        store.createIndex('name', 'name', { unique: false });
        store.createIndex('category', 'category', { unique: false });
      }
    };
    
    request.onsuccess = function (event) {
      const db = event.target.result;
      let currentIndex = 0;
      const startTime = performance.now();
      
      // Chunks transaction loop to keep worker thread responsive and dispatch progress increments
      function writeNextBatch() {
        if (currentIndex >= totalCount) {
          const endTime = performance.now();
          self.postMessage({ 
            action: 'COMPLETE', 
            timeElapsed: Math.round(endTime - startTime) 
          });
          db.close();
          return;
        }
        
        const tx = db.transaction('products', 'readwrite');
        const store = tx.objectStore('products');
        
        tx.oncomplete = function () {
          const percent = Math.round((currentIndex / totalCount) * 100);
          self.postMessage({ action: 'PROGRESS', percent });
          writeNextBatch(); // Recurse next chunk
        };
        
        tx.onerror = function (err) {
          self.postMessage({ action: 'ERROR', error: err.target.error.message });
          db.close();
        };
        
        const limit = Math.min(currentIndex + batchSize, totalCount);
        for (let i = currentIndex; i < limit; i++) {
          const category = categories[i % categories.length];
          const product = {
            id: i + 1,
            name: `Product ${i + 1} - Premium Ax-${category} Device`,
            price: Math.round((19.99 + Math.random() * 1500) * 100) / 100,
            category: category,
            createdAt: new Date(Date.now() - Math.random() * 1000000000).toISOString()
          };
          store.put(product);
        }
        
        currentIndex = limit;
      }
      
      writeNextBatch();
    };
    
    request.onerror = function (event) {
      self.postMessage({ action: 'ERROR', error: event.target.error.message });
    };
  }
};
