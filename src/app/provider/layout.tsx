"use client";

import { AppShell } from "@/components/layout/AppShell";

const nav = [
  { href: "/provider/dashboard", label: "Dashboard" },
  { href: "/provider/bookings", label: "Bookings" },
  { href: "/provider/availability", label: "Availability" },
  { href: "/provider/schedule", label: "Schedule" },
  { href: "/provider/profile", label: "Profile" },
];

export default function ProviderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppShell title="Provider" nav={nav}>
      {children}
    </AppShell>
  );
}
