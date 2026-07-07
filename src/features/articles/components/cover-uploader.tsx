"use client";

// อัปโหลดรูปปกบทความ (รูปเดียว) — ใช้ compress + upload flow เดียวกับ M4

import { useRef, useState } from "react";
import Image from "next/image";
import { compressImage } from "@/lib/image-compress";

export function CoverUploader({
  name,
  initialUrl,
}: {
  name: string; // ชื่อ field ที่จะส่ง url ไปกับฟอร์ม
  initialUrl?: string;
}) {
  const [url, setUrl] = useState(initialUrl ?? "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const { blob, contentType } = await compressImage(file);
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentType, size: blob.size }),
      });
      if (!res.ok) throw new Error("ขออัปโหลดไม่สำเร็จ");
      const target = await res.json();
      const put = await fetch(target.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": contentType },
        body: blob,
      });
      if (!put.ok) throw new Error("อัปโหลดไม่สำเร็จ");
      setUrl(target.publicUrl);
    } catch (e) {
      setError(e instanceof Error ? e.message : "อัปโหลดไม่สำเร็จ");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <input type="hidden" name={name} value={url} />
      {url ? (
        <div className="relative aspect-[16/9] w-full max-w-md overflow-hidden rounded-lg border border-border bg-muted">
          <Image src={url} alt="รูปปก" fill sizes="448px" className="object-cover" />
          <button
            type="button"
            onClick={() => setUrl("")}
            className="absolute top-2 right-2 flex size-8 items-center justify-center rounded-full bg-black/60 text-white hover:bg-destructive"
            aria-label="ลบรูปปก"
          >
            ✕
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex aspect-[16/9] w-full max-w-md flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary disabled:opacity-50"
        >
          <span className="text-2xl">🖼️</span>
          <span className="text-sm">
            {uploading ? "กำลังอัปโหลด..." : "เพิ่มรูปปก (ไม่บังคับ)"}
          </span>
        </button>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </div>
  );
}
