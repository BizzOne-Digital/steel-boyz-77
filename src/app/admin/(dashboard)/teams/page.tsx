import { CollectionManager } from "@/components/admin/CollectionManager";

export const metadata = { title: "Teams" };

export default function Page() {
  return <CollectionManager resource="teams" />;
}
