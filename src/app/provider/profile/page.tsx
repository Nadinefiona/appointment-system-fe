"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api/client";
import { useProviderProfile } from "@/hooks/useProviderProfile";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";

const schema = z.object({
  bio: z.string(),
  buffer_time: z.number().min(0).max(120),
});

type FormData = z.infer<typeof schema>;

export default function ProviderProfilePage() {
  const qc = useQueryClient();
  const { data, isLoading } = useProviderProfile();
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (data) reset({ bio: data.bio, buffer_time: data.buffer_time });
  }, [data, reset]);

  const mutation = useMutation({
    mutationFn: (values: FormData) =>
      api.patch("me/provider-profile/", values),
    onSuccess: () => {
      toast.success("Profile updated");
      qc.invalidateQueries({ queryKey: ["provider-profile"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading) return <Spinner />;

  return (
    <>
      <h2 className="mb-6 font-display text-2xl text-stone-900">Your profile</h2>
      <Card>
        <form
          onSubmit={handleSubmit((v) => mutation.mutate(v))}
          className="max-w-lg space-y-4"
        >
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-stone-700">Bio</span>
            <textarea
              className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-200"
              rows={4}
              {...register("bio")}
            />
          </label>
          <Input
            label="Buffer time (minutes)"
            type="number"
            min={0}
            {...register("buffer_time", { valueAsNumber: true })}
          />
          <Button type="submit" loading={isSubmitting || mutation.isPending}>
            Save changes
          </Button>
        </form>
      </Card>
    </>
  );
}
