import { CollectionManager } from "@/components/admin/CollectionManager";

export const metadata = { title: "Services" };

export default function Page() {
  return <CollectionManager resource="services" />;
}
