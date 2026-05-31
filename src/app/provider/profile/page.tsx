"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api/client";
import { useMe } from "@/hooks/useMe";
import type { PatchMePayload } from "@/types/api";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";

const schema = z.object({
  first_name: z.string(),
  last_name: z.string(),
  email: z.string().email(),
  bio: z.string(),
  buffer_time: z.number().min(0).max(120),
});

type FormData = z.infer<typeof schema>;

export default function ProviderProfilePage() {
  const qc = useQueryClient();
  const { data: me, isLoading } = useMe();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (!me) return;
    reset({
      first_name: me.first_name,
      last_name: me.last_name,
      email: me.email,
      bio: me.provider_profile?.bio ?? "",
      buffer_time: me.provider_profile?.buffer_time ?? 15,
    });
  }, [me, reset]);

  const mutation = useMutation({
    mutationFn: (values: FormData) => {
      const body: PatchMePayload = {
        first_name: values.first_name,
        last_name: values.last_name,
        email: values.email,
        provider_profile: {
          bio: values.bio,
          buffer_time: values.buffer_time,
        },
      };
      return api.patch<typeof me>("me/", body);
    },
    onSuccess: () => {
      toast.success("Profile saved");
      qc.invalidateQueries({ queryKey: ["me"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading) return <Spinner />;

  if (!me?.provider_profile) {
    return <p className="text-stone-600">Profile is not available right now.</p>;
  }

  const busy = isSubmitting || mutation.isPending;

  return (
    <>
      <h2 className="mb-6 font-display text-2xl text-stone-900">Your profile</h2>
      <Card>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void handleSubmit((v) => mutation.mutate(v))(e);
          }}
          className="max-w-lg space-y-4"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="First name"
              disabled={busy}
              error={errors.first_name?.message}
              {...register("first_name")}
            />
            <Input
              label="Last name"
              disabled={busy}
              error={errors.last_name?.message}
              {...register("last_name")}
            />
          </div>
          <Input
            label="Email"
            type="email"
            disabled={busy}
            error={errors.email?.message}
            {...register("email")}
          />
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-stone-700">Bio</span>
            <textarea
              className="w-full border-0 border-b border-stone-300 bg-transparent px-0 py-2.5 text-sm focus:border-brand-600 focus:outline-none disabled:opacity-60"
              rows={4}
              disabled={busy}
              {...register("bio")}
            />
          </label>
          <Input
            label="Buffer time (minutes)"
            type="number"
            min={0}
            disabled={busy}
            error={errors.buffer_time?.message}
            {...register("buffer_time", { valueAsNumber: true })}
          />
          <Button type="submit" loading={busy}>
            Save changes
          </Button>
        </form>
      </Card>
    </>
  );
}
