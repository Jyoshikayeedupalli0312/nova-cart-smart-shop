import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Bar, BarChart, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AppShell, PageHead, Panel } from "@/components/AppShell";

export const Route = createFileRoute("/promotions")({
  head: () => ({
    meta: [
      { title: "Promo Optimizer — NOVA CART" },
      { name: "description", content: "Shift promotion budget from blanket coupons to retention triggers and compare ROI per segment." },
      { property: "og:title", content: "Promo Optimizer — NOVA CART" },
      { property: "og:description", content: "Spend less on coupons, keep more customers." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Promo,
});

// Per-₹1L spent: retained customers (assumption model built from the case signals)
const SEGMENTS = [
  { key: "first", name: "Big 1st-order discount", eff: 90, desc: "Low long-term retention vs organic" },
  { key: "second", name: "2nd-order nudge (≤7d)", eff: 310, desc: "Attacks the 54% → 31% drop" },
  { key: "third", name: "3rd-order milestone", eff: 260, desc: "3 orders → 72% monthly return" },
  { key: "cross", name: "Cross-category intro", eff: 220, desc: "Multi-category buyers repeat more" },
  { key: "winback", name: "Lapsed win-back", eff: 150, desc: "Pair with reliability guarantee" },
] as const;

type K = (typeof SEGMENTS)[number]["key"];
const CURRENT: Record<K, number> = { first: 11, second: 1.5, third: 1, cross: 1, winback: 2.5 };

function Promo() {
  const [plan, setPlan] = useState<Record<K, number>>({ first: 2, second: 3.5, third: 2, cross: 1.5, winback: 1 });
  const total = Object.values(plan).reduce((a, b) => a + b, 0);
  const redeem = (k: K) => (k === "first" ? 0.56 : 0.82); // blanket coupons: 44% unredeemed
  const retained = (p: Record<K, number>) => Math.round(SEGMENTS.reduce((a, s) => a + p[s.key] * s.eff * redeem(s.key), 0));
  const curR = retained(CURRENT), newR = retained(plan);
  const data = SEGMENTS.map((s) => ({ name: s.name.split(" ").slice(0, 2).join(" "), Current: CURRENT[s.key], Optimized: plan[s.key] }));

  return (
    <AppShell>
      <PageHead kicker="Growth" title="Fewer coupons. More regulars." sub="44% of coupons are never redeemed and big first-order discounts retain poorly. Reallocate the monthly budget toward the moments that build habit." />
      <div className="grid gap-6 lg:grid-cols-5">
        <Panel title="Allocate monthly budget (₹ lakh)" className="lg:col-span-3">
          <div className="space-y-5">
            {SEGMENTS.map((s) => (
              <label key={s.key} className="block">
                <div className="flex justify-between text-sm"><span className="font-semibold">{s.name}</span><span className="num font-bold text-primary">₹{plan[s.key].toFixed(1)}L</span></div>
                <input type="range" min={0} max={12} step={0.5} value={plan[s.key]} onChange={(e) => setPlan({ ...plan, [s.key]: +e.target.value })} className="mt-1 w-full accent-[var(--primary)]" />
                <p className="text-xs text-muted-foreground">{s.desc} · ~{s.eff} retained customers per ₹1L</p>
              </label>
            ))}
          </div>
        </Panel>
        <div className="space-y-4 lg:col-span-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border bg-card p-4"><p className="text-xs text-muted-foreground">Budget</p><p className="num text-2xl font-bold">₹{total.toFixed(1)}L</p><p className="text-xs text-muted-foreground">today ₹17L</p></div>
            <div className="rounded-2xl border bg-card p-4"><p className="text-xs text-muted-foreground">Saved / month</p><p className={`num text-2xl font-bold ${17 - total >= 0 ? "text-success" : "text-destructive"}`}>₹{(17 - total).toFixed(1)}L</p></div>
            <div className="rounded-2xl border bg-card p-4"><p className="text-xs text-muted-foreground">Retained customers</p><p className="num text-2xl font-bold">{newR.toLocaleString("en-IN")}</p><p className="text-xs text-muted-foreground">today {curR.toLocaleString("en-IN")}</p></div>
            <div className="rounded-2xl bg-accent p-4 text-accent-foreground"><p className="text-xs">Cost per retained</p><p className="num text-2xl font-bold">₹{Math.round((total * 100000) / Math.max(1, newR))}</p><p className="text-xs">today ₹{Math.round(1700000 / curR)}</p></div>
          </div>
          <Panel title="Current vs optimized">
            <div className="h-56">
              <ResponsiveContainer>
                <BarChart data={data}>
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} />
                  <YAxis tick={{ fontSize: 10 }} width={24} />
                  <Tooltip /><Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="Current" fill="var(--chart-3)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Optimized" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Panel>
        </div>
      </div>
    </AppShell>
  );
}
