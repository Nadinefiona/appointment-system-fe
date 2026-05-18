"use client";

import Link from "next/link";
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
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  const onSubmit = handleSubmit(async (data) => {
    try {
      await login(data.email, data.password);
      toast.success("Welcome back");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Login failed");
    }
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4">
      <Card className="w-full max-w-md">
        <h1 className="font-display text-2xl text-stone-900">Sign in</h1>
        <p className="mt-1 text-sm text-stone-600">
          Use the email and password for your account.
        </p>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <Input
            label="Email"
            type="email"
            autoComplete="email"
            error={errors.email?.message}
            {...register("email")}
          />
          <Input
            label="Password"
            type="password"
            autoComplete="current-password"
            error={errors.password?.message}
            {...register("password")}
          />
          <Button type="submit" className="w-full" loading={isSubmitting}>
            Sign in
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-stone-600">
          No account?{" "}
          <Link href="/register" className="font-medium text-brand-700 hover:underline">
            Register as a client
          </Link>
        </p>
      </Card>
    </div>
  );
}
