import { describe, expect, it } from "vitest";
import {
  addNode,
  connectNodes,
  createDefaultFunnelGraph,
  deleteNode,
  disconnectNodes,
} from "@/builders/funnel-builder";

describe("funnel builder schema", () => {
  it("creates a default visual funnel graph", () => {
    const graph = createDefaultFunnelGraph("ShopCOD Funnel");

    expect(graph.name).toBe("ShopCOD Funnel");
    expect(graph.nodes.length).toBeGreaterThanOrEqual(6);
    expect(graph.pages).toHaveLength(graph.nodes.length);
    expect(graph.connections.length).toBeGreaterThanOrEqual(5);
    expect(graph.pages.every((page) => page.funnelId === graph.id)).toBe(true);
    expect(
      graph.nodes.every((node) => graph.pages.some((page) => page.id === node.pageId)),
    ).toBe(true);
  });

  it("adds nodes and connects them without duplicates", () => {
    const graph = createDefaultFunnelGraph();
    const { graph: graphWithNode, node } = addNode(graph, "landing", { x: 80, y: 80 });
    const nextGraph = connectNodes(graphWithNode, graphWithNode.nodes[0]!.id, node.id);
    const duplicateGraph = connectNodes(nextGraph, graphWithNode.nodes[0]!.id, node.id);

    expect(graphWithNode.nodes.some((candidate) => candidate.id === node.id)).toBe(true);
    expect(graphWithNode.pages.some((page) => page.id === node.pageId)).toBe(true);
    expect(nextGraph.connections.some((connection) => connection.to === node.id)).toBe(true);
    expect(duplicateGraph.connections).toHaveLength(nextGraph.connections.length);
  });

  it("disconnects and deletes nodes with related edges", () => {
    const graph = createDefaultFunnelGraph();
    const firstConnection = graph.connections[0]!;
    const disconnected = disconnectNodes(graph, firstConnection.from, firstConnection.to);

    expect(
      disconnected.connections.some(
        (connection) =>
          connection.from === firstConnection.from && connection.to === firstConnection.to,
      ),
    ).toBe(false);

    const deleted = deleteNode(graph, graph.nodes[0]!.id);

    expect(deleted.nodes.some((node) => node.id === graph.nodes[0]!.id)).toBe(false);
    expect(deleted.pages.some((page) => page.id === graph.nodes[0]!.pageId)).toBe(false);
    expect(
      deleted.connections.some(
        (connection) =>
          connection.from === graph.nodes[0]!.id || connection.to === graph.nodes[0]!.id,
      ),
    ).toBe(false);
  });
});
