"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api/client";
import type { PaginatedResponse, ServiceProvider } from "@/types/api";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";

export default function AdminProvidersPage() {
  const qc = useQueryClient();
  const [userId, setUserId] = useState("");
  const [bio, setBio] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["providers"],
    queryFn: () => api.get<PaginatedResponse<ServiceProvider>>("providers/"),
  });

  const createMutation = useMutation({
    mutationFn: () =>
      api.post<ServiceProvider>("providers/", {
        user: userId,
        bio,
        buffer_time: 0,
      }),
    onSuccess: () => {
      toast.success("Provider created");
      setUserId("");
      setBio("");
      qc.invalidateQueries({ queryKey: ["providers"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const providers = data?.results ?? [];

  return (
    <>
      <h2 className="mb-6 font-display text-2xl text-stone-900">Providers</h2>

      <Card className="mb-8">
        <h3 className="mb-4 font-medium">Create provider</h3>
        <p className="mb-4 text-sm text-stone-500">
          Link an existing user (promote to provider in Django admin first) by user UUID.
        </p>
        <form
          className="grid max-w-xl gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            createMutation.mutate();
          }}
        >
          <Input
            label="User ID (UUID)"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            required
          />
          <Input label="Bio" value={bio} onChange={(e) => setBio(e.target.value)} />
          <Button type="submit" loading={createMutation.isPending}>
            Create
          </Button>
        </form>
      </Card>

      {isLoading ? (
        <Spinner />
      ) : providers.length === 0 ? (
        <EmptyState title="No providers" />
      ) : (
        <ul className="space-y-3">
          {providers.map((p) => (
            <li key={p.id}>
              <Card>
                <p className="font-medium">ID {p.id.slice(0, 8)}…</p>
                <p className="text-sm text-stone-600">User {p.user}</p>
                <p className="mt-1 text-sm">{p.bio || "—"}</p>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
