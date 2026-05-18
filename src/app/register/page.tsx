"use client";

import Link from "next/link";
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
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) });

  const onSubmit = handleSubmit(async (data) => {
    try {
      const res = await registerRequest(data);
      toast.success(res.message);
      router.push("/login");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Registration failed");
    }
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4 py-10">
      <Card className="w-full max-w-md">
        <h1 className="font-display text-2xl text-stone-900">Create account</h1>
        <p className="mt-1 text-sm text-stone-600">
          Client registration only. Providers are promoted by an admin.
        </p>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <Input
            label="Email"
            type="email"
            error={errors.email?.message}
            {...register("email")}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="First name" {...register("first_name")} />
            <Input label="Last name" {...register("last_name")} />
          </div>
          <Input
            label="Password"
            type="password"
            error={errors.password?.message}
            {...register("password")}
          />
          <Input
            label="Confirm password"
            type="password"
            error={errors.password_confirm?.message}
            {...register("password_confirm")}
          />
          <Button type="submit" className="w-full" loading={isSubmitting}>
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
