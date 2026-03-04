import { beforeEach, describe, expect, it } from "vitest";
import { loadEditorState } from "@/lib/editor";
import { getFunnelTemplates, loadFunnels, saveFunnel, slugifyFunnelName } from "@/lib/funnels";

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
});
