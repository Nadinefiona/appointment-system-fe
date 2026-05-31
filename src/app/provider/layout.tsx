"use client";

import { AppShell } from "@/components/layout/AppShell";

const nav = [
  { href: "/provider/dashboard", label: "Dashboard" },
  { href: "/provider/bookings", label: "Bookings" },
  { href: "/provider/availability", label: "Availability" },
];

export default function ProviderLayout({
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
