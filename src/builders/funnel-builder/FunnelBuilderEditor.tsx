
import { useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  Copy,
  Eye,
  Grip,
  Home,
  MousePointer2,
  Move,
  Package2,
  PencilLine,
  Plus,
  Settings2,
  Trash2,
  Unlink2,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { loadProducts } from "@/lib/products";
import { cn } from "@/lib/utils";
import {
  addPage,
  connectPagesBySource,
  deletePage,
  disconnectNodesBySource,
  duplicatePage,
  funnelNodeTypes,
  getFunnelPage,
  updateFunnelPageSettings,
  updateNodePosition,
  updateNodeSelectedProduct,
  updateNodeType,
  type FunnelGraph,
  type FunnelNode,
  type FunnelNodeType,
  type FunnelPageSettings,
} from "./schema";

interface FunnelBuilderEditorProps {
  graph: FunnelGraph;
  onGraphChange: (graph: FunnelGraph) => void;
  onOpenPage: (node: FunnelNode) => void;
  onPreviewPage?: (node: FunnelNode) => void;
}

interface FunnelCtaSource {
  id: string;
  label: string;
  ctr: number;
}

interface NodeSourceHandle {
  nodeId: string;
  sourceHandleId: string | null;
  sourceLabel: string;
}

interface ViewportState {
  x: number;
  y: number;
  zoom: number;
}

type SettingsTabId = "details" | "seo" | "custom-html";

const nodeMeta: Record<FunnelNodeType, { label: string }> = {
  landing: { label: "Landing Page" },
  product: { label: "Product Page" },
  checkout: { label: "Checkout Page" },
  upsell: { label: "Upsell Page" },
  downsell: { label: "Downsell Page" },
  thankyou: { label: "Thankyou Page" },
  leadCapture: { label: "Lead Capture Page" },
  article: { label: "Article Page" },
  blank: { label: "Blank Page" },
};

const CTA_BLOCK_TYPES = new Set(["button", "form", "product"]);
const CARD_WIDTH = 300;
const CARD_CENTER_Y_OFFSET = 168;
const LINKS_SECTION_BASE_Y = 422;
const LINKS_ROW_HEIGHT = 37;

function clampZoom(value: number) {
  return Math.max(0.55, Math.min(1.8, Number(value.toFixed(2))));
}

function getTypeLabel(type: FunnelNodeType) {
  return nodeMeta[type].label;
}

function parseJsonSafe<T>(rawValue: string) {
  try {
    return JSON.parse(rawValue) as T;
  } catch {
    return null;
  }
}

function extractBlocksFromContentJson(contentJson: string) {
  const parsed = parseJsonSafe<unknown>(contentJson);

  if (Array.isArray(parsed)) {
    return parsed;
  }

  if (parsed && typeof parsed === "object" && "blocks" in parsed) {
    const blocks = (parsed as { blocks?: unknown }).blocks;

    if (Array.isArray(blocks)) {
      return blocks;
    }
  }

  return [] as unknown[];
}

function inferCtaLabel(block: { type?: unknown; content?: unknown; id?: unknown }, index: number) {
  const fallbackLabelByType: Record<string, string> = {
    button: "Button",
    form: "Form",
    product: "Product CTA",
  };

  const content =
    block.content && typeof block.content === "object"
      ? (block.content as Record<string, unknown>)
      : {};
  const rawLabel =
    (typeof content.label === "string" && content.label) ||
    (typeof content.cta === "string" && content.cta) ||
    (typeof content.title === "string" && content.title) ||
    (typeof content.name === "string" && content.name) ||
    (typeof content.buttonText === "string" && content.buttonText) ||
    "";
  const normalizedType = typeof block.type === "string" ? block.type : "button";

  return rawLabel.trim() || `${fallbackLabelByType[normalizedType] || "CTA"} ${index + 1}`;
}

function collectCtaSourcesFromBlocks(blocks: unknown[], accumulator: FunnelCtaSource[]) {
  for (const candidate of blocks) {
    if (!candidate || typeof candidate !== "object") {
      continue;
    }

    const block = candidate as {
      id?: unknown;
      type?: unknown;
      content?: unknown;
      children?: unknown;
    };

    if (typeof block.type === "string" && CTA_BLOCK_TYPES.has(block.type)) {
      const id = typeof block.id === "string" ? block.id : `${block.type}-${accumulator.length + 1}`;
      accumulator.push({
        id,
        label: inferCtaLabel(block, accumulator.length),
        ctr: 0,
      });
    }

    if (Array.isArray(block.children) && block.children.length) {
      collectCtaSourcesFromBlocks(block.children, accumulator);
    }
  }
}

function getFunnelCtaSources(contentJson: string) {
  const blocks = extractBlocksFromContentJson(contentJson);
  const sources: FunnelCtaSource[] = [];
  collectCtaSourcesFromBlocks(blocks, sources);
  return sources;
}

function normalizePathInput(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "");
}

function getConnectionStartPoint(
  fromNode: FunnelNode,
  connectionSourceHandleId: string | null,
  ctaSourcesByNode: Map<string, FunnelCtaSource[]>,
) {
  if (!connectionSourceHandleId) {
    return {
      x: fromNode.position.x + CARD_WIDTH,
      y: fromNode.position.y + CARD_CENTER_Y_OFFSET,
    };
  }

  const sources = ctaSourcesByNode.get(fromNode.id) || [];
  const sourceIndex = sources.findIndex((source) => source.id === connectionSourceHandleId);

  if (sourceIndex === -1) {
    return {
      x: fromNode.position.x + CARD_WIDTH,
      y: fromNode.position.y + CARD_CENTER_Y_OFFSET,
    };
  }

  return {
    x: fromNode.position.x + CARD_WIDTH,
    y: fromNode.position.y + LINKS_SECTION_BASE_Y + sourceIndex * LINKS_ROW_HEIGHT,
  };
}

function getConnectionEndPoint(toNode: FunnelNode) {
  return {
    x: toNode.position.x,
    y: toNode.position.y + CARD_CENTER_Y_OFFSET,
  };
}

function ConnectionLine({
  start,
  end,
  onDisconnect,
}: {
  start: { x: number; y: number };
  end: { x: number; y: number };
  onDisconnect: () => void;
}) {
  const midX = (start.x + end.x) / 2;
  const curve = Math.max(110, Math.abs(end.x - start.x) * 0.35);
  const path = `M ${start.x} ${start.y} C ${start.x + curve} ${start.y}, ${end.x - curve} ${end.y}, ${end.x} ${end.y}`;

  return (
    <>
      <path d={path} fill="none" stroke="rgba(37,99,235,0.88)" strokeWidth="2.5" strokeLinecap="round" />
      <foreignObject x={midX - 13} y={(start.y + end.y) / 2 - 13} width="26" height="26">
        <button
          type="button"
          onClick={onDisconnect}
          className="flex h-6 w-6 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-500 transition-colors hover:border-rose-300 hover:text-rose-600"
          aria-label="Desconectar enlace"
        >
          <Unlink2 className="h-3.5 w-3.5" />
        </button>
      </foreignObject>
    </>
  );
}

function FunnelNodeCard({
  node,
  products,
  ctaSources,
  isConnecting,
  connectedSourceIds,
  hasIncomingConnections,
  onNodePrimaryAction,
  onDelete,
  onDuplicate,
  onOpenSettings,
  onPreview,
  onToggleNodeConnection,
  onToggleSourceConnection,
  onProductChange,
  onDragStart,
}: {
  node: FunnelNode;
  products: Array<{ id: string; name: string }>;
  ctaSources: FunnelCtaSource[];
  isConnecting: boolean;
  connectedSourceIds: Set<string>;
  hasIncomingConnections: boolean;
  onNodePrimaryAction: (node: FunnelNode) => void;
  onDelete: (nodeId: string) => void;
  onDuplicate: (nodeId: string) => void;
  onOpenSettings: (nodeId: string) => void;
  onPreview: (node: FunnelNode) => void;
  onToggleNodeConnection: (nodeId: string) => void;
  onToggleSourceConnection: (nodeId: string, source: FunnelCtaSource) => void;
  onProductChange: (nodeId: string, productId: string | null) => void;
  onDragStart: (event: React.PointerEvent<HTMLButtonElement>) => void;
}) {
  const meta = nodeMeta[node.type];

  return (
    <article className="w-[300px] rounded-xl border-2 border-blue-500 bg-white p-2 text-slate-900 shadow-[0_8px_30px_rgba(15,23,42,0.14)]">
      <div className="mb-2 flex items-center gap-2">
        <button
          type="button"
          onPointerDown={onDragStart}
          className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-blue-300 text-blue-600"
          aria-label="Mover nodo"
        >
          <Grip className="h-3.5 w-3.5" />
        </button>
        {!hasIncomingConnections ? (
          <div className="inline-flex items-center gap-1 rounded-md bg-blue-600 px-2 py-1 text-[11px] font-semibold text-white">
            <Home className="h-3.5 w-3.5" />
            Starting Page
          </div>
        ) : null}
      </div>

      <button
        type="button"
        onClick={() => onNodePrimaryAction(node)}
        className="flex h-10 w-full items-center gap-2 rounded-md border border-slate-300 bg-slate-100 px-3 text-left text-sm font-semibold transition-colors hover:border-blue-300 hover:bg-blue-50"
      >
        <Package2 className="h-4 w-4 text-blue-600" />
        <span className="truncate">{meta.label}</span>
      </button>

      <button
        type="button"
        onClick={() => onNodePrimaryAction(node)}
        className="mt-2 w-full rounded-md border border-slate-300 bg-white p-3 transition-colors hover:border-blue-300"
      >
        <div className="grid grid-cols-[5.5rem_minmax(0,1fr)] gap-3">
          <div className="h-20 rounded-md bg-slate-100" />
          <div className="space-y-2 pt-1">
            <div className="h-2 rounded bg-slate-100" />
            <div className="h-2 rounded bg-slate-100" />
            <div className="h-2 rounded bg-slate-100" />
            <div className="h-2 rounded bg-slate-100" />
          </div>
        </div>
      </button>

      <div className="mt-2 grid grid-cols-3 overflow-hidden rounded-md border border-slate-300 bg-slate-100 text-center text-xs">
        <div className="border-r border-slate-300 px-2 py-2">
          <p className="text-base font-semibold text-slate-900">{node.analytics.visits}</p>
          <p className="text-slate-500">Visits</p>
        </div>
        <div className="border-r border-slate-300 px-2 py-2">
          <p className="text-base font-semibold text-slate-900">{node.analytics.conversionRate}%</p>
          <p className="text-slate-500">CTR</p>
        </div>
        <div className="px-2 py-2">
          <p className="text-base font-semibold text-slate-900">{node.analytics.clicks}</p>
          <p className="text-slate-500">Clicks</p>
        </div>
      </div>

      <div className="mt-2 rounded-md border border-slate-300 bg-white px-2 py-1.5">
        <label htmlFor={`node-product-${node.id}`} className="sr-only">
          Producto asociado
        </label>
        <select
          id={`node-product-${node.id}`}
          value={node.selectedProductId ?? ""}
          onChange={(event) => onProductChange(node.id, event.target.value || null)}
          className="h-8 w-full border-0 bg-transparent text-sm outline-none"
        >
          <option value="">No hay productos</option>
          {products.map((product) => (
            <option key={product.id} value={product.id}>
              {product.name}
            </option>
          ))}
        </select>
      </div>

      <button
        type="button"
        onClick={() => onToggleNodeConnection(node.id)}
        className={cn(
          "mt-2 flex h-10 w-full items-center justify-center rounded-md border text-[11px] font-semibold uppercase tracking-[0.16em] transition-colors",
          isConnecting
            ? "border-blue-500 bg-blue-50 text-blue-700"
            : "border-slate-300 bg-white text-slate-500 hover:border-blue-300 hover:text-blue-700",
        )}
      >
        {isConnecting ? "Select target" : ctaSources.length ? "Links" : "No links"}
      </button>

      {ctaSources.length ? (
        <div className="mt-1 space-y-1 rounded-md border border-slate-300 bg-white p-1.5">
          {ctaSources.map((source) => {
            const isConnected = connectedSourceIds.has(source.id);

            return (
              <div
                key={`${node.id}-${source.id}`}
                className="flex items-center justify-between rounded border border-slate-200 bg-slate-50 px-2 py-1 text-xs"
              >
                <p className="truncate pr-2 font-medium text-slate-800">{source.label}</p>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-emerald-600">CTR {source.ctr}%</span>
                  <button
                    type="button"
                    onClick={() => onToggleSourceConnection(node.id, source)}
                    className={cn(
                      "inline-flex h-5 w-5 items-center justify-center rounded-full border transition-colors",
                      isConnected
                        ? "border-blue-500 bg-blue-500 text-white"
                        : "border-blue-300 bg-white text-blue-600 hover:bg-blue-50",
                    )}
                    aria-label={`Conectar ${source.label}`}
                  >
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : null}

      <div className="mt-2 grid grid-cols-5 gap-2 rounded-md border border-slate-300 bg-slate-100 p-1.5">
        <button
          type="button"
          onClick={() => onOpenSettings(node.id)}
          className="inline-flex h-8 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-600 hover:border-blue-300 hover:text-blue-700"
          aria-label="Configurar página"
        >
          <Settings2 className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => onNodePrimaryAction(node)}
          className="inline-flex h-8 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-600 hover:border-blue-300 hover:text-blue-700"
          aria-label="Editar página"
        >
          <PencilLine className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => onPreview(node)}
          className="inline-flex h-8 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-600 hover:border-blue-300 hover:text-blue-700"
          aria-label="Vista previa"
        >
          <Eye className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => onDuplicate(node.id)}
          className="inline-flex h-8 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-600 hover:border-blue-300 hover:text-blue-700"
          aria-label="Clonar página"
        >
          <Copy className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => onDelete(node.id)}
          className="inline-flex h-8 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-600 hover:border-rose-300 hover:text-rose-600"
          aria-label="Eliminar página"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </article>
  );
}

export function FunnelBuilderEditor({
  graph,
  onGraphChange,
  onOpenPage,
  onPreviewPage,
}: FunnelBuilderEditorProps) {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [viewport, setViewport] = useState<ViewportState>({ x: 160, y: 100, zoom: 1 });
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [panStart, setPanStart] = useState<{
    pointerX: number;
    pointerY: number;
    originX: number;
    originY: number;
  } | null>(null);
  const [connectionSource, setConnectionSource] = useState<NodeSourceHandle | null>(null);
  const [activeSettingsNodeId, setActiveSettingsNodeId] = useState<string | null>(null);
  const [settingsTab, setSettingsTab] = useState<SettingsTabId>("details");

  const products = useMemo(
    () => loadProducts().map((product) => ({ id: product.id, name: product.name })),
    [],
  );

  const nodeMap = useMemo(
    () => new Map(graph.nodes.map((node) => [node.id, node])),
    [graph.nodes],
  );

  const incomingCountByNode = useMemo(() => {
    const map = new Map<string, number>();
    for (const connection of graph.connections) {
      map.set(connection.to, (map.get(connection.to) || 0) + 1);
    }
    return map;
  }, [graph.connections]);

  const ctaSourcesByNode = useMemo(() => {
    const map = new Map<string, FunnelCtaSource[]>();

    for (const node of graph.nodes) {
      const page = getFunnelPage(graph, node.pageId);
      const ctaSources = page ? getFunnelCtaSources(page.contentJson) : [];
      map.set(node.id, ctaSources);
    }

    return map;
  }, [graph]);

  const connectedSourceIdsByNode = useMemo(() => {
    const map = new Map<string, Set<string>>();

    for (const connection of graph.connections) {
      if (!connection.sourceHandleId) {
        continue;
      }

      if (!map.has(connection.from)) {
        map.set(connection.from, new Set<string>());
      }

      map.get(connection.from)?.add(connection.sourceHandleId);
    }

    return map;
  }, [graph.connections]);

  const activeSettingsNode = useMemo(
    () => (activeSettingsNodeId ? graph.nodes.find((node) => node.id === activeSettingsNodeId) || null : null),
    [activeSettingsNodeId, graph.nodes],
  );

  const activeSettingsPage = useMemo(
    () => (activeSettingsNode ? getFunnelPage(graph, activeSettingsNode.pageId) : null),
    [activeSettingsNode, graph],
  );

  const activeSettings = activeSettingsPage?.settings ?? null;

  const handleAddNode = (type: FunnelNodeType) => {
    const { graph: nextGraph } = addPage(graph, type, {
      x: 260 - viewport.x + graph.nodes.length * 46,
      y: 180 - viewport.y + graph.nodes.length * 28,
    });

    onGraphChange(nextGraph);
  };

  const startNodeDrag = (event: React.PointerEvent<HTMLButtonElement>, nodeId: string) => {
    event.stopPropagation();
    event.preventDefault();
    setDraggingNodeId(nodeId);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleCanvasPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) {
      return;
    }

    setPanStart({
      pointerX: event.clientX,
      pointerY: event.clientY,
      originX: viewport.x,
      originY: viewport.y,
    });
  };

  const handleCanvasPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (draggingNodeId) {
      const bounds = viewportRef.current?.getBoundingClientRect();

      if (!bounds) {
        return;
      }

      const nextX = (event.clientX - bounds.left - viewport.x) / viewport.zoom - CARD_WIDTH / 2;
      const nextY = (event.clientY - bounds.top - viewport.y) / viewport.zoom - 26;

      onGraphChange(
        updateNodePosition(graph, draggingNodeId, {
          x: Number(nextX.toFixed(0)),
          y: Number(nextY.toFixed(0)),
        }),
      );
      return;
    }

    if (!panStart) {
      return;
    }

    setViewport((current) => ({
      ...current,
      x: panStart.originX + (event.clientX - panStart.pointerX),
      y: panStart.originY + (event.clientY - panStart.pointerY),
    }));
  };

  const handleCanvasPointerUp = () => {
    setPanStart(null);
    setDraggingNodeId(null);
  };

  const handleWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    const delta = event.deltaY > 0 ? -0.08 : 0.08;

    setViewport((current) => ({
      ...current,
      zoom: clampZoom(current.zoom + delta),
    }));
  };

  const handleNodePrimaryAction = (targetNode: FunnelNode) => {
    if (!connectionSource || connectionSource.nodeId === targetNode.id) {
      onOpenPage(targetNode);
      return;
    }

    const graphWithoutPreviousSourceLinks = {
      ...graph,
      connections: graph.connections.filter(
        (connection) =>
          !(
            connection.from === connectionSource.nodeId &&
            connection.sourceHandleId === connectionSource.sourceHandleId
          ),
      ),
    };

    onGraphChange(
      connectPagesBySource(
        graphWithoutPreviousSourceLinks,
        connectionSource.nodeId,
        targetNode.id,
        connectionSource.sourceHandleId,
        connectionSource.sourceLabel,
      ),
    );
    setConnectionSource(null);
  };

  const updatePageSettings = (patch: Partial<FunnelPageSettings>) => {
    if (!activeSettingsPage) {
      return;
    }

    onGraphChange(updateFunnelPageSettings(graph, activeSettingsPage.id, patch));
  };

  return (
    <section className="space-y-4">
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-blue-600">Funnel builder</p>
            <h2 className="mt-1 text-2xl font-semibold text-slate-900">Construir y Diseñar</h2>
            <p className="mt-1 text-sm text-slate-500">
              Click en preview para abrir editor. Los CTA del editor se listan en LINKS y se conectan al siguiente paso.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 rounded-lg border border-slate-300 bg-white p-1">
              <button
                type="button"
                onClick={() => setViewport((current) => ({ ...current, zoom: clampZoom(current.zoom - 0.1) }))}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100"
                aria-label="Reducir zoom"
              >
                <ZoomOut className="h-4 w-4" />
              </button>
              <span className="min-w-12 text-center text-xs font-semibold text-slate-700">{Math.round(viewport.zoom * 100)}%</span>
              <button
                type="button"
                onClick={() => setViewport((current) => ({ ...current, zoom: clampZoom(current.zoom + 0.1) }))}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100"
                aria-label="Aumentar zoom"
              >
                <ZoomIn className="h-4 w-4" />
              </button>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={() => setViewport({ x: 160, y: 100, zoom: 1 })}>
              <Move className="h-4 w-4" />
              Reset view
            </Button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {funnelNodeTypes.map((type) => (
            <Button key={type} type="button" variant="outline" size="sm" onClick={() => handleAddNode(type)}>
              <Plus className="h-4 w-4" />
              {getTypeLabel(type).replace(" Page", "")}
            </Button>
          ))}
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <header className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Canvas</h3>
              <p className="text-sm text-slate-500">Conecta por nodo o por CTA desde LINKS.</p>
            </div>
            <span className="rounded-md border border-slate-300 bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
              {graph.nodes.length} nodos
            </span>
          </header>

          <div
            ref={viewportRef}
            onPointerDown={handleCanvasPointerDown}
            onPointerMove={handleCanvasPointerMove}
            onPointerUp={handleCanvasPointerUp}
            onPointerLeave={handleCanvasPointerUp}
            onWheel={handleWheel}
            className="relative min-h-[760px] overflow-hidden"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, rgba(148,163,184,0.28) 1px, transparent 0)",
              backgroundSize: `${36 * viewport.zoom}px ${36 * viewport.zoom}px`,
              backgroundPosition: `${viewport.x}px ${viewport.y}px`,
              backgroundColor: "#f8fafc",
            }}
          >
            <div
              className="absolute inset-0"
              style={{
                transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
                transformOrigin: "top left",
              }}
            >
              <svg className="pointer-events-none absolute inset-0 h-[2800px] w-[4200px] overflow-visible">
                {graph.connections.map((connection, index) => {
                  const fromNode = nodeMap.get(connection.from);
                  const toNode = nodeMap.get(connection.to);

                  if (!fromNode || !toNode) {
                    return null;
                  }

                  const start = getConnectionStartPoint(fromNode, connection.sourceHandleId, ctaSourcesByNode);
                  const end = getConnectionEndPoint(toNode);

                  return (
                    <ConnectionLine
                      key={`${connection.from}-${connection.to}-${connection.sourceHandleId || "node"}-${index}`}
                      start={start}
                      end={end}
                      onDisconnect={() =>
                        onGraphChange(
                          disconnectNodesBySource(
                            graph,
                            connection.from,
                            connection.to,
                            connection.sourceHandleId,
                          ),
                        )
                      }
                    />
                  );
                })}
              </svg>

              {graph.nodes.map((node) => {
                const ctaSources = ctaSourcesByNode.get(node.id) || [];
                const connectedSourceIds = connectedSourceIdsByNode.get(node.id) || new Set<string>();
                const isNodeConnectionActive =
                  connectionSource?.nodeId === node.id && connectionSource.sourceHandleId === null;

                return (
                  <div key={node.id} className="absolute" style={{ left: node.position.x, top: node.position.y }}>
                    <FunnelNodeCard
                      node={node}
                      products={products}
                      ctaSources={ctaSources}
                      isConnecting={isNodeConnectionActive}
                      connectedSourceIds={connectedSourceIds}
                      hasIncomingConnections={Boolean(incomingCountByNode.get(node.id))}
                      onNodePrimaryAction={handleNodePrimaryAction}
                      onDelete={(nodeId) => {
                        onGraphChange(deletePage(graph, nodeId));
                        if (connectionSource?.nodeId === nodeId) {
                          setConnectionSource(null);
                        }
                      }}
                      onDuplicate={(nodeId) => {
                        const { graph: nextGraph } = duplicatePage(graph, nodeId);
                        onGraphChange(nextGraph);
                      }}
                      onOpenSettings={(nodeId) => {
                        setActiveSettingsNodeId(nodeId);
                        setSettingsTab("details");
                      }}
                      onPreview={(targetNode) => onPreviewPage?.(targetNode)}
                      onToggleNodeConnection={(nodeId) =>
                        setConnectionSource((current) =>
                          current?.nodeId === nodeId && current.sourceHandleId === null
                            ? null
                            : {
                                nodeId,
                                sourceHandleId: null,
                                sourceLabel: "node",
                              },
                        )
                      }
                      onToggleSourceConnection={(nodeId, source) =>
                        setConnectionSource((current) =>
                          current?.nodeId === nodeId && current.sourceHandleId === source.id
                            ? null
                            : {
                                nodeId,
                                sourceHandleId: source.id,
                                sourceLabel: source.label,
                              },
                        )
                      }
                      onProductChange={(nodeId, productId) =>
                        onGraphChange(updateNodeSelectedProduct(graph, nodeId, productId))
                      }
                      onDragStart={(event) => startNodeDrag(event, node.id)}
                    />
                  </div>
                );
              })}
            </div>

            <div className="pointer-events-none absolute bottom-3 left-3 rounded-md border border-slate-300 bg-white px-3 py-2 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <MousePointer2 className="h-4 w-4" />
                Arrastra nodo o canvas. Si activas un CTA, haz click en la página destino para conectar.
              </div>
            </div>
          </div>
        </section>

        <aside className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Funnel data</p>
          <div className="mt-3 rounded-md border border-slate-200 bg-slate-50 p-3">
            <h4 className="text-lg font-semibold text-slate-900">{graph.name}</h4>
            <div className="mt-3 space-y-2">
              <div className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
                Nodes: <strong>{graph.nodes.length}</strong>
              </div>
              <div className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
                Connections: <strong>{graph.connections.length}</strong>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Connection flow</p>
            <div className="mt-2 space-y-2">
              {graph.connections.length === 0 ? (
                <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-3 text-sm text-slate-500">
                  Aun no hay conexiones.
                </div>
              ) : (
                graph.connections.map((connection, index) => {
                  const fromNode = nodeMap.get(connection.from);
                  const toNode = nodeMap.get(connection.to);

                  if (!fromNode || !toNode) {
                    return null;
                  }

                  return (
                    <button
                      key={`summary-${connection.from}-${connection.to}-${connection.sourceHandleId || "node"}-${index}`}
                      type="button"
                      onClick={() =>
                        onGraphChange(
                          disconnectNodesBySource(
                            graph,
                            connection.from,
                            connection.to,
                            connection.sourceHandleId,
                          ),
                        )
                      }
                      className="flex w-full items-center justify-between gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-left text-xs text-slate-700 hover:border-slate-300"
                    >
                      <span className="truncate">{getTypeLabel(fromNode.type)}</span>
                      <ArrowRight className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{getTypeLabel(toNode.type)}</span>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </aside>
      </div>

      <Dialog
        open={Boolean(activeSettingsNodeId)}
        onOpenChange={(open) => {
          if (!open) {
            setActiveSettingsNodeId(null);
          }
        }}
      >
        <DialogContent className="max-w-[680px] border-slate-200 bg-white p-0 text-slate-900">
          <DialogHeader className="border-b border-slate-200 px-6 py-4">
            <DialogTitle className="text-2xl font-semibold text-slate-900">Configuración de la página</DialogTitle>
          </DialogHeader>

          {activeSettingsNode && activeSettings && activeSettingsPage ? (
            <div className="px-6 py-5">
              <Tabs value={settingsTab} onValueChange={(value) => setSettingsTab(value as SettingsTabId)}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="details">Detalles</TabsTrigger>
                  <TabsTrigger value="seo">SEO</TabsTrigger>
                  <TabsTrigger value="custom-html">HTML personalizado</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="mt-4 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="page-path">URL de la página</Label>
                    <div className="flex items-center rounded-lg border border-slate-300 px-3 py-2">
                      <span className="text-slate-500">[DOMAIN NAME]/</span>
                      <Input
                        id="page-path"
                        value={activeSettings.path}
                        onChange={(event) =>
                          updatePageSettings({
                            path: normalizePathInput(event.target.value),
                          })
                        }
                        className="h-7 border-0 px-2 shadow-none focus-visible:ring-0"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="page-title">Título</Label>
                    <Input
                      id="page-title"
                      value={activeSettings.title}
                      onChange={(event) => updatePageSettings({ title: event.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="page-type">Tipo</Label>
                    <select
                      id="page-type"
                      value={activeSettingsNode.type}
                      onChange={(event) =>
                        onGraphChange(
                          updateNodeType(graph, activeSettingsNode.id, event.target.value as FunnelNodeType),
                        )
                      }
                      className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                    >
                      {funnelNodeTypes.map((type) => (
                        <option key={type} value={type}>
                          {getTypeLabel(type)}
                        </option>
                      ))}
                    </select>
                  </div>
                </TabsContent>

                <TabsContent value="seo" className="mt-4 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="seo-title">Título</Label>
                    <Input
                      id="seo-title"
                      value={activeSettings.seoTitle}
                      onChange={(event) => updatePageSettings({ seoTitle: event.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="seo-description">Descripción</Label>
                    <Textarea
                      id="seo-description"
                      value={activeSettings.seoDescription}
                      onChange={(event) => updatePageSettings({ seoDescription: event.target.value })}
                      className="min-h-[100px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="seo-keywords">Palabras clave</Label>
                    <Input
                      id="seo-keywords"
                      placeholder="key1, key2"
                      value={activeSettings.seoKeywords}
                      onChange={(event) => updatePageSettings({ seoKeywords: event.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="seo-featured-image">Imagen destacada</Label>
                    <Input
                      id="seo-featured-image"
                      placeholder="https://..."
                      value={activeSettings.featuredImageUrl}
                      onChange={(event) => updatePageSettings({ featuredImageUrl: event.target.value })}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="custom-html" className="mt-4 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="html-head-scripts">Scripts del encabezado</Label>
                    <Textarea
                      id="html-head-scripts"
                      value={activeSettings.headScripts}
                      onChange={(event) => updatePageSettings({ headScripts: event.target.value })}
                      className="min-h-[96px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="html-footer-scripts">Scripts del pie de página</Label>
                    <Textarea
                      id="html-footer-scripts"
                      value={activeSettings.footerScripts}
                      onChange={(event) => updatePageSettings({ footerScripts: event.target.value })}
                      className="min-h-[96px]"
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </section>
  );
}
