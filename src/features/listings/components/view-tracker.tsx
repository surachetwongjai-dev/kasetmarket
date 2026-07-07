"use client";

// นับวิวประกาศ — ยิงครั้งเดียวต่อ session ต่อประกาศ (หน้าเป็น ISR เลยนับฝั่ง server ตรงๆ ไม่ได้)

import { useEffect } from "react";

export function ViewTracker({ listingId }: { listingId: string }) {
  useEffect(() => {
    const key = `viewed:${listingId}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      // sessionStorage ใช้ไม่ได้ (private mode ฯลฯ) — นับซ้ำได้ ไม่เป็นไร
    }
    navigator.sendBeacon?.(`/api/listings/${listingId}/view`) ??
      fetch(`/api/listings/${listingId}/view`, { method: "POST" });
  }, [listingId]);

  return null;
}
