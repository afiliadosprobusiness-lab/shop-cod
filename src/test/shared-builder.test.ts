import { describe, expect, it } from "vitest";
import {
  createDefaultFunnelGraph,
  createDefaultPageBuilderBlocks,
  createDefaultStoreBuilderState,
} from "@/builders/shared";

describe("shared builder engine", () => {
  it("exposes the canonical page, funnel and store models", () => {
    const page = createDefaultPageBuilderBlocks({ productName: "Kit Pro" });
    const funnel = createDefaultFunnelGraph("Shared Funnel");
    const store = createDefaultStoreBuilderState({ productName: "Kit Pro" });

    expect(page.length).toBeGreaterThan(0);
    expect(funnel.name).toBe("Shared Funnel");
    expect(funnel.nodes.length).toBeGreaterThan(0);
    expect(store.products[0]?.name).toBe("Kit Pro");
  });
});
