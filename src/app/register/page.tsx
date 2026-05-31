"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { registerRequest } from "@/lib/auth/api";
import { registerSchema, type RegisterForm } from "@/lib/validations/auth";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

export default function RegisterPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) });

  useEffect(() => {
    setReady(true);
  }, []);

  const submitRegister = handleSubmit(
    async (data) => {
      try {
        const res = await registerRequest(data);
        toast.success("Account created successfully");
        router.push("/login");
      } catch (e) {
        toast.error("Could not create account");
      }
    },
    () => {
      toast.error("Please fix the highlighted fields.");
    },
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4 py-10">
      <Card className="w-full max-w-md">
        <h1 className="font-display text-2xl text-stone-900">Create account</h1>
        <p className="mt-1 text-sm text-stone-600">A few details to get you started.</p>
        <form
          className="mt-6 space-y-4"
          method="post"
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            void submitRegister(e);
          }}
        >
          {ready ? (
            <>
              <Input
                label="Email"
                type="email"
                disabled={isSubmitting}
                error={errors.email?.message}
                {...register("email")}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="First name"
                  disabled={isSubmitting}
                  {...register("first_name")}
                />
                <Input
                  label="Last name"
                  disabled={isSubmitting}
                  {...register("last_name")}
                />
              </div>
              <Input
                label="Password"
                type="password"
                showPasswordToggle
                disabled={isSubmitting}
                error={errors.password?.message}
                {...register("password")}
              />
              <Input
                label="Confirm password"
                type="password"
                showPasswordToggle
                disabled={isSubmitting}
                error={errors.password_confirm?.message}
                {...register("password_confirm")}
              />
            </>
          ) : (
            <p className="text-sm text-stone-500">Loading form…</p>
          )}
          <Button
            type="button"
            className="w-full"
            loading={isSubmitting}
            disabled={!ready || isSubmitting}
            onClick={() => void submitRegister()}
          >
            Register
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-stone-600">
          Already registered?{" "}
          <Link href="/login" className="font-medium text-brand-700 hover:underline">
            Sign in
          </Link>
        </p>
      </Card>
    </div>
  );
}
