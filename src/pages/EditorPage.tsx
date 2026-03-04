import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  type DragEndEvent,
  type DragStartEvent,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ArrowLeft,
  CheckCircle2,
  Copy,
  Eye,
  GripVertical,
  LayoutTemplate,
  Monitor,
  MousePointerClick,
  Plus,
  Rocket,
  Save,
  ShieldCheck,
  ShoppingCart,
  Smartphone,
  Sparkles,
  Target,
  Trash2,
  TrendingUp,
  Wand2,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { BlockPreview } from "@/components/editor/BlockPreview";
import {
  blockMeta,
  blockPlaybooks,
  defaultBlockData,
} from "@/components/editor/block-config";
import {
  loadEditorState,
  publishEditorState,
  saveEditorState,
  type BlockType,
  type FunnelBlock,
  type StoreProfile,
} from "@/lib/editor";
import { toast } from "sonner";

const libraryGroups: Array<{ label: string; types: BlockType[] }> = [
  { label: "Entrada", types: ["hero", "problem", "benefits"] },
  { label: "Confianza", types: ["reviews", "faq"] },
  { label: "Cierre", types: ["cta", "checkout"] },
];

const recommendedStack: BlockType[] = [
  "hero",
  "problem",
  "benefits",
  "reviews",
  "faq",
  "checkout",
  "cta",
];

type BuilderMode = "store" | "funnel" | "page";

const builderModeMeta: Record<
  BuilderMode,
  {
    label: string;
    eyebrow: string;
    title: string;
    description: string;
    accentClass: string;
    surfaceClass: string;
    points: string[];
  }
> = {
  store: {
    label: "Store builder",
    eyebrow: "Store builder",
    title: "Plantillas de alta conversion y control total de tu oferta",
    description:
      "Define marca, producto y posicionamiento antes de entrar al flujo de conversion. Piensa en esto como la capa comercial de tu tienda.",
    accentClass: "from-emerald-400 to-teal-400",
    surfaceClass: "bg-emerald-50",
    points: [
      "Plantillas de alta conversion",
      "100% personalizable",
      "Tu tienda, tu estilo",
    ],
  },
  funnel: {
    label: "Funnel builder",
    eyebrow: "Funnel builder",
    title: "Arrastra, conecta y optimiza cada paso del funnel",
    description:
      "Construye la secuencia de compra con una vista clara de los pasos, objeciones y cierres. Aqui mandan la narrativa y la conversion.",
    accentClass: "from-amber-300 to-yellow-400",
    surfaceClass: "bg-amber-50",
    points: [
      "Facil de usar",
      "Informacion de un vistazo",
      "Prueba y optimiza",
    ],
  },
  page: {
    label: "Page builder",
    eyebrow: "Page builder",
    title: "Diseña secciones y componentes como un constructor modular",
    description:
      "Pulsa el layout final de cada bloque y ajusta contenido, jerarquia y componentes para que la pagina se vea mas premium.",
    accentClass: "from-sky-400 to-blue-500",
    surfaceClass: "bg-sky-50",
    points: [
      "Arrastrar y soltar",
      "Construye cualquier cosa",
      "Componentes potentes",
    ],
  },
};

function createDefaultProfile(): StoreProfile {
  return {
    storeName: "Nueva tienda",
    productName: "Producto principal",
    headline: "Tu producto estrella para vender mas",
    subheadline: "Oferta lista para lanzar en minutos con checkout COD.",
    price: "$49.900",
    originalPrice: "$89.900",
    ctaText: "Comprar ahora",
    category: "General",
  };
}

function createBlockId() {
  return `b${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

function createBlockDataForType(type: BlockType, profile: StoreProfile) {
  if (type === "hero") {
    return {
      ...defaultBlockData.hero,
      title: profile.headline,
      subtitle: profile.subheadline,
      price: profile.price,
      originalPrice: profile.originalPrice,
      ctaText: profile.ctaText,
    };
  }

  if (type === "problem") {
    return {
      ...defaultBlockData.problem,
      title: `Lo que ${profile.productName} resuelve en segundos`,
    };
  }

  if (type === "benefits") {
    return {
      ...defaultBlockData.benefits,
      title: `Por que elegir ${profile.productName}?`,
    };
  }

  if (type === "reviews") {
    return {
      ...defaultBlockData.reviews,
      title: `Clientes que compraron ${profile.productName}`,
    };
  }

  if (type === "faq") {
    return {
      ...defaultBlockData.faq,
      title: `Preguntas sobre ${profile.productName}`,
    };
  }

  if (type === "checkout") {
    return {
      ...defaultBlockData.checkout,
      title: `Pide ${profile.productName} ahora`,
    };
  }

  if (type === "cta") {
    return {
      ...defaultBlockData.cta,
      title: `Lanza ${profile.storeName} hoy`,
      subtitle: "Tu siguiente venta puede llegar hoy mismo.",
      ctaText: profile.ctaText,
    };
  }

  return { ...defaultBlockData[type] };
}

function createDefaultBlocks(profile: StoreProfile, isNew: boolean) {
  if (isNew) {
    return recommendedStack.map((type, index) => ({
      id: `b${index + 1}`,
      type,
      data: createBlockDataForType(type, profile),
    })) satisfies FunnelBlock[];
  }

  return [
    {
      id: "b1",
      type: "hero",
      data: {
        ...defaultBlockData.hero,
        title: "Auriculares Bluetooth Pro",
      },
    },
    { id: "b2", type: "problem", data: { ...defaultBlockData.problem } },
    { id: "b3", type: "benefits", data: { ...defaultBlockData.benefits } },
    { id: "b4", type: "reviews", data: { ...defaultBlockData.reviews } },
    { id: "b5", type: "faq", data: { ...defaultBlockData.faq } },
    { id: "b6", type: "cta", data: { ...defaultBlockData.cta } },
    { id: "b7", type: "checkout", data: { ...defaultBlockData.checkout } },
  ] satisfies FunnelBlock[];
}

function applyProfileToBlocks(blocks: FunnelBlock[], profile: StoreProfile) {
  return blocks.map((block) => {
    if (block.type === "hero") {
      return {
        ...block,
        data: {
          ...block.data,
          title: profile.headline,
          subtitle: profile.subheadline,
          price: profile.price,
          originalPrice: profile.originalPrice,
          ctaText: profile.ctaText,
        },
      };
    }

    if (block.type === "problem") {
      return {
        ...block,
        data: {
          ...block.data,
          title: `Lo que ${profile.productName} resuelve en segundos`,
        },
      };
    }

    if (block.type === "benefits") {
      return {
        ...block,
        data: {
          ...block.data,
          title: `Por que elegir ${profile.productName}?`,
        },
      };
    }

    if (block.type === "reviews") {
      return {
        ...block,
        data: {
          ...block.data,
          title: `Clientes que compraron ${profile.productName}`,
        },
      };
    }

    if (block.type === "faq") {
      return {
        ...block,
        data: {
          ...block.data,
          title: `Preguntas sobre ${profile.productName}`,
        },
      };
    }

    if (block.type === "checkout") {
      return {
        ...block,
        data: {
          ...block.data,
          title: `Pide ${profile.productName} ahora`,
        },
      };
    }

    if (block.type === "cta") {
      return {
        ...block,
        data: {
          ...block.data,
          title: `Lanza ${profile.storeName} hoy`,
          subtitle: "Tu siguiente venta puede llegar hoy mismo.",
          ctaText: profile.ctaText,
        },
      };
    }

    return block;
  });
}

function getInsertionSuggestions(type: BlockType) {
  if (type === "hero") {
    return ["problem", "benefits", "reviews"] as BlockType[];
  }

  if (type === "problem") {
    return ["benefits", "reviews", "faq"] as BlockType[];
  }

  if (type === "benefits") {
    return ["reviews", "faq", "cta"] as BlockType[];
  }

  if (type === "reviews") {
    return ["faq", "checkout", "cta"] as BlockType[];
  }

  if (type === "faq") {
    return ["checkout", "cta", "reviews"] as BlockType[];
  }

  if (type === "checkout") {
    return ["cta", "reviews", "faq"] as BlockType[];
  }

  return ["reviews", "faq", "checkout"] as BlockType[];
}

function calculateConversionScore(blocks: FunnelBlock[], profile: StoreProfile) {
  const types = new Set(blocks.map((block) => block.type));
  let score = 18;

  if (profile.headline.trim().length >= 18) {
    score += 12;
  }

  if (profile.subheadline.trim().length >= 20) {
    score += 8;
  }

  if (profile.price.trim()) {
    score += 8;
  }

  if (profile.ctaText.trim()) {
    score += 7;
  }

  if (types.has("hero")) {
    score += 12;
  }

  if (types.has("problem")) {
    score += 10;
  }

  if (types.has("benefits")) {
    score += 12;
  }

  if (types.has("reviews")) {
    score += 13;
  }

  if (types.has("faq")) {
    score += 10;
  }

  if (types.has("checkout")) {
    score += 14;
  }

  if (types.has("cta")) {
    score += 8;
  }

  if (blocks[0]?.type === "hero") {
    score += 4;
  }

  if (blocks[blocks.length - 1]?.type === "checkout" || blocks[blocks.length - 1]?.type === "cta") {
    score += 4;
  }

  return Math.min(score, 99);
}

function SortableBlockCard({
  block,
  index,
  isSelected,
  onSelect,
  onDelete,
  onDuplicate,
  onInsertAfter,
}: {
  block: FunnelBlock;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onInsertAfter: (type: BlockType) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: block.id,
  });
  const playbook = blockPlaybooks[block.type];

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="space-y-3">
      <motion.div
        layout
        onClick={onSelect}
        className={cn(
          "overflow-hidden rounded-[1.75rem] border bg-card/95 shadow-2xl shadow-black/10 transition-all",
          isSelected
            ? "border-primary/45 ring-1 ring-primary/20"
            : "border-border/80 hover:border-primary/20",
        )}
      >
        <div className="border-b border-border/70 bg-gradient-to-r from-card to-secondary/20 px-4 py-3">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 items-start gap-3">
              <button
                type="button"
                {...attributes}
                {...listeners}
                className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-border/80 bg-background/70 text-muted-foreground transition-colors hover:text-foreground"
                aria-label={`Mover bloque ${blockMeta[block.type].label}`}
              >
                <GripVertical className="h-4 w-4" />
              </button>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
                    Paso {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="rounded-full bg-secondary px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    {playbook.stage}
                  </span>
                </div>
                <div className="mt-2 flex min-w-0 flex-wrap items-center gap-2">
                  <h3 className="text-base font-bold">
                    {blockMeta[block.type].label}
                  </h3>
                  <span className="text-xs text-muted-foreground">
                    {playbook.goal}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {playbook.description}
                </p>
              </div>
            </div>

            <div className="flex shrink-0 gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={(event) => {
                  event.stopPropagation();
                  onDuplicate();
                }}
              >
                <Copy className="h-4 w-4" /> Duplicar
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={(event) => {
                  event.stopPropagation();
                  onDelete();
                }}
              >
                <Trash2 className="h-4 w-4" /> Eliminar
              </Button>
            </div>
          </div>
        </div>

        <div className="p-4 md:p-5">
          <BlockPreview type={block.type} data={block.data} />
        </div>

        <div className="border-t border-border/70 bg-secondary/15 px-4 py-3">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Sugerido despues de este bloque
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Inserta la siguiente pieza sin romper la narrativa del funnel.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {getInsertionSuggestions(block.type).map((type) => (
                <button
                  key={`${block.id}-${type}`}
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onInsertAfter(type);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/80 px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground"
                >
                  <Plus className="h-3.5 w-3.5" />
                  {blockMeta[type].label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function PropertiesPanel({
  block,
  onChange,
}: {
  block: FunnelBlock | null;
  onChange: (id: string, field: string, value: string) => void;
}) {
  if (!block) {
    return (
      <div className="rounded-3xl border border-dashed border-border bg-card/80 p-5 text-center text-sm text-muted-foreground">
        Selecciona un bloque del canvas para editar copy, CTA y mensajes clave.
      </div>
    );
  }

  const playbook = blockPlaybooks[block.type];

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-border bg-card/90 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
              {playbook.stage}
            </p>
            <h3 className="mt-2 text-lg font-bold">{blockMeta[block.type].label}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{playbook.description}</p>
          </div>
          <div className="rounded-2xl bg-primary/10 px-3 py-2 text-right">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">
              KPI
            </p>
            <p className="mt-1 text-sm font-semibold">{playbook.metric}</p>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-border bg-card/90 p-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Propiedades del bloque
        </p>
        <div className="mt-4 space-y-3">
          {Object.entries(block.data).map(([key, value]) => {
            const isLongField = key.toLowerCase().includes("subtitle") || value.length > 55;

            return (
              <div key={key} className="space-y-1.5">
                <Label className="text-xs capitalize text-muted-foreground">
                  {key.replace(/([A-Z])/g, " $1")}
                </Label>
                {isLongField ? (
                  <Textarea
                    value={value}
                    onChange={(event) => onChange(block.id, key, event.target.value)}
                    className="min-h-[88px] border-border bg-secondary/60"
                  />
                ) : (
                  <Input
                    value={value}
                    onChange={(event) => onChange(block.id, key, event.target.value)}
                    className="h-10 border-border bg-secondary/60"
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-3xl border border-border bg-card/90 p-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Quick wins
        </p>
        <div className="mt-4 space-y-3">
          {playbook.quickWins.map((item) => (
            <div key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BuilderModeTabs({
  mode,
  onChange,
}: {
  mode: BuilderMode;
  onChange: (mode: BuilderMode) => void;
}) {
  const tabs: Array<{ id: BuilderMode; icon: typeof LayoutTemplate }> = [
    { id: "store", icon: LayoutTemplate },
    { id: "funnel", icon: TrendingUp },
    { id: "page", icon: Sparkles },
  ];

  return (
    <div className="flex justify-center">
      <div className="inline-flex flex-wrap items-center gap-2 rounded-full border border-slate-200 bg-white p-2 shadow-sm">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = mode === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className={cn(
                "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all",
                active
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100",
              )}
            >
              <Icon className="h-4 w-4" />
              {builderModeMeta[tab.id].label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function BuilderShowcaseCard({ mode }: { mode: BuilderMode }) {
  const meta = builderModeMeta[mode];

  return (
    <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
      <div className={`h-72 bg-gradient-to-r ${meta.accentClass} p-6 sm:p-8`}>
        <div className="h-full rounded-[1.5rem] border border-white/50 bg-white/25 p-4 backdrop-blur-sm">
          <div className="grid h-full gap-4 md:grid-cols-[1.1fr_0.9fr]">
            <div className="flex flex-col justify-between rounded-[1.5rem] border border-white/60 bg-white/50 p-5">
              <div className="space-y-3">
                <div className="inline-flex rounded-full border border-slate-200 bg-white/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600">
                  {meta.eyebrow}
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-32 rounded-full bg-white/90" />
                  <div className="h-4 w-48 rounded-full bg-white/80" />
                  <div className="h-4 w-40 rounded-full bg-white/70" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {meta.points.map((point) => (
                  <div
                    key={point}
                    className="rounded-2xl border border-white/70 bg-white/75 px-3 py-3"
                  >
                    <div className="h-3 w-10 rounded-full bg-slate-200" />
                    <div className="mt-3 h-16 rounded-2xl bg-slate-100" />
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 md:grid-cols-1 md:grid-rows-3">
              {meta.points.map((point) => (
                <div
                  key={`${mode}-${point}`}
                  className={`rounded-[1.5rem] border border-slate-200/60 ${meta.surfaceClass} p-4 shadow-sm`}
                >
                  <div className="flex h-full flex-col justify-between">
                    <div className="h-4 w-16 rounded-full bg-white/80" />
                    <div className="space-y-2">
                      <div className="h-3 w-24 rounded-full bg-white/70" />
                      <div className="h-3 w-20 rounded-full bg-white/60" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 px-6 py-6 md:grid-cols-3">
        {meta.points.map((point) => (
          <div key={`${mode}-copy-${point}`} className="space-y-2 text-center md:text-left">
            <div className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500">
              <Sparkles className="h-4 w-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900">{point}</h3>
            <p className="text-sm leading-6 text-slate-600">
              {meta.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function StoreBuilderSidePanel({
  score,
  onGoToFunnel,
}: {
  score: number;
  onGoToFunnel: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
          Progreso comercial
        </p>
        <p className="mt-3 text-4xl font-bold text-slate-900">{score}</p>
        <p className="mt-2 text-sm text-slate-600">
          Cuando la oferta ya esta clara, el siguiente paso es pasar al funnel builder.
        </p>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-400" style={{ width: `${score}%` }} />
        </div>
      </div>

      <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
          Siguiente paso
        </p>
        <div className="mt-4 space-y-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-900">1. Define producto y promesa</p>
            <p className="mt-1 text-sm text-slate-600">
              Ajusta el mensaje central hasta que la oferta quede clara.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-900">2. Pasa al funnel builder</p>
            <p className="mt-1 text-sm text-slate-600">
              Ordena la narrativa, objeciones y cierres antes de publicar.
            </p>
          </div>
        </div>
        <Button className="mt-4 w-full" onClick={onGoToFunnel}>
          <TrendingUp className="h-4 w-4" /> Abrir funnel builder
        </Button>
      </div>
    </div>
  );
}

function StrategyPanel({
  profile,
  score,
  missingTypes,
  onProfileChange,
  onApply,
  onSave,
}: {
  profile: StoreProfile;
  score: number;
  missingTypes: BlockType[];
  onProfileChange: (field: keyof StoreProfile, value: string) => void;
  onApply: () => void;
  onSave: () => void;
}) {
  return (
    <section className="rounded-[2rem] border border-primary/20 bg-gradient-to-br from-card via-card to-primary/10 p-5 shadow-2xl shadow-black/10">
      <div className="grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="space-y-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                <LayoutTemplate className="h-3.5 w-3.5" />
                Funnel workspace
              </div>
              <h2 className="text-2xl font-bold">Construye un funnel que venda en menos scrolls</h2>
              <p className="max-w-2xl text-sm text-muted-foreground">
                Ajusta el mensaje central, luego arrastra y reordena secciones para
                construir una narrativa de conversion mas parecida a un builder premium.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button variant="outline" onClick={onApply}>
                <Wand2 className="h-4 w-4" /> Aplicar al funnel
              </Button>
              <Button variant="cta" onClick={onSave}>
                <Save className="h-4 w-4" /> Guardar cambios
              </Button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="profile-store-name">Marca / tienda</Label>
              <Input
                id="profile-store-name"
                value={profile.storeName}
                onChange={(event) => onProfileChange("storeName", event.target.value)}
                className="border-border bg-background/70"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-product-name">Producto principal</Label>
              <Input
                id="profile-product-name"
                value={profile.productName}
                onChange={(event) => onProfileChange("productName", event.target.value)}
                className="border-border bg-background/70"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-category">Categoria</Label>
              <Input
                id="profile-category"
                value={profile.category}
                onChange={(event) => onProfileChange("category", event.target.value)}
                className="border-border bg-background/70"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-cta">CTA principal</Label>
              <Input
                id="profile-cta"
                value={profile.ctaText}
                onChange={(event) => onProfileChange("ctaText", event.target.value)}
                className="border-border bg-background/70"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="profile-headline">Promesa principal</Label>
              <Textarea
                id="profile-headline"
                value={profile.headline}
                onChange={(event) => onProfileChange("headline", event.target.value)}
                className="min-h-[96px] border-border bg-background/70"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="profile-subheadline">Refuerzo de la oferta</Label>
              <Textarea
                id="profile-subheadline"
                value={profile.subheadline}
                onChange={(event) => onProfileChange("subheadline", event.target.value)}
                className="min-h-[96px] border-border bg-background/70"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-price">Precio actual</Label>
              <Input
                id="profile-price"
                value={profile.price}
                onChange={(event) => onProfileChange("price", event.target.value)}
                className="border-border bg-background/70"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-original-price">Precio comparativo</Label>
              <Input
                id="profile-original-price"
                value={profile.originalPrice}
                onChange={(event) => onProfileChange("originalPrice", event.target.value)}
                className="border-border bg-background/70"
              />
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="rounded-3xl border border-primary/15 bg-background/70 p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
                  Conversion score
                </p>
                <p className="mt-2 text-4xl font-bold">{score}</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Puntaje heuristico para este funnel antes de publicar.
                </p>
              </div>
              <div className="rounded-3xl bg-primary/10 p-3 text-primary">
                <TrendingUp className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-gradient-gold transition-all"
                style={{ width: `${score}%` }}
              />
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-background/70 p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Check rapido
            </p>
            <div className="mt-4 space-y-3">
              <div className="flex items-start gap-3 text-sm text-muted-foreground">
                <Target className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>Promesa visible arriba del primer CTA.</span>
              </div>
              <div className="flex items-start gap-3 text-sm text-muted-foreground">
                <MousePointerClick className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>CTA corto, directo y enfocado en accion.</span>
              </div>
              <div className="flex items-start gap-3 text-sm text-muted-foreground">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>Pago contraentrega y garantia visibles en cierre.</span>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-background/70 p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Oportunidades
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {missingTypes.length === 0 ? (
                <span className="rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-300">
                  Stack completa
                </span>
              ) : (
                missingTypes.map((type) => (
                  <span
                    key={type}
                    className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground"
                  >
                    Falta {blockMeta[type].label}
                  </span>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function EditorPage() {
  const navigate = useNavigate();
  const { storeId } = useParams();
  const resolvedStoreId = storeId || "new";
  const isNew = resolvedStoreId === "new";

  const [storeProfile, setStoreProfile] = useState<StoreProfile>(createDefaultProfile);
  const [blocks, setBlocks] = useState<FunnelBlock[]>(() =>
    createDefaultBlocks(createDefaultProfile(), isNew),
  );
  const [selectedId, setSelectedId] = useState<string | null>(blocks[0]?.id || null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");
  const [builderMode, setBuilderMode] = useState<BuilderMode>("store");

  useEffect(() => {
    const storedState = loadEditorState(resolvedStoreId);

    if (storedState?.profile) {
      setStoreProfile(storedState.profile);
    }

    if (!storedState?.blocks.length) {
      if (isNew) {
        const baseProfile = storedState?.profile || createDefaultProfile();
        const nextBlocks = createDefaultBlocks(baseProfile, true);
        setBlocks(nextBlocks);
        setSelectedId(nextBlocks[0]?.id || null);
      }
      return;
    }

    setBlocks(storedState.blocks);
    setSelectedId(storedState.blocks[0]?.id || null);
  }, [resolvedStoreId, isNew]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const selectedBlock = blocks.find((block) => block.id === selectedId) || null;

  const conversionScore = useMemo(
    () => calculateConversionScore(blocks, storeProfile),
    [blocks, storeProfile],
  );

  const missingCriticalBlocks = useMemo(() => {
    const present = new Set(blocks.map((block) => block.type));
    return recommendedStack.filter((type) => !present.has(type));
  }, [blocks]);

  const activeBlock = useMemo(
    () => blocks.find((block) => block.id === activeId) || null,
    [activeId, blocks],
  );

  const canvasModeTitle =
    builderMode === "page"
      ? "Construye y afina cada seccion de la pagina"
      : "Ordena el funnel como un builder real";
  const canvasModeDescription =
    builderMode === "page"
      ? "Ajusta el orden visual de cada bloque y refina el contenido desde el panel lateral."
      : "Arrastra cada bloque para cambiar la narrativa, duplica variaciones y usa las inserciones sugeridas para mantener un flujo de conversion claro.";

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);

    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    setBlocks((items) => {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);
      return arrayMove(items, oldIndex, newIndex);
    });
  };

  const insertBlockAt = (index: number, type: BlockType) => {
    const newBlock: FunnelBlock = {
      id: createBlockId(),
      type,
      data: createBlockDataForType(type, storeProfile),
    };

    setBlocks((previous) => {
      const nextBlocks = [...previous];
      nextBlocks.splice(index, 0, newBlock);
      return nextBlocks;
    });
    setSelectedId(newBlock.id);
  };

  const addBlock = (type: BlockType) => {
    insertBlockAt(blocks.length, type);
  };

  const addMissingConversionBlocks = () => {
    if (missingCriticalBlocks.length === 0) {
      toast.success("Tu stack ya tiene todas las piezas clave.");
      return;
    }

    const nextBlocks = missingCriticalBlocks.map((type) => ({
      id: createBlockId(),
      type,
      data: createBlockDataForType(type, storeProfile),
    }));

    setBlocks((previous) => [...previous, ...nextBlocks]);
    setSelectedId(nextBlocks[0]?.id || null);
    toast.success("Se agregaron las piezas faltantes del funnel.");
  };

  const duplicateBlock = (id: string) => {
    setBlocks((previous) => {
      const index = previous.findIndex((block) => block.id === id);

      if (index < 0) {
        return previous;
      }

      const clone: FunnelBlock = {
        ...previous[index],
        id: createBlockId(),
        data: { ...previous[index].data },
      };

      const nextBlocks = [...previous];
      nextBlocks.splice(index + 1, 0, clone);
      setSelectedId(clone.id);
      return nextBlocks;
    });
  };

  const deleteBlock = (id: string) => {
    setBlocks((previous) => {
      const nextBlocks = previous.filter((block) => block.id !== id);

      if (selectedId === id) {
        setSelectedId(nextBlocks[0]?.id || null);
      }

      return nextBlocks;
    });
  };

  const updateBlockData = useCallback((id: string, field: string, value: string) => {
    setBlocks((previous) =>
      previous.map((block) =>
        block.id === id ? { ...block, data: { ...block.data, [field]: value } } : block,
      ),
    );
  }, []);

  const updateProfileField = (field: keyof StoreProfile, value: string) => {
    setStoreProfile((previous) => ({ ...previous, [field]: value }));
  };

  const applyProfile = () => {
    setBlocks((previous) => applyProfileToBlocks(previous, storeProfile));
    toast.success("La estrategia de oferta se aplico al funnel.");
  };

  const persistDraft = () => {
    const nextBlocks = applyProfileToBlocks(blocks, storeProfile);
    setBlocks(nextBlocks);

    const storedState = saveEditorState(resolvedStoreId, nextBlocks, storeProfile);

    toast.success("Cambios guardados.", {
      description: `Ultima actualizacion: ${new Date(storedState.updatedAt).toLocaleString()}`,
    });
  };

  const openPreview = () => {
    const nextBlocks = applyProfileToBlocks(blocks, storeProfile);
    saveEditorState(resolvedStoreId, nextBlocks, storeProfile);
    setBlocks(nextBlocks);
    navigate(`/preview/${resolvedStoreId}`);
  };

  const handlePublish = () => {
    const nextBlocks = applyProfileToBlocks(blocks, storeProfile);
    setBlocks(nextBlocks);

    const publishedState = publishEditorState(resolvedStoreId, nextBlocks, storeProfile);

    if (!publishedState) {
      toast.error("No hay contenido para publicar.");
      return;
    }

    toast.success("Version publicada.", {
      description: `Publicada: ${new Date(publishedState.publishedAt || "").toLocaleString()}`,
    });
  };

  return (
    <div className="flex min-h-screen flex-col bg-[radial-gradient(circle_at_top,_rgba(249,191,36,0.14),_transparent_32%),linear-gradient(180deg,_rgba(7,11,25,1)_0%,_rgba(4,8,18,1)_100%)]">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/95 backdrop-blur-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 lg:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="inline-flex items-center gap-2 rounded-full border border-border/80 px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" /> Volver
            </button>

            <div className="hidden h-7 w-px bg-border lg:block" />

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                <p className="truncate font-display text-sm font-bold">
                  {storeProfile.storeName || (isNew ? "Nueva Tienda" : "Tienda en edicion")}
                </p>
              </div>
              <p className="truncate text-xs text-muted-foreground">
                Funnel builder para {storeProfile.productName || "tu producto principal"}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 lg:gap-3">
            <div className="hidden items-center gap-2 rounded-2xl border border-border/70 bg-card/90 px-3 py-2 md:flex">
              <TrendingUp className="h-4 w-4 text-primary" />
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Score
                </p>
                <p className="text-sm font-semibold">{conversionScore}/99</p>
              </div>
            </div>

            <div className="flex items-center gap-1 rounded-2xl border border-border/70 bg-card/90 p-1">
              <button
                type="button"
                onClick={() => setPreviewMode("desktop")}
                className={cn(
                  "rounded-xl px-3 py-2 text-sm transition-colors",
                  previewMode === "desktop"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground",
                )}
                aria-label="Vista desktop"
              >
                <Monitor className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setPreviewMode("mobile")}
                className={cn(
                  "rounded-xl px-3 py-2 text-sm transition-colors",
                  previewMode === "mobile"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground",
                )}
                aria-label="Vista mobile"
              >
                <Smartphone className="h-4 w-4" />
              </button>
            </div>

            <Button variant="outline" size="sm" onClick={openPreview}>
              <Eye className="h-4 w-4" /> Preview
            </Button>
            <Button variant="outline" size="sm" onClick={persistDraft}>
              <Save className="h-4 w-4" /> Guardar
            </Button>
            <Button variant="cta" size="sm" onClick={handlePublish}>
              <Rocket className="h-4 w-4" /> Publicar
            </Button>
          </div>
        </div>
      </header>
      <main className="flex flex-1 overflow-hidden">
        <aside className="hidden w-80 shrink-0 border-r border-border/70 bg-card/70 p-4 xl:block">
          <div className="flex h-full flex-col gap-4 overflow-y-auto pr-1">
            {builderMode === "store" ? (
              <>
                <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Store setup
                  </p>
                  <div className="mt-4 space-y-3">
                    {builderModeMeta.store.points.map((point) => (
                      <div
                        key={point}
                        className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                      >
                        <p className="text-sm font-semibold text-slate-900">{point}</p>
                        <p className="mt-1 text-sm text-slate-600">
                          {builderModeMeta.store.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Builder flow
                  </p>
                  <div className="mt-4 space-y-3">
                    <button
                      type="button"
                      onClick={() => setBuilderMode("funnel")}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left transition-colors hover:border-slate-300"
                    >
                      <p className="text-sm font-semibold text-slate-900">Ir a Funnel builder</p>
                      <p className="mt-1 text-sm text-slate-600">
                        Conecta las etapas del recorrido y ordena la conversion.
                      </p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setBuilderMode("page")}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left transition-colors hover:border-slate-300"
                    >
                      <p className="text-sm font-semibold text-slate-900">Ir a Page builder</p>
                      <p className="mt-1 text-sm text-slate-600">
                        Ajusta el layout y los componentes finales de la pagina.
                      </p>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="rounded-3xl border border-border bg-background/70 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
                        Funnel map
                      </p>
                      <h2 className="mt-2 text-lg font-bold">Narrativa visual</h2>
                    </div>
                    <div className="rounded-2xl bg-primary/10 px-3 py-2 text-sm font-semibold text-primary">
                      {blocks.length} pasos
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    {blocks.map((block, index) => (
                      <button
                        key={block.id}
                        type="button"
                        onClick={() => setSelectedId(block.id)}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-2xl border px-3 py-3 text-left transition-all",
                          selectedId === block.id
                            ? "border-primary/30 bg-primary/10"
                            : "border-border bg-card/80 hover:border-primary/20",
                        )}
                      >
                        <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-secondary text-sm font-bold text-foreground">
                          {index + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold">{blockMeta[block.type].label}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            {blockPlaybooks[block.type].goal}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rounded-3xl border border-border bg-background/70 p-5">
                  <div className="flex items-center gap-2">
                    <LayoutTemplate className="h-4 w-4 text-primary" />
                    <h3 className="font-bold">
                      {builderMode === "page" ? "Componentes de pagina" : "Biblioteca de bloques"}
                    </h3>
                  </div>
                  <div className="mt-4 space-y-4">
                    {libraryGroups.map((group) => (
                      <div key={group.label} className="space-y-2">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                          {group.label}
                        </p>
                        <div className="space-y-2">
                          {group.types.map((type) => (
                            <button
                              key={type}
                              type="button"
                              onClick={() => addBlock(type)}
                              className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card/80 px-3 py-3 text-left transition-colors hover:border-primary/20 hover:bg-primary/5"
                            >
                              <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-secondary text-sm font-bold">
                                {blockMeta[type].emoji}
                              </span>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold">{blockMeta[type].label}</p>
                                <p className="truncate text-xs text-muted-foreground">
                                  {blockPlaybooks[type].description}
                                </p>
                              </div>
                              <Plus className="h-4 w-4 text-muted-foreground" />
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-3xl border border-border bg-background/70 p-5">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <h3 className="font-bold">
                      {builderMode === "page" ? "Modo page builder" : "Modo alta conversion"}
                    </h3>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">
                    {builderMode === "page"
                      ? "Trabaja el layout final mientras mantienes la misma logica del funnel."
                      : "Completa automaticamente las piezas clave que falten en el funnel."}
                  </p>
                  <Button className="mt-4 w-full" variant="outline" onClick={addMissingConversionBlocks}>
                    <Plus className="h-4 w-4" /> Completar stack recomendada
                  </Button>
                </div>
              </>
            )}
          </div>
        </aside>

        <div className="flex-1 overflow-y-auto px-4 py-5 lg:px-6">
          <div className="mx-auto max-w-[1800px] space-y-5">
            <BuilderModeTabs mode={builderMode} onChange={setBuilderMode} />
            <BuilderShowcaseCard mode={builderMode} />
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_22rem]">
            <div className="min-w-0 space-y-5">
              {builderMode === "store" ? (
                <StrategyPanel
                  profile={storeProfile}
                  score={conversionScore}
                  missingTypes={missingCriticalBlocks}
                  onProfileChange={updateProfileField}
                  onApply={applyProfile}
                  onSave={persistDraft}
                />
              ) : null}

              {builderMode !== "store" ? (
                <div className="rounded-[2rem] border border-border/70 bg-card/80 p-4 shadow-2xl shadow-black/10">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                      <Sparkles className="h-3.5 w-3.5" />
                      {builderMode === "page" ? "Page builder" : "Canvas drag and drop"}
                    </div>
                    <h2 className="mt-3 text-2xl font-bold">{canvasModeTitle}</h2>
                    <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
                      {canvasModeDescription}
                    </p>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-3">
                    <div className="rounded-2xl border border-border bg-background/70 px-3 py-3">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                        Hook
                      </p>
                      <p className="mt-1 text-sm font-semibold">Promesa + CTA</p>
                    </div>
                    <div className="rounded-2xl border border-border bg-background/70 px-3 py-3">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                        Confianza
                      </p>
                      <p className="mt-1 text-sm font-semibold">Prueba + FAQ</p>
                    </div>
                    <div className="rounded-2xl border border-border bg-background/70 px-3 py-3">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                        Cierre
                      </p>
                      <p className="mt-1 text-sm font-semibold">Checkout simple</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex gap-2 overflow-x-auto pb-2 xl:hidden">
                  {(Object.keys(blockMeta) as BlockType[]).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => addBlock(type)}
                      className="shrink-0 rounded-full border border-border bg-background/80 px-3 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:border-primary/20 hover:text-foreground"
                    >
                      {blockMeta[type].label}
                    </button>
                  ))}
                </div>
              </div>
              ) : null}

              {builderMode === "store" ? (
                <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
                  <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Store builder
                    </p>
                    <h3 className="mt-3 text-2xl font-bold text-slate-900">
                      Define la oferta y luego pasa al recorrido de conversion
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      Este modo existe para pulir producto, marca, precio y promesa. Cuando
                      cierres esos cuatro puntos, cambia a `Funnel builder` para ordenar el
                      journey y a `Page builder` para afinar layout y componentes.
                    </p>
                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      <button
                        type="button"
                        onClick={() => setBuilderMode("funnel")}
                        className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left transition-colors hover:border-slate-300"
                      >
                        <p className="text-sm font-semibold text-slate-900">Abrir Funnel builder</p>
                        <p className="mt-1 text-sm text-slate-600">
                          Arrastra y conecta cada etapa del funnel.
                        </p>
                      </button>
                      <button
                        type="button"
                        onClick={() => setBuilderMode("page")}
                        className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left transition-colors hover:border-slate-300"
                      >
                        <p className="text-sm font-semibold text-slate-900">Abrir Page builder</p>
                        <p className="mt-1 text-sm text-slate-600">
                          Ajusta visualmente la presentacion final de la pagina.
                        </p>
                      </button>
                    </div>
                  </div>

                  <StoreBuilderSidePanel
                    score={conversionScore}
                    onGoToFunnel={() => setBuilderMode("funnel")}
                  />
                </div>
              ) : (
                <div
                  className={cn(
                    "mx-auto w-full transition-all duration-300",
                    previewMode === "mobile" ? "max-w-md" : "max-w-5xl",
                  )}
                >
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={blocks.map((block) => block.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-4">
                        {blocks.map((block, index) => (
                          <SortableBlockCard
                            key={block.id}
                            block={block}
                            index={index}
                            isSelected={selectedId === block.id}
                            onSelect={() => setSelectedId(block.id)}
                            onDelete={() => deleteBlock(block.id)}
                            onDuplicate={() => duplicateBlock(block.id)}
                            onInsertAfter={(type) => insertBlockAt(index + 1, type)}
                          />
                        ))}
                      </div>
                    </SortableContext>

                    <DragOverlay>
                      {activeBlock ? (
                        <div className="w-full max-w-3xl rounded-[1.75rem] border border-primary/35 bg-card/95 p-4 opacity-95 shadow-2xl shadow-black/20">
                          <BlockPreview type={activeBlock.type} data={activeBlock.data} />
                        </div>
                      ) : null}
                    </DragOverlay>
                  </DndContext>

                  {blocks.length === 0 ? (
                    <div className="rounded-[2rem] border border-dashed border-border bg-card/70 px-6 py-16 text-center">
                      <p className="text-lg font-semibold">Tu funnel esta vacio</p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Carga una estructura recomendada o agrega el primer bloque desde la biblioteca.
                      </p>
                      <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
                        <Button variant="cta" onClick={addMissingConversionBlocks}>
                          <Sparkles className="h-4 w-4" /> Cargar stack recomendada
                        </Button>
                        <Button variant="outline" onClick={() => addBlock("hero")}>
                          <Plus className="h-4 w-4" /> Agregar Hero
                        </Button>
                      </div>
                    </div>
                  ) : null}
                </div>
              )}
            </div>

            <aside className="min-w-0 space-y-5">
              <div className="rounded-[2rem] border border-border/70 bg-card/80 p-5 shadow-2xl shadow-black/10">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
                      {builderMode === "store" ? "Store controls" : "Conversion controls"}
                    </p>
                    <h2 className="mt-2 text-lg font-bold">
                      {builderMode === "store"
                        ? "De producto a funnel sin perder contexto"
                        : "Optimiza sin salir del editor"}
                    </h2>
                  </div>
                  <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                    <ShoppingCart className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
                  <div className="rounded-2xl border border-border bg-background/70 p-4">
                    <div className="flex items-center gap-2 text-primary">
                      <Target className="h-4 w-4" />
                      <p className="text-xs font-semibold uppercase tracking-[0.16em]">
                        Objetivo
                      </p>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Mantener una narrativa lineal: promesa, prueba, cierre.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-border bg-background/70 p-4">
                    <div className="flex items-center gap-2 text-primary">
                      <MousePointerClick className="h-4 w-4" />
                      <p className="text-xs font-semibold uppercase tracking-[0.16em]">
                        CTA
                      </p>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Repite CTA en hero, cierre y remate final.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-border bg-background/70 p-4">
                    <div className="flex items-center gap-2 text-primary">
                      <ShieldCheck className="h-4 w-4" />
                      <p className="text-xs font-semibold uppercase tracking-[0.16em]">
                        Riesgo
                      </p>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Refuerza garantia, envio y contraentrega cerca del checkout.
                    </p>
                  </div>
                </div>
              </div>

              {builderMode === "store" ? (
                <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Sugerencias
                  </p>
                  <div className="mt-4 space-y-4">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-sm font-semibold text-slate-900">Promesa clara</p>
                      <p className="mt-1 text-sm text-slate-600">
                        La promesa principal debe leerse en menos de 5 segundos.
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-sm font-semibold text-slate-900">Precio con contraste</p>
                      <p className="mt-1 text-sm text-slate-600">
                        Mantener precio actual y comparativo ayuda a reforzar valor.
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-sm font-semibold text-slate-900">CTA directo</p>
                      <p className="mt-1 text-sm text-slate-600">
                        Usa verbos cortos: comprar, pedir, reservar o recibir hoy.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <PropertiesPanel block={selectedBlock} onChange={updateBlockData} />
              )}
            </aside>
          </div>
          </div>
        </div>
      </main>
    </div>
  );
}
