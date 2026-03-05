import { memo, useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Copy, GripVertical, Plus, StretchHorizontal, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  canAcceptChildren,
  type PageBuilderBlock,
  type PageBuilderDevice,
} from "../block-engine/schema";

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
        "flex h-12 items-center justify-center rounded-lg border border-dashed text-[11px] font-semibold uppercase tracking-[0.18em] transition-colors",
        isOver
          ? "border-blue-400 bg-blue-50 text-blue-600"
          : "border-slate-300 bg-white text-slate-400",
      )}
    >
      {label}
    </div>
  );
}

function MinimalBlockPreview({ block }: { block: PageBuilderBlock }) {
  const title = block.content.title || block.content.label || block.content.name || block.type;
  const subtitle =
    block.content.subtitle ||
    block.content.body ||
    block.content.description ||
    block.content.summary ||
    "";

  if (block.type === "image" || block.type === "video") {
    return (
      <div className="rounded-lg border border-slate-300 bg-slate-100 p-3">
        <div className="flex aspect-[16/6] items-center justify-center rounded-md border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-400">
          {block.type === "video" ? "Video" : "Image"}
        </div>
      </div>
    );
  }

  if (block.type === "button") {
    return (
      <div className="rounded-lg border border-slate-300 bg-white p-3">
        <button type="button" className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white">
          {block.content.label || "Button"}
        </button>
      </div>
    );
  }

  if (block.type === "divider") {
    return (
      <div className="rounded-lg border border-slate-300 bg-white p-3">
        <div className="flex items-center gap-2">
          <div className="h-px flex-1 bg-slate-300" />
          <span className="text-xs uppercase tracking-[0.14em] text-slate-400">{block.content.label || "Divider"}</span>
          <div className="h-px flex-1 bg-slate-300" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-slate-300 bg-white p-3">
      <p className="text-sm font-semibold text-slate-800">{title}</p>
      {subtitle ? <p className="mt-1 text-xs text-slate-500">{subtitle}</p> : null}
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
    opacity: isDragging ? 0.5 : 1,
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
          "rounded-lg border bg-white p-3 shadow-sm",
          isSelected
            ? "border-amber-400"
            : isHovered
              ? "border-blue-300"
              : "border-slate-300",
        )}
      >
        <div className="mb-2 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              {...attributes}
              {...listeners}
              className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-slate-300 bg-slate-50 text-slate-600"
              aria-label="Mover bloque"
            >
              <GripVertical className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => onSelect(block.id)}
              className="inline-flex items-center rounded-full border border-slate-300 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-600"
            >
              {block.type}
            </button>
          </div>

          <div className="flex gap-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onResize(block.id)}
              className="h-7 rounded-md border border-slate-300 bg-white px-2 text-slate-600 hover:bg-slate-50"
            >
              <StretchHorizontal className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onDuplicate(block.id)}
              className="h-7 rounded-md border border-slate-300 bg-white px-2 text-slate-600 hover:bg-slate-50"
            >
              <Copy className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onDelete(block.id)}
              className="h-7 rounded-md border border-slate-300 bg-white px-2 text-slate-600 hover:bg-slate-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        <button type="button" onClick={() => onSelect(block.id)} className="block w-full text-left">
          <MinimalBlockPreview block={block} />
        </button>

        {canAcceptChildren(block.type) ? (
          <div className="mt-3 space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-2">
            <p className="px-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">Nested canvas</p>
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
  onHover: (id: string | null) => void;
  nested?: boolean;
}) {
  return (
    <SortableContext items={blocks.map((block) => block.id)} strategy={verticalListSortingStrategy}>
      <div className={cn("space-y-2", nested ? "rounded-lg border border-slate-200 bg-white p-2" : "")}>
        <DropSlot
          parentId={parentId}
          index={0}
          label={blocks.length ? "Add Element" : "Drop Here"}
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
              onHover={onHover}
            />
            <DropSlot parentId={parentId} index={index + 1} label="Add Element" />
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
}: PageBuilderCanvasProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <section className="min-w-0 rounded-xl border border-slate-300 bg-[#eaedf1] p-3">
      <div className="mb-3 grid grid-cols-2 gap-2">
        <div className="flex h-12 items-center justify-center rounded-lg border border-dashed border-slate-400 bg-[#f2f4f7]">
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-medium text-slate-500"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Element
          </button>
        </div>
        <div className="flex h-12 items-center justify-center rounded-lg border border-dashed border-slate-400 bg-[#f2f4f7]">
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-medium text-slate-500"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Element
          </button>
        </div>
      </div>

      <div className="overflow-x-hidden rounded-lg border border-slate-300 bg-[#dfe2e7] p-4">
        <div className={cn("mx-auto", getFrameWidth(device))}>
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
            onHover={setHoveredId}
          />
        </div>
      </div>
    </section>
  );
}
