"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth/AuthProvider";
import { loginSchema, type LoginForm } from "@/lib/validations/auth";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

export default function LoginPage() {
  const { login } = useAuth();
  const [ready, setReady] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  useEffect(() => {
    setReady(true);
  }, []);

  const submitLogin = handleSubmit(
    async (data) => {
      try {
        clearErrors("root");
        await login(data.email, data.password);
      } catch (e) {
        const message = e instanceof Error ? e.message : "Login failed";
        setError("root", { message });
        toast.error(message);
      }
    },
    () => {
        toast.error("Check your email and password.");
    },
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4">
      <Card className="w-full max-w-md">
        <h1 className="font-display text-2xl text-stone-900">Sign in</h1>
        <p className="mt-1 text-sm text-stone-600">Sign in with your email and password.</p>
        <form
          className="mt-6 space-y-4"
          method="post"
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            void submitLogin(e);
          }}
        >
          {ready ? (
            <>
              <Input
                label="Email"
                type="email"
                autoComplete="email"
                disabled={isSubmitting}
                error={errors.email?.message}
                {...register("email")}
              />
              <Input
                label="Password"
                type="password"
                showPasswordToggle
                autoComplete="current-password"
                disabled={isSubmitting}
                error={errors.password?.message}
                {...register("password")}
              />
            </>
          ) : (
            <>
              <Input label="Email" type="email" disabled autoComplete="email" />
              <Input
                label="Password"
                type="password"
                disabled
                autoComplete="current-password"
              />
            </>
          )}
          <Button
            type="button"
            className="w-full"
            loading={isSubmitting}
            disabled={!ready || isSubmitting}
            onClick={() => void submitLogin()}
          >
            Sign in
          </Button>
          {errors.root?.message && (
            <p className="text-sm text-red-600">{errors.root.message}</p>
          )}
        </form>
        <p className="mt-4 text-center text-sm text-stone-600">
          No account?{" "}
          <Link href="/register" className="font-medium text-brand-700 hover:underline">
            Create account
          </Link>
        </p>
      </Card>
    </div>
  );
}
