import { CollectionManager } from "@/components/admin/CollectionManager";

export const metadata = { title: "Merchandise" };

export default function Page() {
  return <CollectionManager resource="merchandise" />;
}
