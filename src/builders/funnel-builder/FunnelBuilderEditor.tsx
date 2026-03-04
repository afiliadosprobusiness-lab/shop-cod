import { useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  Link2,
  Minus,
  MousePointer2,
  Move,
  Plus,
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
  renderBlock,
} from "@/builders/shared";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  addNode,
  connectNodes,
  deleteNode,
  disconnectNodes,
  funnelNodeTypes,
  updateNodePosition,
  type FunnelConnection,
  type FunnelGraph,
  type FunnelNode,
  type FunnelNodeType,
} from "./schema";

interface FunnelBuilderEditorProps {
  graph: FunnelGraph;
  onGraphChange: (graph: FunnelGraph) => void;
  onOpenPage: (node: FunnelNode) => void;
}

const nodeMeta: Record<
  FunnelNodeType,
  {
    label: string;
    accent: string;
    badge: string;
  }
> = {
  landing: {
    label: "Landing",
    accent: "from-sky-400 to-cyan-300",
    badge: "Top of funnel",
  },
  product: {
    label: "Product",
    accent: "from-violet-400 to-indigo-400",
    badge: "Offer detail",
  },
  checkout: {
    label: "Checkout",
    accent: "from-emerald-400 to-teal-300",
    badge: "Core conversion",
  },
  upsell: {
    label: "Upsell",
    accent: "from-amber-300 to-orange-300",
    badge: "AOV booster",
  },
  downsell: {
    label: "Downsell",
    accent: "from-rose-300 to-pink-300",
    badge: "Recovery path",
  },
  thankyou: {
    label: "Thank you",
    accent: "from-slate-300 to-slate-100",
    badge: "Confirmation",
  },
};

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
    x: node.position.x + 140,
    y: node.position.y + 68,
  };
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
        stroke="rgba(56,189,248,0.88)"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <foreignObject
        x={midX - 22}
        y={(start.y + end.y) / 2 - 22}
        width="44"
        height="44"
      >
        <button
          type="button"
          onClick={onDisconnect}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-slate-950/80 text-slate-300 transition-colors hover:border-rose-300/40 hover:text-rose-200"
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
  isConnecting,
  onOpenPage,
  onDelete,
  onStartConnection,
}: {
  node: FunnelNode;
  isConnecting: boolean;
  onOpenPage: (node: FunnelNode) => void;
  onDelete: (nodeId: string) => void;
  onStartConnection: (nodeId: string) => void;
}) {
  const meta = nodeMeta[node.type];

  return (
    <BuilderBlockCard className="w-[280px] bg-slate-950/85">
      <button type="button" onClick={() => onOpenPage(node)} className="block w-full text-left">
        {renderBlock(node, { funnelMeta: meta })}
      </button>

      <div className="mt-4 flex items-center justify-between gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onStartConnection(node.id)}
          className={cn(
            "border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.06]",
            isConnecting ? "border-sky-300/50 bg-sky-500/10" : "",
          )}
        >
          <Link2 className="h-4 w-4" />
          {isConnecting ? "Conectando" : "Conectar"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onDelete(node.id)}
          className="text-slate-300 hover:bg-white/[0.05] hover:text-white"
        >
          <Minus className="h-4 w-4" />
          Quitar
        </Button>
      </div>
    </BuilderBlockCard>
  );
}

export function FunnelBuilderEditor({
  graph,
  onGraphChange,
  onOpenPage,
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

  const nodeMap = useMemo(
    () => new Map(graph.nodes.map((node) => [node.id, node])),
    [graph.nodes],
  );

  const handleAddNode = (type: FunnelNodeType) => {
    const { graph: nextGraph, node } = addNode(graph, type, {
      x: 240 - viewport.x + graph.nodes.length * 40,
      y: 160 - viewport.y + graph.nodes.length * 28,
    });

    onGraphChange(nextGraph);
    setConnectionStartId(node.id);
  };

  const startNodeDrag = (
    event: React.PointerEvent<HTMLDivElement>,
    nodeId: string,
  ) => {
    event.stopPropagation();
    event.preventDefault();
    setDraggingNodeId(nodeId);
    (event.currentTarget as HTMLDivElement).setPointerCapture(event.pointerId);
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

      const nextX = (event.clientX - bounds.left - viewport.x) / viewport.zoom - 140;
      const nextY = (event.clientY - bounds.top - viewport.y) / viewport.zoom - 68;

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

  const handleConnect = (targetNode: FunnelNode) => {
    if (!connectionStartId) {
      onOpenPage(targetNode);
      return;
    }

    if (connectionStartId === targetNode.id) {
      onOpenPage(targetNode);
      return;
    }

    onGraphChange(connectNodes(graph, connectionStartId, targetNode.id));
    setConnectionStartId(null);
  };

  return (
    <BuilderEditorShell
      toolbar={
        <BuilderToolbar
          eyebrow="Funnel builder"
          title="Canvas infinito para conectar paginas"
          description="Pan, zoom, drag de nodos y conexiones sin recargar el editor. Click en un nodo abre su Page Builder."
          accentClassName="text-amber-200"
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
                {nodeMeta[type].label}
              </Button>
            ))}
          </div>
        </BuilderToolbar>
      }
    >
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <BuilderCanvas
          eyebrow="Canvas"
          title="Nodos, conexiones y analytics"
          description="Todos los builders comparten el mismo shell de canvas y cards visuales."
          accentClassName="text-amber-200"
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
                "radial-gradient(circle at 1px 1px, rgba(148,163,184,0.18) 1px, transparent 0)",
              backgroundSize: `${36 * viewport.zoom}px ${36 * viewport.zoom}px`,
              backgroundPosition: `${viewport.x}px ${viewport.y}px`,
            }}
          >
            <div
              className="absolute inset-0"
              style={{
                transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
                transformOrigin: "top left",
              }}
            >
              <svg className="pointer-events-none absolute inset-0 h-[2400px] w-[3200px] overflow-visible">
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
                  <div
                    onPointerDown={(event) => startNodeDrag(event, node.id)}
                    className="cursor-grab active:cursor-grabbing"
                  >
                    <FunnelNodeCard
                      node={node}
                      isConnecting={connectionStartId === node.id}
                      onOpenPage={(targetNode) => handleConnect(targetNode)}
                      onDelete={(nodeId) => {
                        onGraphChange(deleteNode(graph, nodeId));
                        if (connectionStartId === nodeId) {
                          setConnectionStartId(null);
                        }
                      }}
                      onStartConnection={(nodeId) =>
                        setConnectionStartId((current) => (current === nodeId ? null : nodeId))
                      }
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="pointer-events-none absolute bottom-4 left-4 rounded-2xl border border-white/10 bg-slate-950/85 px-4 py-3 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <MousePointer2 className="h-4 w-4" />
                Arrastra nodos, arrastra el fondo para pan y usa scroll para zoom.
              </div>
            </div>
          </div>
        </BuilderCanvas>

        <BuilderSidebar
          eyebrow="Funnel data"
          description="Resumen del grafo y flujo de conexiones."
          accentClassName="text-amber-200"
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
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-200">
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
                          <p className="text-sm font-semibold text-white">
                            {nodeMeta[fromNode.type].label}
                          </p>
                          <p className="truncate text-xs text-slate-400">
                            {fromNode.pageId}
                          </p>
                        </div>
                        <ArrowRight className="h-4 w-4 shrink-0 text-slate-500" />
                        <div className="min-w-0 text-right">
                          <p className="text-sm font-semibold text-white">
                            {nodeMeta[toNode.type].label}
                          </p>
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
    </BuilderEditorShell>
  );
}
