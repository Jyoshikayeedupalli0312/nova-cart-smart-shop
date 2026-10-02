import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell, Meter, PageHead, Panel, Tag } from "@/components/AppShell";
import { inventoryConfidence, storeReliability } from "@/lib/nova-engine";
import { novaStore, useNova } from "@/lib/nova-store";

export const Route = createFileRoute("/partners")({
  head: () => ({
    meta: [
      { title: "Store Partner Dashboard — NOVA CART" },
      { name: "description", content: "Partner stores see low stock, unmet searches and demand forecasts, and update inventory in one tap." },
      { property: "og:title", content: "Store Partner Dashboard — NOVA CART" },
      { property: "og:description", content: "Inventory made effortless for local stores." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Partners,
});

function Partners() {
  const { products, stores, log } = useNova();
  const [sid, setSid] = useState("S1");
  const s = stores.find((x) => x.id === sid)!;
  const mine = products.filter((p) => p.storeId === sid);
  const lost = mine.filter((p) => p.stock === 0).reduce((a, p) => a + p.unavailableSearches * p.price * 0.3, 0);

  return (
    <AppShell>
      <PageHead kicker="Partner store" title="Inventory in one tap, demand you can see" sub="39% of stores say inventory upkeep is too much effort. Here every action is a single tap — and it instantly changes what customers are shown." />
      <select value={sid} onChange={(e) => setSid(e.target.value)} className="mb-6 h-11 rounded-xl border bg-card px-3 text-sm">
        {stores.map((x) => <option key={x.id} value={x.id}>{x.name} · {x.category} · {x.city}</option>)}
      </select>

      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          ["Reliability score", `${storeReliability(s)}`],
          ["Acceptance rate", `${Math.round(s.acceptRate * 100)}%`],
          ["Inventory last synced", s.inventorySyncHrs === 0 ? "Just now" : `${s.inventorySyncHrs}h ago`],
          ["Est. lost sales / week", `₹${Math.round(lost).toLocaleString("en-IN")}`],
        ].map(([a, b]) => (
          <div key={a} className="rounded-2xl border bg-card p-4"><p className="text-xs text-muted-foreground">{a}</p><p className="num mt-1 text-2xl font-bold">{b}</p></div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Panel title="Your products" className="lg:col-span-2" right={<button onClick={() => novaStore.syncStore(sid)} className="rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground">Confirm all stock is accurate</button>}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs text-muted-foreground"><tr><th className="pb-2">Product</th><th>Stock</th><th>Demand/day</th><th>Confidence</th><th>Signal</th><th className="text-right">Quick update</th></tr></thead>
              <tbody>
                {mine.map((p) => {
                  const conf = inventoryConfidence(p, s);
                  const forecast = Math.round(p.dailyDemand * 1.3 * 2);
                  return (
                    <tr key={p.id} className="border-t">
                      <td className="py-2.5 font-medium">{p.name}</td>
                      <td className="num">{p.stock}</td>
                      <td className="num">{p.dailyDemand}</td>
                      <td><Meter value={conf} /></td>
                      <td>
                        {p.stock === 0 ? <Tag tone="bad">{p.unavailableSearches} missed searches</Tag>
                          : p.stock < p.dailyDemand ? <Tag tone="warn">Low — restock {forecast}</Tag>
                          : p.dailyDemand > 28 ? <Tag tone="good">High demand</Tag> : <Tag>OK</Tag>}
                      </td>
                      <td className="text-right">
                        <div className="inline-flex gap-1">
                          <button onClick={() => novaStore.setStock(p.id, 0)} className="rounded-md bg-muted px-2 py-1 text-xs">Out</button>
                          <button onClick={() => novaStore.setStock(p.id, p.stock + 10)} className="rounded-md bg-muted px-2 py-1 text-xs">+10</button>
                          <button onClick={() => novaStore.setStock(p.id, forecast)} className="rounded-md bg-secondary px-2 py-1 text-xs font-semibold text-secondary-foreground">Restock</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Panel>
        <div className="space-y-4">
          <Panel title="Most-searched, not available (all stores)">
            <ul className="space-y-2 text-sm">
              {[...products].filter((p) => p.stock === 0).sort((a, b) => b.unavailableSearches - a.unavailableSearches).slice(0, 6).map((p) => (
                <li key={p.id} className="flex justify-between gap-2"><span>{p.name} <span className="text-xs text-muted-foreground">· {stores.find((x) => x.id === p.storeId)?.name}</span></span><span className="num font-bold text-destructive">{p.unavailableSearches}</span></li>
              ))}
            </ul>
          </Panel>
          <Panel title="Margin-safe promotion tip">
            <p className="text-sm text-muted-foreground">{s.marginSensitive ? "Your margins are tight. NOVA CART funds targeted 2nd-order nudges instead of asking you for store-wide discounts." : "Offer 5% on high-demand items to first-time buyers in 2 km — conversion is 3× better than blanket 15% off."}</p>
          </Panel>
          <Panel title="Live activity">
            {log.length === 0 ? <p className="text-sm text-muted-foreground">Update stock — then check the Customer App: recommendations change instantly.</p> :
              <ul className="space-y-1 text-xs">{log.map((l, i) => <li key={i}>• {l}</li>)}</ul>}
          </Panel>
        </div>
      </div>
    </AppShell>
  );
}
