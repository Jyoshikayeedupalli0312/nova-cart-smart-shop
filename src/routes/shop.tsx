import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell, Meter, PageHead, Panel, Tag } from "@/components/AppShell";
import { CUSTOMERS } from "@/lib/nova-data";
import { inr, nextBestAction, recommend, substitute } from "@/lib/nova-engine";
import { useNova } from "@/lib/nova-store";

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "Customer App — NOVA CART Recommendations" },
      { name: "description", content: "Personalised local product recommendations ranked by inventory confidence, store reliability and ETA." },
      { property: "og:title", content: "Customer App — NOVA CART" },
      { property: "og:description", content: "See how NOVA CART recommends only what will actually arrive." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Shop,
});

function Shop() {
  const { products, stores } = useNova();
  const [cid, setCid] = useState("C1");
  const [q, setQ] = useState("");
  const [floor, setFloor] = useState(60);
  const [showHidden, setShowHidden] = useState(false);
  const [cart, setCart] = useState<string[]>([]);
  const c = CUSTOMERS.find((x) => x.id === cid)!;
  const recs = useMemo(() => recommend(c, products, stores, q, floor), [c, products, stores, q, floor]);
  const visible = recs.filter((r) => !r.hidden);
  const hidden = recs.filter((r) => r.hidden);
  const nba = nextBestAction(c);
  const cartItems = recs.filter((r) => cart.includes(r.product.id));
  const total = cartItems.reduce((a, r) => a + r.product.price * (1 - (r.product.promo ?? 0) / 100), 0);
  const cats = new Set(cartItems.map((r) => r.product.category));

  return (
    <AppShell>
      <PageHead kicker="Customer experience" title="Recommendations that actually arrive" sub="Each item is ranked by personal relevance, inventory confidence, store reliability and delivery time. Likely-unavailable items are hidden before they become a cancellation." />

      <div className="mb-6 flex flex-wrap gap-2">
        {CUSTOMERS.map((x) => (
          <button key={x.id} onClick={() => { setCid(x.id); setCart([]); }} className={`rounded-xl border px-4 py-2 text-left text-sm transition ${x.id === cid ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:bg-muted"}`}>
            <b>{x.name}</b><span className="block text-xs opacity-75">{x.segment} · {x.city}</span>
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="flex flex-wrap items-center gap-3">
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search milk, bread, paracetamol…" className="h-11 flex-1 rounded-xl border bg-card px-4 text-sm outline-none focus:ring-2 focus:ring-ring" />
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              Confidence floor <input type="range" min={0} max={90} value={floor} onChange={(e) => setFloor(+e.target.value)} className="accent-[var(--primary)]" /><span className="num w-8 font-bold text-foreground">{floor}%</span>
            </label>
          </div>
          <p className="text-xs text-muted-foreground">
            Showing <b className="text-foreground">{visible.length}</b> reliable items · <button className="underline" onClick={() => setShowHidden(!showHidden)}>{hidden.length} hidden as likely unavailable</button>
          </p>

          <div className="grid gap-3 sm:grid-cols-2">
            {(showHidden ? recs : visible).slice(0, 14).map((r) => {
              const sub = r.hidden ? substitute(r.product, products, stores) : undefined;
              const inCart = cart.includes(r.product.id);
              return (
                <div key={r.product.id} className={`rounded-2xl border bg-card p-4 ${r.hidden ? "opacity-60" : ""}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold">{r.product.name}</p>
                      <p className="text-xs text-muted-foreground">{r.store.name} · {r.store.distanceKm} km · ~{r.eta} min</p>
                    </div>
                    <span className="num rounded-lg bg-secondary px-2 py-1 text-xs font-bold text-secondary-foreground">{r.score}</span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">Stock <Meter value={r.confidence} /></span>
                    <span className="flex items-center gap-1">Store <Meter value={r.reliability} /></span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {r.hidden ? <Tag tone="bad">Hidden: likely unavailable</Tag> : r.reasons.slice(0, 3).map((x) => <Tag key={x} tone={x.includes("off") ? "accent" : "muted"}>{x}</Tag>)}
                  </div>
                  {sub && <p className="mt-2 text-xs text-primary">→ Swap to {sub.s.name} ({sub.s.distanceKm} km), in stock</p>}
                  <div className="mt-3 flex items-center justify-between">
                    <span className="num font-bold">{inr(Math.round(r.product.price * (1 - (r.product.promo ?? 0) / 100)))}{r.product.promo ? <s className="ml-1 text-xs font-normal text-muted-foreground">{inr(r.product.price)}</s> : null}</span>
                    {!r.hidden && (
                      <button onClick={() => setCart(inCart ? cart.filter((x) => x !== r.product.id) : [...cart, r.product.id])} className={`rounded-full px-3 py-1 text-xs font-semibold ${inCart ? "bg-muted" : "bg-primary text-primary-foreground"}`}>
                        {inCart ? "Remove" : "Add"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          <Panel title="Next best action">
            <p className="font-semibold text-primary">{nba.title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{nba.detail}</p>
            <p className="mt-3 text-xs">Promo cost: <b className="num">{nba.cost ? inr(nba.cost) : "₹0"}</b> <span className="text-muted-foreground">vs ₹120 blanket coupon</span></p>
          </Panel>
          <Panel title="Basket">
            {cartItems.length === 0 ? <p className="text-sm text-muted-foreground">Add items to see the delivery promise.</p> : (
              <>
                <ul className="space-y-1 text-sm">{cartItems.map((r) => <li key={r.product.id} className="flex justify-between"><span>{r.product.name}</span><span className="num">{inr(Math.round(r.product.price * (1 - (r.product.promo ?? 0) / 100)))}</span></li>)}</ul>
                <div className="mt-3 border-t pt-3 text-sm">
                  <div className="flex justify-between font-bold"><span>Total</span><span className="num">{inr(Math.round(total))}</span></div>
                  <p className="mt-2 text-xs text-muted-foreground">Guaranteed ETA ~{Math.max(...cartItems.map((r) => r.eta))} min · fulfilment confidence {Math.min(...cartItems.map((r) => r.confidence))}%</p>
                  {cats.size >= 2 ? <Tag tone="good">Cross-category basket — higher repeat likelihood</Tag> : <Tag>Tip: add another category</Tag>}
                </div>
              </>
            )}
          </Panel>
        </div>
      </div>
    </AppShell>
  );
}
