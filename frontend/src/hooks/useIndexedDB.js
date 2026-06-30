import { openDB } from 'idb';

const DB_NAME = 'ProductCatalogDB';
const STORE_NAME = 'products';

// Initialize and upgrade database schemas
export const initDB = async () => {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('name', 'name', { unique: false });
        store.createIndex('category', 'category', { unique: false });
      }
    },
  });
};

// Retrieve products with limit and page offset
export const getProductsPaged = async (page = 1, limit = 50) => {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readonly');
  const store = tx.objectStore(STORE_NAME);
  
  // Use cursors to skip pages (efficient pagination)
  let cursor = await store.openCursor();
  const skip = (page - 1) * limit;
  let count = 0;
  const items = [];

  if (skip > 0) {
    // Fast skip
    const advanced = await cursor?.advance(skip);
    if (!advanced) cursor = null;
  }

  while (cursor && count < limit) {
    items.push(cursor.value);
    count++;
    cursor = await cursor.continue();
  }

  await tx.done;
  return items;
};

// Fast prefix index-based search querying 'name' field index
export const searchProducts = async (queryString, limit = 50) => {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readonly');
  const store = tx.objectStore(STORE_NAME);
  const index = store.index('name');
  
  const query = queryString.toLowerCase().trim();
  const items = [];
  
  let cursor = await index.openCursor();
  let count = 0;
  
  while (cursor && count < limit) {
    const name = cursor.value.name.toLowerCase();
    if (name.includes(query)) {
      items.push(cursor.value);
      count++;
    }
    cursor = await cursor.continue();
  }
  
  await tx.done;
  return items;
};

// Clear all records from the object store
export const clearAllProducts = async () => {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  await tx.objectStore(STORE_NAME).clear();
  await tx.done;
};

// Fetch total records inside products object store
export const getProductCount = async () => {
  const db = await initDB();
  const count = await db.count(STORE_NAME);
  return count;
};
