import {
  createDefaultPageBuilderBlocks,
  serializePageBuilderDocument,
} from "./page";

export const funnelNodeTypes = [
  "landing",
  "product",
  "checkout",
  "upsell",
  "downsell",
  "thankyou",
  "leadCapture",
  "article",
  "blank",
] as const;

export type FunnelNodeType = (typeof funnelNodeTypes)[number];

export interface FunnelNodePosition {
  x: number;
  y: number;
}

export interface FunnelNodeAnalytics {
  visits: number;
  clicks: number;
  conversionRate: number;
}

export interface FunnelNode {
  id: string;
  pageId: string;
  type: FunnelNodeType;
  position: FunnelNodePosition;
  analytics: FunnelNodeAnalytics;
  selectedProductId: string | null;
}

export interface FunnelPageSettings {
  path: string;
  title: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  featuredImageUrl: string;
  headScripts: string;
  footerScripts: string;
}

export interface FunnelPage {
  id: string;
  funnelId: string;
  type: FunnelNodeType;
  contentJson: string;
  settings: FunnelPageSettings;
}

export interface FunnelConnection {
  from: string;
  to: string;
}

export interface FunnelGraph {
  id: string;
  name: string;
  nodes: FunnelNode[];
  pages: FunnelPage[];
  connections: FunnelConnection[];
}

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function createAnalytics(type: FunnelNodeType): FunnelNodeAnalytics {
  const baseVisits: Record<FunnelNodeType, number> = {
    landing: 3200,
    product: 2280,
    checkout: 1180,
    upsell: 440,
    downsell: 220,
    thankyou: 165,
    leadCapture: 1450,
    article: 980,
    blank: 120,
  };

  const baseClicks: Record<FunnelNodeType, number> = {
    landing: 1280,
    product: 940,
    checkout: 312,
    upsell: 88,
    downsell: 42,
    thankyou: 165,
    leadCapture: 420,
    article: 170,
    blank: 16,
  };

  const visits = baseVisits[type];
  const clicks = baseClicks[type];

  return {
    visits,
    clicks,
    conversionRate: visits > 0 ? Number(((clicks / visits) * 100).toFixed(1)) : 0,
  };
}

export function isFunnelNodeType(value: string): value is FunnelNodeType {
  return funnelNodeTypes.includes(value as FunnelNodeType);
}

export function createFunnelNode(
  type: FunnelNodeType,
  position: FunnelNodePosition,
): FunnelNode {
  const id = createId("node");
  const pageId = createId("page");

  return {
    id,
    pageId,
    type,
    position,
    analytics: createAnalytics(type),
    selectedProductId: null,
  };
}

function getPageTitle(type: FunnelNodeType) {
  const labels: Record<FunnelNodeType, string> = {
    landing: "Landing page",
    product: "Product page",
    checkout: "Checkout page",
    upsell: "Upsell page",
    downsell: "Downsell page",
    thankyou: "Thank you page",
    leadCapture: "Lead capture page",
    article: "Article page",
    blank: "Blank page",
  };

  return labels[type];
}

export function createFunnelPage(
  node: FunnelNode,
  funnelId: string,
): FunnelPage {
  return {
    id: node.pageId,
    funnelId,
    type: node.type,
    contentJson: serializePageBuilderDocument(createDefaultPageBuilderBlocks(), {
      id: node.pageId,
      title: getPageTitle(node.type),
    }),
    settings: createDefaultFunnelPageSettings(node.pageId, node.type),
  };
}

export function createDefaultFunnelPageSettings(
  pageId: string,
  type: FunnelNodeType,
): FunnelPageSettings {
  const suffix = pageId.split("-").at(-1) || "page";

  return {
    path: suffix.toLowerCase(),
    title: getPageTitle(type),
    seoTitle: "",
    seoDescription: "",
    seoKeywords: "",
    featuredImageUrl: "",
    headScripts: "",
    footerScripts: "",
  };
}

export function getFunnelPage(graph: FunnelGraph, pageId: string) {
  return graph.pages.find((page) => page.id === pageId) ?? null;
}

export function syncFunnelPagesFromNodes(graph: FunnelGraph) {
  const nextPages = graph.nodes.map((node) => {
    const existingPage = graph.pages.find((page) => page.id === node.pageId);

    if (existingPage) {
      const defaultSettings = createDefaultFunnelPageSettings(node.pageId, node.type);

      return {
        ...existingPage,
        funnelId: graph.id,
        type: node.type,
        settings: {
          ...defaultSettings,
          ...existingPage.settings,
          path: existingPage.settings?.path?.trim() || defaultSettings.path,
          title: existingPage.settings?.title?.trim() || defaultSettings.title,
        },
      };
    }

    return createFunnelPage(node, graph.id);
  });

  return {
    ...graph,
    pages: nextPages,
  };
}

export function upsertFunnelPageContent(
  graph: FunnelGraph,
  pageId: string,
  contentJson: string,
) {
  const page = graph.pages.find((candidate) => candidate.id === pageId);

  if (!page) {
    return graph;
  }

  return {
    ...graph,
    pages: graph.pages.map((candidate) =>
      candidate.id === pageId ? { ...candidate, contentJson } : candidate,
    ),
  };
}

export function createDefaultFunnelGraph(name = "Main Funnel"): FunnelGraph {
  const funnelId = createId("funnel");
  const landing = createFunnelNode("landing", { x: 120, y: 180 });
  const product = createFunnelNode("product", { x: 470, y: 180 });
  const checkout = createFunnelNode("checkout", { x: 820, y: 180 });
  const upsell = createFunnelNode("upsell", { x: 1170, y: 90 });
  const downsell = createFunnelNode("downsell", { x: 1170, y: 310 });
  const thankyou = createFunnelNode("thankyou", { x: 1520, y: 180 });

  return {
    id: funnelId,
    name,
    nodes: [landing, product, checkout, upsell, downsell, thankyou],
    pages: [
      createFunnelPage(landing, funnelId),
      createFunnelPage(product, funnelId),
      createFunnelPage(checkout, funnelId),
      createFunnelPage(upsell, funnelId),
      createFunnelPage(downsell, funnelId),
      createFunnelPage(thankyou, funnelId),
    ],
    connections: [
      { from: landing.id, to: product.id },
      { from: product.id, to: checkout.id },
      { from: checkout.id, to: upsell.id },
      { from: checkout.id, to: downsell.id },
      { from: upsell.id, to: thankyou.id },
      { from: downsell.id, to: thankyou.id },
    ],
  };
}

export function addNode(
  graph: FunnelGraph,
  type: FunnelNodeType,
  position: FunnelNodePosition,
) {
  const node = createFunnelNode(type, position);

  return {
    graph: {
      ...graph,
      nodes: [...graph.nodes, node],
      pages: [...graph.pages, createFunnelPage(node, graph.id)],
    },
    node,
  };
}

export function addPage(
  graph: FunnelGraph,
  type: FunnelNodeType,
  position: FunnelNodePosition,
) {
  return addNode(graph, type, position);
}

export function deleteNode(graph: FunnelGraph, nodeId: string) {
  const node = graph.nodes.find((candidate) => candidate.id === nodeId);

  return {
    ...graph,
    nodes: graph.nodes.filter((node) => node.id !== nodeId),
    pages: node ? graph.pages.filter((page) => page.id !== node.pageId) : graph.pages,
    connections: graph.connections.filter(
      (connection) => connection.from !== nodeId && connection.to !== nodeId,
    ),
  };
}

export function deletePage(graph: FunnelGraph, nodeId: string) {
  return deleteNode(graph, nodeId);
}

export function connectNodes(graph: FunnelGraph, from: string, to: string) {
  if (from === to) {
    return graph;
  }

  const hasFrom = graph.nodes.some((node) => node.id === from);
  const hasTo = graph.nodes.some((node) => node.id === to);

  if (!hasFrom || !hasTo) {
    return graph;
  }

  const exists = graph.connections.some(
    (connection) => connection.from === from && connection.to === to,
  );

  if (exists) {
    return graph;
  }

  return {
    ...graph,
    connections: [...graph.connections, { from, to }],
  };
}

export function connectPages(graph: FunnelGraph, from: string, to: string) {
  return connectNodes(graph, from, to);
}

export function disconnectNodes(graph: FunnelGraph, from: string, to: string) {
  return {
    ...graph,
    connections: graph.connections.filter(
      (connection) => !(connection.from === from && connection.to === to),
    ),
  };
}

export function duplicatePage(
  graph: FunnelGraph,
  nodeId: string,
  offset: FunnelNodePosition = { x: 120, y: 120 },
) {
  const source = graph.nodes.find((node) => node.id === nodeId);
  const sourcePage = source ? graph.pages.find((page) => page.id === source.pageId) : null;

  if (!source) {
    return {
      graph,
      node: null,
    };
  }

  const duplicate = createFunnelNode(source.type, {
    x: source.position.x + offset.x,
    y: source.position.y + offset.y,
  });
  duplicate.selectedProductId = source.selectedProductId;

  const duplicatedPage = sourcePage
    ? {
        ...sourcePage,
        id: duplicate.pageId,
        funnelId: graph.id,
        type: duplicate.type,
        settings: {
          ...sourcePage.settings,
          path: `${sourcePage.settings.path || "page"}-copy`,
        },
      }
    : createFunnelPage(duplicate, graph.id);

  const nextGraph: FunnelGraph = {
    ...graph,
    nodes: [...graph.nodes, duplicate],
    pages: [...graph.pages, duplicatedPage],
  };

  return {
    graph: nextGraph,
    node: duplicate,
  };
}

export function updateNodePosition(
  graph: FunnelGraph,
  nodeId: string,
  position: FunnelNodePosition,
) {
  return {
    ...graph,
    nodes: graph.nodes.map((node) =>
      node.id === nodeId ? { ...node, position } : node,
    ),
  };
}

export function updateNodeType(
  graph: FunnelGraph,
  nodeId: string,
  type: FunnelNodeType,
) {
  return syncFunnelPagesFromNodes({
    ...graph,
    nodes: graph.nodes.map((node) =>
      node.id === nodeId
        ? {
            ...node,
            type,
            analytics: createAnalytics(type),
          }
        : node,
    ),
  });
}

export function updateNodeSelectedProduct(
  graph: FunnelGraph,
  nodeId: string,
  selectedProductId: string | null,
) {
  return {
    ...graph,
    nodes: graph.nodes.map((node) =>
      node.id === nodeId
        ? {
            ...node,
            selectedProductId,
          }
        : node,
    ),
  };
}

export function updateFunnelPageSettings(
  graph: FunnelGraph,
  pageId: string,
  patch: Partial<FunnelPageSettings>,
) {
  const targetPage = graph.pages.find((page) => page.id === pageId);

  if (!targetPage) {
    return graph;
  }

  const defaultSettings = createDefaultFunnelPageSettings(pageId, targetPage.type);

  return {
    ...graph,
    pages: graph.pages.map((page) =>
      page.id === pageId
        ? {
            ...page,
            settings: {
              ...defaultSettings,
              ...page.settings,
              ...patch,
              path: (patch.path ?? page.settings?.path ?? defaultSettings.path).trim() || defaultSettings.path,
              title:
                (patch.title ?? page.settings?.title ?? defaultSettings.title).trim() ||
                defaultSettings.title,
            },
          }
        : page,
    ),
  };
}
