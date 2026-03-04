import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Code2, Layers3, Plus, Settings2, Sparkles, Wand2 } from "lucide-react";
import { BuilderBlockCard, BuilderSidebar } from "@/builders/shared";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { pageBuilderElementCatalog } from "../block-engine/catalog";
import {
  type PageBuilderBlock,
  type PageBuilderBlockType,
} from "../block-engine/schema";
import { flattenPageBuilderBlocks } from "../block-engine/tree";

interface PageBuilderSidebarProps {
  blocks: PageBuilderBlock[];
  selectedBlock: PageBuilderBlock | null;
  selectedId: string | null;
  pageJson: string;
  onSelect: (id: string) => void;
  onAddBlock: (type: PageBuilderBlockType) => void;
  onUpdateContent: (field: string, value: string) => void;
  onUpdateStyle: (field: keyof PageBuilderBlock["style"], value: string) => void;
  onUpdateLayout: (field: keyof PageBuilderBlock["layout"], value: string) => void;
}

function PaletteItem({
  type,
  label,
  description,
  onAddBlock,
}: {
  type: PageBuilderBlockType;
  label: string;
  description: string;
  onAddBlock: (type: PageBuilderBlockType) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `palette:${type}`,
    data: {
      kind: "palette",
      blockType: type,
    },
  });

  const style = transform ? { transform: CSS.Translate.toString(transform) } : undefined;

  return (
    <button
      ref={setNodeRef}
      type="button"
      {...attributes}
      {...listeners}
      style={style}
      onDoubleClick={() => onAddBlock(type)}
      className={cn("w-full text-left", isDragging ? "opacity-60" : "")}
    >
      <BuilderBlockCard interactive className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-white">{label}</p>
            <p className="mt-1 text-sm leading-6 text-slate-400">{description}</p>
          </div>
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-slate-200">
            <Plus className="h-4 w-4" />
          </span>
        </div>
      </BuilderBlockCard>
    </button>
  );
}

function EmptyInspector({ label }: { label: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.03] p-5 text-sm text-slate-400">
      {label}
    </div>
  );
}

export function PageBuilderSidebar({
  blocks,
  selectedBlock,
  selectedId,
  pageJson,
  onSelect,
  onAddBlock,
  onUpdateContent,
  onUpdateStyle,
  onUpdateLayout,
}: PageBuilderSidebarProps) {
  const layers = flattenPageBuilderBlocks(blocks);
  const groupedCatalog = pageBuilderElementCatalog.reduce<Record<string, typeof pageBuilderElementCatalog>>(
    (accumulator, item) => {
      accumulator[item.group] = [...(accumulator[item.group] || []), item];
      return accumulator;
    },
    {},
  );

  return (
    <BuilderSidebar
      eyebrow="Page builder"
      description="Elements, layers, styles y settings del editor visual."
      icon={<Sparkles className="h-5 w-5 text-sky-200" />}
      className="max-w-sm xl:w-[23rem]"
    >
      <Tabs defaultValue="elements" className="mt-4">
        <TabsList className="grid h-auto w-full grid-cols-4 gap-1 rounded-2xl bg-white/[0.03] p-1">
          <TabsTrigger value="elements" className="rounded-2xl px-2 text-[11px]">
            Elements
          </TabsTrigger>
          <TabsTrigger value="layers" className="rounded-2xl px-2 text-[11px]">
            Layers
          </TabsTrigger>
          <TabsTrigger value="styles" className="rounded-2xl px-2 text-[11px]">
            Styles
          </TabsTrigger>
          <TabsTrigger value="settings" className="rounded-2xl px-2 text-[11px]">
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="elements" className="space-y-4">
          <div className="max-h-[42rem] space-y-4 overflow-y-auto pr-1">
            {Object.entries(groupedCatalog).map(([group, items]) => (
              <div key={group} className="space-y-3">
                <div className="flex items-center gap-2">
                  <Wand2 className="h-4 w-4 text-sky-200" />
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                    {group}
                  </p>
                </div>
                <div className="space-y-3">
                  {items.map((item) => (
                    <PaletteItem
                      key={item.type}
                      type={item.type}
                      label={item.label}
                      description={item.description}
                      onAddBlock={onAddBlock}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="layers" className="space-y-3">
          <div className="max-h-[42rem] space-y-2 overflow-y-auto pr-1">
            {layers.map(({ block, depth }) => (
              <button
                key={block.id}
                type="button"
                onClick={() => onSelect(block.id)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-2xl border px-3 py-3 text-left transition-colors",
                  selectedId === block.id
                    ? "border-sky-400/40 bg-sky-500/10"
                    : "border-white/10 bg-white/[0.03] hover:border-white/20",
                )}
              >
                <span
                  className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-white/[0.04] text-slate-200"
                  style={{ marginLeft: `${depth * 12}px` }}
                >
                  <Layers3 className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white">{block.type}</p>
                  <p className="truncate text-xs text-slate-400">{block.id}</p>
                </div>
              </button>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="styles" className="space-y-4">
          {!selectedBlock ? (
            <EmptyInspector label="Selecciona un bloque para editar padding, margin, background, font, border y alignment." />
          ) : (
            <div className="max-h-[42rem] space-y-4 overflow-y-auto pr-1">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-[0.14em] text-slate-400">
                    Padding
                  </Label>
                  <select
                    value={selectedBlock.style.padding}
                    onChange={(event) => onUpdateStyle("padding", event.target.value)}
                    className="h-10 w-full rounded-md border border-white/10 bg-white/[0.03] px-3 text-sm text-white"
                  >
                    <option value="compact">Compact</option>
                    <option value="comfortable">Comfortable</option>
                    <option value="spacious">Spacious</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-[0.14em] text-slate-400">
                    Margin
                  </Label>
                  <select
                    value={selectedBlock.style.margin}
                    onChange={(event) => onUpdateStyle("margin", event.target.value)}
                    className="h-10 w-full rounded-md border border-white/10 bg-white/[0.03] px-3 text-sm text-white"
                  >
                    <option value="none">None</option>
                    <option value="sm">SM</option>
                    <option value="md">MD</option>
                    <option value="lg">LG</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="style-background" className="text-xs uppercase tracking-[0.14em] text-slate-400">
                  Background
                </Label>
                <Input
                  id="style-background"
                  value={selectedBlock.style.backgroundColor}
                  onChange={(event) => onUpdateStyle("backgroundColor", event.target.value)}
                  className="border-white/10 bg-white/[0.03] text-white"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="style-text" className="text-xs uppercase tracking-[0.14em] text-slate-400">
                    Font color
                  </Label>
                  <Input
                    id="style-text"
                    value={selectedBlock.style.textColor}
                    onChange={(event) => onUpdateStyle("textColor", event.target.value)}
                    className="border-white/10 bg-white/[0.03] text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-[0.14em] text-slate-400">
                    Alignment
                  </Label>
                  <select
                    value={selectedBlock.style.align}
                    onChange={(event) => onUpdateStyle("align", event.target.value)}
                    className="h-10 w-full rounded-md border border-white/10 bg-white/[0.03] px-3 text-sm text-white"
                  >
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-[0.14em] text-slate-400">
                    Font family
                  </Label>
                  <select
                    value={selectedBlock.style.fontFamily}
                    onChange={(event) => onUpdateStyle("fontFamily", event.target.value)}
                    className="h-10 w-full rounded-md border border-white/10 bg-white/[0.03] px-3 text-sm text-white"
                  >
                    <option value="sans">Sans</option>
                    <option value="serif">Serif</option>
                    <option value="mono">Mono</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-[0.14em] text-slate-400">
                    Font size
                  </Label>
                  <select
                    value={selectedBlock.style.fontSize}
                    onChange={(event) => onUpdateStyle("fontSize", event.target.value)}
                    className="h-10 w-full rounded-md border border-white/10 bg-white/[0.03] px-3 text-sm text-white"
                  >
                    <option value="sm">SM</option>
                    <option value="base">Base</option>
                    <option value="lg">LG</option>
                    <option value="xl">XL</option>
                  </select>
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
                <div className="flex items-center gap-2">
                  <Settings2 className="h-4 w-4 text-sky-200" />
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                    Border
                  </p>
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-[0.14em] text-slate-400">
                      Style
                    </Label>
                    <select
                      value={selectedBlock.style.borderStyle}
                      onChange={(event) => onUpdateStyle("borderStyle", event.target.value)}
                      className="h-10 w-full rounded-md border border-white/10 bg-white/[0.03] px-3 text-sm text-white"
                    >
                      <option value="none">None</option>
                      <option value="solid">Solid</option>
                      <option value="dashed">Dashed</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-[0.14em] text-slate-400">
                      Width
                    </Label>
                    <select
                      value={selectedBlock.style.borderWidth}
                      onChange={(event) => onUpdateStyle("borderWidth", event.target.value)}
                      className="h-10 w-full rounded-md border border-white/10 bg-white/[0.03] px-3 text-sm text-white"
                    >
                      <option value="none">None</option>
                      <option value="thin">Thin</option>
                      <option value="medium">Medium</option>
                    </select>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <Label className="text-xs uppercase tracking-[0.14em] text-slate-400">
                    Color
                  </Label>
                  <Input
                    value={selectedBlock.style.borderColor}
                    onChange={(event) => onUpdateStyle("borderColor", event.target.value)}
                    className="border-white/10 bg-white/[0.03] text-white"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-[0.14em] text-slate-400">
                    Width
                  </Label>
                  <select
                    value={selectedBlock.layout.width}
                    onChange={(event) => onUpdateLayout("width", event.target.value)}
                    className="h-10 w-full rounded-md border border-white/10 bg-white/[0.03] px-3 text-sm text-white"
                  >
                    <option value="full">Full</option>
                    <option value="wide">Wide</option>
                    <option value="narrow">Narrow</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-[0.14em] text-slate-400">
                    Gap
                  </Label>
                  <select
                    value={selectedBlock.layout.gap}
                    onChange={(event) => onUpdateLayout("gap", event.target.value)}
                    className="h-10 w-full rounded-md border border-white/10 bg-white/[0.03] px-3 text-sm text-white"
                  >
                    <option value="tight">Tight</option>
                    <option value="normal">Normal</option>
                    <option value="loose">Loose</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-[0.14em] text-slate-400">
                    Min height
                  </Label>
                  <select
                    value={selectedBlock.layout.minHeight}
                    onChange={(event) => onUpdateLayout("minHeight", event.target.value)}
                    className="h-10 w-full rounded-md border border-white/10 bg-white/[0.03] px-3 text-sm text-white"
                  >
                    <option value="auto">Auto</option>
                    <option value="sm">SM</option>
                    <option value="md">MD</option>
                    <option value="lg">LG</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-[0.14em] text-slate-400">
                    Radius
                  </Label>
                  <select
                    value={selectedBlock.style.radius}
                    onChange={(event) => onUpdateStyle("radius", event.target.value)}
                    className="h-10 w-full rounded-md border border-white/10 bg-white/[0.03] px-3 text-sm text-white"
                  >
                    <option value="soft">Soft</option>
                    <option value="rounded">Rounded</option>
                    <option value="pill">Pill</option>
                  </select>
                </div>
              </div>

              {selectedBlock.type === "columns" ? (
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-[0.14em] text-slate-400">
                    Columns
                  </Label>
                  <Input
                    value={String(selectedBlock.layout.columns)}
                    onChange={(event) => onUpdateLayout("columns", event.target.value)}
                    className="border-white/10 bg-white/[0.03] text-white"
                    inputMode="numeric"
                  />
                </div>
              ) : null}
            </div>
          )}
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          {!selectedBlock ? (
            <EmptyInspector label="Selecciona un bloque para editar contenido, settings y revisar el JSON de la pagina." />
          ) : (
            <>
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
                <div className="flex items-center gap-2">
                  <Settings2 className="h-4 w-4 text-sky-200" />
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                    Bloque activo
                  </p>
                </div>
                <p className="mt-3 text-sm font-semibold text-white">{selectedBlock.type}</p>
                <p className="mt-1 break-all text-xs text-slate-400">{selectedBlock.id}</p>
              </div>

              <div className="max-h-[18rem] space-y-4 overflow-y-auto pr-1">
                {Object.entries(selectedBlock.content).map(([field, value]) => {
                  const multiline =
                    value.length > 48 ||
                    field.toLowerCase().includes("body") ||
                    field.toLowerCase().includes("quote") ||
                    field.toLowerCase().includes("description") ||
                    field.toLowerCase().includes("subtitle") ||
                    field.toLowerCase().includes("summary");

                  return (
                    <div key={`${selectedBlock.id}-${field}`} className="space-y-2">
                      <Label
                        htmlFor={`content-${selectedBlock.id}-${field}`}
                        className="text-xs uppercase tracking-[0.14em] text-slate-400"
                      >
                        {field}
                      </Label>
                      {multiline ? (
                        <Textarea
                          id={`content-${selectedBlock.id}-${field}`}
                          value={value}
                          onChange={(event) => onUpdateContent(field, event.target.value)}
                          className="min-h-[96px] border-white/10 bg-white/[0.03] text-white"
                        />
                      ) : (
                        <Input
                          id={`content-${selectedBlock.id}-${field}`}
                          value={value}
                          onChange={(event) => onUpdateContent(field, event.target.value)}
                          className="border-white/10 bg-white/[0.03] text-white"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center gap-2">
              <Code2 className="h-4 w-4 text-sky-200" />
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                page_json
              </p>
            </div>
            <pre className="mt-3 max-h-56 overflow-auto rounded-2xl border border-white/10 bg-slate-950/70 p-3 text-[11px] leading-5 text-slate-300">
              {pageJson}
            </pre>
          </div>
        </TabsContent>
      </Tabs>
    </BuilderSidebar>
  );
}
