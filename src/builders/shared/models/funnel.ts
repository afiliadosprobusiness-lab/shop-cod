export const funnelNodeTypes = [
  "landing",
  "product",
  "checkout",
  "upsell",
  "downsell",
  "thankyou",
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
}

export interface FunnelConnection {
  from: string;
  to: string;
}

export interface FunnelGraph {
  id: string;
  name: string;
  nodes: FunnelNode[];
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
  };

  const baseClicks: Record<FunnelNodeType, number> = {
    landing: 1280,
    product: 940,
    checkout: 312,
    upsell: 88,
    downsell: 42,
    thankyou: 165,
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
  };
}

export function createDefaultFunnelGraph(name = "Main Funnel"): FunnelGraph {
  const landing = createFunnelNode("landing", { x: 120, y: 180 });
  const product = createFunnelNode("product", { x: 470, y: 180 });
  const checkout = createFunnelNode("checkout", { x: 820, y: 180 });
  const upsell = createFunnelNode("upsell", { x: 1170, y: 90 });
  const downsell = createFunnelNode("downsell", { x: 1170, y: 310 });
  const thankyou = createFunnelNode("thankyou", { x: 1520, y: 180 });

  return {
    id: createId("funnel"),
    name,
    nodes: [landing, product, checkout, upsell, downsell, thankyou],
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
    },
    node,
  };
}

export function deleteNode(graph: FunnelGraph, nodeId: string) {
  return {
    ...graph,
    nodes: graph.nodes.filter((node) => node.id !== nodeId),
    connections: graph.connections.filter(
      (connection) => connection.from !== nodeId && connection.to !== nodeId,
    ),
  };
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

export function disconnectNodes(graph: FunnelGraph, from: string, to: string) {
  return {
    ...graph,
    connections: graph.connections.filter(
      (connection) => !(connection.from === from && connection.to === to),
    ),
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
