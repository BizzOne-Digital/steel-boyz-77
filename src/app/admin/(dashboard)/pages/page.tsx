import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { PAGE_LABELS, PAGE_SLUGS } from "@/lib/content/schema";
import { PageHeader } from "@/components/admin/ui";

export const metadata = { title: "Pages" };

export default function PagesIndex() {
  return (
    <>
      <PageHeader title="Pages" description="Edit headings, text, images, buttons, section visibility and SEO for each page." />
      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {PAGE_SLUGS.map((slug) => (
          <li key={slug}>
            <Link href={`/admin/pages/${slug}`} className="group flex items-center justify-between border border-white/10 bg-ink-2 p-6 transition-colors hover:border-brand">
              <span>
                <span className="block font-display text-3xl text-white">{PAGE_LABELS[slug].label}</span>
                <span className="font-mono text-xs text-muted">{PAGE_LABELS[slug].path}</span>
              </span>
              <ChevronRight className="size-6 text-brand transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ul>
      <p className="mt-6 text-sm text-muted">
        Services, teams, leadership, merchandise and FAQs shown on these pages are managed in their own sections.
      </p>
    </>
  );
}
