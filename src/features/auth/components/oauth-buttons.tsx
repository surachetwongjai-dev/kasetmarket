// ปุ่มล็อกอิน LINE + Google — server component ได้ (ใช้ form action)
// Touch target ≥ 44px ตาม UI rules (CLAUDE.md §3)

import { oauthSignInAction } from "../actions";

export function OAuthButtons() {
  return (
    <div className="flex flex-col gap-3">
      <form action={oauthSignInAction}>
        <input type="hidden" name="provider" value="line" />
        <button
          type="submit"
          className="flex h-12 w-full items-center justify-center gap-2.5 rounded-lg bg-[#06C755] text-base font-semibold text-white transition-colors hover:bg-[#05b34c] active:translate-y-px"
        >
          <LineIcon className="size-6" />
          เข้าสู่ระบบด้วย LINE
        </button>
      </form>
      <form action={oauthSignInAction}>
        <input type="hidden" name="provider" value="google" />
        <button
          type="submit"
          className="flex h-12 w-full items-center justify-center gap-2.5 rounded-lg border border-border bg-white text-base font-medium text-foreground transition-colors hover:bg-muted active:translate-y-px"
        >
          <GoogleIcon className="size-5" />
          เข้าสู่ระบบด้วย Google
        </button>
      </form>
    </div>
  );
}

function LineIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 2.5c-5.52 0-10 3.63-10 8.1 0 4 3.56 7.35 8.36 7.99.33.07.77.21.89.49.1.25.07.64.03.9l-.14.86c-.04.25-.2 1 .87.54 1.08-.45 5.8-3.42 7.92-5.85C21.4 13.9 22 12.33 22 10.6c0-4.47-4.48-8.1-10-8.1zM7.61 13.28H5.62a.53.53 0 0 1-.53-.53V8.79a.53.53 0 0 1 1.06 0v3.43h1.46a.53.53 0 0 1 0 1.06zm1.98-.53a.53.53 0 0 1-1.06 0V8.79a.53.53 0 0 1 1.06 0v3.96zm4.77 0c0 .23-.15.43-.36.5a.55.55 0 0 1-.6-.19l-2.03-2.77v2.46a.53.53 0 0 1-1.06 0V8.79c0-.23.14-.43.36-.5.21-.08.45 0 .59.18l2.04 2.78V8.79a.53.53 0 0 1 1.06 0v3.96zm3.2-2.51a.53.53 0 0 1 0 1.06h-1.46v.92h1.46a.53.53 0 0 1 0 1.06h-1.99a.53.53 0 0 1-.53-.53V8.79c0-.29.24-.53.53-.53h1.99a.53.53 0 0 1 0 1.06h-1.46v.92h1.46z" />
    </svg>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        fill="#4285F4"
        d="M23.52 12.27c0-.85-.08-1.66-.22-2.45H12v4.64h6.46a5.52 5.52 0 0 1-2.4 3.62v3h3.88c2.26-2.09 3.58-5.17 3.58-8.81z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.94-2.91l-3.88-3.01c-1.07.72-2.45 1.15-4.06 1.15-3.13 0-5.78-2.11-6.72-4.95H1.27v3.11A11.99 11.99 0 0 0 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.28a7.21 7.21 0 0 1 0-4.56V6.61H1.27a11.99 11.99 0 0 0 0 10.78l4.01-3.11z"
      />
      <path
        fill="#EA4335"
        d="M12 4.77c1.76 0 3.35.61 4.6 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0A11.99 11.99 0 0 0 1.27 6.61l4.01 3.11C6.22 6.88 8.87 4.77 12 4.77z"
      />
    </svg>
  );
}
