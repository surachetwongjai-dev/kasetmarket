// Admin ภาพรวม — ตัวเลขวันนี้ + ทางลัด (M7)

import type { Metadata } from "next";
import Link from "next/link";
import { getAdminStats } from "@/features/moderation/queries";
import { FLAGS } from "@/config/flags";
import {
  getOpenReviewReportCount,
  getOpenVerificationCount,
} from "@/features/trust";

export const metadata: Metadata = {
  title: "ผู้ดูแลระบบ",
};

export default async function AdminPage() {
  const [stats, openVerifications, openReviewReports] = await Promise.all([
    getAdminStats(),
    getOpenVerificationCount(),
    FLAGS.REVIEWS ? getOpenReviewReportCount() : Promise.resolve(0),
  ]);

  const cards = [
    {
      label: "ประกาศรออนุมัติ",
      value: stats.pendingListings,
      href: "/admin/moderation",
      urgent: stats.pendingListings > 0,
    },
    {
      label: "คำขอยืนยันตัวตน",
      value: openVerifications,
      href: "/admin/verifications",
      urgent: openVerifications > 0,
    },
    {
      label: "รายงานค้างตรวจ",
      value: stats.openReports,
      href: "/admin/reports",
      urgent: stats.openReports > 0,
    },
    ...(FLAGS.REVIEWS
      ? [
          {
            label: "รายงานรีวิวค้าง",
            value: openReviewReports,
            href: "/admin/reviews",
            urgent: openReviewReports > 0,
          },
        ]
      : []),
    {
      label: "ประกาศใหม่วันนี้",
      value: stats.listingsToday,
      href: "/admin/listings",
    },
    {
      label: "สมาชิกใหม่วันนี้",
      value: stats.usersToday,
      href: "/admin/users",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {cards.map((card) => (
        <Link
          key={card.label}
          href={card.href}
          className={`flex flex-col rounded-xl border p-4 transition-colors hover:bg-muted ${
            card.urgent
              ? "border-accent/50 bg-accent/5"
              : "border-border bg-card"
          }`}
        >
          <span className="font-num text-3xl font-bold">
            {card.value.toLocaleString("th-TH")}
          </span>
          <span className="mt-1 text-sm text-muted-foreground">
            {card.label}
          </span>
        </Link>
      ))}
    </div>
  );
}
