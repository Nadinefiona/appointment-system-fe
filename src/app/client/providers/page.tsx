"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type { PaginatedResponse, ServiceProvider } from "@/types/api";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";

export default function ClientProvidersPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["providers"],
    queryFn: () => api.get<PaginatedResponse<ServiceProvider>>("providers/"),
  });

  if (isLoading) return <Spinner label="Loading providers…" />;
  if (error) {
    return (
      <EmptyState
        title="Could not load providers"
        description={error instanceof Error ? error.message : "Unknown error"}
      />
    );
  }

  const providers = data?.results ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl text-stone-900">Find a provider</h2>
        <p className="text-stone-600">Browse the directory and book an appointment.</p>
      </div>
      {providers.length === 0 ? (
        <EmptyState title="No providers yet" description="Check back later." />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {providers.map((p) => (
            <li key={p.id}>
              <Card className="flex h-full flex-col justify-between gap-4">
                <div>
                  <p className="text-xs font-medium uppercase text-brand-700">
                    Provider
                  </p>
                  <p className="mt-1 line-clamp-3 text-sm text-stone-600">
                    {p.bio || "No bio provided."}
                  </p>
                  {p.buffer_time > 0 && (
                    <p className="mt-2 text-xs text-stone-500">
                      Buffer between appointments: {p.buffer_time} min
                    </p>
                  )}
                </div>
                <Link href={`/client/providers/${p.id}`}>
                  <Button variant="secondary" className="w-full">
                    View & book
                  </Button>
                </Link>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
