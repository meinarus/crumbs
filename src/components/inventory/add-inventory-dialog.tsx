"use client";

import { useState, useTransition, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import { addInventoryItem } from "@/actions/inventory";
import { toast } from "sonner";
import { UnitCombobox } from "./unit-combobox";

type FormData = {
  name: string;
  category: string;
  supplier: string;
  purchaseCost: string;
  purchaseQuantity: string;
  unit: string;
};

const initialFormData: FormData = {
  name: "",
  category: "",
  supplier: "",
  purchaseCost: "",
  purchaseQuantity: "",
  unit: "",
};

export function AddInventoryDialog() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState<FormData>(initialFormData);

  const unitCostPreview = useMemo(() => {
    const cost = parseFloat(formData.purchaseCost);
    const qty = parseFloat(formData.purchaseQuantity);
    if (isNaN(cost) || isNaN(qty) || qty === 0) return "—";
    const unitCost = cost / qty;
    return unitCost.toLocaleString(undefined, { maximumFractionDigits: 4 });
  }, [formData.purchaseCost, formData.purchaseQuantity]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

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
        await addInventoryItem({
          name: formData.name,
          category: formData.category,
          supplier: formData.supplier || undefined,
          purchaseCost: formData.purchaseCost,
          purchaseQuantity: formData.purchaseQuantity,
          unit: formData.unit,
        });
        toast.success("Item added successfully!");
        setFormData(initialFormData);
        setOpen(false);
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to add item. Please try again.",
        );
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus />
          Add Item
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Inventory Item</DialogTitle>
          <DialogDescription>
            Add a new item to your inventory. Unit cost will be calculated
            automatically.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <FieldGroup className="gap-4 py-4">
            <Field className="gap-2">
              <FieldLabel htmlFor="name">Name *</FieldLabel>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="Item name"
              />
            </Field>

            <Field className="gap-2">
              <FieldLabel htmlFor="category">Category *</FieldLabel>
              <Select
                value={formData.category}
                onValueChange={(v) => updateField("category", v)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ingredient">Ingredient</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </Field>

            <Field className="gap-2">
              <FieldLabel htmlFor="supplier">Supplier</FieldLabel>
              <Input
                id="supplier"
                value={formData.supplier}
                onChange={(e) => updateField("supplier", e.target.value)}
                placeholder="Supplier name"
              />
            </Field>

            <Field className="gap-2">
              <FieldLabel htmlFor="purchaseCost">Purchase Cost *</FieldLabel>
              <Input
                id="purchaseCost"
                type="number"
                step="any"
                value={formData.purchaseCost}
                onChange={(e) => updateField("purchaseCost", e.target.value)}
                placeholder="0.00"
              />
            </Field>

            <Field className="gap-2">
              <FieldLabel htmlFor="purchaseQuantity">Purchase Qty *</FieldLabel>
              <Input
                id="purchaseQuantity"
                type="number"
                step="any"
                value={formData.purchaseQuantity}
                onChange={(e) =>
                  updateField("purchaseQuantity", e.target.value)
                }
                placeholder="0"
              />
            </Field>

            <Field className="gap-2">
              <FieldLabel>Unit *</FieldLabel>
              <UnitCombobox
                value={formData.unit}
                onValueChange={(value) => updateField("unit", value)}
              />
            </Field>

            <Field className="gap-2">
              <FieldLabel className="text-muted-foreground">
                Unit Cost
              </FieldLabel>
              <div className="text-muted-foreground text-sm">
                {unitCostPreview} {formData.unit && `per ${formData.unit}`}
              </div>
            </Field>
          </FieldGroup>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Adding..." : "Add Item"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
