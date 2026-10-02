import { type Customer, type Product, type Store } from "./nova-data";

const clamp = (n: number, a = 0, b = 1) => Math.max(a, Math.min(b, n));

/** Probability (0-100) that a listed item is actually available at fulfilment. */
export function inventoryConfidence(p: Product, s: Store) {
  if (p.stock === 0) return 4;
  const cover = clamp(p.stock / Math.max(1, p.dailyDemand * 0.5)); // half-day cover
  const freshness = clamp(1 - s.inventorySyncHrs / 48);
  return Math.round((0.55 * cover + 0.3 * freshness + 0.15 * s.acceptRate) * 100);
}

/** Store reliability 0-100 from acceptance, on-time and sync hygiene. */
export function storeReliability(s: Store) {
  return Math.round((0.45 * s.acceptRate + 0.4 * s.onTimeRate + 0.15 * clamp(1 - s.inventorySyncHrs / 48)) * 100);
}

export function etaMinutes(s: Store) {
  return Math.round(s.prepMin + s.distanceKm * 4.5 + (1 - s.onTimeRate) * 20);
}

export interface Rec {
  product: Product;
  store: Store;
  score: number;
  confidence: number;
  reliability: number;
  eta: number;
  reasons: string[];
  hidden: boolean;
}

/** Ranks every product for a customer; items under the confidence floor are hidden. */
export function recommend(c: Customer, products: Product[], stores: Store[], query = "", floor = 60): Rec[] {
  const q = query.trim().toLowerCase();
  return products
    .filter((p) => !q || p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q))
    .map((p) => {
      const s = stores.find((x) => x.id === p.storeId)!;
      const confidence = inventoryConfidence(p, s);
      const reliability = storeReliability(s);
      const eta = etaMinutes(s);
      const reasons: string[] = [];
      let score = 0;
      if (c.favourites.includes(p.name)) { score += 30; reasons.push("You buy this often"); }
      if (c.categories.includes(p.category)) { score += 12; reasons.push("Matches your usual categories"); }
      else if (c.orders >= 2) { score += 8; reasons.push("New category — builds habit"); }
      score += confidence * 0.25;
      score += reliability * 0.18;
      score += clamp(1 - eta / 45) * 15;
      if (eta <= 25) reasons.push(`Arrives in ~${eta} min`);
      if (s.distanceKm < 1.5) { score += 5; reasons.push("Store is nearby"); }
      if (p.promo && c.priceSensitive) { score += p.promo * 0.5; reasons.push(`${p.promo}% off, applied automatically`); }
      return { product: p, store: s, score: Math.round(score), confidence, reliability, eta, reasons, hidden: confidence < floor };
    })
    .sort((a, b) => b.score - a.score);
}

/** Best in-stock alternative for an unavailable item. */
export function substitute(p: Product, products: Product[], stores: Store[]) {
  return products
    .filter((x) => x.id !== p.id && x.name === p.name && x.stock > 0)
    .map((x) => ({ x, s: stores.find((s) => s.id === x.storeId)! }))
    .sort((a, b) => inventoryConfidence(b.x, b.s) - inventoryConfidence(a.x, a.s))[0];
}

/** Retention-led next-best action for a customer. */
export function nextBestAction(c: Customer) {
  if (c.orders === 1) return { title: "Second-order nudge", detail: "₹40 off order #2 within 7 days + free delivery. Second order is the biggest drop-off (54% → 31%).", cost: 40 };
  if (c.orders === 2) return { title: "Habit milestone", detail: "Unlock 'Nova Regular' at order #3 — 72% of 3-order customers return next month. Suggest a cross-category basket.", cost: 25 };
  if (c.lastOrderDays > 21) return { title: "Win-back with reliability", detail: "Show their usual basket pre-checked as in-stock with guaranteed ETA. No blanket coupon.", cost: 20 };
  return { title: "No discount needed", detail: "Loyal and active. Recommend a new local store category instead of spending promo budget.", cost: 0 };
}

export interface ImpactInputs {
  confidenceFloor: number; // hide items below this inventory confidence
  smartRouting: number; // 0-100 % of orders routed by reliability
  targetedPromo: number; // 0-100 % of promo budget shifted from blanket to targeted
  inventoryAdoption: number; // 0-100 % of stores using 1-tap inventory sync
}

/** Transparent, assumption-based impact model built from the case data. */
export function projectImpact(i: ImpactInputs) {
  const floorEffect = clamp((i.confidenceFloor - 30) / 50); // 0..1
  const inv = i.inventoryAdoption / 100;
  const route = i.smartRouting / 100;
  const promo = i.targetedPromo / 100;

  // Cancellations: 35% unavailability, 27% delays, 18% store rejection, 12% partner availability
  const unavailCut = 0.35 * (0.55 * floorEffect + 0.35 * inv);
  const delayCut = 0.27 * 0.45 * route;
  const rejectCut = 0.18 * (0.4 * route + 0.25 * inv);
  const cancel = 11 * (1 - unavailCut - delayCut - rejectCut);

  const delivery = 37 - 8 * route * 0.8 - 1.5 * floorEffect;
  const repeat = 27 + 6 * floorEffect * 0.6 + 4 * route * 0.6 + 6 * promo * 0.7 + 2 * inv;
  const promoSpend = 17 - 17 * promo * 0.44 * 0.8; // 44% coupons unredeemed
  const tickets = 5900 * (1 - (11 - cancel) / 11 * 0.6);
  const orders = 38500 * (1 + (repeat - 27) / 100 * 1.4) * (1 - (cancel - 11) / -100 * -1);
  const revenue = (orders * 486) / 100000;

  return {
    cancel: +cancel.toFixed(1),
    delivery: Math.round(delivery),
    repeat: +repeat.toFixed(1),
    promoSpend: +promoSpend.toFixed(1),
    tickets: Math.round(tickets),
    orders: Math.round(orders),
    revenue: +revenue.toFixed(1),
    promoSaved: +(17 - promoSpend).toFixed(1),
  };
}

export const inr = (n: number) => "₹" + n.toLocaleString("en-IN");
