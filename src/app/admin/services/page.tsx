"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api/client";
import { useProviderDirectory } from "@/hooks/useProviderDirectory";
import { formatProviderDetailsList } from "@/lib/display";
import type { PaginatedResponse, ServiceType } from "@/types/api";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";

function EditIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

function ProviderCheckboxList({
  options,
  selected,
  onChange,
  disabled,
}: {
  options: { value: string; label: string }[];
  selected: string[];
  onChange: (ids: string[]) => void;
  disabled?: boolean;
}) {
  const toggle = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter((x) => x !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  return (
    <fieldset className="space-y-2" disabled={disabled}>
      <legend className="text-sm font-medium text-stone-700">Providers</legend>
      <div className="max-h-48 space-y-2 overflow-y-auto rounded-lg border border-stone-200 p-3">
        {options.length === 0 ? (
          <p className="text-sm text-stone-500">No providers available.</p>
        ) : (
          options.map((p) => (
            <label
              key={p.value}
              className="flex cursor-pointer items-center gap-2 text-sm text-stone-700"
            >
              <input
                type="checkbox"
                checked={selected.includes(p.value)}
                onChange={() => toggle(p.value)}
                className="h-4 w-4 rounded border-stone-300 text-brand-700 focus:ring-brand-200"
              />
              {p.label}
            </label>
          ))
        )}
      </div>
    </fieldset>
  );
}

export default function AdminServicesPage() {
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [selectedProviders, setSelectedProviders] = useState<string[]>([]);
  const [editingService, setEditingService] = useState<ServiceType | null>(null);
  const [editName, setEditName] = useState("");
  const [editProviders, setEditProviders] = useState<string[]>([]);

  const { providerOptions, isLoading: providersLoading } = useProviderDirectory();

  const servicesQuery = useQuery({
    queryKey: ["services"],
    queryFn: () => api.get<PaginatedResponse<ServiceType>>("services/"),
  });

  const createMutation = useMutation({
    mutationFn: () =>
      api.post<ServiceType>("services/", {
        name: name.trim(),
        providers: selectedProviders,
      }),
    onSuccess: () => {
      toast.success("Service saved");
      setName("");
      setSelectedProviders([]);
      qc.invalidateQueries({ queryKey: ["services"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateMutation = useMutation({
    mutationFn: () =>
      api.patch<ServiceType>(`services/${editingService!.id}/`, {
        name: editName.trim(),
        providers: editProviders,
      }),
    onSuccess: () => {
      toast.success("Service updated");
      setEditingService(null);
      qc.invalidateQueries({ queryKey: ["services"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const services = servicesQuery.data?.results ?? [];

  const openEdit = (service: ServiceType) => {
    setEditingService(service);
    setEditName(service.name);
    setEditProviders([...service.providers]);
  };

  const submitCreate = () => {
    if (!name.trim()) {
      toast.error("Add a service name");
      return;
    }
    if (selectedProviders.length === 0) {
      toast.error("Pick at least one provider");
      return;
    }
    const unique = new Set(selectedProviders);
    if (unique.size !== selectedProviders.length) {
      toast.error("Duplicate providers are not allowed");
      return;
    }
    createMutation.mutate();
  };

  const submitEdit = () => {
    if (!editName.trim()) {
      toast.error("Add a service name");
      return;
    }
    if (editProviders.length === 0) {
      toast.error("Pick at least one provider");
      return;
    }
    const unique = new Set(editProviders);
    if (unique.size !== editProviders.length) {
      toast.error("Duplicate providers are not allowed");
      return;
    }
    updateMutation.mutate();
  };

  return (
    <>
      <h2 className="mb-6 font-display text-2xl text-stone-900">Services</h2>

      <Card className="mb-8">
        <h3 className="mb-4 font-medium">Create service</h3>
        <form
          className="grid max-w-xl gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            submitCreate();
          }}
        >
          <Input
            label="Service name"
            value={name}
            disabled={createMutation.isPending}
            onChange={(e) => setName(e.target.value)}
            required
          />
          {providersLoading ? (
            <Spinner label="Loading providers…" />
          ) : (
            <ProviderCheckboxList
              options={providerOptions}
              selected={selectedProviders}
              onChange={setSelectedProviders}
              disabled={createMutation.isPending}
            />
          )}
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
              <Card className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-medium">{s.name}</p>
                  <p className="mt-1 text-sm text-stone-600">
                    {formatProviderDetailsList(s.provider_details)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => openEdit(s)}
                  className="cursor-pointer rounded-lg p-2 text-stone-500 hover:bg-stone-100 hover:text-brand-700"
                  aria-label={`Edit ${s.name}`}
                >
                  <EditIcon />
                </button>
              </Card>
            </li>
          ))}
        </ul>
      )}

      <Modal
        open={Boolean(editingService)}
        onClose={() => setEditingService(null)}
        title="Edit service"
      >
        {editingService && (
          <div className="space-y-4">
            <Input
              label="Service name"
              value={editName}
              disabled={updateMutation.isPending}
              onChange={(e) => setEditName(e.target.value)}
            />
            <ProviderCheckboxList
              options={providerOptions}
              selected={editProviders}
              onChange={setEditProviders}
              disabled={updateMutation.isPending}
            />
            <div className="flex gap-3 pt-2">
              <Button
                variant="secondary"
                className="flex-1"
                disabled={updateMutation.isPending}
                onClick={() => setEditingService(null)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                loading={updateMutation.isPending}
                onClick={submitEdit}
              >
                Save
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
