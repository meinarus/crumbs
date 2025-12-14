"use server";

import { generateObject } from "ai";
import { z } from "zod";
import { defaultModel } from "@/lib/ai";
import { getInventoryItems } from "@/actions/inventory";

const generatedRecipeSchema = z.object({
  name: z.string().describe("Creative recipe name"),
  steps: z
    .array(z.string().describe("A single cooking instruction step"))
    .describe("Array of step-by-step cooking instructions"),
  ingredients: z
    .array(
      z.object({
        inventoryId: z.string().describe("Exact ID from the ingredients list"),
        quantity: z.string().describe("Numeric quantity as a string"),
      }),
    )
    .describe("List of ingredients from the inventory"),
  others: z
    .array(
      z.object({
        inventoryId: z.string().describe("Exact ID from the others list"),
        quantity: z.string().describe("Numeric quantity as a string"),
      }),
    )
    .describe("List of other items (packaging, labels, etc.) from inventory"),
});

export type GeneratedRecipe = {
  name: string;
  instructions: string;
  ingredients: { inventoryId: string; quantity: string }[];
  others: { inventoryId: string; quantity: string }[];
};

export async function generateRecipe(): Promise<GeneratedRecipe> {
  const inventoryItems = await getInventoryItems();

  const ingredientsList = inventoryItems
    .filter((i) => i.category === "ingredient")
    .map((i) => `- ID: "${i.id}", Name: "${i.name}", Unit: "${i.unit}"`)
    .join("\n");

  const othersList = inventoryItems
    .filter((i) => i.category === "other")
    .map((i) => `- ID: "${i.id}", Name: "${i.name}", Unit: "${i.unit}"`)
    .join("\n");

  const { object } = await generateObject({
    model: defaultModel,
    schema: generatedRecipeSchema,
    prompt: `Generate a creative food recipe using ONLY items from these lists.
    
    INGREDIENTS (food items):
    ${ingredientsList || "None available"}

    OTHERS (packaging, labels, etc.):
    ${othersList || "None available"}

    Rules:
    1. Use ONLY the exact IDs provided above
    2. Quantities can be decimals (e.g. "0.5", "1.5", "100", "2")
    3. Be creative with the recipe name
    4. Write clear cooking instructions as separate steps`,
  });

  const instructions = object.steps
    .map((step, i) => `${i + 1}. ${step}`)
    .join("\n");

  return {
    name: object.name,
    instructions,
    ingredients: object.ingredients,
    others: object.others,
  };
}
