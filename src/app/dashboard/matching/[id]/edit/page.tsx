// แก้ไขโพสกระดานจับคู่ (B1) — เจ้าของเท่านั้น · หลัง FLAGS.MATCHING

import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/features/auth";
import { FLAGS } from "@/config/flags";
import {
  MatchPostForm,
  updateMatchPostAction,
  getMyMatchPostForEdit,
  MatchPostStatusBadge,
} from "@/features/matching";
import type { MatchTypeValue } from "@/config/matchTypes";

export const metadata: Metadata = {
  title: "แก้ไขโพสจับคู่ซื้อขาย",
};

export default async function EditMatchPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!FLAGS.MATCHING) notFound();

  const session = await auth();
  if (!session) redirect("/login");

  const { id } = await params;
  const post = await getMyMatchPostForEdit(id, session.user.id);
  if (!post) notFound();

  const action = updateMatchPostAction.bind(null, post.id);

  return (
    <main className="mx-auto w-full max-w-xl px-4 py-8">
      <div className="flex items-center gap-3">
        <h1 className="font-heading text-2xl font-bold text-primary-dk">
          แก้ไขโพสจับคู่ซื้อขาย
        </h1>
        <MatchPostStatusBadge status={post.status} />
      </div>
      <div className="mt-6">
        <MatchPostForm
          action={action}
          submitLabel="บันทึกการแก้ไข"
          defaults={{
            type: post.type as MatchTypeValue,
            title: post.title,
            detail: post.detail,
            category: post.category,
            province: post.province,
            district: post.district ?? "",
            quantity: post.quantity,
            targetDate: post.targetDate
              ? post.targetDate.toISOString().slice(0, 10)
              : "",
            priceNote: post.priceNote ?? "",
            contactPhone: post.contactPhone ?? "",
            contactLine: post.contactLine ?? "",
          }}
        />
      </div>
    </main>
  );
}
