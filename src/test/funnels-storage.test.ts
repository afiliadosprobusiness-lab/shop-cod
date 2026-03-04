import { beforeEach, describe, expect, it } from "vitest";
import { loadEditorState } from "@/lib/editor";
import {
  deleteFunnel,
  getFunnelTemplates,
  loadFunnels,
  saveFunnel,
  slugifyFunnelName,
  updateFunnel,
} from "@/lib/funnels";

describe("funnels storage", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("loads seeded funnels when no local data exists", () => {
    const funnels = loadFunnels();

    expect(funnels.length).toBeGreaterThan(0);
    expect(funnels[0]?.name).toBeTruthy();
  });

  it("returns the available wizard templates", () => {
    const templates = getFunnelTemplates();

    expect(templates).toHaveLength(3);
    expect(templates.map((template) => template.name)).toEqual(
      expect.arrayContaining(["Blank", "IA", "Plantillas predisenadas"]),
    );
  });

  it("saves a funnel and initializes a compatible editor draft", () => {
    const existingSlug = loadFunnels()[0]?.slug || "sample-funnel";

    const funnel = saveFunnel({
      name: "Sample Funnel",
      slug: existingSlug,
      currency: "USD",
      templateId: "ai",
    });

    const editorState = loadEditorState(funnel.id);

    expect(funnel.slug).not.toBe(existingSlug);
    expect(funnel.pages.length).toBeGreaterThan(0);
    expect(editorState).not.toBeNull();
    expect(editorState?.blocks.length).toBeGreaterThan(0);
    expect(slugifyFunnelName(funnel.slug)).toBe(funnel.slug);
  });

  it("deletes a funnel and removes its draft", () => {
    const funnel = saveFunnel({
      name: "Delete Funnel",
      slug: "delete-funnel",
      currency: "USD",
      templateId: "blank",
    });

    const nextFunnels = deleteFunnel(funnel.id);

    expect(nextFunnels).not.toBeNull();
    expect(loadFunnels().some((item) => item.id === funnel.id)).toBe(false);
    expect(loadEditorState(funnel.id)).toBeNull();
  });

  it("starts blank funnels without initial pages", () => {
    const funnel = saveFunnel({
      name: "Blank Funnel",
      slug: "blank-funnel",
      currency: "USD",
      templateId: "blank",
    });

    const editorState = loadEditorState(funnel.id);

    expect(funnel.pages).toHaveLength(0);
    expect(editorState?.funnelBuilder?.nodes).toHaveLength(0);
    expect(editorState?.funnelBuilder?.pages).toHaveLength(0);
  });

  it("updates funnel settings and preserves unique slug", () => {
    const first = saveFunnel({
      name: "Primary Funnel",
      slug: "primary-funnel",
      currency: "USD",
      templateId: "ai",
    });
    const second = saveFunnel({
      name: "Secondary Funnel",
      slug: "secondary-funnel",
      currency: "EUR",
      templateId: "preset",
    });

    const updated = updateFunnel(second.id, {
      name: "Secondary Updated",
      slug: first.slug,
      currency: "PEN",
    });

    expect(updated).not.toBeNull();
    expect(updated?.name).toBe("Secondary Updated");
    expect(updated?.currency).toBe("PEN");
    expect(updated?.slug).not.toBe(first.slug);
  });
});
