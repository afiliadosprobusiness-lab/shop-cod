import { useState, type DragEvent, type ReactNode } from "react";
import { ArrowDown, ArrowUp, Copy, GripVertical, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type {
  BuilderAnyNode,
  BuilderBreakpoint,
  BuilderColumnNode,
  BuilderDragPayload,
  BuilderElementNode,
  BuilderPageNode,
  BuilderSectionNode,
} from "@/features/funnel-builder/types";

function label(node: BuilderAnyNode) {
  if (node.type === "page") return "Page";
  if (node.type === "section") return "Section";
  if (node.type === "column") return "Column";
  return node.type.toUpperCase();
}

function elementTitle(element: BuilderElementNode) {
  const keys = ["title", "content", "text", "question", "src"];
  for (const key of keys) {
    const value = element.props[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "Elemento";
}

function OutlineBox({
  node,
  selectedId,
  hoveredId,
  onSelect,
  onHover,
  actions,
  dragPayload,
  onDragPayloadChange,
  children,
}: {
  node: BuilderAnyNode;
  selectedId: string | null;
  hoveredId: string | null;
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
  actions?: ReactNode;
  dragPayload?: BuilderDragPayload;
  onDragPayloadChange: (payload: BuilderDragPayload | null) => void;
  children: ReactNode;
}) {
  const isSelected = selectedId === node.id;
  const isHovered = hoveredId === node.id;
  return (
    <div
      className={cn(
        "rounded-lg border p-2 transition-colors",
        isSelected
          ? "border-primary bg-primary/10"
          : isHovered
            ? "border-dashed border-primary/70 bg-primary/5"
            : "border-border bg-card",
      )}
      onClick={(event) => {
        event.stopPropagation();
        onSelect(node.id);
      }}
      onMouseEnter={() => onHover(node.id)}
      onMouseLeave={() => onHover(null)}
    >
      <div className="mb-1 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {dragPayload ? (
            <button
              type="button"
              draggable
              className="inline-flex h-6 w-6 cursor-grab items-center justify-center rounded-md border border-border bg-background text-muted-foreground hover:text-foreground active:cursor-grabbing"
              aria-label="Arrastrar nodo"
              onDragStart={(event) => {
                event.stopPropagation();
                event.dataTransfer.effectAllowed = "move";
                event.dataTransfer.setData("text/plain", node.id);
                onDragPayloadChange(dragPayload);
              }}
              onDragEnd={() => onDragPayloadChange(null)}
              onClick={(event) => event.stopPropagation()}
            >
              <GripVertical className="h-3.5 w-3.5" />
            </button>
          ) : null}
          <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
            {label(node)}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {(isSelected || isHovered) && actions ? <div className="flex items-center gap-1">{actions}</div> : null}
          <span className="text-[10px] text-muted-foreground">{node.id.slice(0, 8)}</span>
        </div>
      </div>
      {children}
    </div>
  );
}

function renderElement({
  element,
  selectedId,
  hoveredId,
  onSelect,
  onHover,
  index,
  total,
  columnId,
  onDragPayloadChange,
  onMoveNode,
  onDeleteNode,
  onDuplicateNode,
}: {
  element: BuilderElementNode;
  selectedId: string | null;
  hoveredId: string | null;
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
  index: number;
  total: number;
  columnId: string;
  onDragPayloadChange: (payload: BuilderDragPayload | null) => void;
  onMoveNode: (id: string, direction: "up" | "down") => void;
  onDeleteNode: (id: string) => void;
  onDuplicateNode: (id: string) => void;
}) {
  return (
    <OutlineBox
      key={element.id}
      node={element}
      selectedId={selectedId}
      hoveredId={hoveredId}
      onSelect={onSelect}
      onHover={onHover}
      dragPayload={{ kind: "canvas-element", elementId: element.id }}
      onDragPayloadChange={onDragPayloadChange}
      actions={
        <>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-6 w-6 rounded-md"
            disabled={index <= 0}
            onClick={(event) => {
              event.stopPropagation();
              onMoveNode(element.id, "up");
            }}
            aria-label="Subir elemento"
          >
            <ArrowUp className="h-3 w-3" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-6 w-6 rounded-md"
            disabled={index >= total - 1}
            onClick={(event) => {
              event.stopPropagation();
              onMoveNode(element.id, "down");
            }}
            aria-label="Bajar elemento"
          >
            <ArrowDown className="h-3 w-3" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-6 w-6 rounded-md"
            onClick={(event) => {
              event.stopPropagation();
              onDuplicateNode(element.id);
            }}
            aria-label="Duplicar elemento"
          >
            <Copy className="h-3 w-3" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-6 w-6 rounded-md text-destructive hover:text-destructive"
            onClick={(event) => {
              event.stopPropagation();
              onDeleteNode(element.id);
            }}
            aria-label="Eliminar elemento"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </>
      }
    >
      <p className="text-sm font-medium">{elementTitle(element)}</p>
      <p className="mt-1 text-xs text-muted-foreground">
        Posicion: {index + 1}/{total} en {columnId.slice(0, 8)}
      </p>
    </OutlineBox>
  );
}

function DropIndicator({
  active,
  canDrop,
  onDragOver,
  onDragLeave,
  onDrop,
}: {
  active: boolean;
  canDrop: boolean;
  onDragOver: (event: DragEvent<HTMLDivElement>) => void;
  onDragLeave: () => void;
  onDrop: (event: DragEvent<HTMLDivElement>) => void;
}) {
  return (
    <div
      className={cn(
        "my-1 h-3 rounded-md border border-dashed transition-all",
        canDrop ? "border-primary/35 bg-primary/5" : "border-transparent bg-transparent",
        active ? "border-primary bg-primary/20" : "",
      )}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    />
  );
}

function renderColumn({
  column,
  selectedId,
  hoveredId,
  onSelect,
  onHover,
  dragPayload,
  activeDropId,
  onDragPayloadChange,
  onDragOverDrop,
  onDragLeaveDrop,
  onDropAtColumnIndex,
  onMoveNode,
  onDeleteNode,
  onDuplicateNode,
}: {
  column: BuilderColumnNode;
  selectedId: string | null;
  hoveredId: string | null;
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
  dragPayload: BuilderDragPayload | null;
  activeDropId: string | null;
  onDragPayloadChange: (payload: BuilderDragPayload | null) => void;
  onDragOverDrop: (event: DragEvent<HTMLDivElement>, dropId: string, canDrop: boolean) => void;
  onDragLeaveDrop: (dropId: string) => void;
  onDropAtColumnIndex: (event: DragEvent<HTMLDivElement>, columnId: string, index: number) => void;
  onMoveNode: (id: string, direction: "up" | "down") => void;
  onDeleteNode: (id: string) => void;
  onDuplicateNode: (id: string) => void;
}) {
  return (
    <OutlineBox
      key={column.id}
      node={column}
      selectedId={selectedId}
      hoveredId={hoveredId}
      onSelect={onSelect}
      onHover={onHover}
      onDragPayloadChange={onDragPayloadChange}
    >
      <div className="space-y-2">
        {column.children.map((element, index) => {
          const dropId = `${column.id}:${index}`;
          const canDrop = dragPayload?.kind === "library-element" || dragPayload?.kind === "canvas-element";
          return (
            <div key={element.id}>
              <DropIndicator
                active={activeDropId === dropId}
                canDrop={canDrop}
                onDragOver={(event) => onDragOverDrop(event, dropId, canDrop)}
                onDragLeave={() => onDragLeaveDrop(dropId)}
                onDrop={(event) => onDropAtColumnIndex(event, column.id, index)}
              />
              {renderElement({
                element,
                selectedId,
                hoveredId,
                onSelect,
                onHover,
                index,
                total: column.children.length,
                columnId: column.id,
                onDragPayloadChange,
                onMoveNode,
                onDeleteNode,
                onDuplicateNode,
              })}
            </div>
          );
        })}
        <DropIndicator
          active={activeDropId === `${column.id}:${column.children.length}`}
          canDrop={dragPayload?.kind === "library-element" || dragPayload?.kind === "canvas-element"}
          onDragOver={(event) =>
            onDragOverDrop(
              event,
              `${column.id}:${column.children.length}`,
              dragPayload?.kind === "library-element" || dragPayload?.kind === "canvas-element",
            )
          }
          onDragLeave={() => onDragLeaveDrop(`${column.id}:${column.children.length}`)}
          onDrop={(event) => onDropAtColumnIndex(event, column.id, column.children.length)}
        />
      </div>
    </OutlineBox>
  );
}

function renderSection({
  section,
  selectedId,
  hoveredId,
  onSelect,
  onHover,
  index,
  total,
  dragPayload,
  activeDropId,
  onDragPayloadChange,
  onDragOverDrop,
  onDragLeaveDrop,
  onDropAtColumnIndex,
  onMoveNode,
  onDeleteNode,
  onDuplicateNode,
}: {
  section: BuilderSectionNode;
  selectedId: string | null;
  hoveredId: string | null;
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
  index: number;
  total: number;
  dragPayload: BuilderDragPayload | null;
  activeDropId: string | null;
  onDragPayloadChange: (payload: BuilderDragPayload | null) => void;
  onDragOverDrop: (event: DragEvent<HTMLDivElement>, dropId: string, canDrop: boolean) => void;
  onDragLeaveDrop: (dropId: string) => void;
  onDropAtColumnIndex: (event: DragEvent<HTMLDivElement>, columnId: string, index: number) => void;
  onMoveNode: (id: string, direction: "up" | "down") => void;
  onDeleteNode: (id: string) => void;
  onDuplicateNode: (id: string) => void;
}) {
  return (
    <OutlineBox
      key={section.id}
      node={section}
      selectedId={selectedId}
      hoveredId={hoveredId}
      onSelect={onSelect}
      onHover={onHover}
      dragPayload={{ kind: "canvas-section", sectionId: section.id }}
      onDragPayloadChange={onDragPayloadChange}
      actions={
        <>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-6 w-6 rounded-md"
            disabled={index <= 0}
            onClick={(event) => {
              event.stopPropagation();
              onMoveNode(section.id, "up");
            }}
            aria-label="Subir seccion"
          >
            <ArrowUp className="h-3 w-3" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-6 w-6 rounded-md"
            disabled={index >= total - 1}
            onClick={(event) => {
              event.stopPropagation();
              onMoveNode(section.id, "down");
            }}
            aria-label="Bajar seccion"
          >
            <ArrowDown className="h-3 w-3" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-6 w-6 rounded-md text-destructive hover:text-destructive"
            onClick={(event) => {
              event.stopPropagation();
              onDeleteNode(section.id);
            }}
            aria-label="Eliminar seccion"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </>
      }
    >
      <div
        className="grid gap-2"
        style={{
          gridTemplateColumns: `repeat(${Math.max(section.children.length, 1)}, minmax(0, 1fr))`,
        }}
      >
        {section.children.map((column) =>
          renderColumn({
            column,
            selectedId,
            hoveredId,
            onSelect,
            onHover,
            dragPayload,
            activeDropId,
            onDragPayloadChange,
            onDragOverDrop,
            onDragLeaveDrop,
            onDropAtColumnIndex,
            onMoveNode,
            onDeleteNode,
            onDuplicateNode,
          }),
        )}
      </div>
    </OutlineBox>
  );
}

export function BuilderCanvas({
  page,
  breakpoint,
  dragPayload,
  selectedId,
  hoveredId,
  onSelect,
  onHover,
  onDragPayloadChange,
  onDropAtSectionIndex,
  onDropAtColumnIndex,
  onMoveNode,
  onDeleteNode,
  onDuplicateNode,
}: {
  page: BuilderPageNode;
  breakpoint: BuilderBreakpoint;
  dragPayload: BuilderDragPayload | null;
  selectedId: string | null;
  hoveredId: string | null;
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
  onDragPayloadChange: (payload: BuilderDragPayload | null) => void;
  onDropAtSectionIndex: (index: number) => void;
  onDropAtColumnIndex: (columnId: string, index: number) => void;
  onMoveNode: (id: string, direction: "up" | "down") => void;
  onDeleteNode: (id: string) => void;
  onDuplicateNode: (id: string) => void;
}) {
  const [activeDropId, setActiveDropId] = useState<string | null>(null);
  const widthClass =
    breakpoint === "desktop"
      ? "mx-auto max-w-[1040px]"
      : breakpoint === "tablet"
        ? "mx-auto max-w-[760px]"
        : "mx-auto max-w-[420px]";
  const canDropAtSection = dragPayload?.kind === "library-element" || dragPayload?.kind === "canvas-section";

  const handleDrop = (event: DragEvent<HTMLDivElement>, callback: () => void) => {
    event.preventDefault();
    callback();
    setActiveDropId(null);
    onDragPayloadChange(null);
  };

  const handleDragOverDrop = (event: DragEvent<HTMLDivElement>, dropId: string, canDrop: boolean) => {
    if (!canDrop) return;
    event.preventDefault();
    setActiveDropId(dropId);
  };

  const handleDropAtColumn = (event: DragEvent<HTMLDivElement>, columnId: string, index: number) => {
    event.preventDefault();
    onDropAtColumnIndex(columnId, index);
    setActiveDropId(null);
    onDragPayloadChange(null);
  };

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-semibold">Canvas</p>
        <p className="text-xs text-muted-foreground">Paso 3: drag & drop con drop indicators</p>
      </div>
      <div className="min-h-[620px] rounded-xl border border-dashed border-border bg-secondary/5 p-3">
        <div className={cn("min-h-[595px]", widthClass)} onDragEnd={() => onDragPayloadChange(null)}>
          {!page.children.length ? (
            <div
              className={cn(
                "flex min-h-[580px] flex-col items-center justify-center rounded-lg border border-dashed text-center transition-colors",
                canDropAtSection ? "border-primary/40 bg-primary/5" : "border-border",
              )}
              onDragOver={(event) => handleDragOverDrop(event, "section-empty", canDropAtSection)}
              onDrop={(event) => handleDrop(event, () => onDropAtSectionIndex(0))}
            >
              <p className="text-sm font-medium">Tu canvas esta vacio</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Usa Elements/Sections a la izquierda para agregar nodos.
              </p>
            </div>
          ) : (
            <div
              className="space-y-3"
              onClick={() => onSelect(page.id)}
              onMouseEnter={() => onHover(page.id)}
              onMouseLeave={() => onHover(null)}
            >
              <DropIndicator
                active={activeDropId === "section:0"}
                canDrop={canDropAtSection}
                onDragOver={(event) => handleDragOverDrop(event, "section:0", canDropAtSection)}
                onDragLeave={() => setActiveDropId((current) => (current === "section:0" ? null : current))}
                onDrop={(event) => handleDrop(event, () => onDropAtSectionIndex(0))}
              />
              {page.children.map((section, index) => (
                <div key={section.id}>
                  {renderSection({
                    section,
                    selectedId,
                    hoveredId,
                    onSelect,
                    onHover,
                    index,
                    total: page.children.length,
                    dragPayload,
                    activeDropId,
                    onDragPayloadChange,
                    onDragOverDrop: handleDragOverDrop,
                    onDragLeaveDrop: (dropId) => setActiveDropId((current) => (current === dropId ? null : current)),
                    onDropAtColumnIndex: handleDropAtColumn,
                    onMoveNode,
                    onDeleteNode,
                    onDuplicateNode,
                  })}
                  <DropIndicator
                    active={activeDropId === `section:${index + 1}`}
                    canDrop={canDropAtSection}
                    onDragOver={(event) => handleDragOverDrop(event, `section:${index + 1}`, canDropAtSection)}
                    onDragLeave={() => setActiveDropId((current) => (current === `section:${index + 1}` ? null : current))}
                    onDrop={(event) => handleDrop(event, () => onDropAtSectionIndex(index + 1))}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
