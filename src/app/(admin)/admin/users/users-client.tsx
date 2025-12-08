"use client";

import { useState, useEffect, useCallback } from "react";
import { DataTable } from "@/components/data-table";
import { getUserColumns } from "./user-columns";
import { getAdminColumns } from "./admin-columns";
import { EditUserDialog } from "@/components/admin/edit-user-dialog";
import { BanUserDialog } from "@/components/admin/ban-user-dialog";
import { DeleteUserDialog } from "@/components/admin/delete-user-dialog";
import { CreateAdminDialog } from "@/components/admin/create-admin-dialog";
import {
  listUsers,
  updateUser,
  banUser,
  unbanUser,
  deleteUser,
  createAdmin,
  setUserRole,
  type UserWithPlan,
} from "@/actions/admin";
import { toast } from "sonner";

type UsersClientProps = {
  isSuperAdmin: boolean;
};

export function UsersClient({ isSuperAdmin }: UsersClientProps) {
  const [users, setUsers] = useState<UserWithPlan[]>([]);
  const [admins, setAdmins] = useState<UserWithPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [editUser, setEditUser] = useState<UserWithPlan | null>(null);
  const [banUserData, setBanUserData] = useState<UserWithPlan | null>(null);
  const [deleteUserData, setDeleteUserData] = useState<UserWithPlan | null>(
    null,
  );

  const fetchData = useCallback(async () => {
    try {
      const { users: allUsers } = await listUsers();

      const regularUsers = allUsers.filter((u) => !u.role || u.role === "user");
      const adminUsers = allUsers.filter(
        (u) => u.role === "admin" || u.role === "superadmin",
      );

      setUsers(regularUsers);
      if (isSuperAdmin) {
        setAdmins(adminUsers);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast.error("Failed to load users");
    } finally {
      setIsLoading(false);
    }
  }, [isSuperAdmin]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleEditUser = async (data: {
    name: string;
    email: string;
    emailVerified: boolean;
    role?: string;
    businessName: string;
    plan: string;
    planExpiresAt: Date | null;
  }) => {
    if (!editUser) return;
    try {
      await updateUser(editUser.id, data);
      if (data.role && data.role !== editUser.role) {
        await setUserRole(
          editUser.id,
          data.role as "user" | "admin" | "superadmin",
        );
      }
      toast.success("User updated successfully");
      fetchData();
    } catch (error) {
      console.error("Failed to update user:", error);
      toast.error("Failed to update user");
    }
  };

  const handleBanUser = async (banReason: string, banExpiresIn?: number) => {
    if (!banUserData) return;
    try {
      await banUser(banUserData.id, banReason, banExpiresIn);
      toast.success("User banned successfully");
      fetchData();
    } catch (error) {
      console.error("Failed to ban user:", error);
      toast.error("Failed to ban user");
    }
  };

  const handleUnbanUser = async (user: UserWithPlan) => {
    try {
      await unbanUser(user.id);
      toast.success("User unbanned successfully");
      fetchData();
    } catch (error) {
      console.error("Failed to unban user:", error);
      toast.error("Failed to unban user");
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteUserData) return;
    try {
      await deleteUser(deleteUserData.id);
      toast.success("User deleted successfully");
      fetchData();
    } catch (error) {
      console.error("Failed to delete user:", error);
      toast.error("Failed to delete user");
    }
  };

  const handleCreateAdmin = async (data: {
    name: string;
    email: string;
    password: string;
  }) => {
    try {
      await createAdmin(data.name, data.email, data.password);
      toast.success("Admin created successfully");
      fetchData();
    } catch (error) {
      console.error("Failed to create admin:", error);
      toast.error("Failed to create admin");
    }
  };

  const userColumns = getUserColumns({
    onEdit: setEditUser,
    onBan: setBanUserData,
    onUnban: handleUnbanUser,
    onDelete: setDeleteUserData,
  });

  const adminColumns = getAdminColumns({
    onEdit: setEditUser,
    onBan: setBanUserData,
    onUnban: handleUnbanUser,
    onDelete: setDeleteUserData,
  });

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Business Users</h1>
          <p className="text-muted-foreground">
            Manage business users and their subscriptions
          </p>
        </div>
        {isLoading ? (
          <div className="flex h-64 items-center justify-center rounded-md border">
            <p className="text-muted-foreground">Loading business users...</p>
          </div>
        ) : (
          <DataTable
            columns={userColumns}
            data={users}
            searchPlaceholder="Search business users..."
          />
        )}
      </div>

      {isSuperAdmin && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Admins</h1>
              <p className="text-muted-foreground">Manage admin users</p>
            </div>
            <CreateAdminDialog onSave={handleCreateAdmin} />
          </div>
          {isLoading ? (
            <div className="flex h-64 items-center justify-center rounded-md border">
              <p className="text-muted-foreground">Loading admins...</p>
            </div>
          ) : (
            <DataTable
              columns={adminColumns}
              data={admins}
              searchPlaceholder="Search admins..."
            />
          )}
        </div>
      )}

      <EditUserDialog
        user={editUser}
        open={!!editUser}
        onOpenChange={(open) => !open && setEditUser(null)}
        onSave={handleEditUser}
      />
      <BanUserDialog
        user={banUserData}
        open={!!banUserData}
        onOpenChange={(open) => !open && setBanUserData(null)}
        onConfirm={handleBanUser}
      />
      <DeleteUserDialog
        user={deleteUserData}
        open={!!deleteUserData}
        onOpenChange={(open) => !open && setDeleteUserData(null)}
        onConfirm={handleDeleteUser}
      />
    </div>
  );
}
