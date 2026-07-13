// เรทค่าขนส่งพัสดุทุกค่าย (กลุ่ม S / S1) — ค่าคงที่ทางธุรกิจ แก้ที่นี่ที่เดียว
// ⚠️ เรทมาตรฐานหน้าเคาน์เตอร์ เปลี่ยนบ่อย — ทบทวน+อัปเดต SHIPPING_UPDATED_AT ทุกเดือน
// (PLAN-PHASE2.md กลุ่ม S) ห้าม hardcode ราคาในหน้า ให้ดึงจาก config นี้เท่านั้น

export type ShippingBracket = {
  /** ราคาสำหรับน้ำหนัก ≤ maxKg (กก.) */
  maxKg: number;
  /** ราคาประมาณ (บาท) */
  price: number;
};

export type ShippingService = {
  id: string;
  /** ชื่อบริการ เช่น "EMS", "ส่งด่วน" */
  label: string;
  /** หมายเหตุบริการ (เช่น รวมกล่องผลไม้) */
  note?: string;
  /** บริการเฉพาะของสด/ผลไม้ (ป้าย 🍎) */
  fresh?: boolean;
  /** ตารางเรทตามช่วงน้ำหนัก เรียงเบา→หนัก */
  brackets: ShippingBracket[];
  /** ราคาต่อ กก. ส่วนที่เกิน bracket สุดท้าย (ไม่ใส่ = เกินพิกัดให้ติดต่อค่าย) */
  perKgOver?: number;
};

export type ShippingCarrier = {
  slug: string;
  name: string;
  /** เว็บเช็คเรททางการ (ปุ่ม "เช็คเรทจริง →") */
  url: string;
  /** เบอร์ call center */
  phone?: string;
  /** รับของสด/ผลไม้ (ป้าย 🍎) */
  freshSupport: boolean;
  /** รถห้องเย็น/ควบคุมอุณหภูมิ (ป้าย ❄️) */
  coldChain: boolean;
  /** รองรับเก็บเงินปลายทาง COD (ป้าย ✓) */
  codSupport: boolean;
  /** ตัวหารน้ำหนักปริมาตร (ก×ย×ส ซม. ÷ divisor = กก.) — 0 = คิดตามน้ำหนักจริง */
  volumetricDivisor: number;
  /** หมายเหตุพื้นที่ห่างไกล/เงื่อนไขเพิ่ม */
  remoteNote?: string;
  services: ShippingService[];
};

/** เดือน/ปีที่ทบทวนเรทล่าสุด — โชว์เด่นในหน้า (disclaimer) */
export const SHIPPING_UPDATED_AT = "กรกฎาคม 2569";

// ตัวหารน้ำหนักปริมาตรมาตรฐานพัสดุภาคพื้นไทย (ก×ย×ส ซม. ÷ 5000)
const STD_DIVISOR = 5000;

export const SHIPPING_CARRIERS: ShippingCarrier[] = [
  {
    slug: "flash",
    name: "Flash Express",
    url: "https://www.flashexpress.com/th/",
    phone: "1298",
    freshSupport: true, // รับผลไม้/ของสด (บรรจุภัณฑ์ได้มาตรฐาน)
    coldChain: false,
    codSupport: true,
    volumetricDivisor: STD_DIVISOR,
    remoteNote: "พื้นที่ห่างไกลบางอำเภอมีค่าบริการเพิ่ม",
    services: [
      {
        id: "flash-standard",
        label: "ส่งด่วนมาตรฐาน",
        brackets: [
          { maxKg: 1, price: 25 },
          { maxKg: 3, price: 40 },
          { maxKg: 5, price: 60 },
          { maxKg: 10, price: 105 },
          { maxKg: 15, price: 150 },
          { maxKg: 20, price: 200 },
          { maxKg: 25, price: 260 },
        ],
        perKgOver: 12,
      },
    ],
  },
  {
    slug: "best",
    name: "BEST Express",
    url: "https://www.best-inc.co.th/",
    phone: "1281",
    freshSupport: false,
    coldChain: false,
    codSupport: true,
    volumetricDivisor: STD_DIVISOR,
    services: [
      {
        id: "best-standard",
        label: "ส่งด่วนมาตรฐาน",
        brackets: [
          { maxKg: 1, price: 25 },
          { maxKg: 3, price: 40 },
          { maxKg: 5, price: 58 },
          { maxKg: 10, price: 100 },
          { maxKg: 15, price: 145 },
          { maxKg: 20, price: 195 },
          { maxKg: 25, price: 250 },
        ],
        perKgOver: 11,
      },
    ],
  },
  {
    slug: "jt",
    name: "J&T Express",
    url: "https://www.jtexpress.co.th/",
    phone: "1919",
    freshSupport: false,
    coldChain: false,
    codSupport: true,
    volumetricDivisor: STD_DIVISOR,
    services: [
      {
        id: "jt-standard",
        label: "ส่งด่วนมาตรฐาน",
        brackets: [
          { maxKg: 1, price: 25 },
          { maxKg: 3, price: 43 },
          { maxKg: 5, price: 63 },
          { maxKg: 10, price: 110 },
          { maxKg: 15, price: 155 },
          { maxKg: 20, price: 205 },
          { maxKg: 25, price: 265 },
        ],
        perKgOver: 12,
      },
    ],
  },
  {
    slug: "kerry",
    name: "Kerry Express (KEX)",
    url: "https://th.kerryexpress.com/",
    phone: "1217",
    freshSupport: true, // มีแคมเปญส่งผลไม้ตามฤดู
    coldChain: false,
    codSupport: true,
    volumetricDivisor: STD_DIVISOR,
    services: [
      {
        id: "kerry-standard",
        label: "ส่งด่วนในประเทศ",
        brackets: [
          { maxKg: 1, price: 32 },
          { maxKg: 3, price: 55 },
          { maxKg: 5, price: 79 },
          { maxKg: 10, price: 145 },
          { maxKg: 15, price: 205 },
          { maxKg: 20, price: 265 },
          { maxKg: 25, price: 335 },
        ],
        perKgOver: 14,
      },
    ],
  },
  {
    slug: "thailand-post",
    name: "ไปรษณีย์ไทย",
    url: "https://www.thailandpost.com/",
    phone: "1545",
    freshSupport: true, // EMS ผลไม้ + กล่องผลไม้เฉพาะ
    coldChain: false,
    codSupport: true,
    volumetricDivisor: 0, // คิดตามน้ำหนักจริงเป็นหลัก
    remoteNote: "ครอบคลุมทุกตำบล รวมพื้นที่ห่างไกลที่ค่ายเอกชนไม่ถึง",
    services: [
      {
        id: "thp-registered",
        label: "พัสดุลงทะเบียน",
        note: "ถูกสุดแต่ช้ากว่า EMS",
        brackets: [
          { maxKg: 1, price: 30 },
          { maxKg: 2, price: 42 },
          { maxKg: 5, price: 75 },
          { maxKg: 10, price: 130 },
          { maxKg: 15, price: 180 },
          { maxKg: 20, price: 230 },
        ],
        perKgOver: 12,
      },
      {
        id: "thp-ems",
        label: "EMS ด่วนพิเศษ",
        brackets: [
          { maxKg: 1, price: 45 },
          { maxKg: 2, price: 60 },
          { maxKg: 5, price: 100 },
          { maxKg: 10, price: 175 },
          { maxKg: 15, price: 250 },
          { maxKg: 20, price: 320 },
        ],
        perKgOver: 15,
      },
      {
        id: "thp-ems-fruit",
        label: "EMS ผลไม้",
        note: "รวมกล่องผลไม้เฉพาะของไปรษณีย์",
        fresh: true,
        brackets: [
          { maxKg: 3, price: 60 },
          { maxKg: 5, price: 90 },
          { maxKg: 10, price: 160 },
          { maxKg: 15, price: 230 },
          { maxKg: 20, price: 300 },
        ],
        perKgOver: 15,
      },
    ],
  },
  {
    slug: "nim-express",
    name: "Nim Express",
    url: "https://www.nimexpress.com/",
    phone: "1210",
    freshSupport: true,
    coldChain: true, // รถห้องเย็น ของสดข้ามจังหวัดใน 1 วัน
    codSupport: true,
    volumetricDivisor: STD_DIVISOR,
    remoteNote: "เรทโดยประมาณ ของสด/ห้องเย็นคิดตามชนิดสินค้า—โทรเช็คสาขา",
    services: [
      {
        id: "nim-fresh",
        label: "ส่งของสด/ห้องเย็น",
        note: "เด่นภาคเหนือ—อีสาน ส่งผัก/ผลไม้/ของสด",
        fresh: true,
        brackets: [
          { maxKg: 1, price: 40 },
          { maxKg: 3, price: 70 },
          { maxKg: 5, price: 100 },
          { maxKg: 10, price: 180 },
          { maxKg: 15, price: 250 },
          { maxKg: 20, price: 320 },
          { maxKg: 25, price: 400 },
        ],
        perKgOver: 16,
      },
    ],
  },
  {
    slug: "inter-express",
    name: "Inter Express",
    url: "https://www.interexpress.co.th/",
    freshSupport: true,
    coldChain: true, // โลจิสติกส์ควบคุมอุณหภูมิ/แช่เย็น
    codSupport: true,
    volumetricDivisor: STD_DIVISOR,
    remoteNote: "เรทโดยประมาณ ของสด/แช่เย็นคิดตามชนิดสินค้า—โทรเช็คสาขา",
    services: [
      {
        id: "inter-cold",
        label: "ส่งของสด/แช่เย็น",
        fresh: true,
        brackets: [
          { maxKg: 1, price: 45 },
          { maxKg: 3, price: 78 },
          { maxKg: 5, price: 110 },
          { maxKg: 10, price: 190 },
          { maxKg: 15, price: 265 },
          { maxKg: 20, price: 340 },
          { maxKg: 25, price: 420 },
        ],
        perKgOver: 17,
      },
    ],
  },
];
