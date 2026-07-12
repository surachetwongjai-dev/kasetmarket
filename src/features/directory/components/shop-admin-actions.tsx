"use client";

// ปุ่มจัดการร้านฝั่งแอดมิน (D5) — approve/reject ในคิว + toggle featured ในรายการร้าน

import {
  approveShopAction,
  rejectShopAction,
  toggleShopFeaturedAction,
} from "../actions";

export function ShopModerationActions({ shopId }: { shopId: string }) {
  return (
    <div className="flex gap-2">
      <form action={approveShopAction} className="flex-1">
        <input type="hidden" name="id" value={shopId} />
        <button
          type="submit"
          className="h-12 w-full rounded-lg bg-primary text-base font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          ✓ อนุมัติ — ขึ้นหน้า directory
        </button>
      </form>
      <form
        action={rejectShopAction}
        className="flex-1"
        onSubmit={(e) => {
          if (!confirm("ปฏิเสธร้านนี้? (ข้อมูลไม่จริง/ซ้ำ/สแปม)")) e.preventDefault();
        }}
      >
        <input type="hidden" name="id" value={shopId} />
        <button
          type="submit"
          className="h-12 w-full rounded-lg border border-destructive/40 text-base font-semibold text-destructive transition-colors hover:bg-destructive/10"
        >
          ✕ ปฏิเสธ
        </button>
      </form>
    </div>
  );
}

export function ShopFeaturedToggle({
  shopId,
  featured,
}: {
  shopId: string;
  featured: boolean;
}) {
  return (
    <form action={toggleShopFeaturedAction}>
      <input type="hidden" name="id" value={shopId} />
      <button
        type="submit"
        className={`h-9 rounded-lg px-3 text-sm font-medium transition-colors ${
          featured
            ? "bg-accent text-white hover:bg-accent/90"
            : "border border-border hover:bg-muted"
        }`}
      >
        {featured ? "★ ร้านแนะนำ" : "☆ ตั้งเป็นร้านแนะนำ"}
      </button>
    </form>
  );
}
