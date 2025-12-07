import { requireUserSession } from "@/lib/auth-helpers";

export default async function ProductionPage() {
  await requireUserSession();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Production</h1>
        <p className="text-muted-foreground">
          Execute recipes and track inventory deductions
        </p>
      </div>
      <div className="border-muted-foreground/25 flex h-64 items-center justify-center rounded-lg border border-dashed">
        <p className="text-muted-foreground">Coming soon...</p>
      </div>
    </div>
  );
}
