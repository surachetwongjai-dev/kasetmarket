import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/features/auth";
import { RegisterForm } from "@/features/auth/components/register-form";

export const metadata: Metadata = {
  title: "สมัครสมาชิก — KasetMarket",
};

export default async function RegisterPage() {
  const session = await auth();
  if (session) redirect("/dashboard");

  return (
    <main className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 py-10">
      <div className="text-center">
        <h1 className="font-heading text-2xl font-bold text-primary-dk">
          สมัครสมาชิกด้วยอีเมล
        </h1>
        <p className="mt-1 text-muted-foreground">
          สำหรับคนที่ไม่สะดวกใช้ LINE หรือ Google
        </p>
      </div>

      <RegisterForm />

      <p className="text-center text-sm text-muted-foreground">
        มีบัญชีอยู่แล้ว?{" "}
        <Link
          href="/login"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          เข้าสู่ระบบ
        </Link>
      </p>
    </main>
  );
}
