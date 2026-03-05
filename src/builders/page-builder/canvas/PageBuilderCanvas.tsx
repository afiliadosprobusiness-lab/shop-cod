import { memo, useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Copy, GripVertical, Layers3, StretchHorizontal, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  canAcceptChildren,
  type PageBuilderBlock,
  type PageBuilderDevice,
} from "../block-engine/schema";
import { renderBlock } from "../renderer/renderBlock";

interface PageBuilderCanvasProps {
  blocks: PageBuilderBlock[];
  selectedId: string | null;
  device: PageBuilderDevice;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onResize: (id: string) => void;
  onInlineChange: (id: string, field: string, value: string) => void;
}

function getFrameWidth(device: PageBuilderDevice) {
  if (device === "mobile") {
    return "max-w-md";
  }

  if (device === "tablet") {
    return "max-w-3xl";
  }

  return "max-w-6xl";
}

function DropSlot({
  parentId,
  index,
  label,
}: {
  parentId: string | null;
  index: number;
  label: string;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `slot:${parentId || "root"}:${index}`,
    data: {
      kind: "slot",
      parentId,
      index,
    },
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "rounded-lg border border-dashed px-3 py-2 text-center text-[10px] font-semibold uppercase tracking-[0.18em] transition-all",
        isOver
          ? "border-cyan-400 bg-cyan-400/10 text-cyan-300"
          : "border-slate-300/80 bg-white text-slate-400",
      )}
    >
      {label}
    </div>
  );
}

function SortablePageBuilderBlock({
  block,
  selectedId,
  hoveredId,
  device,
  onSelect,
  onDelete,
  onDuplicate,
  onResize,
  onInlineChange,
  onHover,
}: {
  block: PageBuilderBlock;
  selectedId: string | null;
  hoveredId: string | null;
  device: PageBuilderDevice;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onResize: (id: string) => void;
  onInlineChange: (id: string, field: string, value: string) => void;
  onHover: (id: string | null) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: block.id,
    data: {
      kind: "block",
      blockId: block.id,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.45 : 1,
  };

  const isSelected = selectedId === block.id;
  const isHovered = hoveredId === block.id;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="space-y-2"
      onMouseEnter={() => onHover(block.id)}
      onMouseLeave={() => onHover(null)}
    >
      <article
        className={cn(
          "group rounded-xl border bg-[#0a1020] p-3 shadow-[0_18px_36px_rgba(2,6,23,0.25)] transition-colors",
          isSelected
            ? "border-cyan-400/80"
            : isHovered
              ? "border-cyan-400/40"
              : "border-slate-700/70 hover:border-slate-500",
        )}
      >
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              {...attributes}
              {...listeners}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-700 bg-slate-950 text-slate-300 transition-colors hover:text-white"
              aria-label="Mover bloque"
            >
              <GripVertical className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => onSelect(block.id)}
              className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-950 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-200 transition-colors hover:border-slate-500"
            >
              <Layers3 className="h-3.5 w-3.5" />
              {block.type}
            </button>
          </div>

          <div className="flex flex-wrap gap-1 opacity-100 transition-opacity xl:opacity-0 xl:group-hover:opacity-100">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onResize(block.id)}
              className="h-8 rounded-lg px-2 text-slate-300 hover:bg-slate-800 hover:text-white"
            >
              <StretchHorizontal className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onDuplicate(block.id)}
              className="h-8 rounded-lg px-2 text-slate-300 hover:bg-slate-800 hover:text-white"
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onDelete(block.id)}
              className="h-8 rounded-lg px-2 text-slate-300 hover:bg-slate-800 hover:text-white"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <button type="button" onClick={() => onSelect(block.id)} className="block w-full text-left">
          {renderBlock(block, {
            isSelected,
            device,
            onInlineChange,
          })}
        </button>

        {canAcceptChildren(block.type) ? (
          <div className="mt-3 space-y-2">
            <div className="rounded-lg border border-slate-700 bg-slate-950/80 px-3 py-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Nested canvas</p>
            </div>
            <PageBuilderBlockList
              blocks={block.children}
              parentId={block.id}
              selectedId={selectedId}
              hoveredId={hoveredId}
              device={device}
              onSelect={onSelect}
              onDelete={onDelete}
              onDuplicate={onDuplicate}
              onResize={onResize}
              onInlineChange={onInlineChange}
              onHover={onHover}
              nested
            />
          </div>
        ) : null}
      </article>
    </div>
  );
}

const MemoizedSortablePageBuilderBlock = memo(SortablePageBuilderBlock);

function PageBuilderBlockList({
  blocks,
  parentId,
  selectedId,
  hoveredId,
  device,
  onSelect,
  onDelete,
  onDuplicate,
  onResize,
  onInlineChange,
  onHover,
  nested = false,
}: {
  blocks: PageBuilderBlock[];
  parentId: string | null;
  selectedId: string | null;
  hoveredId: string | null;
  device: PageBuilderDevice;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onResize: (id: string) => void;
  onInlineChange: (id: string, field: string, value: string) => void;
  onHover: (id: string | null) => void;
  nested?: boolean;
}) {
  return (
    <SortableContext items={blocks.map((block) => block.id)} strategy={verticalListSortingStrategy}>
      <div
        className={cn(
          "space-y-2",
          nested ? "rounded-xl border border-slate-700 bg-slate-950/60 p-2" : "",
        )}
      >
        <DropSlot
          parentId={parentId}
          index={0}
          label={blocks.length ? "Insertar al inicio" : "Suelta aqui para crear el primer bloque"}
        />
        {blocks.map((block, index) => (
          <div key={block.id} className="space-y-2">
            <MemoizedSortablePageBuilderBlock
              block={block}
              selectedId={selectedId}
              hoveredId={hoveredId}
              device={device}
              onSelect={onSelect}
              onDelete={onDelete}
              onDuplicate={onDuplicate}
              onResize={onResize}
              onInlineChange={onInlineChange}
              onHover={onHover}
            />
            <DropSlot parentId={parentId} index={index + 1} label="Insertar aqui" />
          </div>
        ))}
      </div>
    </SortableContext>
  );
}

export function PageBuilderCanvas({
  blocks,
  selectedId,
  device,
  onSelect,
  onDelete,
  onDuplicate,
  onResize,
  onInlineChange,
}: PageBuilderCanvasProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <section className="min-w-0 rounded-2xl border border-slate-700/80 bg-[#0a1020] p-3 shadow-[0_24px_80px_rgba(2,6,23,0.35)]">
      <header className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2.5">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-300">Canvas</p>
          <h2 className="text-sm font-semibold text-slate-100">Drag, drop, nested blocks y controles por elemento</h2>
          <p className="text-[11px] text-slate-400">El arbol JSON se actualiza en tiempo real sin reconstruccion completa.</p>
        </div>
        <div className="rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1 text-xs font-semibold text-slate-200">
          {blocks.length} bloques raiz
        </div>
      </header>

      <div className="overflow-x-hidden rounded-xl border border-slate-300 bg-[radial-gradient(circle_at_1px_1px,#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] p-3">
        <div className="rounded-xl border border-slate-200 bg-white/90 p-3 shadow-inner">
          <div className={cn("mx-auto transition-all duration-300", getFrameWidth(device))}>
            <PageBuilderBlockList
              blocks={blocks}
              parentId={null}
              selectedId={selectedId}
              hoveredId={hoveredId}
              device={device}
              onSelect={onSelect}
              onDelete={onDelete}
              onDuplicate={onDuplicate}
              onResize={onResize}
              onInlineChange={onInlineChange}
              onHover={setHoveredId}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
