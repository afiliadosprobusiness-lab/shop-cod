/* eslint-disable react-refresh/only-export-components */

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  type PageBuilderBlock,
  type PageBuilderDevice,
  pageBuilderBlockTypes,
} from "../../models/page";
import { type FunnelNode } from "../../models/funnel";
import {
  type StoreBundle,
  type StoreOrderBump,
  type StoreProduct,
} from "../../models/product";

export type BuilderRenderableBlock =
  | PageBuilderBlock
  | FunnelNode
  | StoreProduct
  | StoreBundle
  | StoreOrderBump;

interface FunnelMeta {
  label: string;
  accent: string;
  badge: string;
}

export interface RenderBlockOptions {
  isSelected?: boolean;
  device?: PageBuilderDevice;
  onInlineChange?: (id: string, field: string, value: string) => void;
  funnelMeta?: FunnelMeta;
  orderBump?: StoreOrderBump | null;
}

function isPageBuilderBlock(block: BuilderRenderableBlock): block is PageBuilderBlock {
  return (
    "type" in block &&
    "content" in block &&
    Array.isArray(block.children) &&
    pageBuilderBlockTypes.includes(block.type)
  );
}

function isFunnelNode(block: BuilderRenderableBlock): block is FunnelNode {
  return "pageId" in block && "position" in block && "analytics" in block;
}

function isStoreProduct(block: BuilderRenderableBlock): block is StoreProduct {
  return (
    "prices" in block &&
    "stock" in block &&
    "variants" in block &&
    "images" in block &&
    !("productIds" in block)
  );
}

function isStoreBundle(block: BuilderRenderableBlock): block is StoreBundle {
  return "productIds" in block && "bundlePrice" in block;
}

function isStoreOrderBump(block: BuilderRenderableBlock): block is StoreOrderBump {
  return "productId" in block && "price" in block && "description" in block && !("id" in block);
}

function getPaddingClass(padding: PageBuilderBlock["style"]["padding"]) {
  if (padding === "compact") {
    return "p-4";
  }

  if (padding === "spacious") {
    return "p-8";
  }

  return "p-6";
}

function getRadiusClass(radius: PageBuilderBlock["style"]["radius"]) {
  if (radius === "soft") {
    return "rounded-2xl";
  }

  if (radius === "pill") {
    return "rounded-[2rem]";
  }

  return "rounded-3xl";
}

function getAlignClass(align: PageBuilderBlock["style"]["align"]) {
  if (align === "center") {
    return "text-center";
  }

  if (align === "right") {
    return "text-right";
  }

  return "text-left";
}

function getWidthClass(
  width: PageBuilderBlock["layout"]["width"],
  device: PageBuilderDevice,
) {
  if (device === "mobile") {
    return "w-full";
  }

  if (width === "narrow") {
    return "max-w-2xl";
  }

  if (width === "wide") {
    return "max-w-5xl";
  }

  return "max-w-full";
}

function EditableField({
  block,
  field,
  fallback,
  multiline = false,
  options,
  className,
}: {
  block: PageBuilderBlock;
  field: string;
  fallback: string;
  multiline?: boolean;
  options?: RenderBlockOptions;
  className?: string;
}) {
  const value = block.content[field] || fallback;

  if (options?.isSelected && options.onInlineChange) {
    if (multiline) {
      return (
        <Textarea
          value={value}
          onChange={(event) =>
            options.onInlineChange?.(block.id, field, event.target.value)
          }
          className={className || "min-h-[88px] border-white/20 bg-white/10 text-sm text-white"}
        />
      );
    }

    return (
      <Input
        value={value}
        onChange={(event) =>
          options.onInlineChange?.(block.id, field, event.target.value)
        }
        className={className || "h-10 border-white/20 bg-white/10 text-sm text-white"}
      />
    );
  }

  return <>{value}</>;
}

function renderPageBlock(block: PageBuilderBlock, options?: RenderBlockOptions) {
  const device = options?.device || "desktop";
  const wrapperClass = [
    "mx-auto overflow-hidden border border-white/10 bg-slate-950/70 shadow-[0_20px_50px_rgba(15,23,42,0.22)]",
    getPaddingClass(block.style.padding),
    getRadiusClass(block.style.radius),
    getAlignClass(block.style.align),
    getWidthClass(block.layout.width, device),
  ].join(" ");

  const inlineStyle = {
    backgroundColor: block.style.backgroundColor,
    color: block.style.textColor,
  };

  switch (block.type) {
    case "text":
      return (
        <section className={wrapperClass} style={inlineStyle}>
          <div className="space-y-3">
            <h3 className="text-2xl font-bold leading-tight sm:text-3xl">
              <EditableField
                block={block}
                field="title"
                fallback="Titulo principal"
                multiline
                options={options}
              />
            </h3>
            <p className="text-sm leading-6 opacity-80 sm:text-base">
              <EditableField
                block={block}
                field="body"
                fallback="Describe el beneficio principal de tu oferta."
                multiline
                options={options}
              />
            </p>
          </div>
        </section>
      );

    case "image":
      return (
        <section className={wrapperClass} style={inlineStyle}>
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60">
            <div className="aspect-[16/9] w-full bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950">
              <img
                src={block.content.src}
                alt={block.content.alt || "Imagen del bloque"}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="border-t border-white/10 px-4 py-3 text-sm opacity-80">
              <EditableField
                block={block}
                field="caption"
                fallback="Caption de la imagen"
                options={options}
              />
            </div>
          </div>
        </section>
      );

    case "button":
      return (
        <section className={wrapperClass} style={inlineStyle}>
          <div className="space-y-3">
            <div className="inline-flex rounded-full border border-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] opacity-70">
              <EditableField
                block={block}
                field="helper"
                fallback="CTA"
                options={options}
                className="h-8 border-white/20 bg-white/10 text-xs text-white"
              />
            </div>
            <button
              type="button"
              className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition-transform hover:scale-[1.01]"
            >
              <EditableField
                block={block}
                field="label"
                fallback="Comprar ahora"
                options={options}
              />
            </button>
          </div>
        </section>
      );

    case "container":
      return (
        <section className={wrapperClass} style={inlineStyle}>
          <div className="space-y-3">
            <div className="inline-flex rounded-full border border-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] opacity-70">
              Container
            </div>
            <h3 className="text-xl font-bold">
              <EditableField
                block={block}
                field="title"
                fallback="Contenedor"
                options={options}
              />
            </h3>
            <p className="text-sm opacity-80">
              <EditableField
                block={block}
                field="subtitle"
                fallback="Agrupa otros bloques dentro de esta seccion."
                multiline
                options={options}
              />
            </p>
            {!block.children.length ? (
              <div className="rounded-2xl border border-dashed border-white/20 px-4 py-6 text-sm opacity-70">
                Suelta bloques aqui para crear una seccion anidada.
              </div>
            ) : null}
          </div>
        </section>
      );

    case "columns":
      return (
        <section className={wrapperClass} style={inlineStyle}>
          <div className="space-y-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] opacity-70">
                Columns
              </p>
              <h3 className="mt-2 text-xl font-bold">
                <EditableField
                  block={block}
                  field="title"
                  fallback="Columnas"
                  options={options}
                />
              </h3>
              <p className="mt-2 text-sm opacity-80">
                <EditableField
                  block={block}
                  field="subtitle"
                  fallback="Usa grids para comparar beneficios o evidencias."
                  multiline
                  options={options}
                />
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {Array.from({ length: Math.max(2, block.layout.columns) }).map((_, index) => (
                <div
                  key={`${block.id}-preview-${index}`}
                  className="rounded-2xl border border-dashed border-white/20 p-4 text-sm opacity-70"
                >
                  Columna {index + 1}
                </div>
              ))}
            </div>
          </div>
        </section>
      );

    case "video":
      return (
        <section className={wrapperClass} style={inlineStyle}>
          <div className="space-y-3">
            <div className="aspect-video rounded-2xl border border-white/10 bg-slate-900/60" />
            <h3 className="text-lg font-semibold">
              <EditableField
                block={block}
                field="title"
                fallback="Video"
                options={options}
              />
            </h3>
            <p className="text-sm opacity-80">
              <EditableField
                block={block}
                field="summary"
                fallback="Resumen breve del video."
                multiline
                options={options}
              />
            </p>
          </div>
        </section>
      );

    case "product":
      return (
        <section className={wrapperClass} style={inlineStyle}>
          <div className="grid gap-4 sm:grid-cols-[0.85fr_1.15fr]">
            <div className="rounded-3xl bg-white/10 p-5">
              <div className="aspect-square rounded-2xl bg-slate-900/70" />
            </div>
            <div className="space-y-3">
              <span className="inline-flex rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]">
                <EditableField
                  block={block}
                  field="badge"
                  fallback="Pago contraentrega"
                  options={options}
                  className="h-8 border-white/20 bg-white/10 text-xs text-white"
                />
              </span>
              <h3 className="text-xl font-bold">
                <EditableField
                  block={block}
                  field="name"
                  fallback="Producto"
                  options={options}
                />
              </h3>
              <p className="text-sm opacity-80">
                <EditableField
                  block={block}
                  field="description"
                  fallback="Beneficio principal del producto."
                  multiline
                  options={options}
                />
              </p>
              <p className="text-2xl font-bold">
                <EditableField
                  block={block}
                  field="price"
                  fallback="$49.900"
                  options={options}
                />
              </p>
            </div>
          </div>
        </section>
      );

    case "form":
      return (
        <section className={wrapperClass} style={inlineStyle}>
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-bold">
                <EditableField
                  block={block}
                  field="title"
                  fallback="Formulario de pedido"
                  options={options}
                />
              </h3>
              <p className="mt-2 text-sm opacity-80">
                <EditableField
                  block={block}
                  field="subtitle"
                  fallback="Pide solo los datos clave para cerrar."
                  multiline
                  options={options}
                />
              </p>
            </div>
            <div className="space-y-2">
              {["Nombre", "Telefono", "Direccion"].map((field) => (
                <div
                  key={field}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm opacity-80"
                >
                  {field}
                </div>
              ))}
            </div>
            <div className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-slate-950">
              <EditableField
                block={block}
                field="cta"
                fallback="Confirmar pedido"
                options={options}
              />
            </div>
          </div>
        </section>
      );

    case "countdown":
      return (
        <section className={wrapperClass} style={inlineStyle}>
          <div className="space-y-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] opacity-70">
              <EditableField
                block={block}
                field="label"
                fallback="Oferta termina en"
                options={options}
              />
            </p>
            <div className="grid grid-cols-3 gap-3">
              {(["days", "hours", "minutes"] as const).map((field) => (
                <div
                  key={`${block.id}-${field}`}
                  className="rounded-2xl border border-white/10 bg-white/5 px-3 py-4 text-center"
                >
                  <p className="text-2xl font-bold">
                    <EditableField
                      block={block}
                      field={field}
                      fallback="00"
                      options={options}
                    />
                  </p>
                  <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.16em] opacity-60">
                    {field}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      );

    case "testimonial":
      return (
        <section className={wrapperClass} style={inlineStyle}>
          <div className="space-y-4">
            <div className="text-4xl leading-none opacity-40">"</div>
            <blockquote className="text-lg font-medium leading-8">
              <EditableField
                block={block}
                field="quote"
                fallback="Testimonio del cliente."
                multiline
                options={options}
              />
            </blockquote>
            <div>
              <p className="font-semibold">
                <EditableField
                  block={block}
                  field="author"
                  fallback="Cliente"
                  options={options}
                />
              </p>
              <p className="text-sm opacity-70">
                <EditableField
                  block={block}
                  field="role"
                  fallback="Comprador verificado"
                  options={options}
                />
              </p>
            </div>
          </div>
        </section>
      );
  }
}

function renderFunnelNode(block: FunnelNode, options?: RenderBlockOptions) {
  const meta = options?.funnelMeta;

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <span
            className={cn(
              "inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-950",
              meta ? `bg-gradient-to-r ${meta.accent}` : "bg-sky-300",
            )}
          >
            {meta?.label || block.type}
          </span>
          <p className="mt-3 text-lg font-bold text-white">{meta?.badge || "Funnel step"}</p>
          <p className="mt-1 text-sm text-slate-400">pageId: {block.pageId}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 text-right">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
            CR
          </p>
          <p className="mt-1 text-sm font-semibold text-white">{block.analytics.conversionRate}%</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
            Visits
          </p>
          <p className="mt-1 text-sm font-semibold text-white">{block.analytics.visits}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
            Clicks
          </p>
          <p className="mt-1 text-sm font-semibold text-white">{block.analytics.clicks}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
            Type
          </p>
          <p className="mt-1 text-sm font-semibold text-white">{block.type}</p>
        </div>
      </div>
    </div>
  );
}

function renderStoreProduct(block: StoreProduct, options?: RenderBlockOptions) {
  const orderBump = options?.orderBump;

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-200">
            Product
          </p>
          <h3 className="mt-2 truncate text-lg font-bold text-white">{block.name}</h3>
          <p className="mt-1 text-sm text-slate-400">{block.stock} unidades en stock</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 text-right">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
            Base
          </p>
          <p className="mt-1 text-sm font-semibold text-white">${block.price.toFixed(2)}</p>
        </div>
      </div>
      <p className="text-sm leading-6 text-slate-300">{block.description}</p>
      <div className="grid gap-2 sm:grid-cols-3">
        {Object.entries(block.prices).map(([currency, price]) => (
          <div
            key={`${block.id}-${currency}`}
            className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-3"
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
              {currency}
            </p>
            <p className="mt-1 text-sm font-semibold text-white">{price.toFixed(2)}</p>
          </div>
        ))}
      </div>
      {orderBump ? (
        <div className="rounded-2xl border border-emerald-300/20 bg-emerald-500/10 px-4 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-200">
            Order bump
          </p>
          <p className="mt-1 text-sm font-semibold text-white">${orderBump.price.toFixed(2)}</p>
          <p className="mt-1 text-sm text-slate-300">{orderBump.description}</p>
        </div>
      ) : null}
    </div>
  );
}

function renderStoreBundle(block: StoreBundle) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-200">
            Bundle
          </p>
          <p className="mt-1 text-sm text-slate-300">{block.productIds.length} productos</p>
        </div>
        <p className="text-sm font-semibold text-white">${block.bundlePrice.toFixed(2)}</p>
      </div>
      <p className="text-xs text-slate-400">{block.productIds.join(", ") || "Sin productos"}</p>
    </div>
  );
}

function renderStoreOrderBump(block: StoreOrderBump) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-200">
        Order bump
      </p>
      <p className="text-sm font-semibold text-white">{block.productId || "Sin producto"}</p>
      <p className="text-sm text-slate-300">${block.price.toFixed(2)}</p>
      <p className="text-sm text-slate-400">{block.description}</p>
    </div>
  );
}

export function renderBlock(block: BuilderRenderableBlock, options?: RenderBlockOptions) {
  if (isPageBuilderBlock(block)) {
    return renderPageBlock(block, options);
  }

  if (isFunnelNode(block)) {
    return renderFunnelNode(block, options);
  }

  if (isStoreProduct(block)) {
    return renderStoreProduct(block, options);
  }

  if (isStoreBundle(block)) {
    return renderStoreBundle(block);
  }

  if (isStoreOrderBump(block)) {
    return renderStoreOrderBump(block);
  }

  return null;
}
