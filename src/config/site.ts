// ค่าคงที่ระดับเว็บ — base URL (สำหรับ sitemap/canonical) + ช่องทาง social

/** Base URL ของเว็บ — ตั้งผ่าน NEXT_PUBLIC_SITE_URL ตอน deploy (ไม่มี / ท้าย) */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
).replace(/\/$/, "");

export const SITE_NAME = "TaladKaset";

export const SITE_DESCRIPTION =
  "ตลาดกลางซื้อขายสินค้าเกษตร ลงประกาศฟรี ผู้ซื้อติดต่อผู้ขายโดยตรงทางโทรศัพท์หรือ LINE พร้อมคลังบทความความรู้เกษตร";

/** ลิงก์ช่อง YouTube ของเจ้าของ (traffic source หลัก) — ตั้งค่าจริงก่อน launch
 *  ปล่อยว่าง = ไม่แสดงแถบ YouTube บนหน้าแรก */
export const YOUTUBE_CHANNEL_URL =
  process.env.NEXT_PUBLIC_YOUTUBE_URL ?? "";
