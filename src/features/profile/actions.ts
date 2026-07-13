"use server";

// Server Action โปรไฟล์เกษตรกร (U1) — validate ฝั่ง server เสมอ
// บันทึกทีเดียว: User.name/province + FarmProfile ทุก field + รูป ≤4
// province เขียนลงทั้ง User.province (ใช้ทั้งเว็บ เช่น prefill ประกาศ) และ FarmProfile.province (ที่ตั้งฟาร์ม)

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/features/auth";
import {
  profileSchema,
  profileFormDataToObject,
  PROFILE_DAILY_LIMIT,
} from "./schemas";

export type ProfileFormState = {
  success?: boolean;
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

// rate limit แก้โปรไฟล์: in-memory 10 ครั้ง/วัน/user (พอสำหรับ MVP — รีเซ็ตเมื่อ redeploy)
const editWindow = new Map<string, { count: number; resetAt: number }>();
const DAY_MS = 24 * 60 * 60 * 1000;

function hitRateLimit(userId: string): boolean {
  const now = Date.now();
  const rec = editWindow.get(userId);
  if (!rec || now > rec.resetAt) {
    editWindow.set(userId, { count: 1, resetAt: now + DAY_MS });
    return false;
  }
  if (rec.count >= PROFILE_DAILY_LIMIT) return true;
  rec.count += 1;
  return false;
}

export async function saveFarmProfileAction(
  _prev: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const session = await auth();
  if (!session) return { error: "ต้องเข้าสู่ระบบก่อน" };
  const userId = session.user.id;

  const parsed = profileSchema.safeParse(profileFormDataToObject(formData));
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  if (hitRateLimit(userId)) {
    return {
      error: `แก้ไขโปรไฟล์ได้สูงสุด ${PROFILE_DAILY_LIMIT} ครั้ง/วัน — พรุ่งนี้แก้ต่อได้`,
    };
  }

  const { name, province, district, bio, farmTypes, products, sizeRai, images } =
    parsed.data;
  const prov = province || null;
  const dist = district || null;

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { name, province: prov },
    }),
    prisma.farmProfile.upsert({
      where: { userId },
      create: {
        userId,
        bio: bio || null,
        farmTypes,
        products: products || null,
        sizeRai: sizeRai ?? null,
        province: prov,
        district: dist,
        images: { create: images.map((img, i) => ({ url: img.url, order: i })) },
      },
      update: {
        bio: bio || null,
        farmTypes,
        products: products || null,
        sizeRai: sizeRai ?? null,
        province: prov,
        district: dist,
        images: {
          deleteMany: {}, // แทนที่รูปทั้งชุดตามลำดับใหม่จากฟอร์ม
          create: images.map((img, i) => ({ url: img.url, order: i })),
        },
      },
    }),
  ]);

  // โชว์หน้า public ทันที (U1 เกณฑ์): โปรไฟล์ผู้ขาย + ฟอร์มเอง
  revalidatePath(`/sellers/${userId}`);
  revalidatePath("/dashboard/profile");
  return { success: true };
}
