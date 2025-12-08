import { requireAdminSession } from "@/lib/auth-helpers";
import { UsersClient } from "./users-client";

export default async function AdminUsersPage() {
  const session = await requireAdminSession();
  return <UsersClient isSuperAdmin={session.role === "superadmin"} />;
}
