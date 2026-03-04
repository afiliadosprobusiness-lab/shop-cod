import { describe, expect, it } from "vitest";
import {
  createPageBuilderDocument,
  createDefaultPageBuilderBlocks,
  createPageBuilderBlock,
  serializePageBuilderDocument,
} from "@/builders/page-builder/blocks/schema";
import {
  duplicatePageBuilderBlock,
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
    expect(blocks[0]?.type).toBe("section");
    expect(blocks[0]?.children.length).toBeGreaterThan(0);
    expect(blocks[0]?.children[0]?.children[1]?.content.label).toBe("Pedir hoy");
    expect(blocks[2]?.children[0]?.children[0]?.type).toBe("divider");
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

  it("duplicates a block and serializes page json", () => {
    const section = createPageBuilderBlock("section");
    const text = createPageBuilderBlock("text");
    const tree = insertPageBuilderBlock([section], section.id, 0, text);

    const duplicated = duplicatePageBuilderBlock(tree, text.id);
    const page = createPageBuilderDocument(duplicated.blocks, {
      id: "page-1",
      title: "Landing principal",
    });
    const serialized = serializePageBuilderDocument(duplicated.blocks, {
      id: "page-1",
      title: "Landing principal",
    });

    expect(duplicated.duplicated).not.toBeNull();
    expect(findPageBuilderBlock(duplicated.blocks, section.id)?.children).toHaveLength(2);
    expect(page.title).toBe("Landing principal");
    expect(serialized).toContain('"title": "Landing principal"');
    expect(serialized).toContain('"type": "text"');
  });
});
