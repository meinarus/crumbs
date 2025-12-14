import { notFound } from "next/navigation";
import { requireUserSession } from "@/lib/auth-helpers";
import { getRecipe } from "@/actions/recipes";
import { getInventoryItems } from "@/actions/inventory";
import { getUserSettings } from "@/actions/settings";
import { RecipeDetail } from "@/components/recipes/recipe-detail";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function RecipeDetailPage({ params }: Props) {
  await requireUserSession();
  const { id } = await params;

  const [recipe, inventoryItems, settings] = await Promise.all([
    getRecipe(id),
    getInventoryItems(),
    getUserSettings(),
  ]);

  if (!recipe) {
    notFound();
  }

  return (
    <RecipeDetail
      recipe={recipe}
      inventoryItems={inventoryItems}
      settings={settings}
    />
  );
}
