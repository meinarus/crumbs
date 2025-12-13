"use client";

import { useState, useMemo, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  AlertTriangle,
  ArrowLeft,
  ChefHat,
  Loader2,
  Minus,
  Package,
  Plus,
} from "lucide-react";
import type { RecipeWithItems } from "@/actions/recipes";
import type { InventoryItem } from "@/actions/inventory";
import { executeProductionBatch } from "@/actions/production";
import { toast } from "sonner";

type ProductionBatchProps = {
  recipes: RecipeWithItems[];
  inventoryItems: InventoryItem[];
};

export function ProductionBatch({
  recipes,
  inventoryItems,
}: ProductionBatchProps) {
  const [selectedRecipes, setSelectedRecipes] = useState<
    Record<string, number>
  >({});
  const [step, setStep] = useState<"select" | "review">("select");
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();

  const filteredRecipes = useMemo(() => {
    if (!search.trim()) return recipes;
    const query = search.toLowerCase();
    return recipes.filter((r) => r.name.toLowerCase().includes(query));
  }, [recipes, search]);

  const deductions = useMemo(() => {
    const map = new Map<
      string,
      { name: string; unit: string; required: number; available: number }
    >();

    for (const [recipeId, qty] of Object.entries(selectedRecipes)) {
      if (qty <= 0) continue;
      const recipe = recipes.find((r) => r.id === recipeId);
      if (!recipe) continue;

      for (const item of recipe.items) {
        const deductAmount = parseFloat(item.quantity) * qty;
        const inv = inventoryItems.find((i) => i.id === item.inventoryId);
        const existing = map.get(item.inventoryId);

        if (existing) {
          existing.required += deductAmount;
        } else {
          map.set(item.inventoryId, {
            name: inv?.name ?? item.inventory.name,
            unit: inv?.unit ?? item.inventory.unit,
            required: deductAmount,
            available: parseFloat(inv?.stock ?? item.inventory.stock),
          });
        }
      }
    }

    return Array.from(map.entries()).map(([id, data]) => ({
      id,
      ...data,
      insufficient: data.required > data.available,
    }));
  }, [selectedRecipes, recipes, inventoryItems]);

  const hasInsufficientStock = deductions.some((d) => d.insufficient);
  const selectedCount = Object.values(selectedRecipes).filter(
    (q) => q > 0,
  ).length;

  const updateQuantity = (recipeId: string, delta: number) => {
    setSelectedRecipes((prev) => {
      const current = prev[recipeId] ?? 0;
      const next = Math.max(0, current + delta);
      if (next === 0) {
        const rest = { ...prev };
        delete rest[recipeId];
        return rest;
      }
      return { ...prev, [recipeId]: next };
    });
  };

  const handleProduce = () => {
    const items = Object.entries(selectedRecipes)
      .filter(([, qty]) => qty > 0)
      .map(([recipeId, quantity]) => ({ recipeId, quantity }));

    startTransition(async () => {
      try {
        await executeProductionBatch(items);
        toast.success("Production completed successfully!");
        setSelectedRecipes({});
        setStep("select");
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Production failed",
        );
      }
    });
  };

  return (
    <div className="grid min-w-0 gap-6 lg:grid-cols-2">
      <div className={`min-w-0 ${step === "review" ? "hidden lg:block" : ""}`}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <ChefHat className="h-5 w-5" />
              Select Recipes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Search recipes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <div className="h-[400px] overflow-x-hidden overflow-y-auto pr-2">
              {filteredRecipes.length === 0 ? (
                <p className="text-muted-foreground py-8 text-center text-sm">
                  {recipes.length === 0
                    ? "No recipes available. Create recipes first."
                    : "No recipes match your search."}
                </p>
              ) : (
                <div className="space-y-2">
                  {filteredRecipes.map((recipe) => {
                    const qty = selectedRecipes[recipe.id] ?? 0;
                    return (
                      <div
                        key={recipe.id}
                        className="bg-muted/50 flex items-center gap-3 rounded-lg p-3"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium">{recipe.name}</p>
                          <p className="text-muted-foreground text-xs">
                            {recipe.items.length} ingredient
                            {recipe.items.length !== 1 ? "s" : ""}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(recipe.id, -1)}
                            disabled={qty === 0}
                          >
                            <Minus />
                          </Button>
                          <Input
                            type="number"
                            min={0}
                            placeholder="0"
                            value={qty || ""}
                            onChange={(e) => {
                              const value = parseInt(e.target.value, 10);
                              setSelectedRecipes((prev) => {
                                if (isNaN(value) || value <= 0) {
                                  const rest = { ...prev };
                                  delete rest[recipe.id];
                                  return rest;
                                }
                                return { ...prev, [recipe.id]: value };
                              });
                            }}
                            className="h-8 w-16 [appearance:textfield] text-center font-mono [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(recipe.id, 1)}
                          >
                            <Plus />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex gap-2 lg:hidden">
              <Button
                variant="outline"
                disabled={selectedCount === 0}
                onClick={() => {
                  setSelectedRecipes({});
                  setStep("select");
                }}
              >
                Clear
              </Button>
              <Button
                className="flex-1"
                disabled={selectedCount === 0}
                onClick={() => setStep("review")}
              >
                Continue ({selectedCount} recipe
                {selectedCount !== 1 ? "s" : ""})
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className={step === "select" ? "hidden lg:block" : ""}>
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden"
                  onClick={() => setStep("select")}
                >
                  <ArrowLeft />
                </Button>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Package className="h-5 w-5" />
                  Production Preview
                </CardTitle>
              </div>
              {selectedCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedRecipes({});
                    setStep("select");
                  }}
                >
                  Clear
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedCount === 0 ? (
              <p className="text-muted-foreground py-8 text-center text-sm">
                Select recipes to see preview
              </p>
            ) : (
              <>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Recipes to produce:</p>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(selectedRecipes)
                      .filter(([, qty]) => qty > 0)
                      .map(([recipeId, qty]) => {
                        const recipe = recipes.find((r) => r.id === recipeId);
                        return (
                          <Badge
                            key={recipeId}
                            variant="secondary"
                            className="max-w-[200px] truncate"
                          >
                            {recipe?.name} × {qty}
                          </Badge>
                        );
                      })}
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <p className="text-sm font-medium">Inventory deductions:</p>
                  <div className="h-[250px] overflow-x-hidden overflow-y-auto pr-2">
                    <div className="space-y-2">
                      {deductions.map((d) => (
                        <div
                          key={d.id}
                          className={`flex items-center justify-between rounded-lg p-2 ${
                            d.insufficient ? "bg-destructive/10" : "bg-muted/50"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {d.insufficient && (
                              <AlertTriangle className="text-destructive h-4 w-4" />
                            )}
                            <span className="text-sm">{d.name}</span>
                          </div>
                          <div className="text-right text-sm">
                            <span
                              className={
                                d.insufficient ? "text-destructive" : ""
                              }
                            >
                              -{d.required.toFixed(2)} {d.unit}
                            </span>
                            <span className="text-muted-foreground ml-2">
                              ({d.available.toFixed(2)} available)
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {hasInsufficientStock && (
                  <p className="text-destructive text-sm">
                    Insufficient stock for some items. Reduce quantities or add
                    stock.
                  </p>
                )}

                <Button
                  className="w-full"
                  size="lg"
                  disabled={hasInsufficientStock || isPending}
                  onClick={handleProduce}
                >
                  {isPending ? (
                    <>
                      <Loader2 className="animate-spin" />
                      Producing...
                    </>
                  ) : (
                    "Produce"
                  )}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
