import { beforeEach, describe, expect, it } from "vitest";
import {
  deleteStoreDraft,
  loadEditorState,
  loadStoreCatalog,
  publishEditorState,
  saveEditorState,
  setStoreCatalogStatus,
  type FunnelBlock,
  type StoreProfile,
} from "@/lib/editor";

describe("editor storage", () => {
  const storeId = "test-store";
  const blocks: FunnelBlock[] = [
    {
      id: "b1",
      type: "hero",
      data: {
        title: "Producto",
      },
    },
  ];
  const profile: StoreProfile = {
    storeName: "Mi tienda",
    productName: "Producto",
    headline: "Headline de prueba",
    subheadline: "Subheadline de prueba",
    price: "$49.900",
    originalPrice: "$89.900",
    ctaText: "Comprar ahora",
    category: "General",
  };

  beforeEach(() => {
    window.localStorage.clear();
  });

  it("saves and loads a draft with profile", () => {
    saveEditorState(storeId, blocks, profile);

    const storedState = loadEditorState(storeId);

    expect(storedState?.blocks).toEqual(blocks);
    expect(storedState?.profile).toEqual(profile);
    expect(storedState?.publishedAt).toBeNull();
    expect(typeof storedState?.updatedAt).toBe("string");
  });

  it("keeps a published timestamp and syncs the catalog", () => {
    saveEditorState(storeId, blocks, profile);
    const publishedState = publishEditorState(storeId, undefined, profile);
    const storedState = loadEditorState(storeId);
    const catalog = loadStoreCatalog();

    expect(publishedState?.publishedAt).not.toBeNull();
    expect(storedState?.publishedAt).toBe(publishedState?.publishedAt);
    expect(catalog[0]?.id).toBe(storeId);
    expect(catalog[0]?.name).toBe("Mi tienda");
    expect(catalog[0]?.status).toBe("activa");
  });

  it("updates the catalog status for local stores", () => {
    saveEditorState(storeId, blocks, profile);
    setStoreCatalogStatus(storeId, "pausada");

    const catalog = loadStoreCatalog();

    expect(catalog[0]?.status).toBe("pausada");
  });

  it("removes the draft and catalog item for deleted stores", () => {
    saveEditorState(storeId, blocks, profile);

    const catalog = deleteStoreDraft(storeId);

    expect(loadEditorState(storeId)).toBeNull();
    expect(catalog).toHaveLength(0);
    expect(loadStoreCatalog()).toHaveLength(0);
  });
});
