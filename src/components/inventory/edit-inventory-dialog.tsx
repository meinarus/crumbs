"use client";

import { useState, useTransition, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateInventoryItem, type InventoryItem } from "@/actions/inventory";
import { toast } from "sonner";
import { UnitCombobox } from "./unit-combobox";

type EditInventoryDialogProps = {
  item: InventoryItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type FormData = {
  name: string;
  category: string;
  supplier: string;
  purchaseCost: string;
  purchaseQuantity: string;
  stock: string;
  unit: string;
};

export function EditInventoryDialog({
  item,
  open,
  onOpenChange,
}: EditInventoryDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState<FormData>(() => ({
    name: item?.name ?? "",
    category: item?.category ?? "",
    supplier: item?.supplier ?? "",
    purchaseCost: item ? parseFloat(item.purchaseCost).toString() : "",
    purchaseQuantity: item ? parseFloat(item.purchaseQuantity).toString() : "",
    stock: item ? parseFloat(item.stock).toString() : "",
    unit: item?.unit ?? "",
  }));

  const unitCostPreview = useMemo(() => {
    const cost = parseFloat(formData.purchaseCost);
    const qty = parseFloat(formData.purchaseQuantity);
    if (isNaN(cost) || isNaN(qty) || qty === 0) return "—";
    const unitCost = cost / qty;
    return unitCost.toLocaleString(undefined, { maximumFractionDigits: 4 });
  }, [formData.purchaseCost, formData.purchaseQuantity]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!item) return;

    if (
      !formData.name ||
      !formData.category ||
      !formData.purchaseCost ||
      !formData.purchaseQuantity ||
      !formData.unit
    ) {
      toast.error("Please fill in all required fields.");
      return;
    }

    startTransition(async () => {
      try {
        await updateInventoryItem(item.id, {
          name: formData.name,
          category: formData.category,
          supplier: formData.supplier || undefined,
          purchaseCost: formData.purchaseCost,
          purchaseQuantity: formData.purchaseQuantity,
          stock: formData.stock,
          unit: formData.unit,
        });
        toast.success("Item updated successfully!");
        onOpenChange(false);
      } catch {
        toast.error("Failed to update item. Please try again.");
      }
    });
  };

  const updateField = <K extends keyof FormData>(
    field: K,
    value: FormData[K],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Inventory Item</DialogTitle>
          <DialogDescription>
            Update the details of this inventory item.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">
                Name *
              </Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => updateField("name", e.target.value)}
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-category" className="text-right">
                Category *
              </Label>
              <Select
                value={formData.category}
                onValueChange={(v) => updateField("category", v)}
              >
                <SelectTrigger className="col-span-3 w-full">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="food">Food</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-supplier" className="text-right">
                Supplier
              </Label>
              <Input
                id="edit-supplier"
                value={formData.supplier}
                onChange={(e) => updateField("supplier", e.target.value)}
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-purchaseCost" className="text-right">
                Purchase Cost *
              </Label>
              <div className="col-span-3 flex items-center gap-2">
                <Input
                  id="edit-purchaseCost"
                  type="number"
                  step="any"
                  value={formData.purchaseCost}
                  onChange={(e) => updateField("purchaseCost", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-purchaseQuantity" className="text-right">
                Purchase Qty *
              </Label>
              <Input
                id="edit-purchaseQuantity"
                type="number"
                step="any"
                value={formData.purchaseQuantity}
                onChange={(e) =>
                  updateField("purchaseQuantity", e.target.value)
                }
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-stock" className="text-right">
                Current Stock *
              </Label>
              <Input
                id="edit-stock"
                type="number"
                step="any"
                value={formData.stock}
                onChange={(e) => updateField("stock", e.target.value)}
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Unit *</Label>
              <UnitCombobox
                value={formData.unit}
                onValueChange={(value) => updateField("unit", value)}
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-muted-foreground text-right">
                Unit Cost
              </Label>
              <div className="text-muted-foreground col-span-3 text-sm">
                {unitCostPreview} {formData.unit && `per ${formData.unit}`}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
