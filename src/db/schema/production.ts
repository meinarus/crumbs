import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, numeric, index } from "drizzle-orm/pg-core";
import { user } from "./auth";
import { recipes } from "./recipes";
import { inventory } from "./inventory";

export const productionLogs = pgTable(
  "production_logs",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    recipeId: text("recipe_id").references(() => recipes.id, {
      onDelete: "set null",
    }),
    recipeName: text("recipe_name").notNull(),
    quantity: numeric("quantity", { precision: 12, scale: 2 }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("productionLogs_userId_idx").on(table.userId)],
);

export const productionLogItems = pgTable(
  "production_log_items",
  {
    id: text("id").primaryKey(),
    productionLogId: text("production_log_id")
      .notNull()
      .references(() => productionLogs.id, { onDelete: "cascade" }),
    inventoryId: text("inventory_id").references(() => inventory.id, {
      onDelete: "set null",
    }),
    inventoryName: text("inventory_name").notNull(),
    unit: text("unit").notNull(),
    quantityDeducted: numeric("quantity_deducted", {
      precision: 12,
      scale: 2,
    }).notNull(),
  },
  (table) => [index("productionLogItems_logId_idx").on(table.productionLogId)],
);

export const productionLogsRelations = relations(
  productionLogs,
  ({ one, many }) => ({
    user: one(user, {
      fields: [productionLogs.userId],
      references: [user.id],
    }),
    recipe: one(recipes, {
      fields: [productionLogs.recipeId],
      references: [recipes.id],
    }),
    items: many(productionLogItems),
  }),
);

export const productionLogItemsRelations = relations(
  productionLogItems,
  ({ one }) => ({
    productionLog: one(productionLogs, {
      fields: [productionLogItems.productionLogId],
      references: [productionLogs.id],
    }),
    inventory: one(inventory, {
      fields: [productionLogItems.inventoryId],
      references: [inventory.id],
    }),
  }),
);
