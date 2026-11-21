import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/utils";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  return [
    { path: "/", priority: 1 },
    { path: "/about", priority: 0.8 },
    { path: "/services", priority: 0.9 },
    { path: "/our-team", priority: 0.7 },
    { path: "/register", priority: 0.9 },
    { path: "/contact", priority: 0.9 },
    { path: "/privacy", priority: 0.2 },
  ].map(({ path, priority }) => ({ url: `${base}${path}`, changeFrequency: "monthly", priority }));
}
