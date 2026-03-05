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

  it("starts empty when there is no local catalog", () => {
    expect(loadStores()).toEqual([]);
  });

  it("removes legacy demo stores from persisted data", () => {
    window.localStorage.setItem(
      "shopcod-stores-v1",
      JSON.stringify([
        {
          id: "store-201",
          name: "Glow Market",
          slug: "glow-market",
          currency: "USD",
          pages: [
            { id: "page-home-1", name: "Home", type: "home" },
            { id: "page-product-1", name: "Producto", type: "product" },
            { id: "page-checkout-1", name: "Checkout", type: "checkout" },
            { id: "page-thankyou-1", name: "Thank you", type: "thankyou" },
          ],
          paymentMethod: "separateCheckout",
          templateId: "catalog",
          createdAt: "2026-03-02T15:00:00.000Z",
          updatedAt: "2026-03-03T18:40:00.000Z",
        },
        {
          id: "store-real-1",
          name: "Real Store",
          slug: "real-store",
          currency: "USD",
          pages: [
            { id: "page-home-2", name: "Home", type: "home" },
            { id: "page-product-2", name: "Producto", type: "product" },
            { id: "page-checkout-2", name: "Checkout", type: "checkout" },
            { id: "page-thankyou-2", name: "Thank you", type: "thankyou" },
          ],
          paymentMethod: "separateCheckout",
          templateId: "singleProduct",
          createdAt: "2026-03-04T10:00:00.000Z",
          updatedAt: "2026-03-04T12:00:00.000Z",
        },
      ]),
    );

    const stores = loadStores();
    const persistedStores = JSON.parse(
      window.localStorage.getItem("shopcod-stores-v1") ?? "[]",
    ) as Array<{ id: string }>;

    expect(stores).toHaveLength(1);
    expect(stores[0]?.id).toBe("store-real-1");
    expect(persistedStores).toHaveLength(1);
    expect(persistedStores[0]?.id).toBe("store-real-1");
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
