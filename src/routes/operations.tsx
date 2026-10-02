import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell, PageHead, Panel, Tag } from "@/components/AppShell";
import { etaMinutes, inventoryConfidence, storeReliability } from "@/lib/nova-engine";
import { useNova } from "@/lib/nova-store";

export const Route = createFileRoute("/operations")({
  head: () => ({
    meta: [
      { title: "Order Risk Triage — NOVA CART Operations" },
      { name: "description", content: "Predict which live orders will cancel or arrive late and fix them before the customer notices." },
      { property: "og:title", content: "Order Risk Triage — NOVA CART" },
      { property: "og:description", content: "Prevent cancellations before they happen." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Ops,
});

const NAMES = ["Ananya", "Rohit", "Fatima", "Karthik", "Meera", "Arjun", "Sneha", "Vikram", "Pooja", "Imran"];

function Ops() {
  const { products, stores } = useNova();
  const [fixed, setFixed] = useState<Record<string, string>>({});

  const orders = useMemo(() => products.filter((_, i) => i % 5 === 0).slice(0, 10).map((p, i) => {
    const s = stores.find((x) => x.id === p.storeId)!;
    const conf = inventoryConfidence(p, s);
    const rel = storeReliability(s);
    const eta = etaMinutes(s);
    const busy = i % 3 === 0;
    const risk = Math.round(Math.min(98, (100 - conf) * 0.5 + (100 - rel) * 0.35 + (busy ? 15 : 0) + Math.max(0, eta - 30)));
    const cause = conf < 50 ? "Item likely unavailable" : busy && s.acceptRate < 0.85 ? "Store may reject (peak hour)" : eta > 32 ? "Delivery delay" : "Low risk";
    const action = cause.startsWith("Item") ? "Pre-confirm substitute with customer" : cause.startsWith("Store") ? "Reroute to backup store" : cause.startsWith("Delivery") ? "Assign nearest rider + update ETA" : "—";
    return { id: `NC-${4810 + i}`, customer: NAMES[i], item: p.name, store: s.name, eta, risk, cause, action };
  }).sort((a, b) => b.risk - a.risk), [products, stores]);

  const atRisk = orders.filter((o) => o.risk >= 40);
  const saved = Object.keys(fixed).length;

  return (
    <AppShell>
      <PageHead kicker="Operations" title="Fix orders before they fail" sub="Every live order gets a failure-risk score from inventory confidence, store reliability, peak load and ETA. Ops acts on the cause — not after the refund ticket." />
      <div className="mb-6 grid grid-cols-3 gap-3">
        {[["Live orders", orders.length], ["High risk", atRisk.length - saved], ["Prevented", saved]].map(([a, b]) => (
          <div key={a} className="rounded-2xl border bg-card p-4"><p className="text-xs text-muted-foreground">{a}</p><p className="num mt-1 text-3xl font-bold">{b}</p></div>
        ))}
      </div>
      <Panel title="Order queue (sorted by risk)">
        <div className="space-y-2">
          {orders.map((o) => {
            const done = fixed[o.id];
            const tone = done ? "good" : o.risk >= 60 ? "bad" : o.risk >= 40 ? "warn" : "muted";
            return (
              <div key={o.id} className="flex flex-wrap items-center gap-3 rounded-xl border bg-background p-3">
                <div className={`num grid h-12 w-12 place-items-center rounded-xl text-lg font-bold ${done ? "bg-success/15 text-success" : o.risk >= 60 ? "bg-destructive/12 text-destructive" : o.risk >= 40 ? "bg-warning/20" : "bg-muted"}`}>{done ? "✓" : o.risk}</div>
                <div className="min-w-48 flex-1">
                  <p className="text-sm font-semibold">{o.id} · {o.customer} · {o.item}</p>
                  <p className="text-xs text-muted-foreground">{o.store} · ETA {o.eta} min</p>
                </div>
                <Tag tone={tone}>{done ? done : o.cause}</Tag>
                {o.risk >= 40 && !done && (
                  <button onClick={() => setFixed({ ...fixed, [o.id]: `Done: ${o.action}` })} className="rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground">{o.action}</button>
                )}
              </div>
            );
          })}
        </div>
      </Panel>
    </AppShell>
  );
}
