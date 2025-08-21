# SpaceX Launches — Vue 3 Starter

Starter kit สำหรับทำโจทย์ **Interview coding challenge** (ดู/ค้น/เรียงลิสต์ launches และเปิดรายละเอียด)

## คุณสมบัติ
- Vue 3 + Vite + Pinia + Vue Router
- Axios เรียก SpaceX API v4
- Day.js จัดรูปเวลา
- โครงหน้าเดียว: All / Past / Upcoming + Sorting (Name/Time)

## วิธีเริ่มใช้งาน
```bash
npm install
npm run dev
```

เปิด `http://localhost:5173`

## โครงสร้างโฟลเดอร์
```
src/
  api/spacex.js         # เรียก /launches + /query สำหรับ batch
  stores/launches.js    # state + actions + sorting
  router/index.js       # routes: /launches/:view
  views/LaunchesView.vue
  components/LaunchCard.vue
  components/LaunchDialog.vue
  utils/format.js
  styles.css
```

## ปรับแต่งเพิ่มเติม (ถ้ามีเวลา)
- ใช้ `/v4/launches/query` เพื่อ server-side sort/paginate
- เพิ่มค้นหาด้วยชื่อภารกิจ
- ใส่ loader/skeleton + error states ให้สวยขึ้น
- เขียนเทสต์ด้วย Vitest / Vue Test Utils / Playwright

> อ้างอิง API: https://github.com/r-spacex/SpaceX-API/blob/master/docs/README.md