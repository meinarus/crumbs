import { redirect } from "next/navigation";
import { requireAdminSession } from "@/lib/auth-helpers";

export default async function AdminPage() {
  await requireAdminSession();
  redirect("/admin/dashboard");
}
