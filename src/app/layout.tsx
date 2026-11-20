import type { Metadata, Viewport } from "next";
import { Barlow_Condensed, Inter, Teko } from "next/font/google";
import { getSettings } from "@/lib/data";
import { siteUrl } from "@/lib/utils";
import "./globals.css";

const teko = Teko({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-teko", display: "swap" });
const barlow = Barlow_Condensed({ subsets: ["latin"], weight: ["500", "600", "700", "800"], variable: "--font-barlow", display: "swap" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  const suffix = s.seo.titleTemplateSuffix || s.branding.businessName;
  return {
    metadataBase: new URL(siteUrl()),
    title: { default: `${s.branding.businessName} | Built Different #ATD`, template: `%s | ${suffix}` },
    description: s.seo.defaultDescription,
    applicationName: s.branding.businessName,
    openGraph: {
      type: "website",
      siteName: s.branding.businessName,
      images: s.seo.ogImage ? [{ url: s.seo.ogImage }] : undefined,
    },
    twitter: { card: "summary_large_image" },
    ...(s.branding.favicon ? { icons: { icon: s.branding.favicon, apple: s.branding.favicon } } : {}),
  };
}

export const viewport: Viewport = {
  themeColor: "#050505",
  colorScheme: "dark",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${teko.variable} ${barlow.variable} ${inter.variable}`}>
      <body className="min-h-dvh bg-ink antialiased">{children}</body>
    </html>
  );
}
