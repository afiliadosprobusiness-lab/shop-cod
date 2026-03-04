import { describe, expect, it } from "vitest";
import {
  addPage,
  connectPages,
  createDefaultFunnelGraph,
  duplicatePage,
  funnelNodeTypes,
  getFunnelPage,
  upsertFunnelPageContent,
} from "@/builders/funnel-builder";

describe("funnel builder model", () => {
  it("supports the extended page types", () => {
    expect(funnelNodeTypes).toEqual(
      expect.arrayContaining(["leadCapture", "article", "blank"]),
    );
  });

  it("duplicates a page preserving the graph and creating a new pageId", () => {
    const graph = createDefaultFunnelGraph();
    const sourceNode = graph.nodes[0]!;

    const result = duplicatePage(graph, sourceNode.id);

    expect(result.node).not.toBeNull();
    expect(result.graph.nodes).toHaveLength(graph.nodes.length + 1);
    expect(result.graph.pages).toHaveLength(graph.pages.length + 1);
    expect(result.node?.id).not.toBe(sourceNode.id);
    expect(result.node?.pageId).not.toBe(sourceNode.pageId);
    expect(result.node?.type).toBe(sourceNode.type);
    expect(result.graph.pages.some((page) => page.id === result.node?.pageId)).toBe(true);
  });

  it("adds and connects pages without duplicating the same connection", () => {
    const graph = createDefaultFunnelGraph();
    const { graph: withNewPage, node } = addPage(graph, "article", { x: 2000, y: 420 });

    const connected = connectPages(withNewPage, graph.nodes[0].id, node.id);
    const connectedAgain = connectPages(connected, graph.nodes[0].id, node.id);

    const matches = connectedAgain.connections.filter(
      (connection) => connection.from === graph.nodes[0].id && connection.to === node.id,
    );

    expect(withNewPage.pages.some((page) => page.id === node.pageId)).toBe(true);
    expect(matches).toHaveLength(1);
  });

  it("updates contentJson for the selected funnel page", () => {
    const graph = createDefaultFunnelGraph();
    const page = graph.pages[0]!;
    const nextContentJson = JSON.stringify({
      id: page.id,
      funnelId: graph.id,
      type: page.type,
      blocks: [],
    });

    const updatedGraph = upsertFunnelPageContent(graph, page.id, nextContentJson);

    expect(getFunnelPage(updatedGraph, page.id)?.contentJson).toBe(nextContentJson);
  });
});
