import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function HomePage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-canvas">
      <div className="pointer-events-none absolute -right-24 top-0 h-96 w-96 rounded-full bg-brand-100/60 blur-3xl" />
      <div className="pointer-events-none absolute -left-16 bottom-0 h-72 w-72 rounded-full bg-accent/20 blur-3xl" />

      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-6">
        <span className="font-display text-2xl text-brand-800">Appoint</span>
        <nav className="flex gap-3">
          <Link href="/login">
            <Button variant="ghost">Sign in</Button>
          </Link>
          <Link href="/register">
            <Button>Get started</Button>
          </Link>
        </nav>
      </header>

      <section className="mx-auto max-w-3xl px-4 pb-24 pt-16 text-center">
        <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-brand-700">
          Appointments made simple
        </p>
        <h1 className="font-display text-4xl leading-tight text-stone-900 sm:text-5xl">
          Book the time that works for you
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-stone-600">
          Pick a service, choose an open slot, and you are done. Providers manage
          their hours in one place.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link href="/register">
            <Button size="lg">Create account</Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="secondary">
              Sign in
            </Button>
          </Link>
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl gap-6 px-4 pb-20 sm:grid-cols-3">
        {[
          {
            title: "Book",
            text: "See what is open and reserve a time in a few clicks.",
          },
          {
            title: "Manage",
            text: "Set weekly hours, review today’s list, and keep your profile current.",
          },
          {
            title: "Oversee",
            text: "Services, users, and appointments in one admin view.",
          },
        ].map((card) => (
          <article
            key={card.title}
            className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm"
          >
            <h2 className="font-display text-lg text-brand-800">{card.title}</h2>
            <p className="mt-2 text-sm text-stone-600">{card.text}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
