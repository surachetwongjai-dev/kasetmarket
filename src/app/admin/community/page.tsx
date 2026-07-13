// แอดมิน — คิวรายงานชุมชน (C2) · ซ่อน/เลิกซ่อน + ปิดงาน · หลัง FLAGS.COMMUNITY

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FLAGS } from "@/config/flags";
import { getForumReportsForAdmin } from "@/features/community";
import { threadPath } from "@/features/community";
import {
  toggleHideThreadAction,
  toggleHideReplyAction,
  resolveForumReportAction,
} from "@/features/community/actions";
import { formatThaiDateTime } from "@/lib/format";

export const metadata: Metadata = { title: "รายงานชุมชน" };

export default async function AdminCommunityPage() {
  if (!FLAGS.COMMUNITY) notFound();
  const reports = await getForumReportsForAdmin();

  if (reports.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center text-muted-foreground">
        🎉 ไม่มีรายงานชุมชน
      </div>
    );
  }

  const btn =
    "h-10 rounded-lg border border-border bg-background px-3 text-sm font-medium transition-colors hover:bg-muted";

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-muted-foreground">
        รายงานชุมชน (ค้างก่อน) — ซ่อนเนื้อหาที่ผิดกติกา แล้วกด &quot;ตรวจแล้ว&quot;
      </p>
      {reports.map((report) => {
        const isThread = Boolean(report.thread);
        const slug = report.thread?.slug ?? report.reply?.thread.slug;
        const title = report.thread?.title ?? report.reply?.thread.title;
        const hidden = report.thread?.hidden ?? report.reply?.hidden ?? false;
        return (
          <article
            key={report.id}
            className={`flex flex-col gap-2 rounded-xl border p-4 ${
              report.resolved ? "border-border bg-muted/30" : "border-accent/40 bg-accent/5"
            }`}
          >
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span className="rounded-full bg-muted px-2 py-0.5 font-medium">
                {isThread ? "กระทู้" : "คำตอบ"}
              </span>
              <span className="font-medium text-destructive">{report.reason}</span>
              <span>· {formatThaiDateTime(report.createdAt)}</span>
              {report.resolved && <span>· ✓ ตรวจแล้ว</span>}
              {hidden && <span>· 🙈 ซ่อนอยู่</span>}
            </div>

            {slug && (
              <Link
                href={threadPath(slug)}
                className="text-sm font-medium text-primary hover:underline"
              >
                {title}
              </Link>
            )}
            {report.reply && (
              <p className="line-clamp-3 whitespace-pre-wrap rounded-lg bg-muted/50 p-2 text-sm">
                {report.reply.body}
              </p>
            )}

            <div className="flex flex-wrap gap-2">
              {isThread && report.thread && (
                <form action={toggleHideThreadAction}>
                  <input type="hidden" name="id" value={report.thread.id} />
                  <button className={btn}>{hidden ? "เลิกซ่อนกระทู้" : "ซ่อนกระทู้"}</button>
                </form>
              )}
              {!isThread && report.reply && (
                <form action={toggleHideReplyAction}>
                  <input type="hidden" name="id" value={report.reply.id} />
                  <button className={btn}>{hidden ? "เลิกซ่อนคำตอบ" : "ซ่อนคำตอบ"}</button>
                </form>
              )}
              {!report.resolved && (
                <form action={resolveForumReportAction}>
                  <input type="hidden" name="id" value={report.id} />
                  <button className={`${btn} bg-primary text-primary-foreground`}>
                    ✓ ตรวจแล้ว
                  </button>
                </form>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}
