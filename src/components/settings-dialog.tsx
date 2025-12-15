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
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldDescription,
} from "@/components/ui/field";
import { Settings } from "lucide-react";
import { updateSettings, type UserSettings } from "@/actions/settings";
import { toast } from "sonner";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

type SettingsDialogProps = {
  settings: UserSettings;
};

export function SettingsDialog({
  settings: initialSettings,
}: SettingsDialogProps) {
  const [open, setOpen] = useState(false);
  const [vatRate, setVatRate] = useState(initialSettings.vatRate);
  const [currency, setCurrency] = useState(initialSettings.currency);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    startTransition(async () => {
      try {
        await updateSettings({ vatRate, currency });
        toast.success("Settings saved successfully!");
        setOpen(false);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to save settings",
        );
      }
    });
  };

  const hasChanges =
    vatRate !== initialSettings.vatRate ||
    currency !== initialSettings.currency;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
          <Settings />
          Settings
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Configure your business settings here.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <FieldGroup className="gap-4 py-4">
            <Field className="gap-2">
              <FieldLabel htmlFor="currency">Currency</FieldLabel>
              <Input
                id="currency"
                type="text"
                maxLength={10}
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              />
              <FieldDescription>
                Symbol or code to display with costs and prices.
              </FieldDescription>
            </Field>

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
              <FieldDescription>
                This rate will be applied when VAT is enabled on recipes.
              </FieldDescription>
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
