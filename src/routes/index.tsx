import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from "recharts";
import { AppShell, Panel } from "@/components/AppShell";
import { BASELINE as B } from "@/lib/nova-data";
import { projectImpact, type ImpactInputs } from "@/lib/nova-engine";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NOVA CART — Local Commerce Intelligence" },
      { name: "description", content: "Command center diagnosing NOVA CART's retention, availability and promo problems, with a live business impact simulator." },
      { property: "og:title", content: "NOVA CART — Local Commerce Intelligence" },
      { property: "og:description", content: "Right Product. Right Store. Right Time. Diagnose, act and measure impact." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const CANCEL = [
  { name: "Unavailable", v: 35 }, { name: "Delays", v: 27 }, { name: "Store reject", v: 18 }, { name: "No rider", v: 12 }, { name: "Other", v: 8 },
];

const LEVERS: { key: keyof ImpactInputs; label: string; hint: string; min: number; max: number }[] = [
  { key: "confidenceFloor", label: "Inventory confidence floor", hint: "Hide items below this availability probability", min: 30, max: 80 },
  { key: "smartRouting", label: "Reliability-based routing", hint: "% of orders routed to most reliable nearby store", min: 0, max: 100 },
  { key: "targetedPromo", label: "Targeted promotions", hint: "% of budget moved from blanket coupons to retention triggers", min: 0, max: 100 },
  { key: "inventoryAdoption", label: "1-tap inventory adoption", hint: "% of partner stores syncing stock daily", min: 0, max: 100 },
];

function Index() {
  const [inp, setInp] = useState<ImpactInputs>({ confidenceFloor: 65, smartRouting: 70, targetedPromo: 60, inventoryAdoption: 50 });
  const r = projectImpact(inp);

  const kpis = [
    { label: "Repeat purchase", now: `${B.repeat}%`, was: `${B.repeatPrev}%`, to: `${r.repeat}%`, good: true },
    { label: "Cancellation rate", now: `${B.cancel}%`, was: `${B.cancelPrev}%`, to: `${r.cancel}%`, good: true },
    { label: "Avg delivery", now: `${B.deliveryMin}m`, was: `${B.deliveryPrev}m`, to: `${r.delivery}m`, good: true },
    { label: "Promo spend /mo", now: `₹${B.promoLakh}L`, was: `₹${B.promoPrev}L`, to: `₹${r.promoSpend}L`, good: true },
    { label: "Support tickets", now: B.tickets.toLocaleString("en-IN"), was: B.ticketsPrev.toLocaleString("en-IN"), to: r.tickets.toLocaleString("en-IN"), good: true },
    { label: "Monthly revenue", now: `₹${B.revenueLakh}L`, was: "—", to: `₹${r.revenue}L`, good: true },
  ];

  return (
    <AppShell>
      <section className="bg-ink-gradient relative overflow-hidden rounded-3xl p-8 text-ink-foreground md:p-12">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent">Business Rescue Challenge</p>
        <h1 className="mt-3 max-w-3xl text-4xl font-bold leading-tight md:text-6xl">Right Product. Right Store. Right Time.</h1>
        <p className="mt-4 max-w-2xl text-ink-foreground/75">
          NOVA CART is losing customers not because discounts are too small, but because promises break: items go missing,
          deliveries run late and coupons are wasted. This platform links customer → inventory → store → order → delivery → retention.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/shop" className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground">Try the customer engine</Link>
          <Link to="/partners" className="rounded-full border border-ink-foreground/25 px-5 py-2.5 text-sm font-semibold">Open store partner view</Link>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
          {[["1,20,000", "registered users"], ["46,000", "monthly active"], ["38,500", "orders / month"], ["620", "local stores · 3 cities"]].map(([a, b]) => (
            <div key={b}><div className="num text-2xl font-bold">{a}</div><div className="text-xs text-ink-foreground/60">{b}</div></div>
          ))}
        </div>
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <Panel title="Root cause: broken promises, not price" className="lg:col-span-2">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="h-56">
              <p className="mb-2 text-xs text-muted-foreground">Cancellation causes (% of 11% cancelled)</p>
              <ResponsiveContainer>
                <BarChart data={CANCEL} layout="vertical" margin={{ left: 10 }}>
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: "var(--muted)" }} />
                  <Bar dataKey="v" radius={[0, 6, 6, 0]}>
                    {CANCEL.map((_, i) => <Cell key={i} fill={i < 2 ? "var(--chart-3)" : "var(--chart-1)"} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <ul className="space-y-3 text-sm">
              {[
                ["62%", "of cancellations come from missing stock or delays — both fixable with data we already have."],
                ["54% → 31%", "first to second order drop. 3 orders = 72% retention. The 2nd order is the battle."],
                ["44%", "of coupons are never redeemed while promo spend rose 79%."],
                ["39%", "of stores find inventory upkeep too hard — the source of availability errors."],
              ].map(([a, b]) => (
                <li key={a} className="flex gap-3"><span className="num min-w-20 font-bold text-primary">{a}</span><span className="text-muted-foreground">{b}</span></li>
              ))}
            </ul>
          </div>
        </Panel>
        <Panel title="The connected loop">
          <ol className="space-y-2 text-sm">
            {[
              ["Customer", "Personal ranking from history & categories"],
              ["Inventory", "Confidence score hides likely-missing items"],
              ["Store", "Reliability score: accept, on-time, sync"],
              ["Order", "Risk triage before the store rejects"],
              ["Delivery", "ETA-weighted routing to nearest reliable store"],
              ["Retention", "Targeted 2nd/3rd order triggers, not blanket coupons"],
            ].map(([a, b], i) => (
              <li key={a} className="flex items-start gap-3 rounded-xl bg-muted p-2.5">
                <span className="num grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary text-xs text-primary-foreground">{i + 1}</span>
                <span><b>{a}</b> <span className="text-muted-foreground">— {b}</span></span>
              </li>
            ))}
          </ol>
        </Panel>
      </div>

      <Panel title="Business impact simulator" className="mt-6" right={<span className="text-xs text-muted-foreground">Move the levers — projections update live</span>}>
        <div className="grid gap-8 lg:grid-cols-5">
          <div className="space-y-5 lg:col-span-2">
            {LEVERS.map((l) => (
              <label key={l.key} className="block">
                <div className="flex justify-between text-sm font-semibold"><span>{l.label}</span><span className="num text-primary">{inp[l.key]}%</span></div>
                <input type="range" min={l.min} max={l.max} value={inp[l.key]} onChange={(e) => setInp({ ...inp, [l.key]: +e.target.value })} className="mt-2 w-full accent-[var(--primary)]" />
                <p className="text-xs text-muted-foreground">{l.hint}</p>
              </label>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:col-span-3">
            {kpis.map((k) => (
              <div key={k.label} className="rounded-xl border bg-background p-4">
                <p className="text-xs text-muted-foreground">{k.label}</p>
                <p className="num mt-1 text-2xl font-bold text-primary">{k.to}</p>
                <p className="text-xs text-muted-foreground">today {k.now} · was {k.was}</p>
              </div>
            ))}
            <div className="col-span-2 rounded-xl bg-accent p-4 text-accent-foreground md:col-span-3">
              <p className="text-sm font-semibold">
                Net monthly upside: <span className="num">₹{(r.revenue - B.revenueLakh).toFixed(1)}L</span> extra revenue + <span className="num">₹{r.promoSaved}L</span> promo saved
                = <span className="num">₹{(r.revenue - B.revenueLakh + r.promoSaved).toFixed(1)}L</span>
              </p>
              <p className="mt-1 text-xs opacity-80">Model assumptions derive from the case's cancellation mix, retention curve and coupon redemption data.</p>
            </div>
          </div>
        </div>
      </Panel>
    </AppShell>
  );
}
