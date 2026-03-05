import { describe, expect, it } from "vitest";
import { commitBuilderHistory } from "@/features/funnel-builder/history";
import { pageFromLandingSections } from "@/features/funnel-builder/model";
import type { LandingBlock } from "@/lib/funnel-system";

function page(content: string) {
  const sections: LandingBlock[] = [{ id: `blk_${content}`, type: "text", content }];
  return pageFromLandingSections(sections);
}

describe("funnel builder history", () => {
  it("pushes a new entry for structural commits", () => {
    const base = page("A");
    const next = page("B");
    const result = commitBuilderHistory(
      { history: [base], historyIndex: 0, lastCommit: null },
      next,
      { source: "structure", mode: "push", now: 1000 },
    );

    expect(result.history).toHaveLength(2);
    expect(result.historyIndex).toBe(1);
  });

  it("merges consecutive prop commits on same node inside merge window", () => {
    const base = page("A");
    const first = page("B");
    const second = page("C");
    const afterFirst = commitBuilderHistory(
      { history: [base], historyIndex: 0, lastCommit: null },
      first,
      { source: "props", mode: "merge", nodeId: "blk_1", now: 1000 },
    );
    const afterSecond = commitBuilderHistory(
      afterFirst,
      second,
      { source: "props", mode: "merge", nodeId: "blk_1", now: 1500 },
    );

    expect(afterSecond.history).toHaveLength(2);
    expect(afterSecond.historyIndex).toBe(1);
    expect(afterSecond.history[1]).toBe(second);
  });

  it("does not merge prop commits when node changes", () => {
    const base = page("A");
    const first = page("B");
    const second = page("C");
    const afterFirst = commitBuilderHistory(
      { history: [base], historyIndex: 0, lastCommit: null },
      first,
      { source: "props", mode: "merge", nodeId: "blk_1", now: 1000 },
    );
    const afterSecond = commitBuilderHistory(
      afterFirst,
      second,
      { source: "props", mode: "merge", nodeId: "blk_2", now: 1200 },
    );

    expect(afterSecond.history).toHaveLength(3);
    expect(afterSecond.historyIndex).toBe(2);
  });

  it("trims future history when committing after undo", () => {
    const p1 = page("A");
    const p2 = page("B");
    const p3 = page("C");
    const result = commitBuilderHistory(
      { history: [p1, p2, p3], historyIndex: 1, lastCommit: null },
      page("D"),
      { source: "structure", mode: "push", now: 1000 },
    );

    expect(result.history).toHaveLength(3);
    expect(result.history[2]?.children[0]?.children[0]?.children[0]?.props.content).toBe("D");
    expect(result.historyIndex).toBe(2);
  });
});
