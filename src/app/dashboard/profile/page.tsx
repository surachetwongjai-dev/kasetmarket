// แก้โปรไฟล์เกษตรกร (U1) — dynamic, no cache · หลัง FLAGS.FARM_PROFILE

import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/features/auth";
import { prisma } from "@/lib/prisma";
import { FLAGS } from "@/config/flags";
import {
  ProfileForm,
  getFarmProfile,
  saveFarmProfileAction,
} from "@/features/profile";

export const metadata: Metadata = {
  title: "โปรไฟล์เกษตรกร",
};

export default async function ProfilePage() {
  if (!FLAGS.FARM_PROFILE) notFound();

  const session = await auth();
  if (!session) redirect("/login");

  const [user, profile] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, province: true },
    }),
    getFarmProfile(session.user.id),
  ]);
  if (!user) redirect("/login");

  return (
    <main className="mx-auto w-full max-w-xl px-4 py-8">
      <h1 className="font-heading text-2xl font-bold text-primary-dk">
        โปรไฟล์เกษตรกร
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        ข้อมูลนี้จะแสดงในหน้าโปรไฟล์สาธารณะของคุณ ช่วยให้ผู้ซื้อเชื่อใจและติดต่อง่ายขึ้น
      </p>

      <div className="mt-6">
        <ProfileForm
          action={saveFarmProfileAction}
          defaults={{
            name: user.name,
            province: profile?.province ?? user.province ?? "",
            district: profile?.district ?? "",
            bio: profile?.bio ?? "",
            farmTypes: profile?.farmTypes ?? [],
            products: profile?.products ?? "",
            sizeRai: profile?.sizeRai != null ? String(profile.sizeRai) : "",
            images: (profile?.images ?? []).map((img) => ({
              key: img.url,
              url: img.url,
            })),
          }}
        />
      </div>

      <div className="mt-6">
        <Link
          href={`/sellers/${session.user.id}`}
          className="text-sm font-medium text-primary hover:underline"
        >
          ดูหน้าโปรไฟล์สาธารณะของฉัน →
        </Link>
      </div>
    </main>
  );
}
