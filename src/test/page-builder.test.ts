import { describe, expect, it } from "vitest";
import {
  createDefaultPageBuilderBlocks,
  createPageBuilderBlock,
} from "@/builders/page-builder/blocks/schema";
import {
  findPageBuilderBlock,
  insertPageBuilderBlock,
  movePageBuilderBlock,
  removePageBuilderBlock,
  updatePageBuilderBlock,
} from "@/builders/page-builder/blocks/tree";

describe("page builder schema", () => {
  it("creates a nested default layout", () => {
    const blocks = createDefaultPageBuilderBlocks({
      productName: "Auriculares Pro",
      ctaText: "Pedir hoy",
    });

    expect(blocks).toHaveLength(3);
    expect(blocks[0]?.children.length).toBeGreaterThan(0);
    expect(blocks[1]?.children.length).toBeGreaterThan(1);
    expect(blocks[0]?.children[1]?.content.label).toBe("Pedir hoy");
  });

  it("moves blocks between root and nested containers", () => {
    const container = createPageBuilderBlock("container");
    const text = createPageBuilderBlock("text");
    const button = createPageBuilderBlock("button");
    const rootBlocks = insertPageBuilderBlock([container, button], container.id, 0, text);

    const moved = movePageBuilderBlock(rootBlocks, text.id, null, 1);

    expect(moved[1]?.id).toBe(text.id);
    expect(moved[0]?.children).toHaveLength(0);
  });

  it("updates and removes nested nodes immutably", () => {
    const container = createPageBuilderBlock("container");
    const text = createPageBuilderBlock("text");
    const tree = insertPageBuilderBlock([container], container.id, 0, text);

    const updated = updatePageBuilderBlock(tree, text.id, (block) => ({
      ...block,
      content: {
        ...block.content,
        title: "Nuevo titulo",
      },
    }));

    expect(findPageBuilderBlock(updated, text.id)?.content.title).toBe("Nuevo titulo");

    const removed = removePageBuilderBlock(updated, text.id);

    expect(removed.removed?.id).toBe(text.id);
    expect(findPageBuilderBlock(removed.blocks, text.id)).toBeNull();
  });
});
