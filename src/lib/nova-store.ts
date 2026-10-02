import { useSyncExternalStore } from "react";
import { PRODUCTS, STORES, type Product, type Store } from "./nova-data";

// Shared in-memory state so partner inventory edits instantly change customer recommendations.
type State = { products: Product[]; stores: Store[]; log: string[] };
let state: State = { products: PRODUCTS, stores: STORES, log: [] };
const subs = new Set<() => void>();
const emit = () => subs.forEach((f) => f());

export const novaStore = {
  get: () => state,
  subscribe: (f: () => void) => (subs.add(f), () => subs.delete(f)),
  setStock(id: string, stock: number) {
    const p = state.products.find((x) => x.id === id);
    state = {
      ...state,
      products: state.products.map((x) => (x.id === id ? { ...x, stock, unavailableSearches: stock > 0 ? 0 : x.unavailableSearches } : x)),
      log: [`Stock of ${p?.name} set to ${stock}`, ...state.log].slice(0, 8),
    };
    emit();
  },
  syncStore(storeId: string) {
    const s = state.stores.find((x) => x.id === storeId);
    state = {
      ...state,
      stores: state.stores.map((x) => (x.id === storeId ? { ...x, inventorySyncHrs: 0 } : x)),
      log: [`${s?.name} synced inventory`, ...state.log].slice(0, 8),
    };
    emit();
  },
};

export function useNova() {
  return useSyncExternalStore(novaStore.subscribe, novaStore.get, novaStore.get);
}
