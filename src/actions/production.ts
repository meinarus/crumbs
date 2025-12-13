"use server";

import { db } from "@/db/index";
import { productionLogs, productionLogItems } from "@/db/schema/production";
import { recipes, recipeItems } from "@/db/schema/recipes";
import { inventory } from "@/db/schema/inventory";
import { requireUserSession } from "@/lib/auth-helpers";
import { eq, and, sql } from "drizzle-orm";
import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export type ProductionLog = typeof productionLogs.$inferSelect;
export type ProductionLogItem = typeof productionLogItems.$inferSelect;
export type ProductionLogWithItems = ProductionLog & {
  items: ProductionLogItem[];
};

export type ProductionBatchItem = {
  recipeId: string;
  quantity: number;
};

const productionBatchSchema = z.array(
  z.object({
    recipeId: z.string().min(1),
    quantity: z.number().int().positive(),
  }),
);

export async function getRecipesForProduction() {
  const session = await requireUserSession();
  const userId = session.id;

  const userRecipes = await db
    .select()
    .from(recipes)
    .where(eq(recipes.userId, userId))
    .orderBy(recipes.name);

  const recipesWithItems = [];

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

export async function executeProductionBatch(items: ProductionBatchItem[]) {
  const session = await requireUserSession();
  const userId = session.id;

  const validated = productionBatchSchema.safeParse(items);
  if (!validated.success) {
    throw new Error("Invalid production batch data");
  }

  if (validated.data.length === 0) {
    throw new Error("No items to produce");
  }

  const deductionsMap = new Map<
    string,
    { inventoryId: string; name: string; unit: string; totalDeduct: number }
  >();
  const recipeDataMap = new Map<
    string,
    { name: string; items: { inventoryId: string; quantity: string }[] }
  >();

  for (const item of validated.data) {
    const [recipe] = await db
      .select()
      .from(recipes)
      .where(and(eq(recipes.id, item.recipeId), eq(recipes.userId, userId)));

    if (!recipe) {
      throw new Error(`Recipe not found: ${item.recipeId}`);
    }

    const recipeItemsData = await db
      .select()
      .from(recipeItems)
      .innerJoin(inventory, eq(recipeItems.inventoryId, inventory.id))
      .where(eq(recipeItems.recipeId, recipe.id));

    recipeDataMap.set(item.recipeId, {
      name: recipe.name,
      items: recipeItemsData.map((r) => ({
        inventoryId: r.recipe_items.inventoryId,
        quantity: r.recipe_items.quantity,
      })),
    });

    for (const ri of recipeItemsData) {
      const deductAmount = parseFloat(ri.recipe_items.quantity) * item.quantity;
      const existing = deductionsMap.get(ri.inventory.id);

      if (existing) {
        existing.totalDeduct += deductAmount;
      } else {
        deductionsMap.set(ri.inventory.id, {
          inventoryId: ri.inventory.id,
          name: ri.inventory.name,
          unit: ri.inventory.unit,
          totalDeduct: deductAmount,
        });
      }
    }
  }

  for (const [inventoryId, deduction] of deductionsMap) {
    const [inv] = await db
      .select({ stock: inventory.stock })
      .from(inventory)
      .where(eq(inventory.id, inventoryId));

    if (!inv) {
      throw new Error(`Inventory item not found: ${deduction.name}`);
    }

    const currentStock = parseFloat(inv.stock);
    if (currentStock < deduction.totalDeduct) {
      throw new Error(
        `Insufficient stock for "${deduction.name}": need ${deduction.totalDeduct} ${deduction.unit}, have ${currentStock} ${deduction.unit}`,
      );
    }
  }

  const createdLogs: string[] = [];

  for (const item of validated.data) {
    const recipeData = recipeDataMap.get(item.recipeId)!;
    const logId = nanoid();

    await db.insert(productionLogs).values({
      id: logId,
      userId,
      recipeId: item.recipeId,
      recipeName: recipeData.name,
      quantity: item.quantity.toString(),
    });

    for (const ri of recipeData.items) {
      const deductAmount = parseFloat(ri.quantity) * item.quantity;

      const [inv] = await db
        .select()
        .from(inventory)
        .where(eq(inventory.id, ri.inventoryId));

      if (inv) {
        await db.insert(productionLogItems).values({
          id: nanoid(),
          productionLogId: logId,
          inventoryId: ri.inventoryId,
          inventoryName: inv.name,
          unit: inv.unit,
          quantityDeducted: deductAmount.toString(),
        });

        await db
          .update(inventory)
          .set({
            stock: sql`${inventory.stock}::numeric - ${deductAmount}`,
          })
          .where(eq(inventory.id, ri.inventoryId));
      }
    }

    createdLogs.push(logId);
  }

  revalidatePath("/production");
  revalidatePath("/inventory");
  revalidatePath("/dashboard");

  return { success: true, logIds: createdLogs };
}

export async function getProductionLogs(): Promise<ProductionLogWithItems[]> {
  const session = await requireUserSession();
  const userId = session.id;

  const logs = await db
    .select()
    .from(productionLogs)
    .where(eq(productionLogs.userId, userId))
    .orderBy(sql`${productionLogs.createdAt} DESC`)
    .limit(50);

  const logsWithItems: ProductionLogWithItems[] = [];

  for (const log of logs) {
    const items = await db
      .select()
      .from(productionLogItems)
      .where(eq(productionLogItems.productionLogId, log.id));

    logsWithItems.push({ ...log, items });
  }

  return logsWithItems;
}

export async function undoProduction(logId: string) {
  const session = await requireUserSession();
  const userId = session.id;

  const [log] = await db
    .select()
    .from(productionLogs)
    .where(
      and(eq(productionLogs.id, logId), eq(productionLogs.userId, userId)),
    );

  if (!log) {
    throw new Error("Production log not found");
  }

  const items = await db
    .select()
    .from(productionLogItems)
    .where(eq(productionLogItems.productionLogId, logId));

  for (const item of items) {
    if (item.inventoryId) {
      await db
        .update(inventory)
        .set({
          stock: sql`${inventory.stock}::numeric + ${parseFloat(item.quantityDeducted)}`,
        })
        .where(eq(inventory.id, item.inventoryId));
    }
  }

  await db.delete(productionLogs).where(eq(productionLogs.id, logId));

  revalidatePath("/production");
  revalidatePath("/inventory");
  revalidatePath("/dashboard");

  return { success: true };
}
