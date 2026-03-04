import { describe, expect, it } from "vitest";
import {
  buildQuantityOrderBumpOffer,
  buildUpsellOfferFromProduct,
  normalizeDiscountPercentage,
  normalizeOrderBumpQuantity,
} from "@/lib/product-offers";
import type { Product } from "@/lib/products";

const productFixture: Product = {
  id: "prod-1",
  name: "Glow Serum",
  description: "Serum premium",
  price: 20,
  comparePrice: 30,
  images: [],
  variants: [],
  inventory: 10,
  sku: "SERUM-1",
  slug: "glow-serum",
  tags: [],
  createdAt: "2026-03-04T00:00:00.000Z",
  inventoryTracking: true,
  shipping: true,
  customFields: [],
  orderBump: null,
  upsell: null,
};

describe("product offers helpers", () => {
  it("normalizes quantity and discount boundaries", () => {
    expect(normalizeOrderBumpQuantity(1)).toBe(2);
    expect(normalizeOrderBumpQuantity(3.9)).toBe(3);
    expect(normalizeDiscountPercentage(-5)).toBe(0);
    expect(normalizeDiscountPercentage(120)).toBe(100);
  });

  it("builds order bump price based on quantity offer", () => {
    const offer = buildQuantityOrderBumpOffer({
      enabled: true,
      baseProductName: "Glow Serum",
      baseProductUnitPrice: 20,
      quantity: 3,
      discountPercentage: 10,
    });

    expect(offer).not.toBeNull();
    expect(offer?.name).toContain("Pack x3");
    expect(offer?.price).toBe(54);
  });

  it("builds upsell from selected product and custom price", () => {
    const offer = buildUpsellOfferFromProduct({
      enabled: true,
      selectedProduct: productFixture,
      customPrice: 15,
    });

    expect(offer).not.toBeNull();
    expect(offer?.name).toBe("Glow Serum");
    expect(offer?.price).toBe(15);
  });
});
