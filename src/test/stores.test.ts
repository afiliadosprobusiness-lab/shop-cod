import { beforeEach, describe, expect, it } from "vitest";
import { loadEditorState } from "@/lib/editor";
import {
  deleteStore,
  getStoreDashboardSnapshot,
  loadStores,
  saveStore,
} from "@/lib/stores";

describe("stores storage", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("persists a store and initializes the editor draft", () => {
    const store = saveStore({
      name: "Nova COD",
      slug: "nova-cod",
      currency: "EUR",
      templateId: "catalog",
      paymentMethod: "separateCheckout",
    });

    const stores = loadStores();
    const draft = loadEditorState(store.id);

    expect(stores[0]?.id).toBe(store.id);
    expect(stores[0]?.pages.some((page) => page.type === "checkout")).toBe(true);
    expect(draft?.profile?.storeName).toBe("Nova COD");
    expect(draft?.storeBuilder?.products.length).toBeGreaterThan(0);
  });

  it("keeps slugs unique and removes checkout when payment is on the product page", () => {
    saveStore({
      name: "Promo Edge",
      slug: "promo-edge",
      currency: "USD",
      templateId: "singleProduct",
      paymentMethod: "separateCheckout",
    });

    const secondStore = saveStore({
      name: "Promo Edge 2",
      slug: "promo-edge",
      currency: "USD",
      templateId: "flashSale",
      paymentMethod: "productPagePayment",
    });

    const storedStore = loadStores().find((item) => item.id === secondStore.id);

    expect(secondStore.slug).toBe("promo-edge-2");
    expect(storedStore?.pages.some((page) => page.type === "checkout")).toBe(false);
    expect(storedStore?.pages.some((page) => page.name.includes("+ Pago"))).toBe(true);
  });

  it("builds a dashboard snapshot with basic analytics", () => {
    const store = saveStore({
      name: "Metric Shop",
      slug: "metric-shop",
      currency: "PEN",
      templateId: "catalog",
      paymentMethod: "separateCheckout",
    });

    const snapshot = getStoreDashboardSnapshot(store.id);

    expect(snapshot?.store.id).toBe(store.id);
    expect(snapshot?.metrics.visitors).toBeGreaterThan(0);
    expect(snapshot?.metrics.orders).toBeGreaterThan(0);
    expect(snapshot?.topProducts.length).toBeGreaterThan(0);
    expect(snapshot?.trafficSources).toHaveLength(4);
    expect(snapshot?.languages.length).toBeGreaterThan(0);
  });

  it("deletes a store and removes its editor draft", () => {
    const store = saveStore({
      name: "Delete Store",
      slug: "delete-store",
      currency: "USD",
      templateId: "singleProduct",
      paymentMethod: "separateCheckout",
    });

    const nextStores = deleteStore(store.id);

    expect(nextStores).not.toBeNull();
    expect(loadStores().some((item) => item.id === store.id)).toBe(false);
    expect(loadEditorState(store.id)).toBeNull();
  });
});
