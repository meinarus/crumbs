import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  businessName: string | null;
  image: string | null;
  role: string;
};

// Helper to check if role is an admin role
function isAdminRole(role: string | null | undefined): boolean {
  return role === "admin" || role === "superadmin";
}

/**
 * For user pages - requires authenticated non-admin user.
 * Redirects to /login if not authenticated.
 * Redirects to /admin/dashboard if user is an admin.
 */

export async function requireUserSession(): Promise<SessionUser> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  if (isAdminRole(session.user.role)) {
    redirect("/admin/dashboard");
  }

  return {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    businessName: session.user.businessName ?? null,
    image: session.user.image ?? null,
    role: session.user.role!,
  };
}

/**
 * For admin pages - requires admin role.
 * Redirects to /login if not authenticated.
 * Redirects to /dashboard if user is not an admin.
 */
export async function requireAdminSession(): Promise<SessionUser> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  if (!isAdminRole(session.user.role)) {
    redirect("/dashboard");
  }

  return {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    businessName: session.user.businessName ?? null,
    image: session.user.image ?? null,
    role: session.user.role!,
  };
}

/**
 * For auth pages (login, signup) - redirect if already logged in.
 * Redirects admins to /admin/dashboard.
 * Redirects regular users to /dashboard.
 */
export async function requireNoSession(): Promise<void> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) {
    if (isAdminRole(session.user.role)) {
      redirect("/admin/dashboard");
    } else {
      redirect("/dashboard");
    }
  }
}
