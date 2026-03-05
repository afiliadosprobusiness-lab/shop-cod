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

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-3 border-b border-slate-200 px-4 py-4 last:border-b-0">
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      {children}
    </section>
  );
}

function NumberField({
  id,
  label,
  value,
  min,
  max,
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label htmlFor={id} className="text-[11px] uppercase tracking-[0.14em] text-slate-500">
          {label}
        </Label>
        <span className="text-xs text-slate-500">{value}px</span>
      </div>
      <Input
        id={id}
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(Number.parseInt(event.target.value || "0", 10) || 0)}
        className="h-8 border-slate-300 bg-white text-slate-900"
      />
    </div>
  );
}

export function PageBuilderStylePanel({
  selectedBlock,
  onUpdateStyle,
  onUpdateLayout,
}: PageBuilderStylePanelProps) {
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
    <aside className="h-full min-h-0 border-l border-slate-300 bg-white">
      <div className="flex h-full min-h-0 flex-col">
        <header className="border-b border-slate-200 px-4 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-slate-900">Styles</h2>
            <div className="inline-flex h-8 items-center border border-slate-300 bg-slate-50 px-2 text-xs font-medium text-slate-700">
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
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
              Ctrl+K
            </span>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {!selectedBlock ? (
            <div className="px-4 py-6 text-sm text-slate-500">Selecciona un elemento en el canvas para editar estilo.</div>
          ) : (
            <>
              <Section title="Spacing">
                <div className="grid grid-cols-2 gap-2">
                  <NumberField
                    id="margin-top"
                    label="Margin top"
                    value={selectedBlock.style.spacing.margin.top}
                    onChange={(value) =>
                      mutateStyle((style) => ({
                        ...style,
                        spacing: {
                          ...style.spacing,
                          margin: { ...style.spacing.margin, top: value },
                        },
                      }))
                    }
                  />
                  <NumberField
                    id="margin-right"
                    label="Margin right"
                    value={selectedBlock.style.spacing.margin.right}
                    onChange={(value) =>
                      mutateStyle((style) => ({
                        ...style,
                        spacing: {
                          ...style.spacing,
                          margin: { ...style.spacing.margin, right: value },
                        },
                      }))
                    }
                  />
                  <NumberField
                    id="margin-bottom"
                    label="Margin bottom"
                    value={selectedBlock.style.spacing.margin.bottom}
                    onChange={(value) =>
                      mutateStyle((style) => ({
                        ...style,
                        spacing: {
                          ...style.spacing,
                          margin: { ...style.spacing.margin, bottom: value },
                        },
                      }))
                    }
                  />
                  <NumberField
                    id="margin-left"
                    label="Margin left"
                    value={selectedBlock.style.spacing.margin.left}
                    onChange={(value) =>
                      mutateStyle((style) => ({
                        ...style,
                        spacing: {
                          ...style.spacing,
                          margin: { ...style.spacing.margin, left: value },
                        },
                      }))
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <NumberField
                    id="padding-top"
                    label="Padding top"
                    value={selectedBlock.style.spacing.padding.top}
                    onChange={(value) =>
                      mutateStyle((style) => ({
                        ...style,
                        spacing: {
                          ...style.spacing,
                          padding: { ...style.spacing.padding, top: value },
                        },
                      }))
                    }
                  />
                  <NumberField
                    id="padding-right"
                    label="Padding right"
                    value={selectedBlock.style.spacing.padding.right}
                    onChange={(value) =>
                      mutateStyle((style) => ({
                        ...style,
                        spacing: {
                          ...style.spacing,
                          padding: { ...style.spacing.padding, right: value },
                        },
                      }))
                    }
                  />
                  <NumberField
                    id="padding-bottom"
                    label="Padding bottom"
                    value={selectedBlock.style.spacing.padding.bottom}
                    onChange={(value) =>
                      mutateStyle((style) => ({
                        ...style,
                        spacing: {
                          ...style.spacing,
                          padding: { ...style.spacing.padding, bottom: value },
                        },
                      }))
                    }
                  />
                  <NumberField
                    id="padding-left"
                    label="Padding left"
                    value={selectedBlock.style.spacing.padding.left}
                    onChange={(value) =>
                      mutateStyle((style) => ({
                        ...style,
                        spacing: {
                          ...style.spacing,
                          padding: { ...style.spacing.padding, left: value },
                        },
                      }))
                    }
                  />
                </div>
              </Section>

              <Section title="Size">
                <div className="grid gap-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="layout-width" className="text-[11px] uppercase tracking-[0.14em] text-slate-500">
                      Width
                    </Label>
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
                      className="h-8 border-slate-300 bg-white text-slate-900"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="layout-height" className="text-[11px] uppercase tracking-[0.14em] text-slate-500">
                      Height
                    </Label>
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
                      className="h-8 border-slate-300 bg-white text-slate-900"
                    />
                  </div>
                </div>
              </Section>

              <Section title="Typography">
                <div className="grid gap-2">
                  <NumberField
                    id="typography-size"
                    label="Font size"
                    value={selectedBlock.style.typography.size}
                    onChange={(value) =>
                      mutateStyle((style) => ({
                        ...style,
                        typography: {
                          ...style.typography,
                          size: value,
                        },
                      }))
                    }
                  />
                  <NumberField
                    id="typography-weight"
                    label="Weight"
                    value={selectedBlock.style.typography.weight}
                    min={100}
                    max={900}
                    onChange={(value) =>
                      mutateStyle((style) => ({
                        ...style,
                        typography: {
                          ...style.typography,
                          weight: value,
                        },
                      }))
                    }
                  />
                  <div className="space-y-1.5">
                    <Label htmlFor="typography-family" className="text-[11px] uppercase tracking-[0.14em] text-slate-500">
                      Font family
                    </Label>
                    <Input
                      id="typography-family"
                      value={selectedBlock.style.typography.family}
                      onChange={(event) =>
                        mutateStyle((style) => ({
                          ...style,
                          typography: {
                            ...style.typography,
                            family: event.target.value,
                          },
                        }))
                      }
                      className="h-8 border-slate-300 bg-white text-slate-900"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="typography-color" className="text-[11px] uppercase tracking-[0.14em] text-slate-500">
                      Color
                    </Label>
                    <Input
                      id="typography-color"
                      value={selectedBlock.style.textColor}
                      onChange={(event) =>
                        mutateStyle((style) => ({
                          ...style,
                          textColor: event.target.value,
                        }))
                      }
                      className="h-8 border-slate-300 bg-white text-slate-900"
                    />
                  </div>
                </div>
              </Section>

              <Section title="Background">
                <div className="grid gap-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="background-color" className="text-[11px] uppercase tracking-[0.14em] text-slate-500">
                      Color
                    </Label>
                    <Input
                      id="background-color"
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
                      className="h-8 border-slate-300 bg-white text-slate-900"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="background-image" className="text-[11px] uppercase tracking-[0.14em] text-slate-500">
                      Image URL
                    </Label>
                    <Input
                      id="background-image"
                      value={selectedBlock.style.background.imageUrl}
                      onChange={(event) =>
                        mutateStyle((style) => ({
                          ...style,
                          background: {
                            ...style.background,
                            imageUrl: event.target.value,
                          },
                        }))
                      }
                      className="h-8 border-slate-300 bg-white text-slate-900"
                    />
                  </div>
                </div>
              </Section>

              <Section title="Border">
                <div className="grid gap-2">
                  <NumberField
                    id="border-width"
                    label="Width"
                    value={selectedBlock.style.border.width}
                    onChange={(value) =>
                      mutateStyle((style) => ({
                        ...style,
                        borderWidth: value > 0 ? "thin" : "none",
                        border: {
                          ...style.border,
                          width: value,
                          style: value > 0 ? "solid" : "none",
                        },
                      }))
                    }
                  />
                  <NumberField
                    id="border-radius"
                    label="Radius"
                    value={selectedBlock.style.border.radius}
                    onChange={(value) =>
                      mutateStyle((style) => ({
                        ...style,
                        border: {
                          ...style.border,
                          radius: value,
                        },
                      }))
                    }
                  />
                  <div className="space-y-1.5">
                    <Label htmlFor="border-color" className="text-[11px] uppercase tracking-[0.14em] text-slate-500">
                      Color
                    </Label>
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
                      className="h-8 border-slate-300 bg-white text-slate-900"
                    />
                  </div>
                </div>
              </Section>

              <Section title="Shadow">
                <label
                  htmlFor="shadow-enabled"
                  className={cn(
                    "inline-flex items-center gap-2 border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700",
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
                <div className="grid grid-cols-2 gap-2">
                  <NumberField
                    id="shadow-x"
                    label="X"
                    value={selectedBlock.style.shadow.x}
                    onChange={(value) =>
                      mutateStyle((style) => ({
                        ...style,
                        shadow: {
                          ...style.shadow,
                          x: value,
                        },
                      }))
                    }
                  />
                  <NumberField
                    id="shadow-y"
                    label="Y"
                    value={selectedBlock.style.shadow.y}
                    onChange={(value) =>
                      mutateStyle((style) => ({
                        ...style,
                        shadow: {
                          ...style.shadow,
                          y: value,
                        },
                      }))
                    }
                  />
                  <NumberField
                    id="shadow-blur"
                    label="Blur"
                    value={selectedBlock.style.shadow.blur}
                    onChange={(value) =>
                      mutateStyle((style) => ({
                        ...style,
                        shadow: {
                          ...style.shadow,
                          blur: value,
                        },
                      }))
                    }
                  />
                  <NumberField
                    id="shadow-spread"
                    label="Spread"
                    value={selectedBlock.style.shadow.spread}
                    onChange={(value) =>
                      mutateStyle((style) => ({
                        ...style,
                        shadow: {
                          ...style.shadow,
                          spread: value,
                        },
                      }))
                    }
                  />
                </div>
              </Section>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}
