import type { ReactNode } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { PageBuilderBlock } from "../block-engine/schema";

interface PageBuilderStylePanelProps {
  selectedBlock: PageBuilderBlock | null;
  onUpdateStyle: (nextStyle: PageBuilderBlock["style"]) => void;
  onUpdateLayout: (nextLayout: PageBuilderBlock["layout"]) => void;
}

function SpacingRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label className="text-xs text-slate-700">{label}</Label>
        <span className="text-xs text-slate-500">{value}px</span>
      </div>
      <div className="flex items-center gap-2">
        <Input
          type="number"
          value={value}
          onChange={(event) => onChange(Number.parseInt(event.target.value || "0", 10) || 0)}
          className="h-8 w-16 border-slate-300 bg-white text-xs text-slate-700"
        />
        <input
          type="range"
          min={0}
          max={120}
          value={value}
          onChange={(event) => onChange(Number.parseInt(event.target.value || "0", 10) || 0)}
          className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-slate-200"
          aria-label={label}
        />
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-3 border-t border-slate-200 px-4 py-4 first:border-t-0">
      <h3 className="text-base font-semibold text-slate-800">{title}</h3>
      {children}
    </section>
  );
}

export function PageBuilderStylePanel({ selectedBlock, onUpdateStyle, onUpdateLayout }: PageBuilderStylePanelProps) {
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
    <aside className="h-full min-h-0 rounded-l-xl border-l border-slate-300 bg-[#f7f8fa]">
      <div className="flex h-full min-h-0 flex-col">
        <header className="border-b border-slate-300 px-4 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-slate-900">Styles</h2>
            <div className="inline-flex h-8 items-center rounded-lg border border-slate-300 bg-white px-2 text-xs font-medium text-slate-700">
              Default
            </div>
          </div>

          <div className="relative mt-3">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value=""
              readOnly
              className="h-9 border-slate-300 bg-white pl-9 text-sm text-slate-500"
              placeholder="Search by property"
              aria-label="Buscar propiedad"
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">Ctrl+K</span>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {!selectedBlock ? (
            <div className="px-4 py-6 text-sm text-slate-500">Selecciona un bloque en el canvas para editar sus estilos.</div>
          ) : (
            <>
              <Section title="Spacing">
                <div className="space-y-3">
                  <p className="text-sm font-medium text-slate-700">Margin</p>
                  <SpacingRow
                    label="Top"
                    value={selectedBlock.style.spacing.margin.top}
                    onChange={(value) =>
                      mutateStyle((style) => ({
                        ...style,
                        spacing: {
                          ...style.spacing,
                          margin: {
                            ...style.spacing.margin,
                            top: value,
                          },
                        },
                      }))
                    }
                  />
                  <SpacingRow
                    label="Right"
                    value={selectedBlock.style.spacing.margin.right}
                    onChange={(value) =>
                      mutateStyle((style) => ({
                        ...style,
                        spacing: {
                          ...style.spacing,
                          margin: {
                            ...style.spacing.margin,
                            right: value,
                          },
                        },
                      }))
                    }
                  />
                  <SpacingRow
                    label="Bottom"
                    value={selectedBlock.style.spacing.margin.bottom}
                    onChange={(value) =>
                      mutateStyle((style) => ({
                        ...style,
                        spacing: {
                          ...style.spacing,
                          margin: {
                            ...style.spacing.margin,
                            bottom: value,
                          },
                        },
                      }))
                    }
                  />
                  <SpacingRow
                    label="Left"
                    value={selectedBlock.style.spacing.margin.left}
                    onChange={(value) =>
                      mutateStyle((style) => ({
                        ...style,
                        spacing: {
                          ...style.spacing,
                          margin: {
                            ...style.spacing.margin,
                            left: value,
                          },
                        },
                      }))
                    }
                  />
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-medium text-slate-700">Padding</p>
                  <SpacingRow
                    label="Top"
                    value={selectedBlock.style.spacing.padding.top}
                    onChange={(value) =>
                      mutateStyle((style) => ({
                        ...style,
                        spacing: {
                          ...style.spacing,
                          padding: {
                            ...style.spacing.padding,
                            top: value,
                          },
                        },
                      }))
                    }
                  />
                  <SpacingRow
                    label="Right"
                    value={selectedBlock.style.spacing.padding.right}
                    onChange={(value) =>
                      mutateStyle((style) => ({
                        ...style,
                        spacing: {
                          ...style.spacing,
                          padding: {
                            ...style.spacing.padding,
                            right: value,
                          },
                        },
                      }))
                    }
                  />
                  <SpacingRow
                    label="Bottom"
                    value={selectedBlock.style.spacing.padding.bottom}
                    onChange={(value) =>
                      mutateStyle((style) => ({
                        ...style,
                        spacing: {
                          ...style.spacing,
                          padding: {
                            ...style.spacing.padding,
                            bottom: value,
                          },
                        },
                      }))
                    }
                  />
                  <SpacingRow
                    label="Left"
                    value={selectedBlock.style.spacing.padding.left}
                    onChange={(value) =>
                      mutateStyle((style) => ({
                        ...style,
                        spacing: {
                          ...style.spacing,
                          padding: {
                            ...style.spacing.padding,
                            left: value,
                          },
                        },
                      }))
                    }
                  />
                </div>
              </Section>

              <Section title="Size">
                <div className="space-y-2">
                  <Label htmlFor="layout-width" className="text-xs text-slate-600">Width</Label>
                  <Input
                    id="layout-width"
                    value={selectedBlock.layout.dimensions.width}
                    onChange={(event) =>
                      mutateLayout((layout) => ({
                        ...layout,
                        dimensions: {
                          ...layout.dimensions,
                          width: event.target.value,
                        },
                      }))
                    }
                    className="h-8 border-slate-300 bg-white text-slate-700"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="layout-height" className="text-xs text-slate-600">Height</Label>
                  <Input
                    id="layout-height"
                    value={selectedBlock.layout.dimensions.height}
                    onChange={(event) =>
                      mutateLayout((layout) => ({
                        ...layout,
                        dimensions: {
                          ...layout.dimensions,
                          height: event.target.value,
                        },
                      }))
                    }
                    className="h-8 border-slate-300 bg-white text-slate-700"
                  />
                </div>
              </Section>

              <Section title="Typography">
                <div className="grid gap-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="typography-size" className="text-xs text-slate-600">Font size</Label>
                    <Input
                      id="typography-size"
                      type="number"
                      value={selectedBlock.style.typography.size}
                      onChange={(event) =>
                        mutateStyle((style) => ({
                          ...style,
                          typography: {
                            ...style.typography,
                            size: Number.parseInt(event.target.value || "0", 10) || 0,
                          },
                        }))
                      }
                      className="h-8 border-slate-300 bg-white text-slate-700"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="typography-color" className="text-xs text-slate-600">Color</Label>
                    <Input
                      id="typography-color"
                      value={selectedBlock.style.textColor}
                      onChange={(event) =>
                        mutateStyle((style) => ({
                          ...style,
                          textColor: event.target.value,
                        }))
                      }
                      className="h-8 border-slate-300 bg-white text-slate-700"
                    />
                  </div>
                </div>
              </Section>

              <Section title="Background">
                <div className="space-y-1.5">
                  <Label htmlFor="bg-color" className="text-xs text-slate-600">Color</Label>
                  <Input
                    id="bg-color"
                    value={selectedBlock.style.background.color}
                    onChange={(event) =>
                      mutateStyle((style) => ({
                        ...style,
                        backgroundColor: event.target.value,
                        background: {
                          ...style.background,
                          color: event.target.value,
                        },
                      }))
                    }
                    className="h-8 border-slate-300 bg-white text-slate-700"
                  />
                </div>
              </Section>

              <Section title="Borders">
                <div className="space-y-1.5">
                  <Label htmlFor="border-color" className="text-xs text-slate-600">Color</Label>
                  <Input
                    id="border-color"
                    value={selectedBlock.style.border.color}
                    onChange={(event) =>
                      mutateStyle((style) => ({
                        ...style,
                        borderColor: event.target.value,
                        border: {
                          ...style.border,
                          color: event.target.value,
                        },
                      }))
                    }
                    className="h-8 border-slate-300 bg-white text-slate-700"
                  />
                </div>
              </Section>

              <Section title="Shadow">
                <label
                  htmlFor="shadow-enabled"
                  className={cn(
                    "inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700",
                    !selectedBlock ? "opacity-70" : "",
                  )}
                >
                  <input
                    id="shadow-enabled"
                    type="checkbox"
                    checked={selectedBlock.style.shadow.enabled}
                    onChange={(event) =>
                      mutateStyle((style) => ({
                        ...style,
                        shadow: {
                          ...style.shadow,
                          enabled: event.target.checked,
                        },
                      }))
                    }
                    className="h-4 w-4 rounded border-slate-300"
                  />
                  Enable shadow
                </label>
              </Section>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}
