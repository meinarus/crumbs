"use server";

import { db } from "@/db/index";
import { userSettings } from "@/db/schema/settings";
import { eq } from "drizzle-orm";
import { requireUserSession } from "@/lib/auth-helpers";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const settingsSchema = z.object({
  vatRate: z.string().refine(
    (val) => {
      if (val === "") return true;
      const num = parseFloat(val);
      return !isNaN(num) && num >= 0 && num <= 100;
    },
    { message: "VAT rate must be between 0 and 100" },
  ),
  currency: z.string().max(10, "Currency must be 10 characters or less"),
});

export type UserSettings = {
  vatRate: string;
  currency: string;
};

export async function getUserSettings(): Promise<UserSettings> {
  const session = await requireUserSession();

  const [settings] = await db
    .select()
    .from(userSettings)
    .where(eq(userSettings.userId, session.id))
    .limit(1);

  return {
    vatRate: settings?.vatRate ?? "",
    currency: settings?.currency ?? "",
  };
}

export async function updateSettings(data: UserSettings) {
  const session = await requireUserSession();

  const validated = settingsSchema.safeParse(data);
  if (!validated.success) {
    throw new Error(validated.error.issues[0]?.message ?? "Invalid input");
  }

  await db
    .insert(userSettings)
    .values({
      userId: session.id,
      vatRate: validated.data.vatRate,
      currency: validated.data.currency,
    })
    .onConflictDoUpdate({
      target: userSettings.userId,
      set: {
        vatRate: validated.data.vatRate,
        currency: validated.data.currency,
      },
    });

  revalidatePath("/");
}
