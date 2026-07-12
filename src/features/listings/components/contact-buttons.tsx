"use client";

// ปุ่มโทร + LINE — ใหญ่ กดง่าย sticky ล่างจอบนมือถือ (CLAUDE.md §3)
// เบอร์โทรซ่อนก่อน กด "แสดงเบอร์" → เห็นคำเตือนตัวกลาง → ยืนยัน → เห็นเบอร์ (ลด scraping §8 + Trust T1)
// revealEndpoint: ถ้าส่งมา (หน้าประกาศ) จะ log ContactReveal ตอนยืนยันดูเบอร์/กด LINE
//   ไม่ส่ง (หน้าร้าน directory) = แสดงคำเตือนอย่างเดียว ไม่ log (ไม่มี Listing ให้ผูก)

import { useState } from "react";
import { SafetyNotice } from "@/features/trust/components/safety-notice";

function lineHref(contactLine: string): string {
  if (/^https?:\/\//.test(contactLine)) return contactLine;
  const id = contactLine.replace(/^@/, "");
  return `https://line.me/R/ti/p/~${encodeURIComponent(id)}`;
}

type PhoneStep = "hidden" | "warning" | "shown";

export function ContactButtons({
  phone,
  line,
  revealEndpoint,
}: {
  phone: string | null;
  line: string | null;
  revealEndpoint?: string;
}) {
  const [phoneStep, setPhoneStep] = useState<PhoneStep>("hidden");

  if (!phone && !line) return null;

  function logReveal(channel: "phone" | "line") {
    if (!revealEndpoint) return;
    try {
      const key = `revealed:${revealEndpoint}:${channel}`;
      if (sessionStorage.getItem(key)) return; // ยิงครั้งเดียว/ช่องทาง/session
      sessionStorage.setItem(key, "1");
    } catch {
      // sessionStorage ใช้ไม่ได้ (private mode) — ยิงซ้ำได้ ไม่เป็นไร
    }
    const url = `${revealEndpoint}?channel=${channel}`;
    navigator.sendBeacon?.(url) ?? fetch(url, { method: "POST", keepalive: true });
  }

  const btnBase =
    "flex h-12 flex-1 items-center justify-center gap-2 rounded-lg text-base font-semibold transition-colors";
  const btnPrimary = `${btnBase} bg-primary text-primary-foreground hover:bg-primary/90`;

  return (
    <>
      {/* spacer กันเนื้อหาโดน bar บัง (มือถือ) */}
      <div className="h-20 sm:hidden" />

      <div className="fixed inset-x-0 bottom-0 z-30 flex flex-col gap-2 border-t border-border bg-card p-3 sm:static sm:rounded-xl sm:border sm:p-3">
        {phoneStep === "warning" && <SafetyNotice variant="pre-reveal" />}

        <div className="flex gap-2">
          {phone &&
            (phoneStep === "hidden" ? (
              <button
                type="button"
                onClick={() => setPhoneStep("warning")}
                className={btnPrimary}
              >
                📞 แสดงเบอร์โทร
              </button>
            ) : phoneStep === "warning" ? (
              <button
                type="button"
                onClick={() => {
                  logReveal("phone");
                  setPhoneStep("shown");
                }}
                className={btnPrimary}
              >
                ✓ เข้าใจแล้ว ดูเบอร์
              </button>
            ) : (
              <a href={`tel:${phone}`} className={btnPrimary}>
                📞 {formatPhone(phone)}
              </a>
            ))}
          {line && (
            <a
              href={lineHref(line)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => logReveal("line")}
              className={`${btnBase} bg-[#06C755] text-white hover:bg-[#05b34c]`}
            >
              LINE
            </a>
          )}
        </div>
      </div>
    </>
  );
}

function formatPhone(phone: string): string {
  // 0812345678 → 081-234-5678
  if (/^0\d{9}$/.test(phone))
    return `${phone.slice(0, 3)}-${phone.slice(3, 6)}-${phone.slice(6)}`;
  if (/^0\d{8}$/.test(phone))
    return `${phone.slice(0, 2)}-${phone.slice(2, 5)}-${phone.slice(5)}`;
  return phone;
}
