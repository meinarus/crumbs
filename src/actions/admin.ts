"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export type UserWithPlan = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
  role: string | null;
  banned: boolean | null;
  banReason: string | null;
  banExpires: Date | null;
  businessName: string;
  plan: string;
  planExpiresAt: Date | null;
};

export type ListUsersQuery = {
  limit?: number;
  offset?: number;
  searchValue?: string;
  sortDirection?: "asc" | "desc";
  filterRole?: string;
};

export type ListUsersResult = {
  users: UserWithPlan[];
  total: number;
};

export async function listUsers(
  query: ListUsersQuery = {},
): Promise<ListUsersResult> {
  const headersList = await headers();

  const result = await auth.api.listUsers({
    query: {
      limit: query.limit ?? 100,
      offset: query.offset ?? 0,
      ...(query.searchValue && {
        searchValue: query.searchValue,
        searchField: "name",
        searchOperator: "contains",
      }),
      ...(query.filterRole && {
        filterField: "role",
        filterValue: query.filterRole,
        filterOperator: "eq",
      }),
      sortBy: "createdAt",
      sortDirection: query.sortDirection ?? "desc",
    },
    headers: headersList,
  });

  return {
    users: result.users as UserWithPlan[],
    total: result.total,
  };
}

export async function updateUser(
  userId: string,
  data: {
    name?: string;
    email?: string;
    emailVerified?: boolean;
    businessName?: string;
    plan?: string;
    planExpiresAt?: Date | null;
  },
) {
  const headersList = await headers();

  const result = await auth.api.adminUpdateUser({
    body: {
      userId,
      data,
    },
    headers: headersList,
  });

  return result;
}

export async function banUser(
  userId: string,
  banReason?: string,
  banExpiresIn?: number,
) {
  const headersList = await headers();

  const result = await auth.api.banUser({
    body: {
      userId,
      banReason,
      banExpiresIn,
    },
    headers: headersList,
  });

  return result;
}

export async function unbanUser(userId: string) {
  const headersList = await headers();

  const result = await auth.api.unbanUser({
    body: {
      userId,
    },
    headers: headersList,
  });

  return result;
}

export async function deleteUser(userId: string) {
  const headersList = await headers();

  const result = await auth.api.removeUser({
    body: {
      userId,
    },
    headers: headersList,
  });

  return result;
}

export async function createAdmin(
  name: string,
  email: string,
  password: string,
) {
  const headersList = await headers();

  const result = await auth.api.createUser({
    body: {
      name,
      email,
      password,
      role: "admin",
      data: {
        businessName: "",
        emailVerified: true,
      },
    },
    headers: headersList,
  });

  return result;
}

export async function setUserRole(
  userId: string,
  role: "user" | "admin" | "superadmin",
) {
  const headersList = await headers();

  const result = await auth.api.setRole({
    body: {
      userId,
      role,
    },
    headers: headersList,
  });

  return result;
}
