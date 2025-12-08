import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { schema } from "@/db/schema/auth";
import { db } from "@/db/index";
import { admin as adminPlugin } from "better-auth/plugins";
import { ac, user, admin, superadmin } from "@/lib/permissions";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: schema,
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    minPasswordLength: 8,
  },
  user: {
    additionalFields: {
      businessName: {
        type: "string",
        required: true,
        input: true,
      },
      plan: {
        type: "string",
        required: false,
        input: false,
        defaultValue: "free",
      },
      planExpiresAt: {
        type: "date",
        required: false,
        input: false,
      },
    },
  },
  plugins: [
    adminPlugin({
      ac,
      roles: {
        user,
        admin,
        superadmin,
      },
    }),
  ],
});
