"use server";

import { AuthError } from "next-auth";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signIn, signOut } from "./auth";
import { loginSchema, registerSchema } from "./schemas";

export type AuthFormState = {
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

/** สมัครสมาชิกด้วย email/รหัสผ่าน แล้วล็อกอินให้ทันที */
export async function registerAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return {
      error:
        "อีเมลนี้ถูกใช้งานแล้ว — ถ้าเคยสมัครด้วย LINE หรือ Google ให้เข้าสู่ระบบด้วยช่องทางเดิม",
    };
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.create({
    data: { name, email, passwordHash },
  });

  // signIn สำเร็จจะ throw redirect ออกไป /dashboard เอง
  await signIn("credentials", { email, password, redirectTo: "/dashboard" });
  return {};
}

/** ล็อกอินด้วย email/รหัสผ่าน */
export async function loginAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  try {
    await signIn("credentials", {
      ...parsed.data,
      redirectTo: "/dashboard",
    });
    return {};
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" };
    }
    throw error; // NEXT_REDIRECT (ล็อกอินสำเร็จ) ต้องปล่อยผ่าน
  }
}

/** ล็อกอินด้วย OAuth (line | google) — ใช้เป็น form action ของปุ่ม */
export async function oauthSignInAction(formData: FormData) {
  const provider = formData.get("provider");
  if (provider !== "line" && provider !== "google") return;
  await signIn(provider, { redirectTo: "/dashboard" });
}

/** ออกจากระบบ */
export async function logoutAction() {
  await signOut({ redirectTo: "/" });
}
