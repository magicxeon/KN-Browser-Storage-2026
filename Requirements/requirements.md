# Web Storage Architecture Demo: Implementation Plan

**หมายเหตุสำคัญ:** เพื่อความเป็นสากลและสอดคล้องกับการทำงานจริง UI และข้อความ (Copywriting) ทั้งหมดภายในแอปพลิเคชันสาธิตจะถูกเขียนเป็น **ภาษาอังกฤษ (English)** ค่ะ

## 1. Technology Stack
*   **Frontend:** React.js (Vite) + Tailwind CSS (สำหรับทำ UI อย่างรวดเร็วและสวยงาม)
*   **Backend (สำหรับสาธิต Cookie):** Node.js + Express.js
*   **Storage Wrappers:** `localforage` หรือ `idb` (สำหรับ IndexedDB)

---

## 2. Implementation by Module (วิธีการพัฒนาแต่ละส่วน)

### 2.1 HttpOnly Cookie (Authentication Module)
*   **แบบธรรมดา (Normal Implementation):**
    *   **Backend:** สร้าง API `/api/login` ที่แนบ `Set-Cookie: access_token=...; HttpOnly; SameSite=Strict` กลับมา
    *   **Frontend:** ใช้ Axios เรียก API พร้อมเปิดตั้งค่า `axios.defaults.withCredentials = true` เพื่อให้เบราว์เซอร์รับและส่ง Cookie อัตโนมัติในรอบถัดไป
*   **แบบขั้นสูง (Advanced Implementation):**
    *   **Backend & Frontend:** เพิ่มระบบ **CSRF Protection** (เช่น ส่ง Anti-CSRF Token ไปทาง HTTP Header ควบคู่กับ HttpOnly Cookie)
    *   สร้าง Axios Interceptor เพื่อดักจับ Error 401 และทำการขอ Token ใหม่แบบเงียบๆ (Silent Refresh) ด้วย Refresh Token เพื่อให้ผู้ใช้ไม่ต้องล็อกอินใหม่บ่อยๆ ค่ะ

### 2.2 LocalStorage (User Preferences Module)
*   **แบบธรรมดา (Normal Implementation):**
    *   เขียนโค้ดเรียกใช้ `localStorage.setItem('theme', 'dark')` และ `localStorage.getItem('theme')` ตรงๆ ในฟังก์ชันเมื่อมีการกดปุ่มสลับธีม
*   **แบบขั้นสูง (Advanced Implementation):**
    *   สร้าง **Custom React Hook (`useLocalStorage`)** เพื่อใช้จัดการ State
    *   เพิ่ม Event Listener ดักฟังอีเวนต์ `window.addEventListener('storage', ...)` เพื่อให้เกิด **Cross-Tab Synchronization** (หากผู้ใช้เปิดเว็บไว้ 2 หน้าต่าง แล้วเปลี่ยนธีมที่หน้าต่างแรก หน้าต่างที่สองจะต้องเปลี่ยนสีตามทันทีแบบ Real-time โดยไม่ต้อง Refresh ค่ะ)

### 2.3 SessionStorage (State Isolation Module)
*   **แบบธรรมดา (Normal Implementation):**
    *   ดักจับอีเวนต์ `onChange` ของช่อง Input แล้วสั่ง `sessionStorage.setItem('draft_note', value)` ทุกครั้งที่พิมพ์
*   **แบบขั้นสูง (Advanced Implementation):**
    *   ใช้เทคนิค **Debouncing** (หน่วงเวลา) ในการเขียนข้อมูลลง Storage (เช่น จะเขียนข้อมูลลงไปก็ต่อเมื่อผู้ใช้หยุดพิมพ์ไปแล้ว 500ms) เพื่อลดภาระการทำงานแบบ Synchronous (I/O Blocking) ซึ่งจะทำให้แอปพลิเคชันลื่นไหลกว่ามากเวลาพิมพ์ข้อความยาวๆ ค่ะ

### 2.4 IndexedDB (Heavy Duty & Async Module)
*   **แบบธรรมดา (Normal Implementation):**
    *   ใช้ไลบรารีอย่าง `localforage` ในการบันทึก Array ของสินค้า 1,000 รายการลง IndexedDB เพื่อลดความซับซ้อนของ Native API
    *   เรียกใช้ผ่าน `async/await` ทั่วไปใน Main Thread
*   **แบบขั้นสูง (Advanced Implementation):**
    *   ผลักภาระการคำนวณและการบันทึกข้อมูลขนาดใหญ่ (เช่น 100,000 รายการ) ไปให้ **Web Worker** ทำงานใน Background Thread แทนโดยสมบูรณ์
    *   ใช้กลไก **Cursor / Pagination** ในการดึงข้อมูลจาก IndexedDB ขึ้นมาแสดงผลทีละ 50 รายการ (Virtual Scrolling) เพื่อให้หน้าต่าง UI ยังคงตอบสนอง (Responsive) และ Animation ไม่กระตุกแม้แต่นิดเดียวค่ะ

### 2.5 Cache Storage (Asset Caching Module)
*   **แบบธรรมดา (Normal Implementation):**
    *   เขียนโค้ดเปิด Cache ตรงๆ ผ่าน `window.caches.open('image-cache')` แล้วดึงรูปภาพจาก API มาบันทึกด้วย `cache.put()` และดึงมาแสดงผลด้วย `cache.match()`
*   **แบบขั้นสูง (Advanced Implementation):**
    *   ฝังระบบเข้ากับ **Service Worker** อย่างเต็มรูปแบบ (ทำสถาปัตยกรรม PWA)
    *   ใช้กลยุทธ์ **Cache-First, Network Fallback Strategy** คือดักจับการยิง Request รูปภาพทั้งหมดจากหน้า HTML หากมีใน Cache ให้เสิร์ฟทันที หากไม่มีค่อยวิ่งไปดึงจาก Server ช่วยลดระยะเวลาโหลดรูปจากหลักวินาทีเหลือระดับมิลลิวินาที (Instant Load) ค่ะ

---

## 3. Storage Inspector Dashboard (แผงควบคุมระบบ)
*   **แบบธรรมดา (Normal Implementation):**
    *   ทำปุ่ม "Refresh Dashboard" เพื่อให้ผู้ใช้กดดึงข้อมูลล่าสุดจาก `localStorage` และ `sessionStorage` มาแสดงผลบนหน้าจอด้วยคำสั่ง `JSON.stringify` ธรรมดา
*   **แบบขั้นสูง (Advanced Implementation):**
    *   สร้างระบบ **Live Observer** โดยเขียนฟังก์ชันให้คอยตรวจสอบขนาดความจุที่ใช้ไปของ Storage แต่ละประเภทแบบ Real-time (คำนวณ Byte Size)
    *   แสดงผลข้อมูลด้วย UI แบบ Tree Viewer ที่สามารถกดพับ/ขยาย (Expand/Collapse) ดู Data Structure ข้างใน IndexedDB ได้อย่างสวยงามและเป็นมืออาชีพค่ะ