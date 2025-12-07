import { requireAdminSession } from "@/lib/auth-helpers";

export default async function AdminDashboardPage() {
  await requireAdminSession();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Admin overview and statistics</p>
      </div>
      <div className="border-muted-foreground/25 flex h-64 items-center justify-center rounded-lg border border-dashed">
        <p className="text-muted-foreground">Coming soon...</p>
      </div>
    </div>
  );
}
