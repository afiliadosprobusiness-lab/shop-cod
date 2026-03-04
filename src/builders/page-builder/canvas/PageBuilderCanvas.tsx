import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Layers3, Trash2 } from "lucide-react";
import { BuilderBlockCard, BuilderCanvas } from "@/builders/shared";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  canAcceptChildren,
  type PageBuilderBlock,
  type PageBuilderDevice,
} from "../blocks/schema";
import { renderBlock } from "../renderer/renderBlock";

interface PageBuilderCanvasProps {
  blocks: PageBuilderBlock[];
  selectedId: string | null;
  device: PageBuilderDevice;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
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
        "rounded-2xl border border-dashed px-3 py-2 text-center text-[11px] font-semibold uppercase tracking-[0.16em] transition-all",
        isOver
          ? "border-sky-400 bg-sky-500/10 text-sky-200"
          : "border-white/10 bg-white/[0.03] text-slate-400",
      )}
    >
      {label}
    </div>
  );
}

function SortablePageBuilderBlock({
  block,
  selectedId,
  device,
  onSelect,
  onDelete,
  onInlineChange,
}: {
  block: PageBuilderBlock;
  selectedId: string | null;
  device: PageBuilderDevice;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onInlineChange: (id: string, field: string, value: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({
      id: block.id,
      data: {
        kind: "block",
        blockId: block.id,
      },
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const isSelected = selectedId === block.id;

  return (
    <div ref={setNodeRef} style={style} className="space-y-3">
      <BuilderBlockCard
        selected={isSelected}
        interactive={!isSelected}
        className="group bg-slate-900/70 p-4 shadow-[0_20px_45px_rgba(2,6,23,0.28)]"
      >
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              {...attributes}
              {...listeners}
              className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-300 transition-colors hover:text-white"
              aria-label="Mover bloque"
            >
              <GripVertical className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => onSelect(block.id)}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-slate-200 transition-colors hover:border-white/20"
            >
              <Layers3 className="h-3.5 w-3.5" />
              {block.type}
            </button>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onDelete(block.id)}
            className="h-9 rounded-2xl border border-transparent px-3 text-slate-300 hover:border-white/10 hover:bg-white/5 hover:text-white"
          >
            <Trash2 className="h-4 w-4" />
            Eliminar
          </Button>
        </div>

        <button
          type="button"
          onClick={() => onSelect(block.id)}
          className="block w-full text-left"
        >
          {renderBlock(block, {
            isSelected,
            device,
            onInlineChange,
          })}
        </button>

        {canAcceptChildren(block.type) ? (
          <div className="mt-4 space-y-3">
            <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                Nested canvas
              </p>
            </div>
            <PageBuilderBlockList
              blocks={block.children}
              parentId={block.id}
              selectedId={selectedId}
              device={device}
              onSelect={onSelect}
              onDelete={onDelete}
              onInlineChange={onInlineChange}
              nested
            />
          </div>
        ) : null}
      </BuilderBlockCard>
    </div>
  );
}

function PageBuilderBlockList({
  blocks,
  parentId,
  selectedId,
  device,
  onSelect,
  onDelete,
  onInlineChange,
  nested = false,
}: {
  blocks: PageBuilderBlock[];
  parentId: string | null;
  selectedId: string | null;
  device: PageBuilderDevice;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onInlineChange: (id: string, field: string, value: string) => void;
  nested?: boolean;
}) {
  return (
    <SortableContext
      items={blocks.map((block) => block.id)}
      strategy={verticalListSortingStrategy}
    >
      <div
        className={cn(
          "space-y-3",
          nested ? "rounded-[1.5rem] border border-white/10 bg-white/[0.02] p-3" : "",
        )}
      >
        <DropSlot
          parentId={parentId}
          index={0}
          label={blocks.length ? "Insertar al inicio" : "Suelta aqui para crear el primer bloque"}
        />
        {blocks.map((block, index) => (
          <div key={block.id} className="space-y-3">
            <SortablePageBuilderBlock
              block={block}
              selectedId={selectedId}
              device={device}
              onSelect={onSelect}
              onDelete={onDelete}
              onInlineChange={onInlineChange}
            />
            <DropSlot
              parentId={parentId}
              index={index + 1}
              label="Insertar aqui"
            />
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
  onInlineChange,
}: PageBuilderCanvasProps) {
  return (
    <BuilderCanvas
      eyebrow="Canvas"
      title="Drag, drop, reorder y edicion inline"
      description="Cada cambio actualiza solo el arbol afectado del builder."
      className="flex-1"
      bodyClassName="overflow-x-hidden"
      headerBadge={
        <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-slate-200">
          {blocks.length} bloques raiz
        </div>
      }
    >
      <div className="overflow-x-hidden">
        <div className={cn("mx-auto transition-all duration-300", getFrameWidth(device))}>
          <PageBuilderBlockList
            blocks={blocks}
            parentId={null}
            selectedId={selectedId}
            device={device}
            onSelect={onSelect}
            onDelete={onDelete}
            onInlineChange={onInlineChange}
          />
        </div>
      </div>
    </BuilderCanvas>
  );
}
