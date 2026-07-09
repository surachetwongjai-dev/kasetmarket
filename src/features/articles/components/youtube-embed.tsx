"use client";

// Lite YouTube embed — โชว์ภาพปกก่อน กดแล้วค่อยโหลด iframe
// (เว็บไม่อืด/ประหยัดเน็ต ตามหลัก CLAUDE.md §3 + ใช้ nocookie เป็นมิตร PDPA)
import { useState } from "react";
import { getYouTubeId, youtubeThumb, youtubeEmbedUrl } from "@/lib/youtube";

export function YoutubeEmbed({ url, title }: { url: string; title: string }) {
  const [playing, setPlaying] = useState(false);
  const id = getYouTubeId(url);
  if (!id) return null;

  return (
    <figure className="my-6">
      <div className="relative aspect-video overflow-hidden rounded-xl bg-black">
        {playing ? (
          <iframe
            className="absolute inset-0 h-full w-full"
            src={`${youtubeEmbedUrl(id)}?autoplay=1&rel=0`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            aria-label={`เล่นวิดีโอ: ${title}`}
            className="group absolute inset-0 h-full w-full cursor-pointer"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={youtubeThumb(id)}
              alt={`ภาพปกวิดีโอ: ${title}`}
              loading="lazy"
              className="h-full w-full object-cover"
            />
            <span className="absolute inset-0 bg-black/15 transition-colors group-hover:bg-black/25" />
            <span className="absolute left-1/2 top-1/2 flex h-14 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-2xl bg-[#FF0000] shadow-lg transition-transform group-hover:scale-105">
              <svg viewBox="0 0 24 24" className="h-7 w-7 fill-white" aria-hidden="true">
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
          </button>
        )}
      </div>
      <figcaption className="mt-2 text-center text-xs text-muted-foreground">
        ▶ ดูคลิปเต็มจากช่อง YouTube เรื่องเกษตร
      </figcaption>
    </figure>
  );
}
