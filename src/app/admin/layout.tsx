"use client";

import { AppShell } from "@/components/layout/AppShell";

const nav = [
  { href: "/admin/providers", label: "Users" },
  { href: "/admin/services", label: "Services" },
  { href: "/admin/bookings", label: "Bookings" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppShell title="Dashboard" nav={nav}>
      {children}
    </AppShell>
  );
}
