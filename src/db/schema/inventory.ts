import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, numeric, index } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const inventory = pgTable(
  "inventory",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    category: text("category").notNull(), // "food" | "other"
    supplier: text("supplier"),
    purchaseCost: numeric("purchase_cost", {
      precision: 12,
      scale: 2,
    }).notNull(),
    purchaseQuantity: numeric("purchase_quantity", {
      precision: 12,
      scale: 2,
    }).notNull(),
    unit: text("unit").notNull(),
    stock: numeric("stock", { precision: 12, scale: 2 }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("inventory_userId_idx").on(table.userId)],
);

export const inventoryRelations = relations(inventory, ({ one }) => ({
  user: one(user, {
    fields: [inventory.userId],
    references: [user.id],
  }),
}));
