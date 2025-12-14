"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, ArrowUpDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { InventoryItem } from "@/actions/inventory";

function formatCurrency(value: string | number, currency: string): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return `${currency}0`;
  const formatted = num.toLocaleString(undefined, { maximumFractionDigits: 2 });
  return `${currency}${formatted}`;
}

function formatQuantity(value: string | number): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "0";
  return num.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function calculateUnitCost(
  purchaseCost: string,
  purchaseQuantity: string,
  currency: string,
): string {
  const cost = parseFloat(purchaseCost);
  const qty = parseFloat(purchaseQuantity);
  if (isNaN(cost) || isNaN(qty) || qty === 0) return `${currency}0`;
  const unitCost = (cost / qty).toLocaleString(undefined, {
    maximumFractionDigits: 4,
  });
  return `${currency}${unitCost}`;
}

type InventoryColumnsProps = {
  currency: string;
  onEdit: (item: InventoryItem) => void;
  onDelete: (item: InventoryItem) => void;
  onAddStock: (item: InventoryItem) => void;
};

export function getInventoryColumns({
  currency,
  onEdit,
  onDelete,
  onAddStock,
}: InventoryColumnsProps): ColumnDef<InventoryItem>[] {
  return [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="-ml-3"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Item
          <ArrowUpDown />
        </Button>
      ),
      cell: ({ row }) => (
        <span
          className="block max-w-[250px] truncate font-medium"
          title={row.getValue("name")}
        >
          {row.getValue("name")}
        </span>
      ),
    },
    {
      accessorKey: "category",
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="-ml-3"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Category
          <ArrowUpDown />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="capitalize">{row.getValue("category")}</span>
      ),
    },
    {
      id: "supplier",
      accessorFn: (row) => row.supplier ?? "",
      header: "Supplier",
      cell: ({ row }) => (
        <span
          className="block max-w-[200px] truncate"
          title={row.getValue("supplier") || ""}
        >
          {row.getValue("supplier") || "—"}
        </span>
      ),
    },
    {
      accessorKey: "purchaseCost",
      header: ({ column }) => (
        <div className="flex justify-end">
          <Button
            variant="ghost"
            className="-mr-3"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <ArrowUpDown />
            Purchase Cost
          </Button>
        </div>
      ),
      cell: ({ row }) => (
        <div className="text-right">
          {formatCurrency(row.getValue("purchaseCost"), currency)}
        </div>
      ),
    },
    {
      accessorKey: "purchaseQuantity",
      header: () => <div className="text-right">Purchase Qty</div>,
      cell: ({ row }) => (
        <div className="text-right">
          {formatQuantity(row.getValue("purchaseQuantity"))}
        </div>
      ),
    },
    {
      accessorKey: "unit",
      header: "Unit",
    },
    {
      id: "unitCost",
      accessorFn: (row) => {
        const cost = parseFloat(row.purchaseCost);
        const qty = parseFloat(row.purchaseQuantity);
        if (isNaN(cost) || isNaN(qty) || qty === 0) return 0;
        return cost / qty;
      },
      header: ({ column }) => (
        <div className="flex justify-end">
          <Button
            variant="ghost"
            className="-mr-3"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <ArrowUpDown />
            Unit Cost
          </Button>
        </div>
      ),
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="text-right">
            {calculateUnitCost(
              item.purchaseCost,
              item.purchaseQuantity,
              currency,
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "stock",
      header: ({ column }) => (
        <div className="flex justify-end">
          <Button
            variant="ghost"
            className="-mr-3"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <ArrowUpDown />
            Stock
          </Button>
        </div>
      ),
      cell: ({ row }) => (
        <div className="text-right">
          {formatQuantity(row.getValue("stock"))}
        </div>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const item = row.original;

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
              <DropdownMenuItem onClick={() => onAddStock(item)}>
                Add Stock
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(item)}>
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(item)}
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
