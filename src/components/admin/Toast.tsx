"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { AlertCircle, CheckCircle2, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Toast = { id: number; kind: "success" | "error"; text: string };
const Ctx = createContext<(kind: Toast["kind"], text: string) => void>(() => {});

export function useToast() {
  return useContext(Ctx);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const push = useCallback((kind: Toast["kind"], text: string) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t.slice(-3), { id, kind, text }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), kind === "error" ? 8000 : 4000);
  }, []);

  return (
    <Ctx.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-2">
        <div aria-live="polite" className="contents">
          {toasts
            .filter((t) => t.kind === "success")
            .map((t) => (
              <ToastItem key={t.id} t={t} onClose={() => setToasts((x) => x.filter((y) => y.id !== t.id))} />
            ))}
        </div>
        <div aria-live="assertive" className="contents">
          {toasts
            .filter((t) => t.kind === "error")
            .map((t) => (
              <ToastItem key={t.id} t={t} onClose={() => setToasts((x) => x.filter((y) => y.id !== t.id))} />
            ))}
        </div>
      </div>
    </Ctx.Provider>
  );
}

function ToastItem({ t, onClose }: { t: Toast; onClose: () => void }) {
  return (
    <div
      role={t.kind === "error" ? "alert" : "status"}
      className={cn(
        "pointer-events-auto flex items-start gap-3 border-l-4 bg-charcoal p-4 text-sm text-white shadow-2xl animate-rise",
        t.kind === "error" ? "border-red-400" : "border-brand",
      )}
    >
      {t.kind === "error" ? <AlertCircle className="size-5 shrink-0 text-red-400" aria-hidden="true" /> : <CheckCircle2 className="size-5 shrink-0 text-brand" aria-hidden="true" />}
      <p className="flex-1">
        <span className="sr-only">{t.kind === "error" ? "Error: " : "Success: "}</span>
        {t.text}
      </p>
      <button type="button" onClick={onClose} aria-label="Dismiss notification" className="text-white/60 hover:text-white">
        <X className="size-4" aria-hidden="true" />
      </button>
    </div>
  );
}
