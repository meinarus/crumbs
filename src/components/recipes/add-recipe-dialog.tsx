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
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2 } from "lucide-react";
import { createRecipe } from "@/actions/recipes";
import { toast } from "sonner";
import type { InventoryItem } from "@/actions/inventory";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { compressAndConvertToBase64 } from "@/lib/image-utils";
import { RecipeItemRow, type RecipeItemData } from "./recipe-item-row";

type FormData = {
  name: string;
  image: string;
  ingredients: RecipeItemData[];
  others: RecipeItemData[];
  instructions: string;
};

type RecipeDialogProps = {
  inventoryItems: InventoryItem[];
};

const initialFormData: FormData = {
  name: "",
  image: "",
  ingredients: [],
  others: [],
  instructions: "",
};

export function AddRecipeDialog({ inventoryItems }: RecipeDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState(initialFormData);
  const [ingredients, setIngredients] = useState<RecipeItemData[]>([]);
  const [others, setOthers] = useState<RecipeItemData[]>([]);

  const foodItems = useMemo(
    () => inventoryItems.filter((item) => item.category === "food"),
    [inventoryItems],
  );

  const otherItems = useMemo(
    () => inventoryItems.filter((item) => item.category === "other"),
    [inventoryItems],
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name) {
      toast.error("Please enter a recipe name.");
      return;
    }

    const rawItems = [...ingredients, ...others];
    const incompleteItem = rawItems.find(
      (item) => !item.inventoryId || !item.quantity,
    );

    if (incompleteItem) {
      toast.error("Please complete all items (selection and quantity).");
      return;
    }

    const allItems = rawItems;

    if (allItems.length === 0) {
      toast.error("Please add at least one ingredient or other item.");
      return;
    }

    startTransition(async () => {
      try {
        await createRecipe({
          name: formData.name,
          instructions: formData.instructions || undefined,
          image: formData.image || undefined,
          items: allItems.map((item) => ({
            inventoryId: item.inventoryId,
            quantity: item.quantity,
          })),
        });
        toast.success("Recipe created successfully!");
        setFormData(initialFormData);
        setIngredients([]);
        setOthers([]);
        setOpen(false);
      } catch {
        toast.error("Failed to create recipe. Please try again.");
      }
    });
  };

  const addIngredient = () => {
    setIngredients((prev) => [
      ...prev,
      { id: crypto.randomUUID(), inventoryId: "", quantity: "" },
    ]);
  };

  const removeIngredient = (id: string) => {
    setIngredients((prev) => prev.filter((item) => item.id !== id));
  };

  const updateIngredient = (
    id: string,
    field: "inventoryId" | "quantity",
    value: string,
  ) => {
    setIngredients((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    );
  };

  const addOther = () => {
    setOthers((prev) => [
      ...prev,
      { id: crypto.randomUUID(), inventoryId: "", quantity: "" },
    ]);
  };

  const removeOther = (id: string) => {
    setOthers((prev) => prev.filter((item) => item.id !== id));
  };

  const updateOther = (
    id: string,
    field: "inventoryId" | "quantity",
    value: string,
  ) => {
    setOthers((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus />
          Create Recipe
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Create Recipe</DialogTitle>
          <DialogDescription>
            Add a new recipe with ingredients and instructions.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <FieldGroup className="gap-4 py-4">
            <Field className="gap-2">
              <FieldLabel htmlFor="name">Name *</FieldLabel>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Recipe name"
              />
            </Field>

            <Field className="gap-2">
              <FieldLabel htmlFor="image">Recipe Image</FieldLabel>
              <div className="space-y-2">
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;

                    if (file.size > 2 * 1024 * 1024) {
                      toast.error("Image must be less than 2MB");
                      return;
                    }

                    try {
                      const base64 = await compressAndConvertToBase64(file);
                      setFormData((prev) => ({ ...prev, image: base64 }));
                    } catch {
                      toast.error("Failed to process image");
                    }
                  }}
                />
                {formData.image && (
                  <div className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={formData.image}
                      alt="Preview"
                      className="h-32 w-full rounded-md border object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-6 w-6"
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, image: "" }))
                      }
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            </Field>

            <Field className="gap-2">
              <FieldLabel htmlFor="instructions">Instructions</FieldLabel>
              <Textarea
                id="instructions"
                value={formData.instructions}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    instructions: e.target.value,
                  }))
                }
                placeholder="Enter cooking instructions..."
                className="min-h-[100px]"
              />
            </Field>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <FieldLabel>Ingredients</FieldLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addIngredient}
                  disabled={foodItems.length === 0}
                >
                  <Plus />
                  Add
                </Button>
              </div>
              {foodItems.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  No food items in inventory. Add some first.
                </p>
              ) : (
                <div className="space-y-2">
                  {ingredients.map((item) => (
                    <RecipeItemRow
                      key={item.id}
                      item={item}
                      items={foodItems}
                      onUpdate={updateIngredient}
                      onRemove={removeIngredient}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <FieldLabel>Others</FieldLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addOther}
                  disabled={otherItems.length === 0}
                >
                  <Plus />
                  Add
                </Button>
              </div>
              {otherItems.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  No other items in inventory. Add some first.
                </p>
              ) : (
                <div className="space-y-2">
                  {others.map((item) => (
                    <RecipeItemRow
                      key={item.id}
                      item={item}
                      items={otherItems}
                      onUpdate={updateOther}
                      onRemove={removeOther}
                    />
                  ))}
                </div>
              )}
            </div>
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
              {isPending ? "Creating..." : "Create Recipe"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
