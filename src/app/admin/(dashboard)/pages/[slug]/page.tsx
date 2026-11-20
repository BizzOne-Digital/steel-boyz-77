import { notFound } from "next/navigation";
import { PAGE_LABELS, PAGE_SLUGS, type PageSlug } from "@/lib/content/schema";
import { PageEditor } from "@/components/admin/PageEditor";

export function generateStaticParams() {
  return PAGE_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return { title: `${PAGE_LABELS[slug as PageSlug]?.label ?? "Page"} editor` };
}

export default async function EditPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!(PAGE_SLUGS as readonly string[]).includes(slug)) notFound();
  return <PageEditor slug={slug as PageSlug} />;
}
