import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/features/auth";
import { OAuthButtons } from "@/features/auth/components/oauth-buttons";
import { LoginForm } from "@/features/auth/components/login-form";
import { FLAGS } from "@/config/flags";

export const metadata: Metadata = {
  title: "เข้าสู่ระบบ — KasetMarket",
};

// ข้อความ error จาก Auth.js (ส่งกลับมาทาง ?error=)
const ERROR_MESSAGES: Record<string, string> = {
  OAuthAccountNotLinked:
    "อีเมลนี้เคยสมัครด้วยช่องทางอื่นแล้ว กรุณาเข้าสู่ระบบด้วยช่องทางเดิม",
  AccessDenied: "การเข้าสู่ระบบถูกปฏิเสธ กรุณาลองใหม่อีกครั้ง",
  Configuration: "ระบบล็อกอินยังตั้งค่าไม่สมบูรณ์ กรุณาติดต่อผู้ดูแล",
  Default: "เข้าสู่ระบบไม่สำเร็จ กรุณาลองใหม่อีกครั้ง",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await auth();
  if (session) redirect("/dashboard");

  const { error } = await searchParams;
  const errorMessage = error
    ? (ERROR_MESSAGES[error] ?? ERROR_MESSAGES.Default)
    : null;

  return (
    <main className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 py-10">
      <div className="text-center">
        <h1 className="font-heading text-2xl font-bold text-primary-dk">
          เข้าสู่ระบบ
        </h1>
        <p className="mt-1 text-muted-foreground">
          ลงประกาศขายสินค้าเกษตรของคุณฟรี
        </p>
      </div>

      {errorMessage && (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {errorMessage}
        </p>
      )}

      <OAuthButtons />

      {/* โครง phone OTP — เปิดใช้ Phase 2 (FLAGS.PHONE_OTP, CLAUDE.md §2) */}
      {FLAGS.PHONE_OTP && (
        <p className="text-center text-sm text-muted-foreground">
          เข้าสู่ระบบด้วยเบอร์โทร (เร็วๆ นี้)
        </p>
      )}

      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-border" />
        <span className="text-sm text-muted-foreground">
          หรือใช้อีเมล
        </span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <LoginForm />

      <p className="text-center text-sm text-muted-foreground">
        ยังไม่มีบัญชี?{" "}
        <Link
          href="/register"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          สมัครสมาชิกด้วยอีเมล
        </Link>
      </p>
    </main>
  );
}
