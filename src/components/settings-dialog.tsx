"use client";

import { useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Settings } from "lucide-react";
import { updateVatRate } from "@/actions/settings";
import { toast } from "sonner";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

type SettingsDialogProps = {
  vatRate: string;
};

export function SettingsDialog({
  vatRate: initialVatRate,
}: SettingsDialogProps) {
  const [open, setOpen] = useState(false);
  const [vatRate, setVatRate] = useState(initialVatRate);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    startTransition(async () => {
      try {
        await updateVatRate(vatRate);
        toast.success("Settings saved successfully!");
        setOpen(false);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to save settings",
        );
      }
    });
  };

  const hasChanges = vatRate !== initialVatRate;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
          <Settings />
          Settings
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Configure your business settings here.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <FieldGroup className="gap-4 py-4">
            <Field className="gap-2">
              <FieldLabel htmlFor="vatRate">VAT Rate (%)</FieldLabel>
              <Input
                id="vatRate"
                type="number"
                step="any"
                min="0"
                max="100"
                value={vatRate}
                onChange={(e) => setVatRate(e.target.value)}
                placeholder="0"
              />
              <p className="text-muted-foreground text-xs">
                This rate will be applied when VAT is enabled on recipes.
              </p>
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
            <Button type="submit" disabled={!hasChanges || isPending}>
              {isPending ? "Saving..." : "Save Settings"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
