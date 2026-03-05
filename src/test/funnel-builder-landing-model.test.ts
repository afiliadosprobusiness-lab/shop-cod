import { describe, expect, it } from "vitest";
import type { LandingBlock } from "@/lib/funnel-system";
import {
  insertElementAsSectionAt,
  insertElementToColumnIndex,
  moveElementToColumnIndex,
  moveSectionToIndex,
  pageFromLandingSections,
  updateNodePropsById,
} from "@/features/funnel-builder/model";

function basePage() {
  const blocks: LandingBlock[] = [
    { id: "blk_a", type: "headline", content: "A" },
    { id: "blk_b", type: "text", content: "B" },
  ];
  return pageFromLandingSections(blocks);
}

describe("landing builder model drag-drop ops", () => {
  it("inserts an element as a new section at the requested index", () => {
    const page = basePage();
    const next = insertElementAsSectionAt(page, "button", 0);

    expect(next.children).toHaveLength(3);
    expect(next.children[0]?.children[0]?.children[0]?.type).toBe("button");
  });

  it("moves a section to a target index", () => {
    const page = basePage();
    const next = moveSectionToIndex(page, "sec_blk_a", 1);

    expect(next.children[0]?.id).toBe("sec_blk_b");
    expect(next.children[1]?.id).toBe("sec_blk_a");
  });

  it("inserts a new element into a column index", () => {
    const page = basePage();
    const next = insertElementToColumnIndex(page, "image", "col_blk_a", 0);
    const targetColumn = next.children[0]?.children[0];

    expect(targetColumn?.children).toHaveLength(2);
    expect(targetColumn?.children[0]?.type).toBe("image");
  });

  it("moves an existing element across columns", () => {
    const page = basePage();
    const next = moveElementToColumnIndex(page, "blk_a", "col_blk_b", 1);
    const sourceColumn = next.children[0]?.children[0];
    const targetColumn = next.children[1]?.children[0];

    expect(sourceColumn?.children).toHaveLength(0);
    expect(targetColumn?.children).toHaveLength(2);
    expect(targetColumn?.children[1]?.id).toBe("blk_a");
  });

  it("updates props for layout and element nodes", () => {
    const page = basePage();
    const withSection = updateNodePropsById(page, "sec_blk_a", { label: "Hero zone", paddingY: 40 });
    const withColumn = updateNodePropsById(withSection, "col_blk_a", { span: 6 });
    const withElement = updateNodePropsById(withColumn, "blk_b", { content: "Updated text" });

    expect(withElement.children[0]?.props.label).toBe("Hero zone");
    expect(withElement.children[0]?.props.paddingY).toBe(40);
    expect(withElement.children[0]?.children[0]?.props.span).toBe(6);
    expect(withElement.children[1]?.children[0]?.children[0]?.props.content).toBe("Updated text");
  });
});
