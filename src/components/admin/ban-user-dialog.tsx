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
import { Label } from "@/components/ui/label";
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
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Ban User</DialogTitle>
            <DialogDescription>
              Ban {user?.name} ({user?.email}). They will not be able to sign in
              until unbanned.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="banReason">Reason (optional)</Label>
              <Input
                id="banReason"
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                placeholder="Enter ban reason..."
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="banDays">
                Duration in days (leave empty for permanent)
              </Label>
              <Input
                id="banDays"
                type="number"
                min="1"
                value={banDays}
                onChange={(e) => setBanDays(e.target.value)}
                placeholder="e.g., 7"
              />
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
            <Button type="submit" variant="destructive" disabled={isLoading}>
              {isLoading ? "Banning..." : "Ban User"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
