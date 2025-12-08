import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements } from "better-auth/plugins/admin/access";

/**
 * Access Control for CRUMBS
 *
 * Roles:
 * - user: Regular business user (no admin permissions)
 * - admin: Can manage users (edit, ban, delete)
 * - superadmin: Full admin + can manage other admins
 */

const statement = {
  ...defaultStatements,
} as const;

export const ac = createAccessControl(statement);

export const user = ac.newRole({
  user: [],
  session: [],
});

export const admin = ac.newRole({
  user: [
    "create",
    "list",
    "get",
    "update",
    "set-role",
    "ban",
    "delete",
    "set-password",
  ],
  session: ["list", "revoke", "delete"],
});

export const superadmin = ac.newRole({
  user: [
    "create",
    "list",
    "get",
    "update",
    "set-role",
    "ban",
    "delete",
    "set-password",
  ],
  session: ["list", "revoke", "delete"],
});
