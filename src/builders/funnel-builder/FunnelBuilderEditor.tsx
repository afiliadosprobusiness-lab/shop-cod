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
import {
  BuilderBlockCard,
  BuilderCanvas,
  BuilderEditorShell,
  BuilderSidebar,
  BuilderToolbar,
} from "@/builders/shared";
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
  connectPages,
  deletePage,
  disconnectNodes,
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

const nodeMeta: Record<
  FunnelNodeType,
  {
    label: string;
    accent: string;
    iconBadge: string;
  }
> = {
  landing: {
    label: "Landing Page",
    accent: "from-sky-300 to-cyan-300",
    iconBadge: "Landing",
  },
  product: {
    label: "Product Page",
    accent: "from-violet-300 to-indigo-300",
    iconBadge: "Product",
  },
  checkout: {
    label: "Checkout Page",
    accent: "from-emerald-300 to-teal-300",
    iconBadge: "Checkout",
  },
  upsell: {
    label: "Upsell Page",
    accent: "from-amber-300 to-orange-300",
    iconBadge: "Upsell",
  },
  downsell: {
    label: "Downsell Page",
    accent: "from-rose-300 to-pink-300",
    iconBadge: "Downsell",
  },
  thankyou: {
    label: "Thank You Page",
    accent: "from-lime-300 to-emerald-300",
    iconBadge: "Thank you",
  },
  leadCapture: {
    label: "Lead Capture Page",
    accent: "from-cyan-300 to-sky-300",
    iconBadge: "Lead",
  },
  article: {
    label: "Article Page",
    accent: "from-fuchsia-300 to-violet-300",
    iconBadge: "Article",
  },
  blank: {
    label: "Blank Page",
    accent: "from-slate-300 to-slate-200",
    iconBadge: "Blank",
  },
};

type SettingsTabId = "details" | "seo" | "custom-html";

interface ViewportState {
  x: number;
  y: number;
  zoom: number;
}

function clampZoom(value: number) {
  return Math.max(0.5, Math.min(1.8, Number(value.toFixed(2))));
}

function getNodeCenter(node: FunnelNode) {
  return {
    x: node.position.x + 150,
    y: node.position.y + 84,
  };
}

function getTypeLabel(type: FunnelNodeType) {
  return nodeMeta[type].label;
}

function ConnectionLine({
  fromNode,
  toNode,
  onDisconnect,
}: {
  fromNode: FunnelNode;
  toNode: FunnelNode;
  onDisconnect: () => void;
}) {
  const start = getNodeCenter(fromNode);
  const end = getNodeCenter(toNode);
  const midX = (start.x + end.x) / 2;
  const curve = Math.max(120, Math.abs(end.x - start.x) * 0.35);
  const path = `M ${start.x} ${start.y} C ${start.x + curve} ${start.y}, ${end.x - curve} ${end.y}, ${end.x} ${end.y}`;

  return (
    <>
      <path
        d={path}
        fill="none"
        stroke="rgba(37,99,235,0.55)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <foreignObject x={midX - 18} y={(start.y + end.y) / 2 - 18} width="36" height="36">
        <button
          type="button"
          onClick={onDisconnect}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-600 transition-colors hover:border-rose-300 hover:text-rose-600"
          aria-label="Desconectar nodos"
        >
          <Unlink2 className="h-4 w-4" />
        </button>
      </foreignObject>
    </>
  );
}

function FunnelNodeCard({
  node,
  products,
  outgoingConnectionsCount,
  hasIncomingConnections,
  isConnecting,
  onOpenPage,
  onDelete,
  onDuplicate,
  onOpenSettings,
  onPreview,
  onToggleConnection,
  onProductChange,
  onDragStart,
}: {
  node: FunnelNode;
  products: Array<{ id: string; name: string }>;
  outgoingConnectionsCount: number;
  hasIncomingConnections: boolean;
  isConnecting: boolean;
  onOpenPage: (node: FunnelNode) => void;
  onDelete: (nodeId: string) => void;
  onDuplicate: (nodeId: string) => void;
  onOpenSettings: (nodeId: string) => void;
  onPreview: (node: FunnelNode) => void;
  onToggleConnection: (nodeId: string) => void;
  onProductChange: (nodeId: string, productId: string | null) => void;
  onDragStart: (event: React.PointerEvent<HTMLButtonElement>) => void;
}) {
  const meta = nodeMeta[node.type];

  return (
    <BuilderBlockCard className="w-[300px] border-blue-400 bg-white p-3 text-slate-900 shadow-[0_14px_45px_rgba(15,23,42,0.22)]">
      {!hasIncomingConnections ? (
        <div className="-mt-8 mb-2 flex w-fit items-center gap-2 rounded-t-xl rounded-b-md bg-blue-600 px-3 py-2 text-xs font-semibold text-white">
          <button
            type="button"
            onPointerDown={onDragStart}
            className="inline-flex h-4 w-4 items-center justify-center rounded-sm text-white/80 transition hover:text-white"
            aria-label="Mover pagina"
          >
            <Grip className="h-3.5 w-3.5" />
          </button>
          <Home className="h-3.5 w-3.5" />
          Starting Page
        </div>
      ) : (
        <div className="mb-2">
          <button
            type="button"
            onPointerDown={onDragStart}
            className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-slate-300 text-slate-600 transition hover:border-slate-400 hover:text-slate-800"
            aria-label="Mover pagina"
          >
            <Grip className="h-4 w-4" />
          </button>
        </div>
      )}

      <button
        type="button"
        onClick={() => onOpenPage(node)}
        className="flex w-full items-center gap-3 rounded-xl border border-slate-300 bg-slate-100 px-3 py-2 text-left transition-colors hover:border-blue-300 hover:bg-blue-50"
      >
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-blue-300 bg-blue-50 text-blue-600">
          <Package2 className="h-3.5 w-3.5" />
        </span>
        <span className="truncate text-base font-medium">{meta.label}</span>
      </button>

      <div className="mt-3 overflow-hidden rounded-xl border border-slate-300 bg-white">
        <div className="grid grid-cols-[5.5rem_minmax(0,1fr)] gap-4 p-4">
          <div className="h-24 rounded-md bg-slate-100" />
          <div className="space-y-2 pt-1">
            <div className="h-2 rounded bg-slate-100" />
            <div className="h-2 rounded bg-slate-100" />
            <div className="h-2 rounded bg-slate-100" />
            <div className="h-2 rounded bg-slate-100" />
          </div>
        </div>
      </div>

      <div className="mt-3 flex w-full items-center justify-center rounded-xl border border-slate-300 bg-slate-100 px-3 py-3 text-center">
        <div>
          <p className="text-2xl font-semibold">{node.analytics.visits}</p>
          <p className="text-xs text-slate-500">Visits</p>
        </div>
      </div>

      <div className="mt-3 rounded-xl border border-slate-300 bg-white px-3 py-2">
        <label htmlFor={`node-product-${node.id}`} className="sr-only">
          Producto asociado
        </label>
        <select
          id={`node-product-${node.id}`}
          value={node.selectedProductId ?? ""}
          onChange={(event) => onProductChange(node.id, event.target.value || null)}
          className="h-8 w-full border-0 bg-transparent text-sm font-medium text-slate-900 outline-none"
        >
          <option value="">
            {products.length ? "Seleccionar producto..." : "No hay productos"}
          </option>
          {products.map((product) => (
            <option key={product.id} value={product.id}>
              {product.name}
            </option>
          ))}
        </select>
      </div>

      <button
        type="button"
        onClick={() => onToggleConnection(node.id)}
        className={cn(
          "mt-3 flex w-full items-center justify-center rounded-xl border px-3 py-3 text-xs font-semibold uppercase tracking-[0.16em] transition-colors",
          isConnecting
            ? "border-blue-400 bg-blue-50 text-blue-700"
            : "border-slate-300 bg-white text-slate-500 hover:border-blue-300 hover:text-blue-700",
        )}
      >
        {isConnecting
          ? "Select target page"
          : outgoingConnectionsCount > 0
            ? `${outgoingConnectionsCount} Links`
            : "No links"}
      </button>

      <div className="mt-3 grid grid-cols-5 gap-2 rounded-xl border border-slate-300 bg-slate-100 p-2">
        <button
          type="button"
          onClick={() => onOpenSettings(node.id)}
          className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-600 transition-colors hover:border-blue-300 hover:text-blue-700"
          aria-label="Configurar pagina"
        >
          <Settings2 className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => onOpenPage(node)}
          className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-600 transition-colors hover:border-blue-300 hover:text-blue-700"
          aria-label="Editar pagina"
        >
          <PencilLine className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => onPreview(node)}
          className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-600 transition-colors hover:border-blue-300 hover:text-blue-700"
          aria-label="Preview de pagina"
        >
          <Eye className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => onDuplicate(node.id)}
          className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-600 transition-colors hover:border-blue-300 hover:text-blue-700"
          aria-label="Clonar pagina"
        >
          <Copy className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => onDelete(node.id)}
          className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-600 transition-colors hover:border-rose-300 hover:text-rose-600"
          aria-label="Eliminar pagina"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </BuilderBlockCard>
  );
}

export function FunnelBuilderEditor({
  graph,
  onGraphChange,
  onOpenPage,
  onPreviewPage,
}: FunnelBuilderEditorProps) {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [viewport, setViewport] = useState<ViewportState>({
    x: 120,
    y: 80,
    zoom: 1,
  });
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [panStart, setPanStart] = useState<{
    pointerX: number;
    pointerY: number;
    originX: number;
    originY: number;
  } | null>(null);
  const [connectionStartId, setConnectionStartId] = useState<string | null>(null);
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
  const outgoingCountByNode = useMemo(() => {
    const map = new Map<string, number>();
    for (const connection of graph.connections) {
      map.set(connection.from, (map.get(connection.from) || 0) + 1);
    }
    return map;
  }, [graph.connections]);

  const activeSettingsNode = useMemo(
    () =>
      activeSettingsNodeId
        ? graph.nodes.find((node) => node.id === activeSettingsNodeId) ?? null
        : null,
    [activeSettingsNodeId, graph.nodes],
  );
  const activeSettingsPage = useMemo(
    () => (activeSettingsNode ? getFunnelPage(graph, activeSettingsNode.pageId) : null),
    [activeSettingsNode, graph],
  );
  const activeSettings = activeSettingsPage?.settings ?? null;

  const handleAddNode = (type: FunnelNodeType) => {
    const { graph: nextGraph, node } = addPage(graph, type, {
      x: 240 - viewport.x + graph.nodes.length * 40,
      y: 160 - viewport.y + graph.nodes.length * 28,
    });

    onGraphChange(nextGraph);
    setConnectionStartId(node.id);
  };

  const startNodeDrag = (
    event: React.PointerEvent<HTMLButtonElement>,
    nodeId: string,
  ) => {
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
      const currentNode = nodeMap.get(draggingNodeId);

      if (!currentNode) {
        return;
      }

      const bounds = viewportRef.current?.getBoundingClientRect();

      if (!bounds) {
        return;
      }

      const nextX = (event.clientX - bounds.left - viewport.x) / viewport.zoom - 150;
      const nextY = (event.clientY - bounds.top - viewport.y) / viewport.zoom - 84;

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

  const handleOpenNode = (targetNode: FunnelNode) => {
    if (!connectionStartId || connectionStartId === targetNode.id) {
      onOpenPage(targetNode);
      return;
    }

    onGraphChange(connectPages(graph, connectionStartId, targetNode.id));
    setConnectionStartId(null);
  };

  const updatePageSettings = (patch: Partial<FunnelPageSettings>) => {
    if (!activeSettingsPage) {
      return;
    }

    onGraphChange(updateFunnelPageSettings(graph, activeSettingsPage.id, patch));
  };

  return (
    <BuilderEditorShell
      toolbar={
        <BuilderToolbar
          eyebrow="Funnel builder"
          title="Canvas visual por acciones"
          description="Cada tarjeta concentra flujo de pagina: editar, visitas, producto, links y acciones operativas."
          accentClassName="text-blue-200"
          actions={
            <>
              <div className="flex items-center gap-1 rounded-2xl border border-white/10 bg-white/[0.03] p-1">
                <button
                  type="button"
                  onClick={() =>
                    setViewport((current) => ({ ...current, zoom: clampZoom(current.zoom - 0.1) }))
                  }
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-slate-300 transition-colors hover:bg-white/[0.06]"
                  aria-label="Reducir zoom"
                >
                  <ZoomOut className="h-4 w-4" />
                </button>
                <div className="min-w-14 text-center text-xs font-semibold text-slate-200">
                  {Math.round(viewport.zoom * 100)}%
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setViewport((current) => ({ ...current, zoom: clampZoom(current.zoom + 0.1) }))
                  }
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-slate-300 transition-colors hover:bg-white/[0.06]"
                  aria-label="Aumentar zoom"
                >
                  <ZoomIn className="h-4 w-4" />
                </button>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setViewport({ x: 120, y: 80, zoom: 1 })}
                className="border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.06]"
              >
                <Move className="h-4 w-4" />
                Reset view
              </Button>
            </>
          }
        >
          <div className="flex flex-wrap gap-2">
            {funnelNodeTypes.map((type) => (
              <Button
                key={type}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleAddNode(type)}
                className="border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.06]"
              >
                <Plus className="h-4 w-4" />
                {nodeMeta[type].iconBadge}
              </Button>
            ))}
          </div>
        </BuilderToolbar>
      }
    >
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <BuilderCanvas
          eyebrow="Canvas"
          title="Tarjetas operativas del funnel"
          description="Click en bloque de cabecera para editar. Configura cada pagina desde su icono de ajustes."
          accentClassName="text-blue-200"
          className="min-h-[720px] overflow-hidden p-0"
          bodyClassName="pt-0"
          headerBadge={
            <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-slate-200">
              {graph.nodes.length} nodos
            </div>
          }
        >
          <div
            ref={viewportRef}
            onPointerDown={handleCanvasPointerDown}
            onPointerMove={handleCanvasPointerMove}
            onPointerUp={handleCanvasPointerUp}
            onPointerLeave={handleCanvasPointerUp}
            onWheel={handleWheel}
            className="relative min-h-[645px] overflow-hidden"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, rgba(100,116,139,0.22) 1px, transparent 0)",
              backgroundSize: `${36 * viewport.zoom}px ${36 * viewport.zoom}px`,
              backgroundPosition: `${viewport.x}px ${viewport.y}px`,
              backgroundColor: "#eef2f7",
            }}
          >
            <div
              className="absolute inset-0"
              style={{
                transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
                transformOrigin: "top left",
              }}
            >
              <svg className="pointer-events-none absolute inset-0 h-[2400px] w-[3400px] overflow-visible">
                {graph.connections.map((connection) => {
                  const fromNode = nodeMap.get(connection.from);
                  const toNode = nodeMap.get(connection.to);

                  if (!fromNode || !toNode) {
                    return null;
                  }

                  return (
                    <ConnectionLine
                      key={`${connection.from}-${connection.to}`}
                      fromNode={fromNode}
                      toNode={toNode}
                      onDisconnect={() =>
                        onGraphChange(disconnectNodes(graph, connection.from, connection.to))
                      }
                    />
                  );
                })}
              </svg>

              {graph.nodes.map((node) => (
                <div
                  key={node.id}
                  className="absolute"
                  style={{
                    left: node.position.x,
                    top: node.position.y,
                  }}
                >
                  <FunnelNodeCard
                    node={node}
                    products={products}
                    outgoingConnectionsCount={outgoingCountByNode.get(node.id) || 0}
                    hasIncomingConnections={Boolean(incomingCountByNode.get(node.id))}
                    isConnecting={connectionStartId === node.id}
                    onOpenPage={handleOpenNode}
                    onDelete={(nodeId) => {
                      onGraphChange(deletePage(graph, nodeId));
                      if (connectionStartId === nodeId) {
                        setConnectionStartId(null);
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
                    onToggleConnection={(nodeId) =>
                      setConnectionStartId((current) => (current === nodeId ? null : nodeId))
                    }
                    onProductChange={(nodeId, productId) =>
                      onGraphChange(updateNodeSelectedProduct(graph, nodeId, productId))
                    }
                    onDragStart={(event) => startNodeDrag(event, node.id)}
                  />
                </div>
              ))}
            </div>

            <div className="pointer-events-none absolute bottom-4 left-4 rounded-2xl border border-white/20 bg-white/90 px-4 py-3 text-xs text-slate-700 shadow-sm">
              <div className="flex items-center gap-2">
                <MousePointer2 className="h-4 w-4" />
                Arrastra nodos con el handle, mueve el canvas y usa scroll para zoom.
              </div>
            </div>
          </div>
        </BuilderCanvas>

        <BuilderSidebar
          eyebrow="Funnel data"
          description="Resumen operativo del flujo de conexiones."
          accentClassName="text-blue-200"
        >
          <div className="space-y-5">
            <BuilderBlockCard className="bg-slate-950/70 p-5">
              <h3 className="text-lg font-bold text-white">{graph.name}</h3>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                    Nodes
                  </p>
                  <p className="mt-1 text-sm font-semibold text-white">{graph.nodes.length}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                    Connections
                  </p>
                  <p className="mt-1 text-sm font-semibold text-white">{graph.connections.length}</p>
                </div>
              </div>
            </BuilderBlockCard>

            <BuilderBlockCard className="bg-slate-950/70 p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-200">
                Connection flow
              </p>
              <div className="mt-4 space-y-3">
                {graph.connections.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] p-4 text-sm text-slate-400">
                    Aun no hay conexiones.
                  </div>
                ) : (
                  graph.connections.map((connection) => {
                    const fromNode = nodeMap.get(connection.from);
                    const toNode = nodeMap.get(connection.to);

                    if (!fromNode || !toNode) {
                      return null;
                    }

                    return (
                      <button
                        key={`${connection.from}-${connection.to}-summary`}
                        type="button"
                        onClick={() =>
                          onGraphChange(disconnectNodes(graph, connection.from, connection.to))
                        }
                        className="flex w-full items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-left transition-colors hover:border-white/20"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-white">{getTypeLabel(fromNode.type)}</p>
                          <p className="truncate text-xs text-slate-400">{fromNode.pageId}</p>
                        </div>
                        <ArrowRight className="h-4 w-4 shrink-0 text-slate-500" />
                        <div className="min-w-0 text-right">
                          <p className="text-sm font-semibold text-white">{getTypeLabel(toNode.type)}</p>
                          <p className="truncate text-xs text-slate-400">{toNode.pageId}</p>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </BuilderBlockCard>
          </div>
        </BuilderSidebar>
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
            <DialogTitle className="text-2xl font-semibold text-slate-900">
              Configuración de la página
            </DialogTitle>
          </DialogHeader>

          {activeSettingsNode && activeSettings && activeSettingsPage ? (
            <div className="px-6 py-5">
              <Tabs
                value={settingsTab}
                onValueChange={(value) => setSettingsTab(value as SettingsTabId)}
              >
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
                            path: event.target.value
                              .trim()
                              .toLowerCase()
                              .replace(/[^a-z0-9-]+/g, "-")
                              .replace(/^-+|-+$/g, ""),
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
                      onChange={(event) =>
                        updatePageSettings({ featuredImageUrl: event.target.value })
                      }
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
    </BuilderEditorShell>
  );
}
