import { getInventoryItems } from "@/actions/inventory";
import { getUserSettings } from "@/actions/settings";
import { requireUserSession } from "@/lib/auth-helpers";
import { InventoryTable } from "@/components/inventory/inventory-table";
import { AddInventoryDialog } from "@/components/inventory/add-inventory-dialog";

export default async function InventoryPage() {
  await requireUserSession();
  const [items, settings] = await Promise.all([
    getInventoryItems(),
    getUserSettings(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Inventory</h1>
          <p className="text-muted-foreground">
            Manage your ingredients and supplies
          </p>
        </div>
        <AddInventoryDialog currency={settings.currency} />
      </div>

      <InventoryTable items={items} currency={settings.currency} />
    </div>
  );
}
