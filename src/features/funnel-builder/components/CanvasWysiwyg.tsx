import { useMemo, useRef, type MouseEvent } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { OverlayLayer } from "@/features/funnel-builder/components/OverlayLayer";
import type {
  BuilderBreakpoint,
  BuilderColumnNode,
  BuilderDropIndicator,
  BuilderElementNode,
  BuilderPageNode,
  BuilderSectionNode,
} from "@/features/funnel-builder/types";

function readString(node: BuilderElementNode, key: string, fallback = "") {
  const value = node.props[key];
  return typeof value === "string" && value.trim() ? value : fallback;
}

function readNumber(props: Record<string, unknown>, key: string, fallback: number) {
  const value = props[key];
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

function renderElement(element: BuilderElementNode) {
  if (element.type === "hero") {
    return (
      <div className="rounded-xl border border-border/70 bg-gradient-to-br from-primary/15 via-secondary/20 to-background p-8 text-center">
        <h1 className="text-3xl font-bold leading-tight md:text-4xl">
          {readString(element, "title", "Oferta principal")}
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-base text-muted-foreground">
          {readString(element, "subtitle", "Subtitulo de la oferta")}
        </p>
        <button
          type="button"
          className="mt-6 rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground"
        >
          {readString(element, "text", "Comprar ahora")}
        </button>
      </div>
    );
  }

  if (element.type === "text") {
    return (
      <p className="whitespace-pre-wrap text-[15px] leading-7 text-foreground/90">
        {readString(element, "content", "Escribe un texto descriptivo aqui.")}
      </p>
    );
  }

  if (element.type === "button") {
    return (
      <div>
        <button
          type="button"
          className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground"
        >
          {readString(element, "text", "Continuar")}
        </button>
      </div>
    );
  }

  if (element.type === "image") {
    const src = readString(element, "src");
    return (
      <div className="overflow-hidden rounded-xl border border-border bg-secondary/20">
        <div className="aspect-[16/9] w-full">
          {src ? (
            <img src={src} alt="Imagen del bloque" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Placeholder de imagen (16:9)
            </div>
          )}
        </div>
      </div>
    );
  }

  if (element.type === "headline") {
    return <h2 className="text-2xl font-semibold">{readString(element, "content", "Titular principal")}</h2>;
  }

  if (element.type === "section") {
    return (
      <article className="rounded-xl border border-border/70 bg-card p-5">
        <h3 className="text-xl font-semibold">{readString(element, "title", "Titulo de seccion")}</h3>
        <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-muted-foreground">
          {readString(element, "content", "Contenido de seccion")}
        </p>
      </article>
    );
  }

  if (element.type === "video") {
    return (
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="aspect-video w-full bg-secondary/30" />
      </div>
    );
  }

  if (element.type === "testimonials") {
    return (
      <blockquote className="rounded-xl border border-border/70 bg-card p-5 text-sm leading-7">
        {readString(element, "content", "\"Excelente experiencia\"")}
      </blockquote>
    );
  }

  if (element.type === "faq") {
    return (
      <div className="rounded-xl border border-border/70 bg-card p-5">
        <h4 className="text-base font-semibold">{readString(element, "question", "Pregunta frecuente")}</h4>
        <p className="mt-2 text-sm leading-7 text-muted-foreground">
          {readString(element, "answer", "Respuesta breve y clara.")}
        </p>
      </div>
    );
  }

  if (element.type === "cod_form") {
    return (
      <div className="rounded-xl border border-border/70 bg-card p-5">
        <p className="text-sm font-semibold">{readString(element, "title", "Formulario COD")}</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <div className="h-10 rounded-lg border border-border bg-background px-3 py-2 text-xs text-muted-foreground">Nombre</div>
          <div className="h-10 rounded-lg border border-border bg-background px-3 py-2 text-xs text-muted-foreground">Telefono</div>
          <div className="h-10 rounded-lg border border-border bg-background px-3 py-2 text-xs text-muted-foreground sm:col-span-2">Direccion</div>
          <div className="h-10 rounded-lg border border-border bg-background px-3 py-2 text-xs text-muted-foreground sm:col-span-2">Ciudad</div>
        </div>
      </div>
    );
  }

  return (
    <footer className="rounded-xl border border-border/70 bg-card p-4 text-center text-sm text-muted-foreground">
      {readString(element, "content", "Copyright 2026")}
    </footer>
  );
}

function renderColumn(column: BuilderColumnNode) {
  return (
    <div
      key={column.id}
      data-node-id={column.id}
      data-node-type="column"
      data-node-label="Column"
      className="min-h-[120px] rounded-xl border border-dashed border-border/70 bg-background/70 p-3"
    >
      {column.children.length ? (
        <div className="space-y-3">
          {column.children.map((element) => (
            <div
              key={element.id}
              data-node-id={element.id}
              data-node-type={element.type}
              data-node-label={element.type}
              className="rounded-lg"
            >
              {renderElement(element)}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex min-h-[100px] items-center justify-center rounded-lg border border-dashed border-border/60 text-xs text-muted-foreground">
          Columna vacia
        </div>
      )}
    </div>
  );
}

function renderSection(section: BuilderSectionNode) {
  const paddingY = readNumber(section.props, "paddingY", 24);
  const label = typeof section.props.label === "string" ? section.props.label : "Section";

  return (
    <section
      key={section.id}
      data-node-id={section.id}
      data-node-type="section"
      data-node-label={label}
      className="rounded-2xl border border-border/80 bg-card/70 px-5"
      style={{ paddingTop: paddingY, paddingBottom: paddingY }}
    >
      <div
        className="grid gap-4"
        style={{
          gridTemplateColumns: `repeat(${Math.max(section.children.length, 1)}, minmax(0, 1fr))`,
        }}
      >
        {section.children.map((column) => renderColumn(column))}
      </div>
    </section>
  );
}

function resolveNodeIdFromTarget(target: EventTarget | null) {
  const element = target as HTMLElement | null;
  return element?.closest<HTMLElement>("[data-node-id]")?.dataset.nodeId ?? null;
}

export function CanvasWysiwyg({
  page,
  breakpoint,
  selectedId,
  hoveredId,
  dropIndicator,
  onSelect,
  onHover,
  onAddSection,
  onMoveSelected,
  onDeleteSelected,
  onDropIndicatorChange,
}: {
  page: BuilderPageNode;
  breakpoint: BuilderBreakpoint;
  selectedId: string | null;
  hoveredId: string | null;
  dropIndicator: BuilderDropIndicator | null;
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
  onAddSection: () => void;
  onMoveSelected?: (direction: "up" | "down") => void;
  onDeleteSelected?: () => void;
  onDropIndicatorChange?: (indicator: BuilderDropIndicator | null) => void;
}) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const widthClass =
    breakpoint === "desktop"
      ? "mx-auto max-w-[1024px]"
      : breakpoint === "tablet"
        ? "mx-auto max-w-[760px]"
        : "mx-auto max-w-[430px]";

  const selectedIsSection = useMemo(() => {
    if (!selectedId) return false;
    return page.children.some((section) => section.id === selectedId);
  }, [page.children, selectedId]);

  const handleCanvasClick = (event: MouseEvent<HTMLDivElement>) => {
    const nodeId = resolveNodeIdFromTarget(event.target);
    onSelect(nodeId ?? page.id);
  };

  const handleCanvasMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    const nodeId = resolveNodeIdFromTarget(event.target);
    onHover(nodeId);
  };

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-semibold">Canvas (WYSIWYG)</p>
        <p className="text-xs text-muted-foreground">
          Paso 1: render real + overlays (drag/drop viene en Paso 2/3)
        </p>
      </div>

      <div className="min-h-[680px] rounded-xl border border-dashed border-border bg-secondary/10 p-4">
        <div className={cn("min-h-[640px]", widthClass)}>
          <div
            ref={canvasRef}
            data-node-id={page.id}
            data-node-type="page"
            data-node-label="Page"
            className="relative min-h-[620px] rounded-2xl border border-border bg-background p-5 shadow-[0_10px_30px_rgba(0,0,0,0.12)]"
            onClick={handleCanvasClick}
            onMouseMove={handleCanvasMouseMove}
            onMouseLeave={() => onHover(null)}
            onDragOver={() => {
              // Paso 2/3: aqui se calculara el drop indicator exacto por cursor.
              onDropIndicatorChange?.(null);
            }}
          >
            {!page.children.length ? (
              <div className="flex min-h-[560px] flex-col items-center justify-center rounded-xl border border-dashed border-border/70 bg-card/30 text-center">
                <p className="text-xl font-semibold">Tu landing esta vacia</p>
                <p className="mt-2 max-w-md text-sm text-muted-foreground">
                  Empieza agregando una seccion base y luego arrastra elementos.
                </p>
                <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                  <Button type="button" className="rounded-lg" onClick={onAddSection}>
                    Agregar seccion
                  </Button>
                  <span className="text-xs text-muted-foreground">Sugerencias: Hero, Beneficios, CTA</span>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                {page.children.map((section) => renderSection(section))}
              </div>
            )}

            <OverlayLayer
              rootRef={canvasRef}
              hoveredId={hoveredId}
              selectedId={selectedId}
              dropIndicator={dropIndicator}
              onMoveSelected={selectedIsSection ? onMoveSelected : undefined}
              onDeleteSelected={onDeleteSelected}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
