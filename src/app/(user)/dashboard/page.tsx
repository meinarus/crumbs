import { requireUserSession } from "@/lib/auth-helpers";

export default async function DashboardPage() {
  await requireUserSession();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your business operations
        </p>
      </div>
      <div className="border-muted-foreground/25 flex h-64 items-center justify-center rounded-lg border border-dashed">
        <p className="text-muted-foreground">Coming soon...</p>
      </div>
    </div>
  );
}
