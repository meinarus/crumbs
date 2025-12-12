"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, ArrowUpDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { UserWithPlan } from "@/actions/admin";

function formatDate(date: Date | null): string {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

type AdminColumnsProps = {
  onEdit: (user: UserWithPlan) => void;
  onBan: (user: UserWithPlan) => void;
  onUnban: (user: UserWithPlan) => void;
  onDelete: (user: UserWithPlan) => void;
};

export function getAdminColumns({
  onEdit,
  onBan,
  onUnban,
  onDelete,
}: AdminColumnsProps): ColumnDef<UserWithPlan>[] {
  return [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="-ml-3"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown />
        </Button>
      ),
      cell: ({ row }) => (
        <span
          className="block max-w-[200px] truncate font-medium"
          title={row.getValue("name")}
        >
          {row.getValue("name")}
        </span>
      ),
    },
    {
      accessorKey: "email",
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="-ml-3"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Email
          <ArrowUpDown />
        </Button>
      ),
      cell: ({ row }) => (
        <span
          className="block max-w-[250px] truncate"
          title={row.getValue("email")}
        >
          {row.getValue("email")}
        </span>
      ),
    },
    {
      accessorKey: "role",
      header: () => <div className="text-center">Role</div>,
      cell: ({ row }) => {
        const role = row.getValue("role") as string;
        return (
          <div className="text-center">
            <Badge variant={role === "superadmin" ? "default" : "secondary"}>
              {role === "superadmin" ? "Super Admin" : "Admin"}
            </Badge>
          </div>
        );
      },
    },
    {
      accessorKey: "banned",
      header: () => <div className="text-center">Status</div>,
      cell: ({ row }) => {
        const banned = row.getValue("banned") as boolean;
        return (
          <div className="text-center">
            <Badge variant={banned ? "destructive" : "default"}>
              {banned ? "Banned" : "Active"}
            </Badge>
          </div>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <div className="text-center">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Joined
            <ArrowUpDown />
          </Button>
        </div>
      ),
      cell: ({ row }) => (
        <div className="text-center">
          {formatDate(row.getValue("createdAt"))}
        </div>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const admin = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onEdit(admin)}>
                Edit
              </DropdownMenuItem>
              {admin.banned ? (
                <DropdownMenuItem onClick={() => onUnban(admin)}>
                  Unban
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={() => onBan(admin)}>
                  Ban
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(admin)}
                className="text-destructive"
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}
