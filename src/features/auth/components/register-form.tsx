"use client";

import { useActionState } from "react";
import { registerAction, type AuthFormState } from "../actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldError } from "./login-form";

const initialState: AuthFormState = {};

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(
    registerAction,
    initialState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">ชื่อที่ใช้แสดง</Label>
        <Input
          id="name"
          name="name"
          autoComplete="name"
          required
          placeholder="เช่น สมชาย ใจดี หรือ สวนลุงชัย"
          className="h-11"
        />
        <FieldError messages={state.fieldErrors?.name} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">อีเมล</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@example.com"
          className="h-11"
        />
        <FieldError messages={state.fieldErrors?.email} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">รหัสผ่าน (อย่างน้อย 8 ตัวอักษร)</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          className="h-11"
        />
        <FieldError messages={state.fieldErrors?.password} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="confirmPassword">ยืนยันรหัสผ่าน</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          className="h-11"
        />
        <FieldError messages={state.fieldErrors?.confirmPassword} />
      </div>

      {state.error && (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="h-12 w-full rounded-lg bg-primary text-base font-semibold text-primary-foreground transition-colors hover:bg-primary/90 active:translate-y-px disabled:pointer-events-none disabled:opacity-60"
      >
        {pending ? "กำลังสมัครสมาชิก..." : "สมัครสมาชิก"}
      </button>
    </form>
  );
}
