// Helper จัดรูปแบบราคา/วันที่ (ปรับจาก ShopDash lib/format.ts)
// เวลาเก็บ UTC แสดงผล Asia/Bangkok เสมอ

import { getUnitLabel } from "@/config/units";

export function formatPrice(amount: number): string {
  return amount.toLocaleString("th-TH", { maximumFractionDigits: 2 });
}

/** ป้ายราคาต่อหน่วย เช่น "12,500 บาท/ตัน" — signature element ของการ์ดประกาศ */
export function formatPricePerUnit(amount: number, unit: string): string {
  return `${formatPrice(amount)} บาท/${getUnitLabel(unit)}`;
}

export function formatThaiDate(iso: string | Date): string {
  return new Date(iso).toLocaleDateString("th-TH", {
    dateStyle: "medium",
    timeZone: "Asia/Bangkok",
  });
}

export function formatThaiDateTime(iso: string | Date): string {
  return new Date(iso).toLocaleString("th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Bangkok",
  });
}

/** เวลาแบบสัมพัทธ์สำหรับการ์ดประกาศ เช่น "3 ชม.ที่แล้ว" */
export function formatTimeAgo(iso: string | Date): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1) return "เมื่อสักครู่";
  if (mins < 60) return `${mins} นาทีที่แล้ว`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} ชม.ที่แล้ว`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} วันที่แล้ว`;
  return formatThaiDate(iso);
}
