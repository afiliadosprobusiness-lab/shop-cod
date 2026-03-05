import type { ReactNode } from "react";
import { SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { PageBuilderBlock } from "../block-engine/schema";

interface PageBuilderStylePanelProps {
  selectedBlock: PageBuilderBlock | null;
  onUpdateStyle: (nextStyle: PageBuilderBlock["style"]) => void;
  onUpdateLayout: (nextLayout: PageBuilderBlock["layout"]) => void;
}

function NumberField({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-[10px] uppercase tracking-[0.16em] text-slate-400">
        {label}
      </Label>
      <Input
        id={id}
        type="number"
        value={Number.isFinite(value) ? value : 0}
        onChange={(event) => onChange(Number.parseFloat(event.target.value || "0") || 0)}
        className="h-9 border-slate-700 bg-slate-950/80 text-slate-100"
      />
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-slate-700 bg-slate-950/70 p-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">{title}</p>
      <div className="mt-3">{children}</div>
    </section>
  );
}

export function PageBuilderStylePanel({
  selectedBlock,
  onUpdateStyle,
  onUpdateLayout,
}: PageBuilderStylePanelProps) {
  const disabled = !selectedBlock;

  const mutateStyle = (mutator: (style: PageBuilderBlock["style"]) => PageBuilderBlock["style"]) => {
    if (!selectedBlock) {
      return;
    }

    onUpdateStyle(mutator(selectedBlock.style));
  };

  const mutateLayout = (mutator: (layout: PageBuilderBlock["layout"]) => PageBuilderBlock["layout"]) => {
    if (!selectedBlock) {
      return;
    }

    onUpdateLayout(mutator(selectedBlock.layout));
  };

  return (
    <aside className="w-full rounded-2xl border border-slate-700/80 bg-[#0a1020] p-3 shadow-[0_24px_80px_rgba(2,6,23,0.35)] xl:w-[19rem]">
      <header className="mb-3 rounded-xl border border-slate-700 bg-slate-950/70 p-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-400/20 text-cyan-200">
            <SlidersHorizontal className="h-4 w-4" />
          </span>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-300">Style editor</p>
            <p className="text-xs text-slate-400">Spacing, typography y visual</p>
          </div>
        </div>
      </header>

      {!selectedBlock ? (
        <div className="rounded-xl border border-dashed border-slate-700 bg-slate-950/70 p-4 text-sm text-slate-400">
          Selecciona un bloque en el canvas para editar sus estilos.
        </div>
      ) : (
        <div className="max-h-[78vh] space-y-3 overflow-y-auto pr-1">
          <Section title="Spacing">
            <div className="grid gap-2 sm:grid-cols-2">
              <NumberField id="margin-top" label="Margin top" value={selectedBlock.style.spacing.margin.top} onChange={(value) => mutateStyle((style) => ({ ...style, spacing: { ...style.spacing, margin: { ...style.spacing.margin, top: value } } }))} />
              <NumberField id="margin-right" label="Margin right" value={selectedBlock.style.spacing.margin.right} onChange={(value) => mutateStyle((style) => ({ ...style, spacing: { ...style.spacing, margin: { ...style.spacing.margin, right: value } } }))} />
              <NumberField id="margin-bottom" label="Margin bottom" value={selectedBlock.style.spacing.margin.bottom} onChange={(value) => mutateStyle((style) => ({ ...style, spacing: { ...style.spacing, margin: { ...style.spacing.margin, bottom: value } } }))} />
              <NumberField id="margin-left" label="Margin left" value={selectedBlock.style.spacing.margin.left} onChange={(value) => mutateStyle((style) => ({ ...style, spacing: { ...style.spacing, margin: { ...style.spacing.margin, left: value } } }))} />
            </div>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              <NumberField id="padding-top" label="Padding top" value={selectedBlock.style.spacing.padding.top} onChange={(value) => mutateStyle((style) => ({ ...style, spacing: { ...style.spacing, padding: { ...style.spacing.padding, top: value } } }))} />
              <NumberField id="padding-right" label="Padding right" value={selectedBlock.style.spacing.padding.right} onChange={(value) => mutateStyle((style) => ({ ...style, spacing: { ...style.spacing, padding: { ...style.spacing.padding, right: value } } }))} />
              <NumberField id="padding-bottom" label="Padding bottom" value={selectedBlock.style.spacing.padding.bottom} onChange={(value) => mutateStyle((style) => ({ ...style, spacing: { ...style.spacing, padding: { ...style.spacing.padding, bottom: value } } }))} />
              <NumberField id="padding-left" label="Padding left" value={selectedBlock.style.spacing.padding.left} onChange={(value) => mutateStyle((style) => ({ ...style, spacing: { ...style.spacing, padding: { ...style.spacing.padding, left: value } } }))} />
            </div>
          </Section>

          <Section title="Dimensions">
            <div className="grid gap-2">
              <div className="space-y-1.5">
                <Label htmlFor="layout-width" className="text-[10px] uppercase tracking-[0.16em] text-slate-400">Width</Label>
                <Input id="layout-width" value={selectedBlock.layout.dimensions.width} onChange={(event) => mutateLayout((layout) => ({ ...layout, dimensions: { ...layout.dimensions, width: event.target.value } }))} className="h-9 border-slate-700 bg-slate-950/80 text-slate-100" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="layout-height" className="text-[10px] uppercase tracking-[0.16em] text-slate-400">Height</Label>
                <Input id="layout-height" value={selectedBlock.layout.dimensions.height} onChange={(event) => mutateLayout((layout) => ({ ...layout, dimensions: { ...layout.dimensions, height: event.target.value } }))} className="h-9 border-slate-700 bg-slate-950/80 text-slate-100" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="layout-min-height" className="text-[10px] uppercase tracking-[0.16em] text-slate-400">Min height</Label>
                <Input id="layout-min-height" value={selectedBlock.layout.dimensions.minHeight} onChange={(event) => mutateLayout((layout) => ({ ...layout, dimensions: { ...layout.dimensions, minHeight: event.target.value } }))} className="h-9 border-slate-700 bg-slate-950/80 text-slate-100" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="layout-max-width" className="text-[10px] uppercase tracking-[0.16em] text-slate-400">Max width</Label>
                <Input id="layout-max-width" value={selectedBlock.layout.dimensions.maxWidth} onChange={(event) => mutateLayout((layout) => ({ ...layout, dimensions: { ...layout.dimensions, maxWidth: event.target.value } }))} className="h-9 border-slate-700 bg-slate-950/80 text-slate-100" />
              </div>
              <NumberField id="layout-gap" label="Gap" value={selectedBlock.layout.gapPx} onChange={(value) => mutateLayout((layout) => ({ ...layout, gapPx: value }))} />
              {selectedBlock.type === "columns" ? (
                <NumberField id="layout-columns" label="Columns" value={selectedBlock.layout.columns} onChange={(value) => mutateLayout((layout) => ({ ...layout, columns: Math.max(2, value) }))} />
              ) : null}
            </div>
          </Section>

          <Section title="Typography">
            <div className="grid gap-2">
              <div className="space-y-1.5">
                <Label htmlFor="typography-family" className="text-[10px] uppercase tracking-[0.16em] text-slate-400">Font family</Label>
                <Input id="typography-family" value={selectedBlock.style.typography.family} onChange={(event) => mutateStyle((style) => ({ ...style, typography: { ...style.typography, family: event.target.value } }))} className="h-9 border-slate-700 bg-slate-950/80 text-slate-100" />
              </div>
              <NumberField id="typography-size" label="Font size" value={selectedBlock.style.typography.size} onChange={(value) => mutateStyle((style) => ({ ...style, typography: { ...style.typography, size: value } }))} />
              <NumberField id="typography-weight" label="Weight" value={selectedBlock.style.typography.weight} onChange={(value) => mutateStyle((style) => ({ ...style, typography: { ...style.typography, weight: value } }))} />
              <NumberField id="typography-line-height" label="Line height" value={selectedBlock.style.typography.lineHeight} onChange={(value) => mutateStyle((style) => ({ ...style, typography: { ...style.typography, lineHeight: value } }))} />
              <div className="space-y-1.5">
                <Label htmlFor="typography-align" className="text-[10px] uppercase tracking-[0.16em] text-slate-400">Text align</Label>
                <select id="typography-align" value={selectedBlock.style.align} onChange={(event) => mutateStyle((style) => ({ ...style, align: event.target.value as PageBuilderBlock["style"]["align"] }))} className="h-9 w-full rounded-md border border-slate-700 bg-slate-950/80 px-3 text-sm text-slate-100">
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="typography-color" className="text-[10px] uppercase tracking-[0.16em] text-slate-400">Text color</Label>
                <Input id="typography-color" value={selectedBlock.style.textColor} onChange={(event) => mutateStyle((style) => ({ ...style, textColor: event.target.value }))} className="h-9 border-slate-700 bg-slate-950/80 text-slate-100" />
              </div>
            </div>
          </Section>

          <Section title="Background">
            <div className="grid gap-2">
              <div className="space-y-1.5">
                <Label htmlFor="background-color" className="text-[10px] uppercase tracking-[0.16em] text-slate-400">Color</Label>
                <Input id="background-color" value={selectedBlock.style.background.color} onChange={(event) => mutateStyle((style) => ({ ...style, backgroundColor: event.target.value, background: { ...style.background, color: event.target.value } }))} className="h-9 border-slate-700 bg-slate-950/80 text-slate-100" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="background-image" className="text-[10px] uppercase tracking-[0.16em] text-slate-400">Image URL</Label>
                <Input id="background-image" value={selectedBlock.style.background.imageUrl} onChange={(event) => mutateStyle((style) => ({ ...style, background: { ...style.background, imageUrl: event.target.value } }))} className="h-9 border-slate-700 bg-slate-950/80 text-slate-100" />
              </div>
            </div>
          </Section>

          <Section title="Borders">
            <div className="grid gap-2">
              <div className="space-y-1.5">
                <Label htmlFor="border-style" className="text-[10px] uppercase tracking-[0.16em] text-slate-400">Style</Label>
                <select id="border-style" value={selectedBlock.style.border.style} onChange={(event) => mutateStyle((style) => ({ ...style, borderStyle: event.target.value as PageBuilderBlock["style"]["borderStyle"], border: { ...style.border, style: event.target.value as PageBuilderBlock["style"]["border"]["style"] } }))} className="h-9 w-full rounded-md border border-slate-700 bg-slate-950/80 px-3 text-sm text-slate-100">
                  <option value="none">None</option>
                  <option value="solid">Solid</option>
                  <option value="dashed">Dashed</option>
                </select>
              </div>
              <NumberField id="border-width" label="Width" value={selectedBlock.style.border.width} onChange={(value) => mutateStyle((style) => ({ ...style, border: { ...style.border, width: value } }))} />
              <NumberField id="border-radius" label="Radius" value={selectedBlock.style.border.radius} onChange={(value) => mutateStyle((style) => ({ ...style, border: { ...style.border, radius: value } }))} />
              <div className="space-y-1.5">
                <Label htmlFor="border-color" className="text-[10px] uppercase tracking-[0.16em] text-slate-400">Color</Label>
                <Input id="border-color" value={selectedBlock.style.border.color} onChange={(event) => mutateStyle((style) => ({ ...style, borderColor: event.target.value, border: { ...style.border, color: event.target.value } }))} className="h-9 border-slate-700 bg-slate-950/80 text-slate-100" />
              </div>
            </div>
          </Section>

          <Section title="Shadow">
            <label htmlFor="shadow-enabled" className={cn("flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-300", disabled ? "opacity-70" : "") }>
              <input id="shadow-enabled" type="checkbox" checked={selectedBlock.style.shadow.enabled} onChange={(event) => mutateStyle((style) => ({ ...style, shadow: { ...style.shadow, enabled: event.target.checked } }))} className="h-4 w-4 rounded border-slate-600" />
              Shadow enabled
            </label>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              <NumberField id="shadow-x" label="Offset X" value={selectedBlock.style.shadow.x} onChange={(value) => mutateStyle((style) => ({ ...style, shadow: { ...style.shadow, x: value } }))} />
              <NumberField id="shadow-y" label="Offset Y" value={selectedBlock.style.shadow.y} onChange={(value) => mutateStyle((style) => ({ ...style, shadow: { ...style.shadow, y: value } }))} />
              <NumberField id="shadow-blur" label="Blur" value={selectedBlock.style.shadow.blur} onChange={(value) => mutateStyle((style) => ({ ...style, shadow: { ...style.shadow, blur: value } }))} />
              <NumberField id="shadow-spread" label="Spread" value={selectedBlock.style.shadow.spread} onChange={(value) => mutateStyle((style) => ({ ...style, shadow: { ...style.shadow, spread: value } }))} />
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="shadow-color" className="text-[10px] uppercase tracking-[0.16em] text-slate-400">Shadow color</Label>
                <Input id="shadow-color" value={selectedBlock.style.shadow.color} onChange={(event) => mutateStyle((style) => ({ ...style, shadow: { ...style.shadow, color: event.target.value } }))} className="h-9 border-slate-700 bg-slate-950/80 text-slate-100" />
              </div>
            </div>
          </Section>
        </div>
      )}
    </aside>
  );
}
