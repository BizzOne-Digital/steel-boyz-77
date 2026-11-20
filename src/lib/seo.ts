import "server-only";
import type { Metadata } from "next";
import { getPage, getSettings } from "@/lib/data";
import { PAGE_LABELS, type PageSlug } from "@/lib/content/schema";

export async function pageMetadata(slug: PageSlug): Promise<Metadata> {
  const [page, settings] = await Promise.all([getPage(slug), getSettings()]);
  const seo = (page as { seo: { title: string; description: string; ogImage: string } }).seo;
  const path = PAGE_LABELS[slug].path;
  const image = seo.ogImage || settings.seo.ogImage;
  const title = slug === "home" ? { absolute: seo.title || settings.branding.businessName } : seo.title || PAGE_LABELS[slug].label;
  const description = seo.description || settings.seo.defaultDescription;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title: typeof title === "string" ? title : title.absolute, description, url: path, images: image ? [{ url: image }] : undefined },
    twitter: { card: "summary_large_image", title: typeof title === "string" ? title : title.absolute, description, images: image ? [image] : undefined },
  };
}
