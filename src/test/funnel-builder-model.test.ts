import { describe, expect, it } from "vitest";
import {
  addPage,
  connectPages,
  createDefaultFunnelGraph,
  duplicatePage,
  funnelNodeTypes,
  getFunnelPage,
  updateFunnelPageSettings,
  updateNodeSelectedProduct,
  upsertFunnelPageContent,
} from "@/builders/funnel-builder";

describe("funnel builder model", () => {
  it("supports the extended page types", () => {
    expect(funnelNodeTypes).toEqual(
      expect.arrayContaining(["leadCapture", "article", "blank"]),
    );
  });

  it("duplicates a page preserving the graph and creating a new pageId", () => {
    const baseGraph = createDefaultFunnelGraph();
    const graph = updateNodeSelectedProduct(baseGraph, baseGraph.nodes[0]!.id, "prod-1");
    const sourceNode = graph.nodes[0]!;

    const result = duplicatePage(graph, sourceNode.id);

    expect(result.node).not.toBeNull();
    expect(result.graph.nodes).toHaveLength(graph.nodes.length + 1);
    expect(result.graph.pages).toHaveLength(graph.pages.length + 1);
    expect(result.node?.id).not.toBe(sourceNode.id);
    expect(result.node?.pageId).not.toBe(sourceNode.pageId);
    expect(result.node?.type).toBe(sourceNode.type);
    expect(result.node?.selectedProductId).toBe("prod-1");
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

  it("updates page settings for details, seo and custom html", () => {
    const graph = createDefaultFunnelGraph();
    const page = graph.pages[0]!;

    const updatedGraph = updateFunnelPageSettings(graph, page.id, {
      title: "Product Page",
      path: "product-page",
      seoTitle: "SEO Product",
      seoDescription: "Descripcion seo",
      seoKeywords: "producto, demo",
      featuredImageUrl: "https://cdn.test/image.png",
      headScripts: "<script>window.head=true;</script>",
      footerScripts: "<script>window.footer=true;</script>",
    });

    const updatedPage = getFunnelPage(updatedGraph, page.id);

    expect(updatedPage?.settings.title).toBe("Product Page");
    expect(updatedPage?.settings.path).toBe("product-page");
    expect(updatedPage?.settings.seoTitle).toBe("SEO Product");
    expect(updatedPage?.settings.headScripts).toContain("window.head=true");
    expect(updatedPage?.settings.footerScripts).toContain("window.footer=true");
  });
});
