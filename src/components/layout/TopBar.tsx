import { Mail, Phone } from "lucide-react";
import type { SiteSettings } from "@/lib/content/defaults";
import { telHref } from "@/lib/constants";

function XLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
      <path d="M18.9 2H22l-6.8 7.8L23 22h-6.2l-4.8-6.3L6.4 22H3.3l7.3-8.3L1 2h6.3l4.4 5.8L18.9 2Zm-1.1 18h1.7L6.3 3.9H4.5L17.8 20Z" />
    </svg>
  );
}

/** Slim bar above the header. The X link comes from Site Settings, so it is editable in Admin. */
export function TopBar({ settings }: { settings: SiteSettings }) {
  const twitter = settings.social.twitter?.startsWith("https://") ? settings.social.twitter : "";
  const handle = twitter ? `@${twitter.replace(/\/+$/, "").split("/").pop()}` : "";
  const { email, phone } = settings.contact;
  if (!twitter && !email && !phone) return null;

  return (
    <div className="border-b border-brand/30 bg-brand text-black">
      <div className="mx-auto flex min-h-9 max-w-7xl items-center justify-between gap-4 px-4 font-condensed text-sm font-bold uppercase tracking-wide sm:px-6 lg:px-8">
        <div className="hidden items-center gap-5 md:flex">
          {phone && (
            <a href={telHref(phone)} className="inline-flex items-center gap-1.5 hover:underline">
              <Phone className="size-3.5" aria-hidden="true" /> {phone}
            </a>
          )}
          {email && (
            <a href={`mailto:${email}`} className="inline-flex items-center gap-1.5 normal-case hover:underline">
              <Mail className="size-3.5" aria-hidden="true" /> {email}
            </a>
          )}
        </div>
        {twitter && (
          <a
            href={twitter}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto inline-flex items-center gap-2 py-1.5 hover:underline md:ml-0"
            aria-label={`Follow us on X ${handle}`}
          >
            <span>Follow us</span>
            <XLogo className="size-3.5" />
            <span className="normal-case">{handle}</span>
          </a>
        )}
      </div>
    </div>
  );
}
