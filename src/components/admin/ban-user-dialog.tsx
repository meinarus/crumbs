"use client";

import { useState } from "react";
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
import type { UserWithPlan } from "@/actions/admin";

type BanUserDialogProps = {
  user: UserWithPlan | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (banReason: string, banExpiresIn?: number) => Promise<void>;
};

export function BanUserDialog({
  user,
  open,
  onOpenChange,
  onConfirm,
}: BanUserDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [banReason, setBanReason] = useState("");
  const [banDays, setBanDays] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    try {
      const banExpiresIn = banDays
        ? parseInt(banDays) * 24 * 60 * 60
        : undefined;
      await onConfirm(banReason, banExpiresIn);
      onOpenChange(false);
      setBanReason("");
      setBanDays("");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Ban User</DialogTitle>
            <DialogDescription>
              Ban {user?.name} ({user?.email}). They will not be able to sign in
              until unbanned.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup className="gap-4 py-4">
            <Field className="gap-2">
              <FieldLabel htmlFor="banReason">Reason (optional)</FieldLabel>
              <Input
                id="banReason"
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                placeholder="Enter ban reason..."
              />
            </Field>
            <Field className="gap-2">
              <FieldLabel htmlFor="banDays">
                Duration in days (leave empty for permanent)
              </FieldLabel>
              <Input
                id="banDays"
                type="number"
                min="1"
                value={banDays}
                onChange={(e) => setBanDays(e.target.value)}
                placeholder="e.g., 7"
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
            <Button type="submit" variant="destructive" disabled={isLoading}>
              {isLoading ? "Banning..." : "Ban User"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
