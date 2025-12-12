import { relations } from "drizzle-orm";
import {
  pgTable,
  text,
  timestamp,
  numeric,
  boolean,
  index,
} from "drizzle-orm/pg-core";
import { user } from "./auth";
import { inventory } from "./inventory";

export const recipes = pgTable(
  "recipes",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    instructions: text("instructions"),
    image: text("image"),
    targetMargin: numeric("target_margin", { precision: 5, scale: 2 })
      .default("0")
      .notNull(),
    hasVat: boolean("has_vat").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("recipes_userId_idx").on(table.userId)],
);

export const recipeItems = pgTable(
  "recipe_items",
  {
    id: text("id").primaryKey(),
    recipeId: text("recipe_id")
      .notNull()
      .references(() => recipes.id, { onDelete: "cascade" }),
    inventoryId: text("inventory_id")
      .notNull()
      .references(() => inventory.id, { onDelete: "cascade" }),
    quantity: numeric("quantity", { precision: 12, scale: 2 }).notNull(),
  },
  (table) => [index("recipeItems_recipeId_idx").on(table.recipeId)],
);

export const recipesRelations = relations(recipes, ({ one, many }) => ({
  user: one(user, { fields: [recipes.userId], references: [user.id] }),
  items: many(recipeItems),
}));

export const recipeItemsRelations = relations(recipeItems, ({ one }) => ({
  recipe: one(recipes, {
    fields: [recipeItems.recipeId],
    references: [recipes.id],
  }),
  inventory: one(inventory, {
    fields: [recipeItems.inventoryId],
    references: [inventory.id],
  }),
}));
