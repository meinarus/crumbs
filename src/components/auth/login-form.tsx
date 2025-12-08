"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import CrumbsLogo from "@/components/crumbs-logo";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<
    Partial<Record<keyof LoginFormData | "root", string>>
  >({});

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
    };

    const result = loginSchema.safeParse(data);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof LoginFormData, string>> = {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          fieldErrors[issue.path[0] as keyof LoginFormData] = issue.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);

    const { error } = await authClient.signIn.email({
      email: result.data.email,
      password: result.data.password,
    });

    setIsLoading(false);

    if (error) {
      toast.error(error.message ?? "Invalid email or password");
      setErrors({ root: error.message ?? "Invalid email or password" });
      return;
    }

    const session = await authClient.getSession();

    toast.success("Logged in successfully!");

    if (
      session.data?.user?.role === "admin" ||
      session.data?.user?.role === "superadmin"
    ) {
      router.replace("/admin/dashboard");
    } else {
      router.replace("/dashboard");
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Log in</h1>
                <p className="text-muted-foreground text-sm text-balance">
                  Log in to your CRUMBS account
                </p>
              </div>
              <FieldGroup className="gap-4">
                <Field className="gap-2" data-invalid={!!errors.email}>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    required
                  />
                  {errors.email && <FieldError>{errors.email}</FieldError>}
                </Field>
                <Field className="gap-2" data-invalid={!!errors.password}>
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute top-0 right-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="text-muted-foreground h-4 w-4" />
                      ) : (
                        <Eye className="text-muted-foreground h-4 w-4" />
                      )}
                      <span className="sr-only">
                        {showPassword ? "Hide password" : "Show password"}
                      </span>
                    </Button>
                  </div>
                  {errors.password && (
                    <FieldError>{errors.password}</FieldError>
                  )}
                </Field>
                {errors.root && (
                  <FieldError className="text-center">{errors.root}</FieldError>
                )}
                <Field>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Logging in..." : "Log in"}
                  </Button>
                </Field>
              </FieldGroup>
              <p className="text-muted-foreground text-center text-sm">
                Don&apos;t have an account?{" "}
                <Link
                  href="/signup"
                  className="hover:text-primary underline underline-offset-4"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </form>
          <div className="bg-muted relative hidden md:block">
            <CrumbsLogo className="absolute inset-0 m-auto size-64" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
