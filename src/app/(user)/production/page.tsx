import { requireUserSession } from "@/lib/auth-helpers";
import {
  getRecipesForProduction,
  getProductionLogs,
} from "@/actions/production";
import { getInventoryItems } from "@/actions/inventory";
import { ProductionBatch } from "@/components/production/production-batch";
import { ProductionHistoryDialog } from "@/components/production/production-history-dialog";

export default async function ProductionPage() {
  await requireUserSession();

  const [recipes, inventoryItems, productionLogs] = await Promise.all([
    getRecipesForProduction(),
    getInventoryItems(),
    getProductionLogs(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Production</h1>
          <p className="text-muted-foreground">
            Execute recipes and deduct inventory
          </p>
        </div>
        <ProductionHistoryDialog logs={productionLogs} />
      </div>

      <ProductionBatch recipes={recipes} inventoryItems={inventoryItems} />
    </div>
  );
}
