import { requireUserSession } from "@/lib/auth-helpers";
import { getRecipes } from "@/actions/recipes";
import { getInventoryItems } from "@/actions/inventory";
import { AddRecipeDialog } from "@/components/recipes/add-recipe-dialog";
import { RecipesList } from "@/components/recipes/recipes-list";

export default async function RecipesPage() {
  await requireUserSession();

  const [recipes, inventoryItems] = await Promise.all([
    getRecipes(),
    getInventoryItems(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Recipes</h1>
          <p className="text-muted-foreground">
            Create recipes with auto-calculated costs and pricing
          </p>
        </div>
        <AddRecipeDialog inventoryItems={inventoryItems} />
      </div>

      <RecipesList recipes={recipes} />
    </div>
  );
}
