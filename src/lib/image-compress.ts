// บีบอัดรูปฝั่ง client ก่อนอัปโหลด (PLAN M4: max 1600px, quality ~0.8, แปลง webp)
// ใช้ใน browser เท่านั้น

const MAX_DIMENSION = 1600;
const QUALITY = 0.8;

export type CompressedImage = {
  blob: Blob;
  /** webp หรือ jpeg (fallback บน browser เก่าที่ encode webp ไม่ได้) */
  contentType: "image/webp" | "image/jpeg";
};

export async function compressImage(file: File): Promise<CompressedImage> {
  // imageOrientation: "from-image" — หมุนตาม EXIF ให้อัตโนมัติ (รูปจากกล้องมือถือ)
  const bitmap = await createImageBitmap(file, {
    imageOrientation: "from-image",
  });

  const scale = Math.min(
    1,
    MAX_DIMENSION / Math.max(bitmap.width, bitmap.height),
  );
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("ไม่สามารถประมวลผลรูปได้");
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  let blob = await toBlob(canvas, "image/webp");
  if (blob?.type === "image/webp") {
    return { blob, contentType: "image/webp" };
  }
  // browser ไม่รองรับ webp encode → ใช้ jpeg
  blob = await toBlob(canvas, "image/jpeg");
  if (!blob) throw new Error("ไม่สามารถบีบอัดรูปได้");
  return { blob, contentType: "image/jpeg" };
}

function toBlob(canvas: HTMLCanvasElement, type: string): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, QUALITY));
}
