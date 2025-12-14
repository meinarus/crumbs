import { RecipeCosting } from "./recipe-costing";
import { DeleteRecipeAlert } from "./delete-recipe-alert";
import { EditRecipeDialog } from "./edit-recipe-dialog";
import CrumbsLogo from "@/components/crumbs-logo";
import type { RecipeWithItems } from "@/actions/recipes";
import type { InventoryItem } from "@/actions/inventory";
import type { UserSettings } from "@/actions/settings";

type RecipeDetailProps = {
  recipe: RecipeWithItems;
  inventoryItems: InventoryItem[];
  settings: UserSettings;
};

function calculateUnitCost(
  purchaseCost: string,
  purchaseQuantity: string,
): number {
  const cost = parseFloat(purchaseCost);
  const qty = parseFloat(purchaseQuantity);
  if (isNaN(cost) || isNaN(qty) || qty === 0) return 0;
  return cost / qty;
}

function formatQuantity(value: string | number): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "0";
  return num.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function formatCurrency(value: number, currency: string): string {
  const formatted = value.toLocaleString(undefined, {
    maximumFractionDigits: 2,
  });
  return `${currency}${formatted}`;
}

export function RecipeDetail({
  recipe,
  inventoryItems,
  settings,
}: RecipeDetailProps) {
  const ingredients = recipe.items.filter(
    (item) => item.inventory.category === "ingredient",
  );
  const others = recipe.items.filter(
    (item) => item.inventory.category === "other",
  );

  return (
    <div className="space-y-6 overflow-hidden">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="min-w-0 space-y-6 lg:col-span-2">
          <div className="bg-muted relative aspect-video overflow-hidden rounded-lg">
            {recipe.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={recipe.image}
                alt={recipe.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <CrumbsLogo className="h-24 w-24 opacity-30" />
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <h1 className="text-3xl font-bold wrap-break-word">
              {recipe.name}
            </h1>
            <div className="flex w-full gap-2 max-sm:*:flex-1 sm:w-auto sm:shrink-0">
              <EditRecipeDialog
                recipe={recipe}
                inventoryItems={inventoryItems}
              />
              <DeleteRecipeAlert
                recipeId={recipe.id}
                recipeName={recipe.name}
              />
            </div>
          </div>

          {recipe.instructions && (
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">Instructions</h2>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {recipe.instructions}
              </p>
            </div>
          )}

          {ingredients.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xl font-semibold">Ingredients</h2>
              <div className="divide-y rounded-lg border">
                {ingredients.map((item) => {
                  const unitCost = calculateUnitCost(
                    item.inventory.purchaseCost,
                    item.inventory.purchaseQuantity,
                  );
                  const itemCost = parseFloat(item.quantity) * unitCost;
                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3"
                    >
                      <div className="min-w-0 wrap-break-word">
                        <span className="font-medium">
                          {item.inventory.name}
                        </span>
                        <span className="text-muted-foreground ml-2">
                          {formatQuantity(item.quantity)} {item.inventory.unit}
                        </span>
                      </div>
                      <span className="text-muted-foreground text-sm">
                        {formatCurrency(itemCost, settings.currency)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {others.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xl font-semibold">Others</h2>
              <div className="divide-y rounded-lg border">
                {others.map((item) => {
                  const unitCost = calculateUnitCost(
                    item.inventory.purchaseCost,
                    item.inventory.purchaseQuantity,
                  );
                  const itemCost = parseFloat(item.quantity) * unitCost;
                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3"
                    >
                      <div className="min-w-0 wrap-break-word">
                        <span className="font-medium">
                          {item.inventory.name}
                        </span>
                        <span className="text-muted-foreground ml-2">
                          {formatQuantity(item.quantity)} {item.inventory.unit}
                        </span>
                      </div>
                      <span className="text-muted-foreground text-sm">
                        {formatCurrency(itemCost, settings.currency)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="lg:sticky lg:top-6 lg:self-start">
          <RecipeCosting recipe={recipe} settings={settings} />
        </div>
      </div>
    </div>
  );
}
