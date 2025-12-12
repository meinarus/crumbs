"use server";

import { db } from "@/db/index";
import { recipes, recipeItems } from "@/db/schema/recipes";
import { inventory } from "@/db/schema/inventory";
import { requireUserSession } from "@/lib/auth-helpers";
import { eq, and } from "drizzle-orm";
import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const positiveNumericString = z
  .string()
  .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: "Must be a valid positive number",
  });

const recipeItemSchema = z.object({
  inventoryId: z.string().min(1, "Inventory item is required"),
  quantity: positiveNumericString,
});

const createRecipeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  instructions: z.string().optional(),
  image: z.string().optional(),
  items: z.array(recipeItemSchema).min(1, "At least one item is required"),
});

const marginString = z.string().refine(
  (val) => {
    const num = parseFloat(val);
    return !isNaN(num) && num >= 0 && num < 100;
  },
  {
    message: "Margin must be between 0 and 99",
  },
);

const updateRecipeSchema = z.object({
  name: z.string().min(1).optional(),
  instructions: z.string().optional(),
  image: z.string().optional(),
  targetMargin: marginString.optional(),
  hasVat: z.boolean().optional(),
});

export type Recipe = typeof recipes.$inferSelect;
export type RecipeItem = typeof recipeItems.$inferSelect;
export type InventoryItemForRecipe = typeof inventory.$inferSelect;
export type RecipeWithItems = Recipe & {
  items: (RecipeItem & { inventory: InventoryItemForRecipe })[];
};

export type CreateRecipeData = {
  name: string;
  instructions?: string;
  image?: string;
  items: { inventoryId: string; quantity: string }[];
};

export type UpdateRecipeData = {
  name?: string;
  instructions?: string;
  image?: string;
  targetMargin?: string;
  hasVat?: boolean;
};

export async function createRecipe(data: CreateRecipeData) {
  const session = await requireUserSession();
  const userId = session.id;

  const validated = createRecipeSchema.safeParse(data);
  if (!validated.success) {
    throw new Error(validated.error.issues[0]?.message ?? "Invalid input");
  }

  const recipeId = nanoid();

  const [recipe] = await db
    .insert(recipes)
    .values({
      id: recipeId,
      userId,
      name: validated.data.name,
      instructions: validated.data.instructions ?? null,
      image: validated.data.image ?? null,
    })
    .returning();

  if (validated.data.items.length > 0) {
    await db.insert(recipeItems).values(
      validated.data.items.map((item) => ({
        id: nanoid(),
        recipeId,
        inventoryId: item.inventoryId,
        quantity: item.quantity,
      })),
    );
  }

  revalidatePath("/recipes");
  return recipe;
}

export async function getRecipes(): Promise<RecipeWithItems[]> {
  const session = await requireUserSession();
  const userId = session.id;

  const userRecipes = await db
    .select()
    .from(recipes)
    .where(eq(recipes.userId, userId))
    .orderBy(recipes.createdAt);

  const recipesWithItems: RecipeWithItems[] = [];

  for (const recipe of userRecipes) {
    const items = await db
      .select()
      .from(recipeItems)
      .innerJoin(inventory, eq(recipeItems.inventoryId, inventory.id))
      .where(eq(recipeItems.recipeId, recipe.id));

    recipesWithItems.push({
      ...recipe,
      items: items.map((row) => ({
        ...row.recipe_items,
        inventory: row.inventory,
      })),
    });
  }

  return recipesWithItems;
}

export async function getRecipe(id: string): Promise<RecipeWithItems | null> {
  const session = await requireUserSession();
  const userId = session.id;

  const [recipe] = await db
    .select()
    .from(recipes)
    .where(and(eq(recipes.id, id), eq(recipes.userId, userId)));

  if (!recipe) {
    return null;
  }

  const items = await db
    .select()
    .from(recipeItems)
    .innerJoin(inventory, eq(recipeItems.inventoryId, inventory.id))
    .where(eq(recipeItems.recipeId, recipe.id));

  return {
    ...recipe,
    items: items.map((row) => ({
      ...row.recipe_items,
      inventory: row.inventory,
    })),
  };
}

export async function updateRecipe(id: string, data: UpdateRecipeData) {
  const session = await requireUserSession();
  const userId = session.id;

  const validated = updateRecipeSchema.safeParse(data);
  if (!validated.success) {
    throw new Error(validated.error.issues[0]?.message ?? "Invalid input");
  }

  const updateData: Record<string, unknown> = {};

  if (validated.data.name !== undefined) updateData.name = validated.data.name;
  if (validated.data.instructions !== undefined)
    updateData.instructions = validated.data.instructions;
  if (validated.data.image !== undefined)
    updateData.image = validated.data.image;
  if (validated.data.targetMargin !== undefined)
    updateData.targetMargin = validated.data.targetMargin;
  if (validated.data.hasVat !== undefined)
    updateData.hasVat = validated.data.hasVat;

  const [result] = await db
    .update(recipes)
    .set(updateData)
    .where(and(eq(recipes.id, id), eq(recipes.userId, userId)))
    .returning();

  revalidatePath("/recipes");
  revalidatePath(`/recipes/${id}`);
  return result ?? null;
}

export type UpdateRecipeWithItemsData = {
  name: string;
  instructions?: string;
  image?: string;
  items: { inventoryId: string; quantity: string }[];
};

export async function updateRecipeWithItems(
  id: string,
  data: UpdateRecipeWithItemsData,
) {
  const session = await requireUserSession();
  const userId = session.id;

  if (!data.name || data.name.trim() === "") {
    throw new Error("Name is required");
  }

  if (!data.items || data.items.length === 0) {
    throw new Error("At least one item is required");
  }

  const [existingRecipe] = await db
    .select()
    .from(recipes)
    .where(and(eq(recipes.id, id), eq(recipes.userId, userId)));

  if (!existingRecipe) {
    throw new Error("Recipe not found");
  }

  await db
    .update(recipes)
    .set({
      name: data.name,
      instructions: data.instructions ?? null,
      image: data.image ?? null,
    })
    .where(eq(recipes.id, id));

  await db.delete(recipeItems).where(eq(recipeItems.recipeId, id));

  if (data.items.length > 0) {
    await db.insert(recipeItems).values(
      data.items.map((item) => ({
        id: nanoid(),
        recipeId: id,
        inventoryId: item.inventoryId,
        quantity: item.quantity,
      })),
    );
  }

  revalidatePath("/recipes");
  revalidatePath(`/recipes/${id}`);
  return { success: true };
}

export async function deleteRecipe(id: string) {
  const session = await requireUserSession();
  const userId = session.id;

  await db
    .delete(recipes)
    .where(and(eq(recipes.id, id), eq(recipes.userId, userId)));

  revalidatePath("/recipes");
  return { success: true };
}
