"use client";

import { useState, useEffect } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import type { UserWithPlan } from "@/actions/admin";

type EditUserDialogProps = {
  user: UserWithPlan | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: {
    name: string;
    email: string;
    emailVerified: boolean;
    role?: string;
    businessName: string;
    plan: string;
    planExpiresAt: Date | null;
  }) => Promise<void>;
};

export function EditUserDialog({
  user,
  open,
  onOpenChange,
  onSave,
}: EditUserDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [emailVerified, setEmailVerified] = useState(
    user?.emailVerified ?? false,
  );
  const [businessName, setBusinessName] = useState(user?.businessName ?? "");
  const [plan, setPlan] = useState(user?.plan ?? "free");
  const [planExpiresAt, setPlanExpiresAt] = useState(
    user?.planExpiresAt
      ? new Date(user.planExpiresAt).toISOString().split("T")[0]
      : "",
  );

  const [isAdmin, setIsAdmin] = useState(false);
  const [role, setRole] = useState<string>("admin");

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setEmailVerified(user.emailVerified);
      setBusinessName(user.businessName);
      setPlan(user.plan ?? "free");
      setPlanExpiresAt(
        user.planExpiresAt
          ? new Date(user.planExpiresAt).toISOString().split("T")[0]
          : "",
      );
      const userIsAdmin = user.role === "admin" || user.role === "superadmin";
      setIsAdmin(userIsAdmin);
      if (userIsAdmin) {
        setRole(user.role ?? "admin");
      }
    }
  }, [user]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    try {
      await onSave({
        name,
        email,
        emailVerified,
        role: isAdmin ? role : undefined,
        businessName,
        plan,
        planExpiresAt:
          plan === "pro" && planExpiresAt ? new Date(planExpiresAt) : null,
      });
      onOpenChange(false);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit {isAdmin ? "Admin" : "User"}</DialogTitle>
            <DialogDescription>
              Make changes to the {isAdmin ? "admin" : "user"} profile here.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup className="gap-4 py-4">
            {!isAdmin && (
              <Field className="gap-2">
                <FieldLabel htmlFor="businessName">Business Name</FieldLabel>
                <Input
                  id="businessName"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder={user?.businessName}
                  required
                />
              </Field>
            )}
            <Field className="gap-2">
              <FieldLabel htmlFor="name">
                {isAdmin ? "Name" : "Owner Name"}
              </FieldLabel>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={user?.name}
                required
              />
            </Field>
            {isAdmin && (
              <Field className="gap-2">
                <FieldLabel htmlFor="role">Role</FieldLabel>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="superadmin">Super Admin</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            )}
            <Field className="gap-2">
              <div className="flex items-center justify-between">
                <FieldLabel htmlFor="email">Email</FieldLabel>
                {!isAdmin && (
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="emailVerified"
                      checked={emailVerified}
                      onCheckedChange={(checked) => setEmailVerified(!!checked)}
                    />
                    <label
                      htmlFor="emailVerified"
                      className="text-sm font-normal"
                    >
                      Verified
                    </label>
                  </div>
                )}
              </div>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={user?.email}
                required
              />
            </Field>
            {!isAdmin && (
              <>
                <Field className="gap-2">
                  <FieldLabel htmlFor="plan">Plan</FieldLabel>
                  <Select value={plan} onValueChange={setPlan}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a plan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">Free</SelectItem>
                      <SelectItem value="pro">Pro</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                {plan === "pro" && (
                  <Field className="gap-2">
                    <FieldLabel htmlFor="planExpiresAt">
                      Plan Expiry Date
                    </FieldLabel>
                    <Input
                      id="planExpiresAt"
                      type="date"
                      value={planExpiresAt}
                      onChange={(e) => setPlanExpiresAt(e.target.value)}
                    />
                  </Field>
                )}
              </>
            )}
          </FieldGroup>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
