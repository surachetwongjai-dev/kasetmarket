// helper สำหรับ YouTube — ใช้ทั้งฝั่ง server (JSON-LD) และ client (embed)

/** ดึง video id (11 ตัว) จาก URL รูปแบบ watch?v= / youtu.be/ / embed/ */
export function getYouTubeId(url: string | null | undefined): string | null {
  if (!url) return null;
  const m = url.match(/(?:v=|youtu\.be\/|embed\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}

/** ภาพปกวิดีโอ (มีทุกคลิป) */
export function youtubeThumb(id: string): string {
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}

/** URL ฝัง (nocookie — เป็นมิตร PDPA, ไม่ตั้ง cookie จนกว่าจะเล่น) */
export function youtubeEmbedUrl(id: string): string {
  return `https://www.youtube-nocookie.com/embed/${id}`;
}
