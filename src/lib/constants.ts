export const INTEREST_OPTIONS = [
  { value: "team-play", label: "7-on-7 Team Play" },
  { value: "training", label: "One-on-One Training" },
  { value: "media-review", label: "Hudl / Social Media Review" },
  { value: "nil-recruiting", label: "NIL / Recruiting Information" },
  { value: "merchandise", label: "Merchandise" },
  { value: "tryouts", label: "Tryout Registration" },
  { value: "uniform", label: "Team Uniform" },
  { value: "general", label: "General Inquiry" },
] as const;

export type InterestValue = (typeof INTEREST_OPTIONS)[number]["value"];

export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Our Team", href: "/our-team" },
  { label: "Contact", href: "/contact" },
] as const;

export const SESSION_COOKIE = "sb_admin_session";
export const SESSION_TTL_HOURS = 12;
export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
/** Stays under Vercel's 4.5 MB serverless request-body limit, including multipart overhead. */
export const UPLOAD_CHUNK_BYTES = 3 * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"] as const;

export function telHref(phone: string) {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}
