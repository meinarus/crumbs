"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Trash2, Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { InventoryItem } from "@/actions/inventory";

export type RecipeItemData = {
  id: string;
  inventoryId: string;
  quantity: string;
};

type RecipeItemRowProps = {
  item: RecipeItemData;
  items: InventoryItem[];
  onUpdate: (
    id: string,
    field: "inventoryId" | "quantity",
    value: string,
  ) => void;
  onRemove: (id: string) => void;
};

export function RecipeItemRow({
  item,
  items,
  onUpdate,
  onRemove,
}: RecipeItemRowProps) {
  const [open, setOpen] = useState(false);
  const selectedItem = items.find((i) => i.id === item.inventoryId);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Popover open={open} onOpenChange={setOpen} modal={true}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="min-w-0 flex-1 justify-between overflow-hidden"
          >
            <span className="truncate">
              {selectedItem ? selectedItem.name : "Select item..."}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0">
          <Command>
            <CommandInput placeholder="Search item..." />
            <CommandList>
              <CommandEmpty>No item found.</CommandEmpty>
              <CommandGroup>
                {items.map((inventoryItem) => (
                  <CommandItem
                    key={inventoryItem.id}
                    value={inventoryItem.name}
                    onSelect={() => {
                      onUpdate(item.id, "inventoryId", inventoryItem.id);
                      setOpen(false);
                    }}
                    className="overflow-hidden"
                  >
                    <span className="truncate">{inventoryItem.name}</span>
                    <Check
                      className={cn(
                        "ml-auto h-4 w-4 shrink-0",
                        item.inventoryId === inventoryItem.id
                          ? "opacity-100"
                          : "opacity-0",
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <div className="flex items-center gap-2">
        <Input
          type="number"
          step="any"
          placeholder="Qty"
          className="w-20"
          value={item.quantity}
          onChange={(e) => onUpdate(item.id, "quantity", e.target.value)}
        />
        {selectedItem && (
          <span className="text-muted-foreground w-10 text-sm">
            {selectedItem.unit}
          </span>
        )}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => onRemove(item.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
