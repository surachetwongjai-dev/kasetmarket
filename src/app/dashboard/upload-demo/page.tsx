// หน้าทดสอบ ImageUploader (ชั่วคราว — จะถูกแทนที่ด้วยฟอร์มลงประกาศจริงใน M5)

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/features/auth";
import { UploadDemo } from "./upload-demo";

export const metadata: Metadata = {
  title: "ทดสอบอัปโหลดรูป — KasetMarket",
};

export default async function UploadDemoPage() {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <main className="mx-auto w-full max-w-xl px-4 py-8">
      <h1 className="font-heading text-2xl font-bold text-primary-dk">
        ทดสอบอัปโหลดรูป
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        หน้านี้ใช้ทดสอบ M4 ชั่วคราว — ฟอร์มลงประกาศจริงมาใน M5
      </p>
      <div className="mt-6">
        <UploadDemo />
      </div>
    </main>
  );
}
