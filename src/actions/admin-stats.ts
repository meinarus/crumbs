"use server";

import { db } from "@/db/index";
import { user } from "@/db/schema/auth";
import { count, eq, and, or, isNull, ne } from "drizzle-orm";

export type AdminDashboardStats = {
  totalUsers: number;
  activeUsers: number;
  bannedUsers: number;
  verifiedUsers: number;
  totalAccounts?: number;
  totalAdmins?: number;
  activeAccounts?: number;
  bannedAccounts?: number;
};

export async function getAdminDashboardStats(
  isSuperadmin: boolean,
): Promise<AdminDashboardStats> {
  const userRoleCondition = or(eq(user.role, "user"), isNull(user.role));

  const [
    totalUsersResult,
    activeUsersResult,
    bannedUsersResult,
    verifiedUsersResult,
  ] = await Promise.all([
    db.select({ count: count() }).from(user).where(userRoleCondition),
    db
      .select({ count: count() })
      .from(user)
      .where(
        and(userRoleCondition, or(eq(user.banned, false), isNull(user.banned))),
      ),
    db
      .select({ count: count() })
      .from(user)
      .where(and(userRoleCondition, eq(user.banned, true))),
    db
      .select({ count: count() })
      .from(user)
      .where(and(userRoleCondition, eq(user.emailVerified, true))),
    db
      .select({ count: count() })
      .from(user)
      .where(and(userRoleCondition, eq(user.emailVerified, true))),
  ]);

  const stats: AdminDashboardStats = {
    totalUsers: totalUsersResult[0]?.count ?? 0,
    activeUsers: activeUsersResult[0]?.count ?? 0,
    bannedUsers: bannedUsersResult[0]?.count ?? 0,
    verifiedUsers: verifiedUsersResult[0]?.count ?? 0,
  };

  if (isSuperadmin) {
    const [
      totalAccountsResult,
      totalAdminsResult,
      activeAccountsResult,
      bannedAccountsResult,
    ] = await Promise.all([
      db.select({ count: count() }).from(user),
      db.select({ count: count() }).from(user).where(eq(user.role, "admin")),
      db
        .select({ count: count() })
        .from(user)
        .where(or(eq(user.banned, false), isNull(user.banned))),
      db.select({ count: count() }).from(user).where(eq(user.banned, true)),
    ]);

    stats.totalAccounts = totalAccountsResult[0]?.count ?? 0;
    stats.totalAdmins = totalAdminsResult[0]?.count ?? 0;
    stats.activeAccounts = activeAccountsResult[0]?.count ?? 0;
    stats.bannedAccounts = bannedAccountsResult[0]?.count ?? 0;
  }

  return stats;
}
