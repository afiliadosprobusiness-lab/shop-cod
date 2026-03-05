import { useCallback, useLayoutEffect, useState, type RefObject } from "react";
import { GripVertical, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { BuilderDropIndicator } from "@/features/funnel-builder/types";

interface OverlayRect {
  top: number;
  left: number;
  width: number;
  height: number;
  label: string;
}

function queryRect(
  root: HTMLElement,
  nodeId: string | null,
): OverlayRect | null {
  if (!nodeId) return null;
  const target = root.querySelector<HTMLElement>(`[data-node-id="${nodeId}"]`);
  if (!target) return null;
  const rootRect = root.getBoundingClientRect();
  const rect = target.getBoundingClientRect();
  const label =
    target.dataset.nodeLabel ||
    target.dataset.nodeType ||
    target.dataset.nodeId ||
    "Block";
  return {
    top: rect.top - rootRect.top,
    left: rect.left - rootRect.left,
    width: rect.width,
    height: rect.height,
    label,
  };
}

export function OverlayLayer({
  rootRef,
  hoveredId,
  selectedId,
  dropIndicator,
  onMoveSelected,
  onDeleteSelected,
}: {
  rootRef: RefObject<HTMLDivElement>;
  hoveredId: string | null;
  selectedId: string | null;
  dropIndicator: BuilderDropIndicator | null;
  onMoveSelected?: (direction: "up" | "down") => void;
  onDeleteSelected?: () => void;
}) {
  const [hoveredRect, setHoveredRect] = useState<OverlayRect | null>(null);
  const [selectedRect, setSelectedRect] = useState<OverlayRect | null>(null);
  const [dropRect, setDropRect] = useState<OverlayRect | null>(null);

  const recalc = useCallback(() => {
    const root = rootRef.current;
    if (!root) return;
    setHoveredRect(queryRect(root, hoveredId));
    setSelectedRect(queryRect(root, selectedId));
    setDropRect(queryRect(root, dropIndicator?.targetId ?? null));
  }, [dropIndicator?.targetId, hoveredId, rootRef, selectedId]);

  useLayoutEffect(() => {
    recalc();
    const root = rootRef.current;
    if (!root) return;

    const onResize = () => recalc();
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onResize, true);

    let observer: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(() => recalc());
      observer.observe(root);
    }

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onResize, true);
      observer?.disconnect();
    };
  }, [recalc, rootRef]);

  return (
    <div className="pointer-events-none absolute inset-0 z-20">
      {hoveredRect && hoveredId !== selectedId ? (
        <div
          className="absolute rounded-md border border-dashed border-primary/80"
          style={{
            top: hoveredRect.top,
            left: hoveredRect.left,
            width: hoveredRect.width,
            height: hoveredRect.height,
          }}
        >
          <span className="absolute -top-6 left-0 rounded-md bg-background/95 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-primary shadow">
            {hoveredRect.label}
          </span>
        </div>
      ) : null}

      {selectedRect ? (
        <div
          className="absolute rounded-md border-2 border-primary"
          style={{
            top: selectedRect.top,
            left: selectedRect.left,
            width: selectedRect.width,
            height: selectedRect.height,
          }}
        >
          <span className="absolute -top-6 left-0 rounded-md bg-primary px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-primary-foreground shadow">
            {selectedRect.label}
          </span>
          <div className="pointer-events-auto absolute -top-6 right-0 flex items-center gap-1 rounded-md border border-border bg-background/95 p-1 shadow">
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="h-6 w-6 rounded"
              aria-label="Mover bloque"
              onClick={(event) => {
                event.preventDefault();
                onMoveSelected?.("up");
              }}
            >
              <GripVertical className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="h-6 w-6 rounded text-destructive hover:text-destructive"
              aria-label="Eliminar bloque"
              onClick={(event) => {
                event.preventDefault();
                onDeleteSelected?.();
              }}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      ) : null}

      {dropIndicator && dropRect ? (
        <div
          className="absolute bg-primary"
          style={{
            left: dropRect.left,
            width: dropRect.width,
            height: 2,
            top:
              dropIndicator.position === "before"
                ? dropRect.top - 2
                : dropIndicator.position === "after"
                  ? dropRect.top + dropRect.height + 1
                  : dropRect.top + dropRect.height / 2,
          }}
        />
      ) : null}
    </div>
  );
}
