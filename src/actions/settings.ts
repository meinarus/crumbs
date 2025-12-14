"use server";

import { db } from "@/db/index";
import { userSettings } from "@/db/schema/settings";
import { eq } from "drizzle-orm";
import { requireUserSession } from "@/lib/auth-helpers";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const vatRateSchema = z.string().refine(
  (val) => {
    if (val === "") return true;
    const num = parseFloat(val);
    return !isNaN(num) && num >= 0 && num <= 100;
  },
  { message: "VAT rate must be between 0 and 100" },
);

export async function getUserSettings() {
  const session = await requireUserSession();

  const [settings] = await db
    .select()
    .from(userSettings)
    .where(eq(userSettings.userId, session.id))
    .limit(1);

  return {
    vatRate: settings?.vatRate ?? "",
  };
}

export async function updateVatRate(vatRate: string) {
  const session = await requireUserSession();

  const validated = vatRateSchema.safeParse(vatRate);
  if (!validated.success) {
    throw new Error(validated.error.issues[0]?.message ?? "Invalid input");
  }

  await db
    .insert(userSettings)
    .values({
      userId: session.id,
      vatRate: validated.data,
    })
    .onConflictDoUpdate({
      target: userSettings.userId,
      set: { vatRate: validated.data },
    });

  revalidatePath("/recipes");
}
