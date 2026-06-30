

# Web Storage Architecture Demo: UX/UI Requirements

## 1. ธีมและคอนเซปต์การออกแบบ (Design Theme & Concept)
*   **Visual Style:** Modern Dark Mode + Glassmorphism (เน้นความล้ำสมัย เข้ากับสไลด์นำเสนอ)
*   **Color Palette (อิงตามสีของ Slide):**
    *   **Background:** Deep Charcoal & Slate (`#121212`, `#1E293B`)
    *   **HttpOnly Cookie (Auth):** Neon Blue (`#3B82F6`)
    *   **LocalStorage:** Neon Red/Orange (`#EF4444`, `#F97316`)
    *   **SessionStorage:** Neon Orange (`#F97316`)
    *   **IndexedDB:** Neon Green (`#22C55E`)
    *   **Cache Storage:** Icy Cyan (`#06B6D4`)
*   **Typography:** ฟอนต์ตระกูล Sans-serif ที่อ่านง่าย เช่น `Inter` หรือ `Roboto` สำหรับ UI ทั่วไป และใช้ฟอนต์ `Fira Code` สำหรับส่วนแสดงผล JSON Code ค่ะ

## 2. โครงสร้างหน้าจอ (Layout Structure)
ออกแบบหน้าจอเป็นแบบ **Split Screen (2-Column Grid)** เพื่อให้เห็นการกระทำและผลลัพธ์พร้อมกันโดยไม่ต้องสลับหน้าจอ:
*   **Left Panel (60% Width) - Interactive Workspace:** พื้นที่สำหรับให้ผู้ใช้งานกดปุ่มและทดลองใช้งาน Module ทั้ง 5 ตัว (จัดเรียงเป็น Card แนวตั้ง Scroll ลงมาได้)
*   **Right Panel (40% Width) - Storage Inspector (Sticky):** แผงควบคุมและแสดงผลข้อมูลดิบด้านขวาแบบยึดติดกับหน้าจอ (Sticky) เลื่อนตามเวลาผู้ใช้ Scroll ดูข้อมูล JSON แบบ Real-time

## 3. กลยุทธ์การแยกสไตล์ (Modular Styling Strategy)
เพื่อให้สามารถแก้ไข UI ได้ง่ายและไม่กระทบกัน จะใช้โครงสร้างแบบผสมผสาน (Tailwind CSS + CSS Variables):

### 3.1 การตั้งค่า Design Token (`tailwind.config.js`)
รวมสีหลักและฟอนต์ไว้ที่ส่วนกลาง เพื่อให้เปลี่ยนสีทั้งโปรเจกต์ได้จากการแก้ไฟล์เดียว
```javascript
// ตัวอย่าง tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        background: 'var(--color-bg)',
        surface: 'var(--color-surface)',
        primary: 'var(--color-primary)',
        // แยกสีตาม Module
        module: {
          cookie: '#3B82F6',
          local: '#EF4444',
          session: '#F97316',
          indexed: '#22C55E',
          cache: '#06B6D4'
        }
      }
    }
  }
}

```

### 3.2 การแยกไฟล์ CSS สำหรับเอฟเฟกต์พิเศษ (`src/styles/glassmorphism.css`)

เอฟเฟกต์ที่ซับซ้อนอย่างกระจกฝ้า (Glassmorphism) จะถูกแยกออกมาเป็นคลาสอิสระ เพื่อเรียกใช้ซ้ำได้ง่าย

```css
.glass-panel {
  background: rgba(30, 41, 59, 0.7);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3);
  border-radius: 16px;
}

```

## 4. การออกแบบคอมโพเนนต์ (Component UX/UI)

### 4.1 Module Cards (การ์ดสาธิตแต่ละหัวข้อ)

* ใช้ `.glass-panel` เป็นพื้นหลังของการ์ด
* มี Header ของการ์ดที่ใช้สี (Border-top หรือ Glow effect) ตาม Color Palette ที่กำหนด เพื่อแบ่งแยกหมวดหมู่ให้ชัดเจน
* ปุ่มกด (Buttons) เป็นแบบมี Hover Effect (สว่างขึ้นเล็กน้อย และมีเงา Glow ตามสีของปุ่ม)

### 4.2 Storage Inspector (แผง Dashboard ด้านขวา)

* **JSON Tree Viewer:** ข้อมูลที่ดึงมาจาก Storage จะต้องถูก Format ให้สวยงาม มี Syntax Highlighting (Key สีฟ้า, String สีเขียว, Number สีส้ม) และสามารถกดลูกศร `>` เพื่อพับ/ขยาย Object ที่ซ้อนกันได้
* **Storage Capacity Bars:** มีหลอด Progress Bar เล็กๆ ใต้ชื่อ Storage แต่ละประเภท แสดงปริมาณข้อมูลที่ใช้ไป เพื่อให้เห็นภาพชัดเจนเมื่อมีการเซฟข้อมูลขนาดใหญ่ลง IndexedDB

### 4.3 Feedback & Micro-interactions (การตอบสนองผู้ใช้)

* **Toast Notifications:** เมื่อเกิด Action สำเร็จ (เช่น "Saved to LocalStorage") จะมีป๊อปอัปแจ้งเตือนลอยขึ้นมามุมขวาล่างแบบนุ่มนวลและหายไปเองใน 3 วินาที
* **Async Loaders:** ระหว่างรัน Web Worker ใน IndexedDB Module ปุ่มกดจะเปลี่ยนสถานะเป็น `Disabled` และแสดง Skeleton Loading หรือ CSS Spinner เพื่อบอกว่าระบบกำลังทำงานเบื้องหลัง
* **Empty States:** หาก Storage ตัวไหนยังไม่มีข้อมูล (เช่น SessionStorage ยังว่างเปล่า) ให้แสดงภาพประกอบเล็กๆ หรือข้อความสีเทาบางๆ ว่า "No data in storage" แทนการปล่อยพื้นที่ให้ว่างเปล่าค่ะ
