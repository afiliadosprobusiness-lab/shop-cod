import { memo, type CSSProperties, type ReactNode, useMemo, useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Copy, GripVertical, PlayCircle, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  canAcceptChildren,
  type PageBuilderBlock,
  type PageBuilderBlockType,
  type PageBuilderDevice,
} from "../block-engine/schema";

interface PageBuilderCanvasProps {
  blocks: PageBuilderBlock[];
  selectedId: string | null;
  device: PageBuilderDevice;
  previewMode: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onResize: (id: string) => void;
  onInlineChange: (id: string, field: string, value: string) => void;
}

function getFrameWidth(device: PageBuilderDevice) {
  if (device === "mobile") {
    return "max-w-[430px]";
  }

  if (device === "tablet") {
    return "max-w-[880px]";
  }

  return "max-w-[1240px]";
}

function getInlineStyles(block: PageBuilderBlock): CSSProperties {
  const spacing = block.style.spacing;
  const border = block.style.border;
  const background = block.style.background;
  const typography = block.style.typography;
  const shadow = block.style.shadow;

  const style: CSSProperties = {
    marginTop: spacing.margin.top,
    marginRight: spacing.margin.right,
    marginBottom: spacing.margin.bottom,
    marginLeft: spacing.margin.left,
    paddingTop: spacing.padding.top,
    paddingRight: spacing.padding.right,
    paddingBottom: spacing.padding.bottom,
    paddingLeft: spacing.padding.left,
    color: block.style.textColor,
    textAlign: block.style.align,
    fontFamily: typography.family,
    fontSize: typography.size,
    fontWeight: typography.weight,
    lineHeight: typography.lineHeight,
    letterSpacing: `${typography.letterSpacing}px`,
    backgroundColor: background.color,
    borderColor: border.color,
    borderWidth: border.width,
    borderStyle: border.style,
    borderRadius: border.radius,
    width: block.layout.dimensions.width,
    maxWidth: block.layout.dimensions.maxWidth,
    minHeight: block.layout.dimensions.minHeight,
    height: block.layout.dimensions.height,
  };

  if (block.type === "section") {
    style.width = "100%";
    style.maxWidth = "100%";
  }

  if (block.type === "container") {
    style.width = "100%";
    style.maxWidth = block.layout.dimensions.maxWidth || "1120px";
    style.marginLeft = "auto";
    style.marginRight = "auto";
  }

  if (background.imageUrl.trim()) {
    style.backgroundImage = `url(${background.imageUrl})`;
    style.backgroundSize = background.size;
    style.backgroundPosition = background.position;
    style.backgroundRepeat = "no-repeat";
  }

  if (shadow.enabled) {
    style.boxShadow = `${shadow.x}px ${shadow.y}px ${shadow.blur}px ${shadow.spread}px ${shadow.color}`;
  }

  return style;
}

function DropIndicator({
  parentId,
  parentType,
  index,
}: {
  parentId: string | null;
  parentType: PageBuilderBlockType | null;
  index: number;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `slot:${parentId || "page"}:${index}`,
    data: {
      kind: "slot",
      parentId,
      parentType,
      index,
    },
  });

  return (
    <div ref={setNodeRef} className="relative h-5">
      <div
        className={cn(
          "absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 transition-colors",
          isOver ? "bg-blue-500" : "bg-transparent",
        )}
      />
      {isOver ? (
        <div className="absolute left-0 top-1/2 h-2.5 w-2.5 -translate-y-1/2 bg-blue-500" />
      ) : null}
    </div>
  );
}

function NodeContent({
  block,
  onInlineChange,
}: {
  block: PageBuilderBlock;
  onInlineChange: (id: string, field: string, value: string) => void;
}) {
  switch (block.type) {
    case "section":
    case "container":
    case "columns":
      return null;

    case "text":
      return (
        <div className="space-y-2">
          <h2
            contentEditable
            suppressContentEditableWarning
            onBlur={(event) => onInlineChange(block.id, "title", event.currentTarget.textContent || "")}
            className="min-h-8 text-4xl font-bold text-slate-900 outline-none"
          >
            {block.content.title || "Hero Title"}
          </h2>
          <p
            contentEditable
            suppressContentEditableWarning
            onBlur={(event) => onInlineChange(block.id, "body", event.currentTarget.textContent || "")}
            className="min-h-7 text-base text-slate-600 outline-none"
          >
            {block.content.body || "Subheadline text here"}
          </p>
        </div>
      );

    case "button":
      return (
        <button
          type="button"
          className="inline-flex min-h-11 items-center justify-center bg-blue-600 px-6 text-sm font-semibold text-white"
        >
          {block.content.label || "Buy now"}
        </button>
      );

    case "image":
      return (
        <img
          src={block.content.src || "https://placehold.co/1200x640/e2e8f0/64748b?text=Image"}
          alt={block.content.alt || "Image"}
          className="h-auto w-full border border-slate-200 object-cover"
        />
      );

    case "video":
      return (
        <div className="flex aspect-video items-center justify-center border border-slate-200 bg-slate-100">
          <PlayCircle className="h-14 w-14 text-slate-400" />
        </div>
      );

    case "form":
      return (
        <div className="grid max-w-xl gap-2">
          <input className="h-10 border border-slate-300 px-3 text-sm text-slate-900" placeholder="Nombre" />
          <input className="h-10 border border-slate-300 px-3 text-sm text-slate-900" placeholder="Telefono" />
          <input className="h-10 border border-slate-300 px-3 text-sm text-slate-900" placeholder="Direccion" />
          <button type="button" className="h-11 bg-blue-600 px-4 text-sm font-semibold text-white">
            {block.content.cta || "Enviar pedido"}
          </button>
        </div>
      );

    case "testimonial":
      return (
        <blockquote className="max-w-2xl space-y-2 border-l-2 border-slate-300 pl-4 text-slate-700">
          <p>{block.content.quote || "Testimonial quote..."}</p>
          <footer className="text-sm text-slate-500">{block.content.author || "Cliente"}</footer>
        </blockquote>
      );

    case "product":
      return (
        <article className="grid gap-4 md:grid-cols-[1fr_1fr]">
          <div className="aspect-square border border-slate-200 bg-slate-100" />
          <div className="space-y-2">
            <h3 className="text-2xl font-semibold text-slate-900">{block.content.name || "Producto"}</h3>
            <p className="text-slate-600">{block.content.description || "Descripcion del producto"}</p>
            <p className="text-2xl font-bold text-slate-900">{block.content.price || "$0"}</p>
            <button type="button" className="inline-flex h-10 items-center bg-blue-600 px-4 text-sm font-semibold text-white">
              Comprar
            </button>
          </div>
        </article>
      );

    case "checkout":
      return (
        <div className="grid max-w-xl gap-2">
          <h3 className="text-2xl font-semibold text-slate-900">{block.content.title || "Checkout"}</h3>
          <p className="text-slate-600">{block.content.subtitle || "Finaliza tu compra"}</p>
          <input className="h-10 border border-slate-300 px-3 text-sm text-slate-900" placeholder="Nombre completo" />
          <input className="h-10 border border-slate-300 px-3 text-sm text-slate-900" placeholder="Telefono" />
          <input className="h-10 border border-slate-300 px-3 text-sm text-slate-900" placeholder="Direccion" />
          <button type="button" className="h-11 bg-blue-600 px-4 text-sm font-semibold text-white">
            {block.content.cta || "Pagar ahora"}
          </button>
        </div>
      );

    case "countdown":
      return (
        <div className="grid max-w-md grid-cols-3 gap-2">
          {(["days", "hours", "minutes"] as const).map((key) => (
            <div key={`${block.id}-${key}`} className="border border-slate-200 p-3 text-center">
              <p className="text-3xl font-semibold text-slate-900">{block.content[key] || "00"}</p>
              <p className="text-[10px] uppercase tracking-[0.16em] text-slate-500">{key}</p>
            </div>
          ))}
        </div>
      );

    case "divider":
      return <hr className="border-t border-slate-300" />;
  }
}

function EditableNode({
  block,
  selectedId,
  hoveredId,
  previewMode,
  onSelect,
  onDelete,
  onDuplicate,
  onResize,
  onInlineChange,
  onHover,
  children,
}: {
  block: PageBuilderBlock;
  selectedId: string | null;
  hoveredId: string | null;
  previewMode: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onResize: (id: string) => void;
  onInlineChange: (id: string, field: string, value: string) => void;
  onHover: (id: string | null) => void;
  children: ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: block.id,
    data: {
      kind: "block",
      blockId: block.id,
    },
    disabled: previewMode,
  });

  const isSelected = selectedId === block.id;
  const isHovered = hoveredId === block.id;

  const shellStyle: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.45 : 1,
    outline: previewMode
      ? "none"
      : isSelected
        ? "1.5px solid rgb(59 130 246)"
        : isHovered
          ? "1px solid rgb(96 165 250)"
          : "none",
    outlineOffset: previewMode ? 0 : -1,
  };

  return (
    <div
      ref={setNodeRef}
      style={shellStyle}
      onMouseEnter={() => !previewMode && onHover(block.id)}
      onMouseLeave={() => !previewMode && onHover(null)}
      className="relative"
    >
      {!previewMode && isSelected ? (
        <div className="absolute left-0 top-0 z-20 flex -translate-y-full items-center gap-1 border border-slate-300 bg-white px-1 py-1 text-slate-700">
          <button
            type="button"
            {...attributes}
            {...listeners}
            className="inline-flex h-6 w-6 items-center justify-center border border-slate-200 bg-white hover:bg-slate-50"
            aria-label="Mover"
          >
            <GripVertical className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onDuplicate(block.id)}
            className="inline-flex h-6 w-6 items-center justify-center border border-slate-200 bg-white hover:bg-slate-50"
            aria-label="Duplicar"
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onResize(block.id)}
            className="inline-flex h-6 items-center justify-center border border-slate-200 bg-white px-2 text-[11px] hover:bg-slate-50"
          >
            Width
          </button>
          <button
            type="button"
            onClick={() => onDelete(block.id)}
            className="inline-flex h-6 w-6 items-center justify-center border border-slate-200 bg-white hover:bg-slate-50"
            aria-label="Eliminar"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : null}

      <div
        style={getInlineStyles(block)}
        className="relative min-w-0"
        onClick={() => !previewMode && onSelect(block.id)}
        role="presentation"
      >
        <NodeContent block={block} onInlineChange={onInlineChange} />
        {children}
      </div>
    </div>
  );
}

const MemoizedEditableNode = memo(EditableNode);

function BlockTree({
  blocks,
  parentId,
  parentType,
  selectedId,
  hoveredId,
  previewMode,
  onSelect,
  onDelete,
  onDuplicate,
  onResize,
  onInlineChange,
  onHover,
}: {
  blocks: PageBuilderBlock[];
  parentId: string | null;
  parentType: PageBuilderBlockType | null;
  selectedId: string | null;
  hoveredId: string | null;
  previewMode: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onResize: (id: string) => void;
  onInlineChange: (id: string, field: string, value: string) => void;
  onHover: (id: string | null) => void;
}) {
  const sortableItems = useMemo(() => blocks.map((block) => block.id), [blocks]);

  return (
    <SortableContext items={sortableItems} strategy={verticalListSortingStrategy}>
      <div className="space-y-0.5">
        {!previewMode ? <DropIndicator parentId={parentId} parentType={parentType} index={0} /> : null}

        {blocks.map((block, index) => {
          const isColumns = block.type === "columns";
          const childrenContainerStyle: CSSProperties | undefined = isColumns
            ? {
                display: "grid",
                gridTemplateColumns: `repeat(${Math.max(2, block.layout.columns)}, minmax(0,1fr))`,
                gap: `${Math.max(0, block.layout.gapPx || 0)}px`,
              }
            : undefined;

          return (
            <div key={block.id} className="space-y-0.5">
              <MemoizedEditableNode
                block={block}
                selectedId={selectedId}
                hoveredId={hoveredId}
                previewMode={previewMode}
                onSelect={onSelect}
                onDelete={onDelete}
                onDuplicate={onDuplicate}
                onResize={onResize}
                onInlineChange={onInlineChange}
                onHover={onHover}
              >
                {canAcceptChildren(block.type) ? (
                  <div style={childrenContainerStyle} className={cn(block.children.length ? "" : "min-h-8")}>
                    {!block.children.length && !previewMode ? (
                      <div className="border border-dashed border-slate-300 px-3 py-3 text-xs uppercase tracking-[0.16em] text-slate-400">
                        Drop here
                      </div>
                    ) : null}
                    <BlockTree
                      blocks={block.children}
                      parentId={block.id}
                      parentType={block.type}
                      selectedId={selectedId}
                      hoveredId={hoveredId}
                      previewMode={previewMode}
                      onSelect={onSelect}
                      onDelete={onDelete}
                      onDuplicate={onDuplicate}
                      onResize={onResize}
                      onInlineChange={onInlineChange}
                      onHover={onHover}
                    />
                  </div>
                ) : null}
              </MemoizedEditableNode>

              {!previewMode ? (
                <DropIndicator parentId={parentId} parentType={parentType} index={index + 1} />
              ) : null}
            </div>
          );
        })}
      </div>
    </SortableContext>
  );
}

export function PageBuilderCanvas({
  blocks,
  selectedId,
  device,
  previewMode,
  onSelect,
  onDelete,
  onDuplicate,
  onResize,
  onInlineChange,
}: PageBuilderCanvasProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <section className="min-w-0 border-x border-slate-300 bg-[#eceff3] p-4">
      <div className="mx-auto mb-2 flex w-full items-center justify-between text-xs text-slate-500">
        <p>Canvas</p>
        <p>{previewMode ? "Preview mode" : "Edit mode"}</p>
      </div>

      <div className={cn("mx-auto bg-white", getFrameWidth(device))}>
        <div className="min-h-[78vh] border border-slate-300 bg-white px-5 py-5">
          <BlockTree
            blocks={blocks}
            parentId={null}
            parentType={null}
            selectedId={selectedId}
            hoveredId={hoveredId}
            previewMode={previewMode}
            onSelect={onSelect}
            onDelete={onDelete}
            onDuplicate={onDuplicate}
            onResize={onResize}
            onInlineChange={onInlineChange}
            onHover={setHoveredId}
          />
        </div>
      </div>

      {!previewMode ? (
        <div className="mx-auto mt-3 flex w-full items-center justify-center">
          <button
            type="button"
            className="inline-flex h-8 items-center gap-1 border border-slate-300 bg-white px-3 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Section
          </button>
        </div>
      ) : null}
    </section>
  );
}
