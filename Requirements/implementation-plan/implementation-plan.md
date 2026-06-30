# Core Implementation Plan & Directory Structure

## 1. โครงสร้างโฟลเดอร์ (Working Directory Structure)
การออกแบบสถาปัตยกรรมจะใช้โครงสร้างแบบ Monorepo เพื่อให้ง่ายต่อการพัฒนาและรัน Demo ไปพร้อมกัน โดยแบ่งเป็นฝั่ง Backend (สำหรับจำลอง API) และ Frontend (แอปพลิเคชันหลัก) ค่ะ

web-storage-demo/
├── backend/                              # Server สำหรับจำลอง API และ HttpOnly Cookie
│   ├── package.json
│   ├── server.js                         # โค้ดหลักของ Express.js (ตั้งค่า CORS และ Cookie Parser)
│   └── middleware/
│       └── authMiddleware.js             # ตรวจสอบ JWT จาก req.cookies
│
├── frontend/                             # Web Application หลัก (React + Vite)
│   ├── package.json
│   ├── vite.config.js                    # ตั้งค่า Proxy เพื่อแก้ปัญหา CORS (Cross-Origin) ตอน Development
│   ├── public/
│   │   ├── sw.js                         # Service Worker สำหรับ Cache Storage Module
│   │   └── mock-data/                    # ไฟล์รูปภาพหรือ JSON ขนาดใหญ่สำหรับทดสอบ
│   │
│   ├── src/
│   │   ├── main.jsx                      # จุดเริ่มต้นของ React App
│   │   ├── App.jsx                       # Layout หลัก แบ่ง Grid ซ้าย (พื้นที่ Demo) ขวา (Inspector)
│   │   │
│   │   ├── api/
│   │   │   └── axiosClient.js            # ตั้งค่า Axios (withCredentials: true สำหรับส่ง Cookie)
│   │   │
│   │   ├── hooks/                        # Custom Hooks สำหรับจัดการ Storage อย่างปลอดภัย
│   │   │   ├── useLocalStorage.js        # จัดการ LocalStorage พร้อมดักจับอีเวนต์ 'storage' (Cross-tab)
│   │   │   ├── useSessionStorage.js      # จัดการ SessionStorage พร้อมระบบ Debounce ป้องกัน UI ค้าง
│   │   │   └── useIndexedDB.js           # Wrapper สำหรับเชื่อมต่อฐานข้อมูลผ่านไลบรารี idb
│   │   │
│   │   ├── workers/
│   │   │   └── dataWorker.js             # Web Worker สำหรับประมวลผล Mock Data 100k รายการบน Background Thread
│   │   │
│   │   ├── components/                   # UI Components ส่วนกลาง (Button, Card, Input, Spinner)
│   │   │
│   │   ├── modules/                      # โฟลเดอร์หลักสำหรับ 5 Storage Modules
│   │   │   ├── AuthModule.jsx            # 1. HttpOnly Cookie Demo
│   │   │   ├── PreferencesModule.jsx     # 2. LocalStorage Demo
│   │   │   ├── DraftFormModule.jsx       # 3. SessionStorage Demo
│   │   │   ├── ProductCatalogModule.jsx  # 4. IndexedDB Demo
│   │   │   └── AssetLoaderModule.jsx     # 5. Cache Storage Demo
│   │   │
│   │   └── dashboard/
│   │       ├── StorageInspector.jsx      # หน้าต่าง Dashboard หลักทางขวา
│   │       └── JsonViewer.jsx            # UI สำหรับ Render JSON Tree แบบ Expand/Collapse


---

## 2. รายละเอียดการพัฒนาในแต่ละ Module (Implementation Details)

### 2.1 Backend Server (`backend/server.js`)
*   **เครื่องมือหลัก:** `express`, `cookie-parser`, `cors`, `jsonwebtoken`
*   **รายละเอียดการทำงาน:** 
    *   ตั้งค่า `cors` ให้รับ `origin` จาก Frontend และกำหนด `credentials: true` เพื่ออนุญาตการส่ง Cookie ค่ะ
    *   **Endpoint `POST /api/login`:** เมื่อรับ Request จะสร้าง JWT และทำการ `res.cookie('access_token', token, { httpOnly: true, secure: true, sameSite: 'Strict' })`
    *   **Endpoint `GET /api/profile`:** จำลองการดึงข้อมูลส่วนตัว โดยอ่านค่าผ่าน `req.cookies.access_token` เพื่อตรวจสอบสิทธิ์การเข้าถึงข้อมูล

### 2.2 Auth Module (`modules/AuthModule.jsx`)
*   **เป้าหมาย:** สาธิตความปลอดภัยขั้นสูงสุดของ HttpOnly Cookie
*   **รายละเอียดการทำงาน:**
    *   สร้างปุ่ม "Login" เพื่อยิง Request ไปที่ `/api/login`
    *   สร้างปุ่ม "Get Profile" โดยใช้ `axiosClient.js` ซึ่งเบราว์เซอร์จะจัดการแนบ Cookie กลับไปที่ Server ให้อัตโนมัติ โดยที่โค้ด React ไม่ต้องจับ Token เลยค่ะ
    *   จำลองปุ่ม "XSS Attack Simulator" ที่รันคำสั่ง `alert(document.cookie)` เพื่อพิสูจน์ให้เห็นว่า JavaScript ฝั่ง Client ไม่สามารถอ่านค่า Access Token ได้

### 2.3 Preferences Module (`modules/PreferencesModule.jsx`)
*   **เป้าหมาย:** สาธิตความถาวรของ LocalStorage และการซิงค์ข้อมูลข้ามแท็บ (Cross-tab Sync)
*   **รายละเอียดการทำงาน:**
    *   สร้างชุดปุ่มเลือกธีม (Light, Dark, System)
    *   ใช้ `useLocalStorage` hook ซึ่งภายในเรียก `localStorage.setItem()` เพื่อบันทึกค่าลงเบราว์เซอร์
    *   เพิ่ม Event Listener ตรวจจับอีเวนต์ `storage` บน Object `window` หากผู้ใช้เปิดหน้าเว็บ 2 แท็บ แล้วเปลี่ยนธีมที่แท็บแรก แท็บที่ 2 จะอัปเดต UI ตามทันทีแบบ Real-time ค่ะ

### 2.4 Draft Form Module (`modules/DraftFormModule.jsx`)
*   **เป้าหมาย:** สาธิต State Isolation ของ SessionStorage 
*   **รายละเอียดการทำงาน:**
    *   สร้างช่อง `<textarea>` สำหรับจำลองการร่างฟอร์มข้อมูลขนาดใหญ่
    *   ใช้เทคนิค Debouncing (หน่วงเวลา 500ms) หลังจากการพิมพ์ตัวอักษรตัวสุดท้าย ค่อยทำงานคำสั่ง `sessionStorage.setItem('draft', data)` เพื่อลดภาระการเขียนข้อมูลลงดิสก์ที่อาจขัดจังหวะการพิมพ์
    *   เพิ่มปุ่ม "Open in New Tab" ให้ผู้ใช้ทดสอบกด เมื่อเปิดแท็บใหม่ขึ้นมา ช่อง Textarea จะว่างเปล่า ซึ่งพิสูจน์ว่า SessionStorage จะไม่แชร์ข้อมูลข้ามแท็บค่ะ

### 2.5 Product Catalog Module (`modules/ProductCatalogModule.jsx`)
*   **เป้าหมาย:** สาธิตพลังการประมวลผลแบบคู่ขนาน (Asynchronous) ของ IndexedDB
*   **รายละเอียดการทำงาน:**
    *   สร้างปุ่ม "Generate 100k Products" เมื่อกด ระบบจะส่ง Message ไปที่ `dataWorker.js`
    *   Web Worker จะทำหน้าที่สร้าง Array ขนาดใหญ่และเซฟลง IndexedDB ผ่านไลบรารี `idb` เบื้องหลัง
    *   ฝั่ง UI จะมี CSS Spinner หรือ Animation หมุนอยู่ตลอดเวลา เพื่อพิสูจน์ว่า Main Thread ไม่ถูกบล็อก (UI ไม่ค้าง) แม้กำลังจัดการกับข้อมูลระดับกิกะไบต์ค่ะ
    *   สร้างช่อง Search เพื่อแสดงความเร็วในการทำ Indexing และดึงข้อมูลของ IndexedDB

### 2.6 Asset Loader Module (`modules/AssetLoaderModule.jsx`)
*   **เป้าหมาย:** สาธิตการใช้ Cache Storage สำหรับทำระบบ Instant Load (สถาปัตยกรรมแบบ PWA)
*   **รายละเอียดการทำงาน:**
    *   เตรียมรูปภาพความละเอียดสูง (Hi-Res Image) ไว้ในโฟลเดอร์ public
    *   เมื่อกดปุ่ม "Load Image" คำสั่ง Request จะถูกดักจับ (Intercept) โดย Service Worker (`sw.js`)
    *   ใช้กลยุทธ์ **Cache-First Strategy**: โหลดครั้งแรกดึงจาก Network (โชว์เวลาที่ใช้โหลดเป็นวินาที) โหลดครั้งถัดไปดึงจาก Cache Storage (โชว์เวลาที่ใช้โหลดเพียงไม่กี่มิลลิวินาที) ค่ะ

### 2.7 Storage Inspector (`dashboard/StorageInspector.jsx`)
*   **เป้าหมาย:** แผงควบคุมระบบ (Live Monitor) สำหรับสังเกตการณ์การเปลี่ยนแปลงแบบ Real-time
*   **รายละเอียดการทำงาน:**
    *   ใช้ `setInterval` ดึงข้อมูลจาก Local, Session, และเช็ค Metadata ของ IndexedDB มาแสดงเป็น JSON Tree ทุกๆ 1 วินาที
    *   เพิ่ม Progress Bar จำลอง เพื่อแสดงปริมาณข้อมูลดิบที่กำลังถูกจัดเก็บในแต่ละ Storage
    *   สร้างปุ่ม "Clear All Browser Storage" (ปุ่มสีแดง) สำหรับทำลายล้างสถานะข้อมูลทั้งหมด เพื่อรีเซ็ตแอปพลิเคชันให้พร้อมสำหรับรอบการสาธิตใหม่ค่ะ
