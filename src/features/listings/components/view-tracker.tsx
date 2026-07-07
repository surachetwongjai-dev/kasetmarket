"use client";

// นับวิว — ยิงครั้งเดียวต่อ session ต่อรายการ (หน้าเป็น ISR เลยนับฝั่ง server ตรงๆ ไม่ได้)
// ใช้ได้ทั้งประกาศและบทความผ่าน endpoint ที่ส่งเข้ามา

import { useEffect } from "react";

export function ViewTracker({
  endpoint,
  dedupeKey,
}: {
  endpoint: string;
  dedupeKey: string;
}) {
  useEffect(() => {
    const key = `viewed:${dedupeKey}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      // sessionStorage ใช้ไม่ได้ (private mode ฯลฯ) — นับซ้ำได้ ไม่เป็นไร
    }
    navigator.sendBeacon?.(endpoint) ?? fetch(endpoint, { method: "POST" });
  }, [endpoint, dedupeKey]);

  return null;
}
