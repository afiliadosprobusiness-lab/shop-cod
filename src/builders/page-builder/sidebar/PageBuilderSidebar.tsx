import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Layers3, Plus, Sparkles } from "lucide-react";
import { BuilderBlockCard, BuilderSidebar } from "@/builders/shared";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { pageBuilderElementCatalog } from "../blocks/catalog";
import {
  type PageBuilderBlock,
  type PageBuilderBlockType,
} from "../blocks/schema";
import { flattenPageBuilderBlocks } from "../blocks/tree";

interface PageBuilderSidebarProps {
  blocks: PageBuilderBlock[];
  selectedBlock: PageBuilderBlock | null;
  selectedId: string | null;
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

  const style = transform
    ? { transform: CSS.Translate.toString(transform) }
    : undefined;

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
  onSelect,
  onAddBlock,
  onUpdateContent,
  onUpdateStyle,
  onUpdateLayout,
}: PageBuilderSidebarProps) {
  const layers = flattenPageBuilderBlocks(blocks);

  return (
    <BuilderSidebar
      eyebrow="Page builder"
      description="Sidebar con elementos, capas y estilos."
      icon={<Sparkles className="h-5 w-5 text-sky-200" />}
      className="max-w-sm xl:w-[22rem]"
    >
      <Tabs defaultValue="add" className="mt-4">
        <TabsList className="grid h-auto w-full grid-cols-2 gap-1 rounded-2xl bg-white/[0.03] p-1">
          <TabsTrigger value="add" className="rounded-2xl text-xs">
            Add Elements
          </TabsTrigger>
          <TabsTrigger value="edit" className="rounded-2xl text-xs">
            Edit Elements
          </TabsTrigger>
          <TabsTrigger value="layers" className="rounded-2xl text-xs">
            Layers
          </TabsTrigger>
          <TabsTrigger value="styles" className="rounded-2xl text-xs">
            Styles
          </TabsTrigger>
        </TabsList>

        <TabsContent value="add" className="space-y-3">
          <div className="max-h-[42rem] space-y-3 overflow-y-auto pr-1">
            {pageBuilderElementCatalog.map((item) => (
              <PaletteItem
                key={item.type}
                type={item.type}
                label={item.label}
                description={item.description}
                onAddBlock={onAddBlock}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="edit" className="space-y-4">
          {!selectedBlock ? (
            <EmptyInspector label="Selecciona un bloque del canvas para editar su contenido." />
          ) : (
            <div className="max-h-[42rem] space-y-4 overflow-y-auto pr-1">
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-200">
                  Elemento activo
                </p>
                <p className="mt-2 text-sm font-semibold text-white">{selectedBlock.type}</p>
              </div>
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
          )}
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
                  <p className="text-xs text-slate-400">{block.id}</p>
                </div>
              </button>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="styles" className="space-y-4">
          {!selectedBlock ? (
            <EmptyInspector label="Selecciona un bloque para ajustar estilos y layout." />
          ) : (
            <div className="max-h-[42rem] space-y-4 overflow-y-auto pr-1">
              <div className="space-y-2">
                <Label
                  htmlFor="style-background"
                  className="text-xs uppercase tracking-[0.14em] text-slate-400"
                >
                  Background
                </Label>
                <Input
                  id="style-background"
                  value={selectedBlock.style.backgroundColor}
                  onChange={(event) =>
                    onUpdateStyle("backgroundColor", event.target.value)
                  }
                  className="border-white/10 bg-white/[0.03] text-white"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="style-text"
                  className="text-xs uppercase tracking-[0.14em] text-slate-400"
                >
                  Text color
                </Label>
                <Input
                  id="style-text"
                  value={selectedBlock.style.textColor}
                  onChange={(event) => onUpdateStyle("textColor", event.target.value)}
                  className="border-white/10 bg-white/[0.03] text-white"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-[0.14em] text-slate-400">
                    Align
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
              </div>

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
      </Tabs>
    </BuilderSidebar>
  );
}
