import { beforeEach, describe, expect, it } from "vitest";
import {
  deleteProduct,
  duplicateProduct,
  loadProducts,
  saveProduct,
  slugifyProductName,
} from "@/lib/products";

describe("products storage", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("loads seeded products when no local data exists", () => {
    const products = loadProducts();

    expect(products.length).toBeGreaterThan(0);
    expect(products[0]?.name).toBeTruthy();
  });

  it("saves a product and ensures a unique slug", () => {
    const existingSlug = loadProducts()[0]?.slug || "sample-product";

    const product = saveProduct({
      name: "Sample Product",
      description: "Descripcion",
      price: 49.9,
      comparePrice: 69.9,
      images: ["https://example.com/image.png"],
      variants: ["Base"],
      inventory: 12,
      sku: "SAMPLE-001",
      slug: existingSlug,
      tags: ["test"],
      inventoryTracking: true,
      shipping: true,
      customFields: [{ id: "cf-test", key: "Origen", value: "PE" }],
      orderBump: null,
      upsell: null,
    });

    expect(product.slug).not.toBe(existingSlug);
    expect(loadProducts()[0]?.id).toBe(product.id);
  });

  it("duplicates an existing product", () => {
    const source = loadProducts()[0];

    const duplicate = duplicateProduct(source.id);

    expect(duplicate).not.toBeNull();
    expect(duplicate?.id).not.toBe(source.id);
    expect(duplicate?.name).toContain("copia");
    expect(slugifyProductName(duplicate?.slug || "")).toBe(duplicate?.slug);
  });

  it("deletes an existing product", () => {
    const source = loadProducts()[0];
    const nextProducts = deleteProduct(source.id);

    expect(nextProducts).not.toBeNull();
    expect(loadProducts().some((product) => product.id === source.id)).toBe(false);
  });
});
