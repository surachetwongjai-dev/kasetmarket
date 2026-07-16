// Default OG image (1200×630) — ใช้เป็นรูปแชร์ของทุกหน้าที่ไม่ตั้ง og:image เอง
// (หน้าประกาศ/บทความตั้ง images เองใน generateMetadata → ทับรูปนี้)
import { ImageResponse } from "next/og";

export const alt = "TaladKaset — ตลาดกลางซื้อขายสินค้าเกษตร ลงประกาศฟรี";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// โหลด IBM Plex Sans Thai (700) จาก Google Fonts เพื่อให้ตัวไทยเรนเดอร์ได้
// (ImageResponse ใช้ฟอนต์ default ที่ไม่มี glyph ไทย → ถ้าไม่โหลดจะเป็นกล่อง)
async function loadThaiFont(): Promise<ArrayBuffer | null> {
  try {
    const css = await fetch(
      "https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Thai:wght@700",
      { headers: { "User-Agent": "Mozilla/5.0" } },
    ).then((r) => r.text());
    const url = css.match(/url\((https:\/\/[^)]+\.(?:woff2|ttf|otf))\)/)?.[1];
    if (!url) return null;
    return await fetch(url).then((r) => r.arrayBuffer());
  } catch {
    return null;
  }
}

export default async function OpengraphImage() {
  const font = await loadThaiFont();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #1E7A46 0%, #14522F 100%)",
          fontFamily: font ? "Plex Thai" : "sans-serif",
          color: "#FFFFFF",
        }}
      >
        {/* wordmark (Latin — เรนเดอร์ได้เสมอ) */}
        <div style={{ display: "flex", fontSize: 104, fontWeight: 700, letterSpacing: -2 }}>
          <span>Talad</span>
          <span style={{ color: "#E8A317" }}>Kaset</span>
        </div>

        {/* tagline ไทย — แสดงเฉพาะเมื่อโหลดฟอนต์สำเร็จ (กันกล่อง) */}
        {font && (
          <div
            style={{
              marginTop: 24,
              fontSize: 42,
              color: "#F7F8F4",
              display: "flex",
            }}
          >
            ตลาดกลางซื้อขายสินค้าเกษตร · ลงประกาศฟรี
          </div>
        )}

        {/* แถบทองข้าวเปลือก (signature) */}
        <div
          style={{
            marginTop: 40,
            width: 220,
            height: 8,
            borderRadius: 4,
            background: "#E8A317",
          }}
        />
      </div>
    ),
    {
      ...size,
      fonts: font
        ? [{ name: "Plex Thai", data: font, weight: 700 as const, style: "normal" as const }]
        : undefined,
    },
  );
}
