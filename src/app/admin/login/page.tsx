import type { Metadata } from "next";
import { LoginForm } from "@/components/admin/LoginForm";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-ink px-4 py-12 grain">
      <div className="relative w-full max-w-md border border-line bg-ink-2 p-8 clip-card sm:p-10">
        <p className="font-condensed text-xs font-bold uppercase tracking-[0.3em] text-brand">Admin Portal</p>
        <h1 className="mt-2 font-display text-5xl text-white">
          STEEL BOYZ <span className="text-brand">7-7</span>
        </h1>
        <p className="mt-2 text-sm text-muted">Sign in to manage website content and inquiries.</p>
        <LoginForm />
      </div>
    </main>
  );
}
