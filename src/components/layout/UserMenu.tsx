"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { clsx } from "clsx";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useMe } from "@/hooks/useMe";
import { formatPersonName, roleLabel } from "@/lib/display";
import type { UserRole } from "@/types/api";
import { UserAvatar } from "@/components/layout/UserAvatar";

function profileHref(role: UserRole): string {
  if (role === "provider") return "/provider/profile";
  if (role === "admin") return "/admin/profile";
  return "/client/profile";
}

function PersonIcon({ className }: { className?: string }) {
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
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function LogoutIcon({ className }: { className?: string }) {
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
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" x2="9" y1="12" y2="12" />
    </svg>
  );
}

export function UserMenu() {
  const { user, logout } = useAuth();
  const { data: me } = useMe();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  if (!user) return null;

  const name = me
    ? formatPersonName(me, user.email)
    : formatPersonName({ email: user.email }, user.email);
  const role = me?.role ?? user.role;
  const profile = profileHref(user.role);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={clsx(
          "flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-colors",
          "hover:bg-stone-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600",
          open && "bg-stone-100",
        )}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <UserAvatar size="sm" />
        <span className="hidden min-w-0 sm:block">
          <span className="block max-w-[10rem] truncate text-sm font-semibold text-stone-900">
            {name}
          </span>
          <span className="block text-xs text-stone-500">{roleLabel(role)}</span>
        </span>
        <svg
          className={clsx(
            "hidden h-4 w-4 shrink-0 text-stone-500 transition-transform sm:block",
            open && "rotate-180",
          )}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-xl border border-stone-200 bg-white shadow-lg"
        >
          <div className="flex items-center gap-3 border-b border-stone-100 px-4 py-3">
            <UserAvatar />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-stone-900">{name}</p>
              <p className="truncate text-xs text-stone-500">{user.email}</p>
            </div>
          </div>
          <div className="py-1">
            <Link
              href={profile}
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-stone-700 hover:bg-stone-50"
            >
              <PersonIcon className="text-stone-500" />
              Profile
            </Link>
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                void logout();
              }}
              className="flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-left text-sm text-stone-700 hover:bg-stone-50"
            >
              <LogoutIcon className="text-stone-500" />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
