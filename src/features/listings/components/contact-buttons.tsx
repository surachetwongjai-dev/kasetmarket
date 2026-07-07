"use client";

// ปุ่มโทร + LINE — ใหญ่ กดง่าย sticky ล่างจอบนมือถือ (CLAUDE.md §3)
// เบอร์โทรซ่อนก่อน กด "แสดงเบอร์" ถึงเห็น/โทรได้ (ลด scraping — §8)

import { useState } from "react";

function lineHref(contactLine: string): string {
  if (/^https?:\/\//.test(contactLine)) return contactLine;
  const id = contactLine.replace(/^@/, "");
  return `https://line.me/R/ti/p/~${encodeURIComponent(id)}`;
}

export function ContactButtons({
  phone,
  line,
}: {
  phone: string | null;
  line: string | null;
}) {
  const [phoneShown, setPhoneShown] = useState(false);

  if (!phone && !line) return null;

  return (
    <>
      {/* spacer กันเนื้อหาโดน bar บัง (มือถือ) */}
      <div className="h-20 sm:hidden" />

      <div className="fixed inset-x-0 bottom-0 z-30 flex gap-2 border-t border-border bg-card p-3 sm:static sm:rounded-xl sm:border sm:p-3">
        {phone &&
          (phoneShown ? (
            <a
              href={`tel:${phone}`}
              className="flex h-12 flex-1 items-center justify-center gap-2 rounded-lg bg-primary text-base font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              📞 {formatPhone(phone)}
            </a>
          ) : (
            <button
              type="button"
              onClick={() => setPhoneShown(true)}
              className="flex h-12 flex-1 items-center justify-center gap-2 rounded-lg bg-primary text-base font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              📞 แสดงเบอร์โทร
            </button>
          ))}
        {line && (
          <a
            href={lineHref(line)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-12 flex-1 items-center justify-center gap-2 rounded-lg bg-[#06C755] text-base font-semibold text-white transition-colors hover:bg-[#05b34c]"
          >
            LINE
          </a>
        )}
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
