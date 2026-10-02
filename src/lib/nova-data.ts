// Deterministic demo dataset for NOVA CART (fictional).
export type Category = "Grocery" | "Pharmacy" | "Bakery" | "Stationery" | "Fruits & Veg" | "Dairy";

export interface Store {
  id: string;
  name: string;
  category: Category;
  city: string;
  distanceKm: number;
  acceptRate: number; // 0-1 share of orders accepted
  onTimeRate: number; // 0-1
  prepMin: number;
  inventorySyncHrs: number; // hours since last inventory update
  marginSensitive: boolean;
}

export interface Product {
  id: string;
  name: string;
  category: Category;
  storeId: string;
  price: number;
  stock: number;
  dailyDemand: number;
  unavailableSearches: number; // searches last 7d while out of stock
  promo?: number; // % off
}

export interface Customer {
  id: string;
  name: string;
  segment: string;
  city: string;
  orders: number;
  lastOrderDays: number;
  categories: Category[];
  priceSensitive: boolean;
  favourites: string[]; // product names
}

export const BASELINE = {
  registered: 120000,
  mau: 46000,
  orders: 38500,
  aov: 486,
  revenueLakh: 26.1,
  repeat: 27,
  repeatPrev: 41,
  deliveryMin: 37,
  deliveryPrev: 29,
  cancel: 11,
  cancelPrev: 6,
  tickets: 5900,
  ticketsPrev: 3100,
  promoLakh: 17,
  promoPrev: 9.5,
  stores: 620,
};

let seed = 7;
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

export const STORES: Store[] = [
  ["Sharma Kirana", "Grocery"], ["FreshBasket Mart", "Grocery"], ["Annapurna Stores", "Grocery"],
  ["MedPlus Corner", "Pharmacy"], ["Apollo Lane Pharmacy", "Pharmacy"],
  ["Iyengar Bakery", "Bakery"], ["Crumbs & Co.", "Bakery"],
  ["Pen Point Stationers", "Stationery"],
  ["Green Leaf Sabzi", "Fruits & Veg"], ["Farm2Door Veggies", "Fruits & Veg"],
  ["Nandini Milk Parlour", "Dairy"], ["Gokul Dairy Hub", "Dairy"],
].map(([name, category], i) => ({
  id: `S${i + 1}`,
  name,
  category: category as Category,
  city: ["Bengaluru", "Pune", "Hyderabad"][i % 3],
  distanceKm: +(0.6 + rnd() * 4.2).toFixed(1),
  acceptRate: +(0.72 + rnd() * 0.27).toFixed(2),
  onTimeRate: +(0.68 + rnd() * 0.3).toFixed(2),
  prepMin: Math.round(6 + rnd() * 14),
  inventorySyncHrs: Math.round(rnd() * 40),
  marginSensitive: rnd() > 0.6,
}));

const CATALOG: Record<Category, [string, number][]> = {
  Grocery: [["Basmati Rice 5kg", 620], ["Toor Dal 1kg", 165], ["Sunflower Oil 1L", 148], ["Atta 10kg", 455], ["Masala Chai 250g", 140], ["Maggi 12-pack", 168]],
  Pharmacy: [["Paracetamol 650", 32], ["ORS Sachets x10", 95], ["Vitamin C Tabs", 120], ["Hand Sanitizer", 85], ["Digital Thermometer", 240]],
  Bakery: [["Sourdough Loaf", 180], ["Butter Croissant", 75], ["Rusk 300g", 60], ["Plum Cake", 220], ["Multigrain Bread", 55]],
  Stationery: [["A4 Notebook x5", 210], ["Gel Pens x10", 120], ["Geometry Box", 145], ["Sticky Notes", 60]],
  "Fruits & Veg": [["Tomatoes 1kg", 42], ["Onions 2kg", 70], ["Bananas 12", 60], ["Alphonso Mango 1kg", 380], ["Spinach Bunch", 25], ["Coriander", 12]],
  Dairy: [["Toned Milk 1L", 54], ["Paneer 200g", 90], ["Curd 400g", 45], ["Butter 100g", 58], ["Ghee 500ml", 340]],
};

export const PRODUCTS: Product[] = STORES.flatMap((s) =>
  CATALOG[s.category].map(([name, price], j) => {
    const demand = Math.round(4 + rnd() * 36);
    const stock = rnd() < 0.22 ? 0 : Math.round(rnd() * 60);
    return {
      id: `${s.id}-P${j}`,
      name,
      category: s.category,
      storeId: s.id,
      price: Math.round(price * (0.92 + rnd() * 0.16)),
      stock,
      dailyDemand: demand,
      unavailableSearches: stock === 0 ? Math.round(10 + rnd() * 80) : Math.round(rnd() * 6),
      promo: rnd() > 0.75 ? [5, 10, 15, 20][Math.floor(rnd() * 4)] : undefined,
    };
  }),
);

export const CUSTOMERS: Customer[] = [
  { id: "C1", name: "Ananya R.", segment: "New · 1 order", city: "Bengaluru", orders: 1, lastOrderDays: 12, categories: ["Grocery"], priceSensitive: true, favourites: ["Toor Dal 1kg", "Toned Milk 1L"] },
  { id: "C2", name: "Rohit M.", segment: "At risk · lapsed 34d", city: "Pune", orders: 6, lastOrderDays: 34, categories: ["Grocery", "Dairy"], priceSensitive: false, favourites: ["Atta 10kg", "Paneer 200g", "Curd 400g"] },
  { id: "C3", name: "Fatima S.", segment: "Loyal · 14 orders", city: "Hyderabad", orders: 14, lastOrderDays: 3, categories: ["Bakery", "Dairy", "Fruits & Veg"], priceSensitive: false, favourites: ["Sourdough Loaf", "Bananas 12", "Butter 100g"] },
  { id: "C4", name: "Karthik V.", segment: "2 orders · habit forming", city: "Bengaluru", orders: 2, lastOrderDays: 9, categories: ["Pharmacy", "Grocery"], priceSensitive: true, favourites: ["Vitamin C Tabs", "Masala Chai 250g"] },
];

export const storeById = (id: string) => STORES.find((s) => s.id === id)!;
