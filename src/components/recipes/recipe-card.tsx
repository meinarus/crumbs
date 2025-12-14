import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import CrumbsLogo from "@/components/crumbs-logo";
import type { RecipeWithItems } from "@/actions/recipes";

type RecipeCardProps = {
  recipe: RecipeWithItems;
  currency: string;
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

function formatCurrency(value: number, currency: string): string {
  const formatted = value.toLocaleString(undefined, {
    maximumFractionDigits: 2,
  });
  return `${currency}${formatted}`;
}

export function RecipeCard({ recipe, currency }: RecipeCardProps) {
  const totalCost = recipe.items.reduce((sum, item) => {
    const unitCost = calculateUnitCost(
      item.inventory.purchaseCost,
      item.inventory.purchaseQuantity,
    );
    return sum + parseFloat(item.quantity) * unitCost;
  }, 0);

  const margin = parseFloat(recipe.targetMargin) || 0;
  const sellingPriceBeforeVat =
    margin > 0 ? totalCost / (1 - margin / 100) : totalCost;
  const finalSellingPrice = recipe.hasVat
    ? sellingPriceBeforeVat * 1.12
    : sellingPriceBeforeVat;

  return (
    <Link href={`/recipes/${recipe.id}`}>
      <Card className="hover:bg-muted/50 h-full transition-colors">
        <div className="bg-muted relative aspect-video w-full overflow-hidden rounded-t-lg">
          {recipe.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={recipe.image}
              alt={recipe.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <CrumbsLogo className="h-16 w-16 opacity-30" />
            </div>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="line-clamp-1 font-semibold">{recipe.name}</h3>
          <div className="mt-2 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Cost: {formatCurrency(totalCost, currency)}
            </span>
            <span className="font-medium text-green-600 dark:text-green-400">
              Price: {formatCurrency(finalSellingPrice, currency)}
            </span>
          </div>
          {margin > 0 && (
            <div className="text-muted-foreground mt-1 text-right text-xs">
              {margin}% margin{recipe.hasVat ? " + 12% VAT" : ""}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
