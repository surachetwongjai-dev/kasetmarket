"use client";

// Error boundary ทั้งเว็บ — ต้องเป็น client component

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-[60vh] w-full max-w-md flex-col items-center justify-center px-4 py-16 text-center">
      <p className="text-6xl">😵</p>
      <h1 className="mt-4 font-heading text-2xl font-bold text-primary-dk">
        เกิดข้อผิดพลาด
      </h1>
      <p className="mt-2 text-muted-foreground">
        ขออภัย มีบางอย่างผิดพลาด กรุณาลองใหม่อีกครั้ง
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 flex h-11 items-center rounded-lg bg-primary px-5 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
      >
        ลองใหม่
      </button>
    </main>
  );
}
