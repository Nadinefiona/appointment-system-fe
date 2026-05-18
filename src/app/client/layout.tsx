"use client";

import { AppShell } from "@/components/layout/AppShell";

const nav = [
  { href: "/client/providers", label: "Providers" },
  { href: "/client/bookings", label: "My bookings" },
];

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppShell title="Client" nav={nav}>
      {children}
    </AppShell>
  );
}
