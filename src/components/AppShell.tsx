import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

const NAV = [
  { to: "/", label: "Command Center" },
  { to: "/shop", label: "Customer App" },
  { to: "/partners", label: "Store Partner" },
  { to: "/operations", label: "Order Risk" },
  { to: "/promotions", label: "Promo Optimizer" },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary font-display text-sm font-bold text-primary-foreground">N</span>
            <span className="leading-tight">
              <span className="block font-display text-sm font-bold">NOVA CART</span>
              <span className="block text-[10px] uppercase tracking-widest text-muted-foreground">Local Commerce Intelligence</span>
            </span>
          </Link>
          <nav className="-mx-1 flex flex-1 gap-1 overflow-x-auto">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                activeOptions={{ exact: true }}
                className="whitespace-nowrap rounded-full px-3 py-1.5 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground"
                activeProps={{ className: "bg-ink text-ink-foreground hover:bg-ink hover:text-ink-foreground" }}
              >
                {n.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8">{children}</main>
      <footer className="border-t py-6 text-center text-xs text-muted-foreground">
        NOVA CART · Right Product. Right Store. Right Time. — Prototype with simulated data
      </footer>
    </div>
  );
}

export function PageHead({ kicker, title, sub }: { kicker: string; title: string; sub: string }) {
  return (
    <div className="mb-8 max-w-3xl">
      <p className="text-xs font-semibold uppercase tracking-widest text-primary">{kicker}</p>
      <h1 className="mt-2 text-3xl font-bold md:text-4xl">{title}</h1>
      <p className="mt-2 text-muted-foreground">{sub}</p>
    </div>
  );
}

export function Panel({ title, children, right, className = "" }: { title?: string; children: ReactNode; right?: ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl border bg-card p-5 ${className}`}>
      {title && (
        <div className="mb-4 flex items-center justify-between gap-2">
          <h3 className="font-display text-base font-semibold">{title}</h3>
          {right}
        </div>
      )}
      {children}
    </section>
  );
}

export function Meter({ value, label }: { value: number; label?: string }) {
  const tone = value >= 75 ? "bg-success" : value >= 55 ? "bg-warning" : "bg-destructive";
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
        <div className={`h-full ${tone}`} style={{ width: `${value}%` }} />
      </div>
      <span className="num text-xs">{value}{label ?? "%"}</span>
    </div>
  );
}

export function Tag({ children, tone = "muted" }: { children: ReactNode; tone?: "muted" | "good" | "warn" | "bad" | "accent" }) {
  const t = {
    muted: "bg-muted text-muted-foreground",
    good: "bg-success/15 text-success",
    warn: "bg-warning/20 text-accent-foreground",
    bad: "bg-destructive/12 text-destructive",
    accent: "bg-accent text-accent-foreground",
  }[tone];
  return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${t}`}>{children}</span>;
}
