import { describe, expect, it } from "vitest";
import {
  createDefaultStoreBuilderState,
  createOrderBump,
  createStoreBundle,
  createStoreCollection,
  createStoreProduct,
} from "@/builders/store-builder";

describe("store builder schema", () => {
  it("creates a default store builder state with catalog and checkout", () => {
    const state = createDefaultStoreBuilderState({
      storeName: "ShopCOD",
      productName: "Auriculares Pro",
      price: "$49.90",
    });

    expect(state.products).toHaveLength(1);
    expect(state.bundles.length).toBeGreaterThanOrEqual(1);
    expect(state.collections.length).toBeGreaterThanOrEqual(1);
    expect(state.checkout.enabledCurrencies).toContain("USD");
    expect(state.checkout.domains[0]).toContain("shopcod");
  });

  it("creates standalone products, bundles and collections", () => {
    const product = createStoreProduct({ productName: "Combo" });
    const bundle = createStoreBundle([product.id]);
    const collection = createStoreCollection([product.id]);

    expect(product.name).toBe("Combo");
    expect(bundle.productIds).toEqual([product.id]);
    expect(collection.productIds).toEqual([product.id]);
  });

  it("creates order bumps with editable defaults", () => {
    const orderBump = createOrderBump("product-1");

    expect(orderBump.productId).toBe("product-1");
    expect(orderBump.price).toBe(0);
    expect(orderBump.description.length).toBeGreaterThan(0);
  });
});
