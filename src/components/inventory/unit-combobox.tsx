"use client";

import { useState } from "react";
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
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

export const UNITS = [
  { value: "g", label: "Grams (g)", keywords: ["grams", "g"] },
  {
    value: "kg",
    label: "Kilograms (kg)",
    keywords: ["kilograms", "kg", "kilo"],
  },
  {
    value: "ml",
    label: "Milliliters (ml)",
    keywords: ["milliliters", "ml"],
  },
  {
    value: "L",
    label: "Liters (L)",
    keywords: ["liters", "L", "litres"],
  },
  {
    value: "pcs",
    label: "Pieces (pcs)",
    keywords: ["pieces", "pcs", "pc"],
  },
  { value: "oz", label: "Ounces (oz)", keywords: ["ounces", "oz"] },
  {
    value: "lb",
    label: "Pounds (lb)",
    keywords: ["pounds", "lbs"],
  },
  { value: "cup", label: "Cups", keywords: ["cups", "cup"] },
  {
    value: "tbsp",
    label: "Tablespoons (tbsp)",
    keywords: ["tablespoons", "tbsp"],
  },
  {
    value: "tsp",
    label: "Teaspoons (tsp)",
    keywords: ["teaspoons", "tsp"],
  },
  { value: "pack", label: "Packs", keywords: ["packs", "pack"] },
  { value: "box", label: "Boxes", keywords: ["boxes", "box"] },
  { value: "bottle", label: "Bottles", keywords: ["bottles", "bottle"] },
  { value: "can", label: "Cans", keywords: ["cans", "can"] },
  { value: "bag", label: "Bags", keywords: ["bags", "bag"] },
  { value: "roll", label: "Rolls", keywords: ["rolls", "roll"] },
  { value: "sheet", label: "Sheets", keywords: ["sheets", "sheet"] },
];

type UnitComboboxProps = {
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
};

export function UnitCombobox({
  value,
  onValueChange,
  className,
}: UnitComboboxProps) {
  const [open, setOpen] = useState(false);

  const selectedLabel = value
    ? (UNITS.find((u) => u.value === value)?.label ?? value)
    : "Select unit...";

  return (
    <Popover open={open} onOpenChange={setOpen} modal={true}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("justify-between", className)}
        >
          {selectedLabel}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput placeholder="Search unit..." />
          <CommandList>
            <CommandEmpty>No unit found.</CommandEmpty>
            <CommandGroup>
              {UNITS.map((unit) => (
                <CommandItem
                  key={unit.value}
                  value={unit.value}
                  keywords={unit.keywords}
                  onSelect={(currentValue) => {
                    onValueChange(currentValue === value ? "" : currentValue);
                    setOpen(false);
                  }}
                >
                  {unit.label}
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      value === unit.value ? "opacity-100" : "opacity-0",
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
