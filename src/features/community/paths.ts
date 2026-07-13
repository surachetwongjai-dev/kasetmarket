// path ชุมชนพูดคุย (C1) — URL สาธารณะไทย /ชุมชน, route จริง /community (rewrite ใน next.config)

import { SITE_URL } from "@/config/site";

export const COMMUNITY_BASE = "/ชุมชน";

export function threadPath(slug: string): string {
  return `${COMMUNITY_BASE}/${slug}`;
}

export type CommunityBoardParams = {
  category?: string;
  page?: string;
};

/** URL hub พร้อม filter (แท็บหมวด/แบ่งหน้า) */
export function communityBoardPath(params: CommunityBoardParams): string {
  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) sp.set(key, value);
  }
  const qs = sp.toString();
  return qs ? `${COMMUNITY_BASE}?${qs}` : COMMUNITY_BASE;
}

export function communityAbsoluteUrl(path: string): string {
  return `${SITE_URL}${path.split("/").map(encodeURIComponent).join("/")}`;
}
