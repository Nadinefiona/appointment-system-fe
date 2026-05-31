"use client";

import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { UserAvatar } from "@/components/layout/UserAvatar";
import { fetchMe } from "@/lib/auth/api";
import { formatPersonName } from "@/lib/display";
import { useAuth } from "@/lib/auth/AuthProvider";

export function AccountProfileCard({ title }: { title: string }) {
  const { user } = useAuth();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["me"],
    queryFn: fetchMe,
    enabled: Boolean(user),
  });

  if (isLoading) return <Spinner />;

  const displayEmail = data?.email ?? user?.email ?? "";
  const name = data
    ? formatPersonName(data, displayEmail)
    : formatPersonName({ email: displayEmail }, displayEmail);

  return (
    <Card className="max-w-lg">
      <h2 className="font-display text-2xl text-stone-900">{title}</h2>
      <div className="mt-6 flex items-center gap-4">
        <UserAvatar className="ring-4 ring-brand-50" size="lg" />
        <p className="text-lg font-semibold text-stone-900">{name}</p>
      </div>
      {isError && (
        <p className="mt-4 text-sm text-amber-700">
          Could not load your profile. Showing session details.
        </p>
      )}
      {data && (
        <dl className="mt-6 space-y-3 border-t border-stone-100 pt-6 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-stone-500">First name</dt>
            <dd className="font-medium text-stone-900">{data.first_name || "—"}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-stone-500">Last name</dt>
            <dd className="font-medium text-stone-900">{data.last_name || "—"}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-stone-500">Email</dt>
            <dd className="font-medium text-stone-900">{displayEmail || "—"}</dd>
          </div>
        </dl>
      )}
    </Card>
  );
}
