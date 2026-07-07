"use client";

import { useState } from "react";
import {
  ImageUploader,
  type UploadedImage,
} from "@/features/listings/components/image-uploader";

export function UploadDemo() {
  const [images, setImages] = useState<UploadedImage[]>([]);

  return (
    <div className="flex flex-col gap-4">
      <ImageUploader onChange={setImages} />
      <div data-testid="result" className="rounded-lg bg-muted p-3 text-xs">
        <p className="font-medium">อัปเสร็จแล้ว {images.length} รูป:</p>
        <ol className="mt-1 list-inside list-decimal break-all">
          {images.map((img) => (
            <li key={img.key}>{img.url}</li>
          ))}
        </ol>
      </div>
    </div>
  );
}
