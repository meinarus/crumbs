import { Suspense } from "react";
import {
  Users,
  UserCheck,
  UserX,
  BadgeCheck,
  Globe,
  Shield,
} from "lucide-react";

import { requireAdminSession } from "@/lib/auth-helpers";
import { getAdminDashboardStats } from "@/actions/admin-stats";
import { StatCard, StatCardSkeleton } from "@/components/admin/stat-card";
import {
  RecentUsersTable,
  RecentUsersTableSkeleton,
} from "@/components/admin/recent-users-table";

async function StatCards() {
  const session = await requireAdminSession();
  const isSuperadmin = session.role === "superadmin";
  const stats = await getAdminDashboardStats(isSuperadmin);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {isSuperadmin && (
        <>
          <StatCard
            title="Total Accounts"
            value={stats.totalAccounts ?? 0}
            icon={Globe}
            description="All roles"
          />
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            icon={Users}
            description="Regular users"
          />
          <StatCard
            title="Total Admins"
            value={stats.totalAdmins ?? 0}
            icon={Shield}
            description="Excludes superadmins"
          />
          <StatCard
            title="Active Accounts"
            value={stats.activeAccounts ?? 0}
            icon={UserCheck}
            description="All roles"
          />
          <StatCard
            title="Banned Accounts"
            value={stats.bannedAccounts ?? 0}
            icon={UserX}
            description="All roles"
          />
          <StatCard
            title="Verified Users"
            value={stats.verifiedUsers}
            icon={BadgeCheck}
            description="Regular users"
          />
        </>
      )}
      {!isSuperadmin && (
        <>
          <StatCard title="Total Users" value={stats.totalUsers} icon={Users} />
          <StatCard
            title="Active Users"
            value={stats.activeUsers}
            icon={UserCheck}
          />
          <StatCard
            title="Banned Users"
            value={stats.bannedUsers}
            icon={UserX}
          />
          <StatCard
            title="Verified Users"
            value={stats.verifiedUsers}
            icon={BadgeCheck}
          />
        </>
      )}
    </div>
  );
}

function StatCardsSkeleton({ count }: { count: number }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <StatCardSkeleton key={i} />
      ))}
    </div>
  );
}

export default async function AdminDashboardPage() {
  const session = await requireAdminSession();
  const isSuperadmin = session.role === "superadmin";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Admin overview and statistics</p>
      </div>
      <Suspense fallback={<StatCardsSkeleton count={isSuperadmin ? 6 : 4} />}>
        <StatCards />
      </Suspense>
      <Suspense fallback={<RecentUsersTableSkeleton />}>
        <RecentUsersTable />
      </Suspense>
    </div>
  );
}
