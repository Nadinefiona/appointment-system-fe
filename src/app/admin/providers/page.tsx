"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api/client";
import { useAdminUsers } from "@/hooks/useAdminUsers";
import { formatPersonName, roleLabel } from "@/lib/display";
import type { MeProfile, UserRole } from "@/types/api";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { EmptyState } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: "client", label: "Client" },
  { value: "provider", label: "Provider" },
  { value: "admin", label: "Admin" },
];

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

export default function AdminProvidersPage() {
  const qc = useQueryClient();
  const { data: users = [], isLoading, error } = useAdminUsers();

  const [editingUser, setEditingUser] = useState<MeProfile | null>(null);
  const [draftRole, setDraftRole] = useState<UserRole>("client");
  const [confirmOpen, setConfirmOpen] = useState(false);

  const updateRoleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: UserRole }) =>
      api.patch<MeProfile>(`admin/users/${id}/`, { role }),
    onSuccess: () => {
      toast.success("User updated");
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      qc.invalidateQueries({ queryKey: ["providers"] });
      setConfirmOpen(false);
      setEditingUser(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const openEdit = (user: MeProfile) => {
    setEditingUser(user);
    setDraftRole(user.role);
  };

  const requestConfirm = () => {
    if (!editingUser || draftRole === editingUser.role) {
      toast.message("Nothing to save");
      return;
    }
    setConfirmOpen(true);
  };

  if (isLoading) return <Spinner label="Loading users…" />;
  if (error) {
    return (
      <EmptyState
        title="Could not load users"
        description={error instanceof Error ? error.message : undefined}
      />
    );
  }

  return (
    <>
      <h2 className="mb-6 font-display text-2xl text-stone-900">Users</h2>

      {users.length === 0 ? (
        <EmptyState title="No users" />
      ) : (
        <ul className="space-y-3">
          {users.map((user) => (
            <li key={user.id}>
              <Card className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium text-stone-900">
                    {formatPersonName(user, user.email)}
                  </p>
                  <p className="truncate text-sm text-stone-600">{user.email}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-brand-100 px-2.5 py-0.5 text-xs font-medium text-brand-800">
                    {roleLabel(user.role)}
                  </span>
                  <button
                    type="button"
                    onClick={() => openEdit(user)}
                    className="cursor-pointer rounded-lg p-2 text-stone-500 hover:bg-stone-100 hover:text-brand-700"
                    aria-label={`Edit ${formatPersonName(user)}`}
                  >
                    <EditIcon />
                  </button>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}

      <Modal
        open={Boolean(editingUser) && !confirmOpen}
        onClose={() => setEditingUser(null)}
        title="Edit account"
      >
        {editingUser && (
          <div className="space-y-4">
            <p className="text-sm text-stone-600">
              <span className="font-medium text-stone-900">
                {formatPersonName(editingUser)}
              </span>
              <br />
              {editingUser.email}
            </p>
            <Select
              label="Account type"
              value={draftRole}
              onChange={(e) => setDraftRole(e.target.value as UserRole)}
              options={ROLE_OPTIONS.map((r) => ({
                value: r.value,
                label: r.label,
              }))}
            />
            <div className="flex gap-3 pt-2">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setEditingUser(null)}
              >
                Cancel
              </Button>
              <Button className="flex-1" onClick={requestConfirm}>
                Continue
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {editingUser && (
        <ConfirmDialog
          open={confirmOpen}
          title="Save changes?"
          message={`Update account for ${formatPersonName(editingUser)}?`}
          confirmLabel="Save"
          loading={updateRoleMutation.isPending}
          onCancel={() => setConfirmOpen(false)}
          onConfirm={() =>
            updateRoleMutation.mutate({ id: editingUser.id, role: draftRole })
          }
        />
      )}
    </>
  );
}
