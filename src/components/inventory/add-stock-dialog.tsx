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
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
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
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-md">
        <DialogHeader className="overflow-hidden">
          <DialogTitle className="truncate">Add Stock: {item.name}</DialogTitle>
          <DialogDescription>
            Add quantity to your existing stock.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <FieldGroup className="gap-4 py-4">
            <Field className="gap-2">
              <FieldLabel>Current Stock</FieldLabel>
              <div className="text-muted-foreground text-sm font-medium">
                {parseFloat(item.stock).toLocaleString(undefined, {
                  maximumFractionDigits: 2,
                })}{" "}
                {item.unit}
              </div>
            </Field>

            <Field className="gap-2">
              <FieldLabel htmlFor="add-stock-qty">Quantity to Add *</FieldLabel>
              <Input
                id="add-stock-qty"
                type="number"
                step="any"
                value={quantityToAdd}
                onChange={(e) => setQuantityToAdd(e.target.value)}
                placeholder="0"
                autoFocus
              />
            </Field>
          </FieldGroup>

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
