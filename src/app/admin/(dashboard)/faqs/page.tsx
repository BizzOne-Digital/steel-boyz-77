import { CollectionManager } from "@/components/admin/CollectionManager";

export const metadata = { title: "FAQs" };

export default function Page() {
  return <CollectionManager resource="faqs" />;
}
