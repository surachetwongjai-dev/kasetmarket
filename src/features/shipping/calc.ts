// ตรรกะคำนวณค่าส่ง (S1) — ฟังก์ชันบริสุทธิ์ ไม่พึ่ง React ทดสอบแยกได้
// น้ำหนักคิดค่าส่ง = max(น้ำหนักจริง, น้ำหนักตามปริมาตร) ต่อค่าย

import {
  SHIPPING_CARRIERS,
  type ShippingCarrier,
  type ShippingService,
} from "@/config/shippingRates";

export type Dimensions = { w: number; l: number; h: number };

/** น้ำหนักตามปริมาตร (กก.) — 0 ถ้าค่ายไม่คิด volumetric หรือกรอกขนาดไม่ครบ */
export function volumetricKg(dims: Dimensions, divisor: number): number {
  if (divisor <= 0) return 0;
  const { w, l, h } = dims;
  if (!(w > 0) || !(l > 0) || !(h > 0)) return 0;
  return (w * l * h) / divisor;
}

/** น้ำหนักที่ใช้คิดค่าส่งของค่ายนั้น */
export function chargeableKg(
  actualKg: number,
  dims: Dimensions | null,
  divisor: number,
): number {
  const vol = dims ? volumetricKg(dims, divisor) : 0;
  return Math.max(actualKg, vol);
}

/** ราคาบริการตามน้ำหนัก — null = เกินพิกัดที่มีเรท (ให้ติดต่อค่าย) */
export function servicePrice(service: ShippingService, kg: number): number | null {
  if (!(kg > 0)) return null;
  for (const b of service.brackets) {
    if (kg <= b.maxKg) return b.price;
  }
  const last = service.brackets[service.brackets.length - 1];
  if (service.perKgOver != null) {
    const extra = Math.ceil(kg - last.maxKg);
    return last.price + extra * service.perKgOver;
  }
  return null; // เกินพิกัด — ผู้ใช้ต้องติดต่อค่าย
}

export type QuoteRow = {
  carrier: ShippingCarrier;
  service: ShippingService;
  /** น้ำหนักที่ค่ายนี้ใช้คิด (อาจต่างจากน้ำหนักจริงถ้าคิด volumetric) */
  chargeableKg: number;
  /** true เมื่อค่าส่งถูกคิดจากน้ำหนักปริมาตรแทนน้ำหนักจริง */
  volumetric: boolean;
  price: number | null;
};

/** คำนวณราคาทุกค่าย/ทุกบริการ เรียงถูก→แพง (คิดไม่ได้ไปท้ายสุด) */
export function quoteAll(
  actualKg: number,
  dims: Dimensions | null,
): QuoteRow[] {
  const rows: QuoteRow[] = [];
  for (const carrier of SHIPPING_CARRIERS) {
    const ck = chargeableKg(actualKg, dims, carrier.volumetricDivisor);
    const volumetric = ck > actualKg + 1e-9;
    for (const service of carrier.services) {
      rows.push({
        carrier,
        service,
        chargeableKg: ck,
        volumetric,
        price: servicePrice(service, ck),
      });
    }
  }
  return rows.sort((a, b) => {
    if (a.price == null) return b.price == null ? 0 : 1;
    if (b.price == null) return -1;
    return a.price - b.price;
  });
}
