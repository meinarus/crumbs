"use client";

import { useState, useTransition, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { updateRecipe } from "@/actions/recipes";
import { toast } from "sonner";
import type { RecipeWithItems } from "@/actions/recipes";

type RecipeCostingProps = {
  recipe: RecipeWithItems;
  vatRate: string;
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

function formatCurrency(value: number): string {
  return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

export function RecipeCosting({ recipe, vatRate }: RecipeCostingProps) {
  const [margin, setMargin] = useState(
    parseFloat(recipe.targetMargin) === 0 ? "" : recipe.targetMargin,
  );
  const [hasVat, setHasVat] = useState(recipe.hasVat);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const {
    ingredientsSubtotal,
    othersSubtotal,
    totalCost,
    sellingPrice,
    profit,
  } = useMemo(() => {
    const ingredientsCost = recipe.items
      .filter((item) => item.inventory.category === "ingredient")
      .reduce((sum, item) => {
        const unitCost = calculateUnitCost(
          item.inventory.purchaseCost,
          item.inventory.purchaseQuantity,
        );
        return sum + parseFloat(item.quantity) * unitCost;
      }, 0);

    const othersCost = recipe.items
      .filter((item) => item.inventory.category === "other")
      .reduce((sum, item) => {
        const unitCost = calculateUnitCost(
          item.inventory.purchaseCost,
          item.inventory.purchaseQuantity,
        );
        return sum + parseFloat(item.quantity) * unitCost;
      }, 0);

    const total = ingredientsCost + othersCost;
    const marginPercent = parseFloat(margin) || 0;
    const priceBeforeVat =
      marginPercent > 0 ? total / (1 - marginPercent / 100) : total;
    const vatMultiplier = 1 + parseFloat(vatRate) / 100;
    const finalPrice = hasVat ? priceBeforeVat * vatMultiplier : priceBeforeVat;
    const profitAmount = priceBeforeVat - total;

    return {
      ingredientsSubtotal: ingredientsCost,
      othersSubtotal: othersCost,
      totalCost: total,
      sellingPrice: finalPrice,
      profit: profitAmount,
    };
  }, [recipe.items, margin, hasVat, vatRate]);

  const handleSave = () => {
    const marginVal = parseFloat(margin);
    if (isNaN(marginVal) || marginVal < 0 || marginVal >= 100) {
      setError("Margin must be between 0 and 99");
      return;
    }
    setError(null);

    startTransition(async () => {
      try {
        await updateRecipe(recipe.id, {
          targetMargin: margin,
          hasVat,
        });
        toast.success("Pricing updated successfully!");
      } catch (e) {
        const message =
          e instanceof Error ? e.message : "Failed to update pricing.";
        toast.error(message);
      }
    });
  };

  const hasChanges = margin !== recipe.targetMargin || hasVat !== recipe.hasVat;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Costing & Pricing</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Ingredients</span>
            <span>{formatCurrency(ingredientsSubtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Others</span>
            <span>{formatCurrency(othersSubtotal)}</span>
          </div>
          <div className="border-t pt-2">
            <div className="flex justify-between font-medium">
              <span>Total Cost</span>
              <span>{formatCurrency(totalCost)}</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Target Margin (%)</label>
          <Input
            type="number"
            step="0.01"
            min="0"
            max="99"
            value={margin}
            onChange={(e) => {
              setMargin(e.target.value);
              setError(null);
            }}
            placeholder="0"
          />
          {error && <p className="text-destructive text-sm">{error}</p>}
        </div>

        <div className="flex items-center justify-between">
          <label htmlFor="vat" className="text-sm font-medium">
            Include VAT ({vatRate}%)
          </label>
          <Switch id="vat" checked={hasVat} onCheckedChange={setHasVat} />
        </div>

        <div className="space-y-2 border-t pt-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Profit</span>
            <span className="text-green-600 dark:text-green-400">
              {formatCurrency(profit)}
            </span>
          </div>
          <div className="flex justify-between text-lg font-bold">
            <span>Selling Price</span>
            <span className="text-primary">{formatCurrency(sellingPrice)}</span>
          </div>
        </div>

        <Button
          onClick={handleSave}
          disabled={!hasChanges || isPending}
          className="w-full"
        >
          {isPending ? "Saving..." : "Save Pricing"}
        </Button>
      </CardContent>
    </Card>
  );
}
