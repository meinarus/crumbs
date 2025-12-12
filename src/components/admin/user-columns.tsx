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
          className="-ml-3"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Business Name
          <ArrowUpDown />
        </Button>
      ),
      cell: ({ row }) => (
        <span
          className="block max-w-[220px] truncate font-medium"
          title={row.getValue("businessName")}
        >
          {row.getValue("businessName")}
        </span>
      ),
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="-ml-3"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Owner Name
          <ArrowUpDown />
        </Button>
      ),
      cell: ({ row }) => (
        <span
          className="block max-w-[200px] truncate"
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
      accessorKey: "emailVerified",
      header: () => <div className="text-center">Verified</div>,
      cell: ({ row }) => {
        const verified = row.getValue("emailVerified") as boolean;
        return (
          <div className="text-center">
            <Badge variant={verified ? "default" : "secondary"}>
              {verified ? "Yes" : "No"}
            </Badge>
          </div>
        );
      },
    },
    {
      accessorKey: "plan",
      header: () => <div className="text-center">Plan</div>,
      cell: ({ row }) => {
        const user = row.original;
        const expired = isPlanExpired(user);

        if (user.plan === "free") {
          return (
            <div className="text-center">
              <Badge variant="secondary">Free</Badge>
            </div>
          );
        }

        if (expired) {
          return (
            <div className="text-center">
              <Badge
                variant="outline"
                className="text-destructive border-destructive"
              >
                Pro (Expired)
              </Badge>
            </div>
          );
        }

        return (
          <div className="text-center">
            <Badge variant="default">Pro</Badge>
          </div>
        );
      },
    },
    {
      accessorKey: "planExpiresAt",
      header: () => <div className="text-center">Expiry</div>,
      cell: ({ row }) => {
        const user = row.original;
        if (user.plan === "free") return <div className="text-center">—</div>;
        return (
          <div className="text-center">{formatDate(user.planExpiresAt)}</div>
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
