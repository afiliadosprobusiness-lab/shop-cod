import { memo, useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Copy, GripVertical, Layers3, StretchHorizontal, Trash2 } from "lucide-react";
import { BuilderBlockCard, BuilderCanvas } from "@/builders/shared";
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
        "rounded-xl border border-dashed px-3 py-2 text-center text-[10px] font-semibold uppercase tracking-[0.16em] transition-all",
        isOver
          ? "border-cyan-400 bg-cyan-100 text-cyan-700"
          : "border-slate-300 bg-slate-100 text-slate-500",
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
    <div ref={setNodeRef} style={style} className="space-y-2" onMouseEnter={() => onHover(block.id)} onMouseLeave={() => onHover(null)}>
      <BuilderBlockCard
        selected={isSelected}
        interactive={!isSelected}
        className={cn(
          "group rounded-2xl border bg-slate-950/90 p-3 shadow-[0_16px_24px_rgba(15,23,42,0.3)] transition-colors",
          isSelected
            ? "border-cyan-400/80"
            : isHovered
              ? "border-cyan-400/40"
              : "border-slate-700/80 hover:border-cyan-300/40",
        )}
      >
        <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              {...attributes}
              {...listeners}
              className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-slate-700 bg-slate-900 text-slate-300 transition-colors hover:text-white"
              aria-label="Mover bloque"
            >
              <GripVertical className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => onSelect(block.id)}
              className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-200 transition-colors hover:border-slate-500"
            >
              <Layers3 className="h-3.5 w-3.5" />
              {block.type}
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5 opacity-100 transition-opacity xl:opacity-0 xl:group-hover:opacity-100">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onResize(block.id)}
              className="h-8 rounded-xl border border-transparent px-2.5 text-slate-300 hover:border-slate-600 hover:bg-slate-800 hover:text-white"
            >
              <StretchHorizontal className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onDuplicate(block.id)}
              className="h-8 rounded-xl border border-transparent px-2.5 text-slate-300 hover:border-slate-600 hover:bg-slate-800 hover:text-white"
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onDelete(block.id)}
              className="h-8 rounded-xl border border-transparent px-2.5 text-slate-300 hover:border-slate-600 hover:bg-slate-800 hover:text-white"
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
            <div className="rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                Nested canvas
              </p>
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
      </BuilderBlockCard>
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
          nested ? "rounded-2xl border border-slate-700 bg-slate-900/70 p-2.5" : "",
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
    <BuilderCanvas
      eyebrow="Canvas"
      title="Drag, drop, nested blocks y controles por elemento"
      description="El arbol JSON se actualiza en tiempo real sin recargar la pagina completa."
      className="min-w-0 flex-1"
      bodyClassName="overflow-x-hidden"
      headerBadge={
        <div className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-1.5 text-sm font-semibold text-slate-200">
          {blocks.length} bloques raiz
        </div>
      }
    >
      <div className="overflow-x-hidden rounded-[1.5rem] border border-slate-200 bg-slate-100 p-3">
        <div className="rounded-[1.25rem] border border-slate-300 bg-white p-3 shadow-inner">
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
    </BuilderCanvas>
  );
}
