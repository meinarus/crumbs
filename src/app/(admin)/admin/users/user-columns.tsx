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

function isPlanExpired(user: UserWithPlan): boolean {
  if (user.plan !== "pro" || !user.planExpiresAt) return false;
  return new Date(user.planExpiresAt) < new Date();
}

function formatDate(date: Date | null): string {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

type UserColumnsProps = {
  onEdit: (user: UserWithPlan) => void;
  onBan: (user: UserWithPlan) => void;
  onUnban: (user: UserWithPlan) => void;
  onDelete: (user: UserWithPlan) => void;
};

export function getUserColumns({
  onEdit,
  onBan,
  onUnban,
  onDelete,
}: UserColumnsProps): ColumnDef<UserWithPlan>[] {
  return [
    {
      accessorKey: "businessName",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Business Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Owner Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
    },
    {
      accessorKey: "email",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Email
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
    },
    {
      accessorKey: "banned",
      header: "Status",
      cell: ({ row }) => {
        const banned = row.getValue("banned") as boolean;
        return (
          <Badge variant={banned ? "destructive" : "default"}>
            {banned ? "Banned" : "Active"}
          </Badge>
        );
      },
    },
    {
      accessorKey: "emailVerified",
      header: "Verified",
      cell: ({ row }) => {
        const verified = row.getValue("emailVerified") as boolean;
        return (
          <Badge variant={verified ? "default" : "secondary"}>
            {verified ? "Yes" : "No"}
          </Badge>
        );
      },
    },
    {
      accessorKey: "plan",
      header: "Plan",
      cell: ({ row }) => {
        const user = row.original;
        const expired = isPlanExpired(user);

        if (user.plan === "free") {
          return <Badge variant="secondary">Free</Badge>;
        }

        if (expired) {
          return (
            <Badge
              variant="outline"
              className="text-destructive border-destructive"
            >
              Pro (Expired)
            </Badge>
          );
        }

        return <Badge variant="default">Pro</Badge>;
      },
    },
    {
      accessorKey: "planExpiresAt",
      header: "Expiry",
      cell: ({ row }) => {
        const user = row.original;
        if (user.plan === "free") return "—";
        return formatDate(user.planExpiresAt);
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Joined
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => formatDate(row.getValue("createdAt")),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const user = row.original;

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
              <DropdownMenuItem onClick={() => onEdit(user)}>
                Edit
              </DropdownMenuItem>
              {user.banned ? (
                <DropdownMenuItem onClick={() => onUnban(user)}>
                  Unban
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={() => onBan(user)}>
                  Ban
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(user)}
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
