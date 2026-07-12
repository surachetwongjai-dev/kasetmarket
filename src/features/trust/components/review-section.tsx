// ส่วนรีวิวบนหน้าโปรไฟล์ผู้ขาย (server) — สรุปดาว + ฟอร์ม/ข้อความเงื่อนไข + รายการรีวิว

import Link from "next/link";
import type { ReviewEligibility, SellerReviewView } from "../queries";
import { REVIEW_ELIGIBLE_HOURS } from "../schemas";
import { RatingStars } from "./rating-stars";
import { ReviewForm } from "./review-form";
import { ReviewList } from "./review-list";

function Composer({
  sellerId,
  eligibility,
}: {
  sellerId: string;
  eligibility: ReviewEligibility;
}) {
  if (eligibility.canReview) {
    return (
      <ReviewForm
        sellerId={sellerId}
        suggestedListingId={
          eligibility.existingReview ? null : eligibility.suggestedListingId
        }
        existing={eligibility.existingReview}
      />
    );
  }

  // ผู้ชม = เจ้าของโปรไฟล์ → ไม่ต้องชวนรีวิวตัวเอง
  if (eligibility.reason === "self") return null;

  const box = "rounded-xl border border-border bg-muted/30 p-4 text-sm leading-relaxed text-muted-foreground";

  if (eligibility.reason === "not-logged-in") {
    return (
      <div className={box}>
        <Link href="/login" className="font-medium text-primary hover:underline">
          เข้าสู่ระบบ
        </Link>{" "}
        เพื่อรีวิวผู้ขาย — รีวิวได้เฉพาะผู้ที่เคยกดดูช่องทางติดต่อของผู้ขายรายนี้ผ่านแพลตฟอร์ม
      </div>
    );
  }

  if (eligibility.reason === "reveal-too-recent") {
    return (
      <div className={box}>
        คุณกดดูช่องทางติดต่อของผู้ขายรายนี้แล้ว — จะรีวิวได้เมื่อครบ{" "}
        {REVIEW_ELIGIBLE_HOURS} ชั่วโมง (เผื่อเวลาซื้อขายจริง)
      </div>
    );
  }

  // need-reveal
  return (
    <div className={box}>
      รีวิวได้เฉพาะผู้ที่เคย<strong className="text-foreground">กดดูช่องทางติดต่อ</strong>
      (เบอร์โทร/LINE) ของผู้ขายรายนี้ผ่านแพลตฟอร์มมาแล้วอย่างน้อย{" "}
      {REVIEW_ELIGIBLE_HOURS} ชั่วโมง เพื่อยืนยันว่าเคยติดต่อซื้อขายกันจริง
    </div>
  );
}

export function ReviewSection({
  sellerId,
  isSeller,
  summary,
  reviews,
  eligibility,
}: {
  sellerId: string;
  isSeller: boolean;
  summary: { avg: number; count: number };
  reviews: SellerReviewView[];
  eligibility: ReviewEligibility;
}) {
  return (
    <section className="mt-10">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <h2 className="font-heading text-lg font-semibold text-primary-dk">
          รีวิวผู้ขาย
        </h2>
        <RatingStars rating={summary.avg} count={summary.count} size="lg" />
      </div>

      <div className="mt-4">
        <Composer sellerId={sellerId} eligibility={eligibility} />
      </div>

      <div className="mt-4">
        <ReviewList reviews={reviews} isSeller={isSeller} />
      </div>
    </section>
  );
}
