"use client";

// <ImageUploader> — อัปรูปประกาศสูงสุด 6 รูป (PLAN M4)
// บีบอัดฝั่ง client → ขอ upload URL → PUT พร้อม progress → ส่ง list รูปกลับผ่าน onChange
// เรียงลำดับได้ทั้งลาก (desktop) และปุ่มลูกศร (มือถือ), รูปแรก = รูปปก

import { useRef, useState } from "react";
import { compressImage } from "@/lib/image-compress";

export type UploadedImage = {
  key: string;
  url: string;
};

type Item = {
  id: string;
  previewUrl: string;
  progress: number; // 0-100
  status: "uploading" | "done" | "error";
  errorMessage?: string;
  image?: UploadedImage;
  file?: File; // เก็บไว้เผื่อ retry เมื่ออัปล้ม
};

export function ImageUploader({
  onChange,
  disabled,
  initial,
  max: maxImages = 6,
  endpoint = "/api/upload",
}: {
  /** เรียกทุกครั้งที่รายการรูป (ที่อัปเสร็จแล้ว) เปลี่ยน — เรียงตามลำดับแสดงผล */
  onChange: (images: UploadedImage[]) => void;
  disabled?: boolean;
  /** รูปเดิมของประกาศ (โหมดแก้ไข) — ใช้ค่าตอน mount ครั้งแรกเท่านั้น */
  initial?: UploadedImage[];
  /** จำนวนรูปสูงสุด (ประกาศ 6, ร้านค้า directory 4) */
  max?: number;
  /** API ขอ upload URL — ฟอร์มลงทะเบียนร้าน (ไม่ล็อกอิน) ใช้ /api/upload/shop */
  endpoint?: string;
}) {
  const [items, setItems] = useState<Item[]>(() =>
    (initial ?? []).slice(0, maxImages).map((img) => ({
      id: crypto.randomUUID(),
      previewUrl: img.url,
      progress: 100,
      status: "done" as const,
      image: img,
    })),
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const dragIndex = useRef<number | null>(null);

  function emit(next: Item[]) {
    setItems(next);
    onChange(
      next
        .filter((it) => it.status === "done" && it.image)
        .map((it) => it.image as UploadedImage),
    );
  }

  function patchItem(id: string, patch: Partial<Item>) {
    setItems((prev) => {
      const next = prev.map((it) => (it.id === id ? { ...it, ...patch } : it));
      // แจ้ง onChange เมื่อสถานะ done เปลี่ยน
      if (patch.status === "done") {
        queueMicrotask(() =>
          onChange(
            next
              .filter((it) => it.status === "done" && it.image)
              .map((it) => it.image as UploadedImage),
          ),
        );
      }
      return next;
    });
  }

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    const room = maxImages - items.length;
    const selected = Array.from(files).slice(0, room);

    for (const file of selected) {
      const id = crypto.randomUUID();
      const previewUrl = URL.createObjectURL(file);
      setItems((prev) => [
        ...prev,
        { id, previewUrl, progress: 0, status: "uploading", file },
      ]);
      uploadOne(id, file); // ยิงขนานกันได้ ไม่ await
    }
    if (inputRef.current) inputRef.current.value = "";
  }

  async function uploadOne(id: string, file: File) {
    try {
      const { blob, contentType } = await compressImage(file);

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentType, size: blob.size }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "ขออัปโหลดไม่สำเร็จ");
      }
      const target: { uploadUrl: string; publicUrl: string; key: string } =
        await res.json();

      await putWithProgress(target.uploadUrl, blob, contentType, (pct) =>
        patchItem(id, { progress: pct }),
      );

      patchItem(id, {
        status: "done",
        progress: 100,
        image: { key: target.key, url: target.publicUrl },
      });
    } catch (error) {
      patchItem(id, {
        status: "error",
        errorMessage:
          error instanceof Error ? error.message : "อัปโหลดไม่สำเร็จ",
      });
    }
  }

  function retryUpload(id: string) {
    const item = items.find((it) => it.id === id);
    if (!item?.file) return;
    patchItem(id, { status: "uploading", progress: 0, errorMessage: undefined });
    uploadOne(id, item.file);
  }

  function removeItem(id: string) {
    const item = items.find((it) => it.id === id);
    if (item) URL.revokeObjectURL(item.previewUrl);
    emit(items.filter((it) => it.id !== id));
  }

  function move(from: number, to: number) {
    if (to < 0 || to >= items.length) return;
    const next = [...items];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    emit(next);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-3 gap-2">
        {items.map((item, i) => (
          <div
            key={item.id}
            draggable={!disabled}
            onDragStart={() => (dragIndex.current = i)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => {
              if (dragIndex.current !== null) move(dragIndex.current, i);
              dragIndex.current = null;
            }}
            className="group relative aspect-[4/3] overflow-hidden rounded-lg border border-border bg-muted"
          >
            {/* preview เป็น object URL — ใช้ <img> ตรงๆ (next/image ไม่รองรับ blob:) */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.previewUrl}
              alt={`รูปที่ ${i + 1}`}
              className="h-full w-full object-cover"
            />

            {i === 0 && item.status === "done" && (
              <span className="absolute top-1 left-1 rounded bg-accent px-1.5 py-0.5 text-xs font-medium text-accent-foreground">
                รูปปก
              </span>
            )}

            {item.status === "uploading" && (
              <div className="absolute inset-0 flex items-end bg-black/40">
                <div className="h-1.5 w-full bg-black/30">
                  <div
                    className="h-full bg-accent transition-all"
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
              </div>
            )}

            {item.status === "error" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-destructive/80 p-2 text-center text-xs text-white">
                <span>{item.errorMessage}</span>
                {item.file && (
                  <button
                    type="button"
                    onClick={() => retryUpload(item.id)}
                    className="rounded-md bg-white/90 px-2 py-1 text-xs font-semibold text-destructive hover:bg-white"
                  >
                    ลองอีกครั้ง
                  </button>
                )}
              </div>
            )}

            <div className="absolute top-1 right-1 flex gap-1">
              <button
                type="button"
                onClick={() => removeItem(item.id)}
                aria-label={`ลบรูปที่ ${i + 1}`}
                className="flex size-7 items-center justify-center rounded-full bg-black/60 text-white hover:bg-destructive"
              >
                ✕
              </button>
            </div>

            <div className="absolute bottom-1 right-1 flex gap-1">
              <button
                type="button"
                onClick={() => move(i, i - 1)}
                disabled={i === 0}
                aria-label="เลื่อนไปทางซ้าย"
                className="flex size-7 items-center justify-center rounded-full bg-black/60 text-white disabled:opacity-30"
              >
                ◀
              </button>
              <button
                type="button"
                onClick={() => move(i, i + 1)}
                disabled={i === items.length - 1}
                aria-label="เลื่อนไปทางขวา"
                className="flex size-7 items-center justify-center rounded-full bg-black/60 text-white disabled:opacity-30"
              >
                ▶
              </button>
            </div>
          </div>
        ))}

        {items.length < maxImages && (
          <button
            type="button"
            disabled={disabled}
            onClick={() => inputRef.current?.click()}
            className="flex aspect-[4/3] flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary disabled:pointer-events-none disabled:opacity-50"
          >
            <span className="text-2xl leading-none">+</span>
            <span className="text-xs">เพิ่มรูป</span>
          </button>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        สูงสุด {maxImages} รูป — รูปแรกคือรูปปก ลากหรือใช้ปุ่มลูกศรเพื่อเรียงลำดับ
        (รูปถูกย่อขนาดอัตโนมัติ อัปจากมือถือได้เลย)
      </p>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}

/** PUT ด้วย XHR เพื่อให้ได้ upload progress (fetch ยังไม่รองรับ) */
function putWithProgress(
  url: string,
  blob: Blob,
  contentType: string,
  onProgress: (pct: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.setRequestHeader("Content-Type", contentType);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };
    xhr.onload = () =>
      xhr.status >= 200 && xhr.status < 300
        ? resolve()
        : reject(new Error(`อัปโหลดไม่สำเร็จ (${xhr.status})`));
    xhr.onerror = () => reject(new Error("อัปโหลดไม่สำเร็จ — เช็คอินเทอร์เน็ต"));
    xhr.send(blob);
  });
}
