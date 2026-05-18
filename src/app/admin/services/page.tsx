"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api/client";
import type { PaginatedResponse, ServiceProvider, ServiceType } from "@/types/api";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { EmptyState } from "@/components/ui/EmptyState";

export default function AdminServicesPage() {
  const qc = useQueryClient();
  const [provider, setProvider] = useState("");
  const [name, setName] = useState("");
  const [duration, setDuration] = useState("30");
  const [price, setPrice] = useState("50.00");

  const providersQuery = useQuery({
    queryKey: ["providers"],
    queryFn: () => api.get<PaginatedResponse<ServiceProvider>>("providers/"),
  });

  const servicesQuery = useQuery({
    queryKey: ["services"],
    queryFn: () => api.get<PaginatedResponse<ServiceType>>("services/"),
  });

  const createMutation = useMutation({
    mutationFn: () =>
      api.post<ServiceType>("services/", {
        provider,
        name,
        duration: Number(duration),
        price,
      }),
    onSuccess: () => {
      toast.success("Service created");
      qc.invalidateQueries({ queryKey: ["services"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const providers = providersQuery.data?.results ?? [];
  const services = servicesQuery.data?.results ?? [];

  return (
    <>
      <h2 className="mb-6 font-display text-2xl text-stone-900">Services</h2>

      <Card className="mb-8">
        <h3 className="mb-4 font-medium">Create service</h3>
        <form
          className="grid max-w-xl gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            createMutation.mutate();
          }}
        >
          <Select
            label="Provider"
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            options={[
              { value: "", label: "Select provider…" },
              ...providers.map((p) => ({
                value: p.id,
                label: `${p.id.slice(0, 8)}… (${p.user.slice(0, 8)}…)`,
              })),
            ]}
          />
          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input
            label="Duration (minutes)"
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
          />
          <Input label="Price" value={price} onChange={(e) => setPrice(e.target.value)} />
          <Button type="submit" loading={createMutation.isPending}>
            Create
          </Button>
        </form>
      </Card>

      {servicesQuery.isLoading ? (
        <Spinner />
      ) : services.length === 0 ? (
        <EmptyState title="No services" />
      ) : (
        <ul className="space-y-3">
          {services.map((s) => (
            <li key={s.id}>
              <Card className="flex justify-between gap-4">
                <div>
                  <p className="font-medium">{s.name}</p>
                  <p className="text-sm text-stone-600">
                    {s.duration} min · ${s.price}
                  </p>
                </div>
                <p className="text-xs text-stone-500">Provider {s.provider.slice(0, 8)}…</p>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
