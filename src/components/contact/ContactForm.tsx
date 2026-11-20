"use client";

import { useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AlertCircle, CheckCircle2, Loader2, Send } from "lucide-react";
import { INTEREST_OPTIONS } from "@/lib/constants";
import { contactSchema } from "@/lib/validation/contact";
import { cn } from "@/lib/utils";

type Errors = Partial<Record<string, string>>;

function FieldError({ name, errors }: { name: string; errors: Errors }) {
  return errors[name] ? (
    <p id={`cf-${name}-error`} className="mt-1.5 flex items-center gap-1.5 text-sm text-red-300">
      <AlertCircle className="size-4 shrink-0" aria-hidden="true" /> {errors[name]}
    </p>
  ) : null;
}

function FieldLabel({ htmlFor, children, optional }: { htmlFor: string; children: React.ReactNode; optional?: boolean }) {
  return (
    <label htmlFor={htmlFor} className="font-condensed text-sm font-bold uppercase tracking-wide text-white">
      {children}{" "}
      {optional ? <span className="font-normal normal-case text-muted">(optional)</span> : <span className="text-brand" aria-hidden="true">*</span>}
    </label>
  );
}

function newKey() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

const inputCls =
  "mt-2 block w-full border border-white/15 bg-ink px-4 py-3 text-base text-white placeholder:text-white/35 transition-colors focus:border-brand focus:outline-none focus-visible:outline-2 aria-[invalid=true]:border-red-400";

export function ContactForm({
  products,
  consentText,
  privacyNotice,
  successMessage,
}: {
  products: { slug: string; name: string }[];
  consentText: string;
  privacyNotice: string;
  successMessage: string;
}) {
  const params = useSearchParams();
  const initialInterest = useMemo(() => {
    const v = params.get("interest");
    return INTEREST_OPTIONS.some((o) => o.value === v) ? (v as string) : "";
  }, [params]);
  const initialProduct = useMemo(() => {
    const v = params.get("product");
    return products.find((p) => p.slug === v)?.name ?? "";
  }, [params, products]);

  const [interest, setInterest] = useState(initialInterest);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [startedAt] = useState(() => Date.now());
  const keyRef = useRef<string>("");
  const formRef = useRef<HTMLFormElement>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "submitting") return; // guard against double clicks
    const fd = new FormData(e.currentTarget);
    keyRef.current ||= newKey(); // same key on retry => server de-duplicates
    const payload = {
      guardianName: String(fd.get("guardianName") ?? ""),
      athleteName: String(fd.get("athleteName") ?? ""),
      athleteAge: String(fd.get("athleteAge") ?? ""),
      email: String(fd.get("email") ?? ""),
      phone: String(fd.get("phone") ?? ""),
      interest: String(fd.get("interest") ?? ""),
      product: String(fd.get("product") ?? ""),
      message: String(fd.get("message") ?? ""),
      consent: fd.get("consent") === "on",
      website: String(fd.get("website") ?? ""),
      submissionKey: keyRef.current,
      startedAt,
    };

    const parsed = contactSchema.safeParse(payload);
    if (!parsed.success) {
      const next: Errors = {};
      for (const issue of parsed.error.issues) {
        const k = String(issue.path[0]);
        next[k] ??= issue.message;
      }
      setErrors(next);
      setStatus("error");
      setMessage("Please fix the highlighted fields.");
      const first = Object.keys(next)[0];
      formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }

    setErrors({});
    setStatus("submitting");
    setMessage("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json().catch(() => ({}))) as { success?: boolean; error?: string; fieldErrors?: Errors };
      if (!res.ok || !data.success) {
        if (data.fieldErrors) setErrors(data.fieldErrors);
        throw new Error(data.error || "We could not send your inquiry. Please try again or call us directly.");
      }
      setStatus("success");
      setMessage(successMessage);
      formRef.current?.reset();
      keyRef.current = "";
    } catch (err) {
      setStatus("error");
      setMessage((err as Error).message);
    }
  }

  if (status === "success") {
    return (
      <div role="status" className="mt-8 border-2 border-brand bg-brand/10 p-8 text-center">
        <CheckCircle2 className="mx-auto size-14 text-brand" aria-hidden="true" />
        <p className="mt-4 font-display text-4xl text-white">Inquiry Received</p>
        <p className="mt-2 text-white/85">{message}</p>
        <button
          type="button"
          onClick={() => {
            setStatus("idle");
            setMessage("");
          }}
          className="mt-6 font-condensed font-bold uppercase text-brand underline-offset-4 hover:underline"
        >
          Send another inquiry
        </button>
      </div>
    );
  }

  const field = (name: string) => ({
    name,
    id: `cf-${name}`,
    "aria-invalid": errors[name] ? true : undefined,
    "aria-describedby": errors[name] ? `cf-${name}-error` : undefined,
  });
  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className="mt-8 space-y-5" aria-describedby="cf-required-note">
      <p id="cf-required-note" className="text-sm text-muted">
        Fields marked <span className="text-brand">*</span> are required.
      </p>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <FieldLabel htmlFor="cf-guardianName">Parent / Guardian Name</FieldLabel>
          <input {...field("guardianName")} type="text" autoComplete="name" required maxLength={100} className={inputCls} />
          <FieldError name="guardianName" errors={errors} />
        </div>
        <div>
          <FieldLabel htmlFor="cf-athleteName" optional>
            Athlete First Name
          </FieldLabel>
          <input {...field("athleteName")} type="text" autoComplete="off" maxLength={100} className={inputCls} />
          <FieldError name="athleteName" errors={errors} />
        </div>
        <div>
          <FieldLabel htmlFor="cf-athleteAge">Athlete Age</FieldLabel>
          <input {...field("athleteAge")} type="number" inputMode="numeric" min={8} max={25} required className={inputCls} />
          <FieldError name="athleteAge" errors={errors} />
        </div>
        <div>
          <FieldLabel htmlFor="cf-interest">Interested In</FieldLabel>
          <select
            {...field("interest")}
            required
            value={interest}
            onChange={(e) => setInterest(e.target.value)}
            className={cn(inputCls, "appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2214%22 height=%2214%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%23FFD900%22 stroke-width=%223%22><path d=%22m6 9 6 6 6-6%22/></svg>')] bg-[length:14px] bg-[right_1rem_center] bg-no-repeat pr-10")}
          >
            <option value="" disabled>
              Select an option
            </option>
            {INTEREST_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <FieldError name="interest" errors={errors} />
        </div>
        <div>
          <FieldLabel htmlFor="cf-email">Email</FieldLabel>
          <input {...field("email")} type="email" autoComplete="email" required maxLength={200} className={inputCls} />
          <FieldError name="email" errors={errors} />
        </div>
        <div>
          <FieldLabel htmlFor="cf-phone" optional>
            Phone
          </FieldLabel>
          <input {...field("phone")} type="tel" autoComplete="tel" maxLength={30} className={inputCls} />
          <FieldError name="phone" errors={errors} />
        </div>
      </div>

      {interest === "merchandise" && (
        <div>
          <FieldLabel htmlFor="cf-product" optional>
            Product
          </FieldLabel>
          <select {...field("product")} defaultValue={initialProduct} className={inputCls}>
            <option value="">Not sure yet</option>
            {products.map((p) => (
              <option key={p.slug} value={p.name}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <FieldLabel htmlFor="cf-message">Message</FieldLabel>
        <textarea {...field("message")} rows={5} required maxLength={3000} className={inputCls} placeholder="Tell us about your athlete and how we can help." />
        <FieldError name="message" errors={errors} />
      </div>

      {/* Honeypot: hidden from people and assistive tech, bots tend to fill it. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="cf-website">Website</label>
        <input id="cf-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div>
        <label htmlFor="cf-consent" className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed text-white/85">
          <input
            {...field("consent")}
            type="checkbox"
            required
            className="mt-0.5 size-5 shrink-0 cursor-pointer accent-[#FFD900]"
          />
          <span>
            {consentText} <span className="text-brand" aria-hidden="true">*</span>
          </span>
        </label>
        <FieldError name="consent" errors={errors} />
      </div>

      {privacyNotice && <p className="text-xs leading-relaxed text-muted">{privacyNotice}</p>}

      <div aria-live="polite" role="status" className="min-h-6">
        {status === "error" && message && (
          <p className="flex items-center gap-2 text-sm font-semibold text-red-300">
            <AlertCircle className="size-4 shrink-0" aria-hidden="true" /> {message}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={status === "submitting"}
        className="group inline-flex min-h-14 w-full items-center justify-center gap-2 bg-brand px-8 font-condensed text-lg font-bold uppercase text-black clip-angle transition-transform hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-70 sm:w-auto"
      >
        {status === "submitting" ? (
          <>
            <Loader2 className="size-5 animate-spin" aria-hidden="true" /> Sending…
          </>
        ) : (
          <>
            Send Inquiry <Send className="size-5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </>
        )}
      </button>
    </form>
  );
}
