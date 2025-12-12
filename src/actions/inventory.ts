"use server";

import { db } from "@/db/index";
import { inventory } from "@/db/schema/inventory";
import { requireUserSession } from "@/lib/auth-helpers";
import { eq, and, ilike } from "drizzle-orm";
import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const numericString = z
  .string()
  .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, {
    message: "Must be a valid non-negative number",
  });

const positiveNumericString = z
  .string()
  .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: "Must be a valid positive number",
  });

const addInventorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  category: z.string().min(1, "Category is required"),
  supplier: z.string().optional(),
  purchaseCost: numericString,
  purchaseQuantity: positiveNumericString,
  unit: z.string().min(1, "Unit is required"),
});

const updateInventorySchema = z.object({
  name: z.string().min(1).optional(),
  category: z.string().min(1).optional(),
  supplier: z.string().optional(),
  purchaseCost: numericString.optional(),
  purchaseQuantity: positiveNumericString.optional(),
  unit: z.string().min(1).optional(),
  stock: numericString.optional(),
});

const addStockSchema = z.object({
  id: z.string().min(1),
  quantityToAdd: positiveNumericString,
});

export type InventoryItem = typeof inventory.$inferSelect;

export type AddInventoryData = {
  name: string;
  category: string;
  supplier?: string;
  purchaseCost: string;
  purchaseQuantity: string;
  unit: string;
};

export type UpdateInventoryData = Partial<AddInventoryData> & {
  stock?: string;
};

export async function addInventoryItem(data: AddInventoryData) {
  const session = await requireUserSession();
  const userId = session.id;

  const validated = addInventorySchema.safeParse(data);
  if (!validated.success) {
    throw new Error(validated.error.issues[0]?.message ?? "Invalid input");
  }

  const duplicates = await db
    .select()
    .from(inventory)
    .where(
      and(
        eq(inventory.userId, userId),
        eq(inventory.unit, validated.data.unit),
        ilike(inventory.name, validated.data.name),
      ),
    );

  if (duplicates.length > 0) {
    throw new Error(
      `Item "${validated.data.name}" with unit "${validated.data.unit}" already exists.`,
    );
  }

  const item = await db
    .insert(inventory)
    .values({
      id: nanoid(),
      userId,
      name: validated.data.name,
      category: validated.data.category,
      supplier: validated.data.supplier ?? null,
      purchaseCost: validated.data.purchaseCost,
      purchaseQuantity: validated.data.purchaseQuantity,
      unit: validated.data.unit,
      stock: validated.data.purchaseQuantity, // Initial stock = purchase quantity
    })
    .returning();

  revalidatePath("/inventory");
  return item[0];
}

export async function getInventoryItems() {
  const session = await requireUserSession();
  const userId = session.id;

  const items = await db
    .select()
    .from(inventory)
    .where(eq(inventory.userId, userId))
    .orderBy(inventory.createdAt);

  return items;
}

export async function getInventoryItem(id: string) {
  const session = await requireUserSession();
  const userId = session.id;

  const items = await db
    .select()
    .from(inventory)
    .where(and(eq(inventory.id, id), eq(inventory.userId, userId)));

  return items[0] ?? null;
}

export async function updateInventoryItem(
  id: string,
  data: UpdateInventoryData,
) {
  const session = await requireUserSession();
  const userId = session.id;

  const validated = updateInventorySchema.safeParse(data);
  if (!validated.success) {
    throw new Error(validated.error.issues[0]?.message ?? "Invalid input");
  }

  const updateData: Record<string, unknown> = {};

  if (validated.data.name !== undefined) updateData.name = validated.data.name;
  if (validated.data.category !== undefined)
    updateData.category = validated.data.category;
  if (validated.data.supplier !== undefined)
    updateData.supplier = validated.data.supplier;
  if (validated.data.purchaseCost !== undefined)
    updateData.purchaseCost = validated.data.purchaseCost;
  if (validated.data.purchaseQuantity !== undefined)
    updateData.purchaseQuantity = validated.data.purchaseQuantity;
  if (validated.data.unit !== undefined) updateData.unit = validated.data.unit;
  if (validated.data.stock !== undefined)
    updateData.stock = validated.data.stock;

  const result = await db
    .update(inventory)
    .set(updateData)
    .where(and(eq(inventory.id, id), eq(inventory.userId, userId)))
    .returning();

  revalidatePath("/inventory");
  return result[0] ?? null;
}

export async function deleteInventoryItem(id: string) {
  const session = await requireUserSession();
  const userId = session.id;

  await db
    .delete(inventory)
    .where(and(eq(inventory.id, id), eq(inventory.userId, userId)));

  revalidatePath("/inventory");
  return { success: true };
}

export async function addStock(id: string, quantityToAdd: string) {
  const session = await requireUserSession();
  const userId = session.id;

  const validated = addStockSchema.safeParse({ id, quantityToAdd });
  if (!validated.success) {
    throw new Error(validated.error.issues[0]?.message ?? "Invalid input");
  }

  const item = await db
    .select({ stock: inventory.stock })
    .from(inventory)
    .where(
      and(eq(inventory.id, validated.data.id), eq(inventory.userId, userId)),
    )
    .limit(1)
    .then((res) => res[0]);

  if (!item) {
    throw new Error("Item not found");
  }

  const currentStock = parseFloat(item.stock);
  const added = parseFloat(validated.data.quantityToAdd);
  const newStock = (currentStock + added).toString();

  const result = await db
    .update(inventory)
    .set({ stock: newStock })
    .where(and(eq(inventory.id, id), eq(inventory.userId, userId)))
    .returning();

  revalidatePath("/inventory");
  return result[0];
}
