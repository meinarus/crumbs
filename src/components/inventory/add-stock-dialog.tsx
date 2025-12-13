"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addStock, type InventoryItem } from "@/actions/inventory";

type AddStockDialogProps = {
  item: InventoryItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function AddStockDialog({
  item,
  open,
  onOpenChange,
}: AddStockDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [quantityToAdd, setQuantityToAdd] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!item || !quantityToAdd || parseFloat(quantityToAdd) <= 0) {
      return;
    }

    startTransition(async () => {
      try {
        await addStock(item.id, quantityToAdd);
        toast.success("Stock added successfully");
        onOpenChange(false);
      } catch {
        toast.error("Failed to add stock");
      }
    });
  };

  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Stock: {item.name}</DialogTitle>
          <DialogDescription>
            Add quantity to your existing stock.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Current Stock</Label>
            <div className="text-muted-foreground col-span-3 text-sm font-medium">
              {parseFloat(item.stock).toLocaleString(undefined, {
                maximumFractionDigits: 2,
              })}{" "}
              {item.unit}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="add-stock-qty" className="text-right">
              Quantity to Add *
            </Label>
            <Input
              id="add-stock-qty"
              type="number"
              step="any"
              value={quantityToAdd}
              onChange={(e) => setQuantityToAdd(e.target.value)}
              className="col-span-3"
              placeholder="0"
              autoFocus
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || !quantityToAdd}>
              {isPending && <Loader2 className="animate-spin" />}
              Add Stock
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
