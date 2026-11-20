import { Suspense } from "react";
import { redirect } from "next/navigation";
import { Loader2 } from "lucide-react";
import { getCurrentAdmin } from "@/lib/auth";
import { AdminShell } from "@/components/admin/AdminShell";

/** Database-backed session check for every dashboard page (proxy.ts is only an early guard). */
async function AdminGate({ children }: { children: React.ReactNode }) {
  const admin = await getCurrentAdmin().catch(() => null);
  if (!admin) redirect("/admin/login");
  return <AdminShell admin={{ name: admin.name, email: admin.email }}>{children}</AdminShell>;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div role="status" className="flex min-h-dvh items-center justify-center gap-3 bg-ink text-muted">
          <Loader2 className="size-6 animate-spin text-brand" aria-hidden="true" /> Checking session…
        </div>
      }
    >
      <AdminGate>{children}</AdminGate>
    </Suspense>
  );
}
