import { useEffect, useMemo, useState } from "react";
import {
  DndContext,
  type DragEndEvent,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { AlertCircle, Copy, GripVertical, Monitor, Search, Smartphone, Tablet, Trash2 } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/lib/auth";
import {
  findFunnelById,
  getFunnelOffers,
  getFunnelProduct,
  getLandingSections,
  listOrders,
  listUserProducts,
  saveFunnelOffers,
  saveLandingSections,
  setFunnelPublished,
  updateFunnelCurrency,
  upsertFunnelProduct,
  type FunnelCurrency,
  type FunnelOfferRow,
  type LandingBlock,
  type LandingBlockType,
  type PaymentType,
  type ProductType,
} from "@/lib/funnel-system";
import { cn } from "@/lib/utils";
import { BuilderLandingEditorStep1 } from "@/features/funnel-builder/BuilderLandingEditorStep1";

type WizardStep = 1 | 2 | 3;
type DeviceMode = "desktop" | "tablet" | "mobile";
type SaveState = "idle" | "saving" | "saved" | "error";
type PublishState = "idle" | "publishing" | "published" | "error";
type LibraryTab = "elements" | "sections";

interface LibraryElement {
  type: LandingBlockType;
  label: string;
  description: string;
}

interface SectionPreset {
  id: string;
  label: string;
  description: string;
}

const libraryElements: LibraryElement[] = [
  { type: "hero", label: "Hero", description: "Encabezado principal con CTA." },
  { type: "section", label: "Section", description: "Bloque para beneficios o detalles." },
  { type: "headline", label: "Headline", description: "Titulo corto de impacto." },
  { type: "text", label: "Text", description: "Parrafo explicativo." },
  { type: "image", label: "Image", description: "Imagen del producto o uso." },
  { type: "video", label: "Video", description: "Demo en video." },
  { type: "button", label: "Button", description: "Boton de llamada a la accion." },
  { type: "testimonials", label: "Testimonials", description: "Prueba social de clientes." },
  { type: "faq", label: "FAQ", description: "Pregunta y respuesta." },
  { type: "cod_form", label: "COD Form", description: "Formulario rapido contra entrega." },
  { type: "footer", label: "Footer", description: "Pie de pagina simple." },
];

const sectionPresets: SectionPreset[] = [
  { id: "hero-start", label: "Hero de conversion", description: "Hero + boton inicial para vender rapido." },
  { id: "benefits", label: "Beneficios", description: "Titulo + texto + imagen de apoyo." },
  { id: "social-proof", label: "Prueba social", description: "Headline + testimonios + CTA." },
  { id: "faq-cod", label: "FAQ + COD", description: "Resuelve dudas y agrega formulario COD." },
  { id: "closing", label: "Cierre", description: "Seccion final + boton + footer." },
];

const blockLabel: Record<LandingBlockType, string> = {
  hero: "Hero",
  section: "Section",
  headline: "Headline",
  text: "Text",
  image: "Image",
  video: "Video",
  button: "Button",
  testimonials: "Testimonials",
  faq: "FAQ",
  cod_form: "COD Form",
  footer: "Footer",
};

function isLandingBlockType(value: string): value is LandingBlockType {
  return value in blockLabel;
}

function createBlockId() {
  return `blk_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function createBlock(type: LandingBlockType): LandingBlock {
  const id = createBlockId();
  if (type === "hero") {
    return {
      id,
      type,
      title: "Oferta principal",
      subtitle: "Explica en una frase clara por que tu producto vale la pena.",
      text: "Comprar ahora",
      href: "#checkout",
    };
  }
  if (type === "section") {
    return {
      id,
      type,
      title: "Beneficio clave",
      content: "Explica el resultado que consigue el cliente.",
    };
  }
  if (type === "headline") return { id, type, content: "Convierte mas con este producto" };
  if (type === "text") {
    return {
      id,
      type,
      content: "Escribe aqui un texto corto y directo. Evita parrafos largos y enfoca la promesa principal.",
    };
  }
  if (type === "image") {
    return {
      id,
      type,
      src: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1400&q=80&auto=format&fit=crop",
    };
  }
  if (type === "video") return { id, type, src: "https://www.youtube.com/embed/dQw4w9WgXcQ" };
  if (type === "button") return { id, type, text: "Ir al checkout", href: "#checkout" };
  if (type === "testimonials") return { id, type, content: '"Me llego rapido y funciona perfecto." - Cliente verificado' };
  if (type === "faq") return { id, type, question: "Cuanto tarda el envio?", answer: "Depende de tu ciudad. Normalmente entre 24 y 72 horas." };
  if (type === "cod_form") return { id, type, title: "Pedido contra entrega", text: "Confirm Order" };
  return { id, type: "footer", content: "Copyright 2026 - Todos los derechos reservados." };
}

function createPresetBlocks(presetId: string): LandingBlock[] {
  if (presetId === "hero-start") {
    return [createBlock("hero"), { ...createBlock("button"), text: "Comprar ahora", href: "#checkout" }];
  }
  if (presetId === "benefits") {
    return [
      { ...createBlock("headline"), content: "Beneficios que el cliente siente desde el dia 1" },
      { ...createBlock("section"), title: "Por que funciona", content: "Beneficio 1\nBeneficio 2\nBeneficio 3" },
      createBlock("image"),
    ];
  }
  if (presetId === "social-proof") {
    return [
      { ...createBlock("headline"), content: "Clientes reales, resultados reales" },
      createBlock("testimonials"),
      { ...createBlock("button"), text: "Quiero este producto" },
    ];
  }
  if (presetId === "faq-cod") {
    return [createBlock("faq"), createBlock("faq"), createBlock("cod_form")];
  }
  return [
    { ...createBlock("section"), title: "Ultimo paso", content: "Recuerda la oferta y refuerza urgencia en una frase." },
    { ...createBlock("button"), text: "Finalizar compra" },
    createBlock("footer"),
  ];
}

function SaveStatus({ state, at }: { state: SaveState; at: string | null }) {
  if (state === "saving") return <p className="text-xs text-muted-foreground">Guardando cambios...</p>;
  if (state === "error") return <p className="text-xs text-destructive">Error de guardado automatico</p>;
  if (state === "saved" && at)
    return <p className="text-xs text-muted-foreground">Guardado automatico {new Date(at).toLocaleTimeString("es-PE")}</p>;
  return <p className="text-xs text-muted-foreground">Sin cambios pendientes</p>;
}

function LibraryItem({
  element,
  onAdd,
  onNativeDragStart,
  onNativeDragEnd,
}: {
  element: LibraryElement;
  onAdd: (type: LandingBlockType) => void;
  onNativeDragStart: (type: LandingBlockType) => void;
  onNativeDragEnd: () => void;
}) {
  return (
    <button
      type="button"
      draggable
      className={cn(
        "w-full cursor-grab rounded-xl border border-border bg-card px-3 py-2 text-left transition-colors hover:border-primary/45 hover:bg-secondary/20 active:cursor-grabbing",
      )}
      onClick={() => onAdd(element.type)}
      onDragStart={(event) => {
        event.dataTransfer.effectAllowed = "copy";
        event.dataTransfer.setData("text/plain", element.type);
        onNativeDragStart(element.type);
      }}
      onDragEnd={onNativeDragEnd}
    >
      <p className="text-sm font-medium">{element.label}</p>
      <p className="mt-1 text-xs text-muted-foreground">{element.description}</p>
    </button>
  );
}

function SectionPresetCard({ preset, onAdd }: { preset: SectionPreset; onAdd: (presetId: string) => void }) {
  return (
    <article className="rounded-xl border border-border bg-card p-3">
      <p className="text-sm font-semibold">{preset.label}</p>
      <p className="mt-1 text-xs text-muted-foreground">{preset.description}</p>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="mt-3 h-8 rounded-lg text-xs"
        onClick={() => onAdd(preset.id)}
      >
        Agregar preset
      </Button>
    </article>
  );
}

function BlockPreview({ block }: { block: LandingBlock }) {
  if (block.type === "hero") {
    return (
      <div className="overflow-hidden rounded-xl border border-primary/25 bg-gradient-to-br from-primary/20 via-secondary/30 to-background p-5">
        <h3 className="text-2xl font-semibold leading-tight">{block.title || "Hero principal"}</h3>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">{block.subtitle || "Subtitulo del hero"}</p>
        <div className="mt-4 inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
          {block.text || "Comprar ahora"}
        </div>
      </div>
    );
  }

  if (block.type === "section") {
    return (
      <div className="rounded-xl border border-border bg-card p-4">
        <h4 className="text-lg font-semibold">{block.title || "Seccion"}</h4>
        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{block.content || "Contenido"}</p>
      </div>
    );
  }

  if (block.type === "headline") {
    return (
      <div className="rounded-xl border border-border bg-card p-5 text-center">
        <h3 className="text-2xl font-bold leading-tight">{block.content || "Headline"}</h3>
      </div>
    );
  }

  if (block.type === "text") {
    return (
      <div className="rounded-xl border border-border bg-card p-5">
        <p className="whitespace-pre-wrap text-sm leading-7 text-muted-foreground">{block.content || "Texto descriptivo"}</p>
      </div>
    );
  }

  if (block.type === "image") {
    return (
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        {block.src ? (
          <img src={block.src} alt="Preview bloque imagen" className="h-52 w-full object-cover" />
        ) : (
          <div className="flex h-52 items-center justify-center text-sm text-muted-foreground">Agrega URL de imagen</div>
        )}
      </div>
    );
  }

  if (block.type === "video") {
    return (
      <div className="rounded-xl border border-border bg-card p-3">
        <div className="aspect-video overflow-hidden rounded-lg border border-border bg-background">
          {block.src ? (
            <iframe
              title="Preview bloque video"
              src={block.src}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Agrega URL embed de video</div>
          )}
        </div>
      </div>
    );
  }

  if (block.type === "button") {
    return (
      <div className="rounded-xl border border-border bg-card p-5 text-center">
        <span className="inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
          {block.text || "Boton"}
        </span>
        <p className="mt-2 text-xs text-muted-foreground">{block.href || "#checkout"}</p>
      </div>
    );
  }

  if (block.type === "testimonials") {
    return (
      <div className="rounded-xl border border-border bg-card p-5">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Testimonials</p>
        <p className="mt-2 text-sm leading-6">{block.content || "Testimonio"}</p>
      </div>
    );
  }

  if (block.type === "faq") {
    return (
      <div className="rounded-xl border border-border bg-card p-5">
        <p className="text-sm font-semibold">{block.question || "Pregunta frecuente"}</p>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{block.answer || "Respuesta breve"}</p>
      </div>
    );
  }

  if (block.type === "cod_form") {
    return (
      <div className="rounded-xl border border-border bg-card p-5">
        <p className="text-sm font-semibold">{block.title || "Formulario COD"}</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <div className="h-9 rounded-lg border border-border bg-background px-3 py-2 text-xs text-muted-foreground">Nombre</div>
          <div className="h-9 rounded-lg border border-border bg-background px-3 py-2 text-xs text-muted-foreground">Telefono</div>
          <div className="h-9 rounded-lg border border-border bg-background px-3 py-2 text-xs text-muted-foreground sm:col-span-2">Direccion</div>
          <div className="h-9 rounded-lg border border-border bg-background px-3 py-2 text-xs text-muted-foreground sm:col-span-2">Ciudad</div>
        </div>
        <span className="mt-3 inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
          {block.text || "Confirm Order"}
        </span>
      </div>
    );
  }

  return (
    <footer className="rounded-xl border border-border bg-card p-4 text-center">
      <p className="text-xs text-muted-foreground">{block.content || "Copyright 2026 - Todos los derechos reservados."}</p>
    </footer>
  );
}

function CanvasCard({
  block,
  selected,
  onSelect,
  onDelete,
  onDuplicate,
}: {
  block: LandingBlock;
  selected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}) {
  const { setNodeRef, transform, transition, attributes, listeners } = useSortable({ id: block.id });
  return (
    <article
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn("rounded-xl border p-3 transition-colors", selected ? "border-primary bg-primary/5" : "border-border bg-secondary/10")}
      onClick={onSelect}
    >
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Mover bloque"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground"
            {...listeners}
            {...attributes}
          >
            <GripVertical className="h-4 w-4" />
          </button>
          <span className="rounded-full border border-border bg-card px-2 py-1 text-xs font-medium">{blockLabel[block.type]}</span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-8 w-8 rounded-lg"
            onClick={(event) => {
              event.stopPropagation();
              onDuplicate();
            }}
            aria-label="Duplicar bloque"
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-8 w-8 rounded-lg text-destructive hover:text-destructive"
            onClick={(event) => {
              event.stopPropagation();
              onDelete();
            }}
            aria-label="Eliminar bloque"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <BlockPreview block={block} />
    </article>
  );
}

export default function FunnelWorkspacePage() {
  const { funnelId = "" } = useParams();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const [step, setStep] = useState<WizardStep>(1);
  const [deviceMode, setDeviceMode] = useState<DeviceMode>("desktop");
  const [libraryTab, setLibraryTab] = useState<LibraryTab>("elements");
  const [libraryQuery, setLibraryQuery] = useState("");
  const [nativeDragType, setNativeDragType] = useState<LandingBlockType | null>(null);
  const [isNativeCanvasOver, setIsNativeCanvasOver] = useState(false);
  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState("0");
  const [productType, setProductType] = useState<ProductType>("physical");
  const [paymentType, setPaymentType] = useState<PaymentType>("cash_on_delivery");
  const [currency, setCurrency] = useState<FunnelCurrency>("USD");
  const [selectedExistingProductId, setSelectedExistingProductId] = useState("");
  const [landingSections, setLandingSections] = useState<LandingBlock[]>([]);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [offers, setOffers] = useState<FunnelOfferRow | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [offersSaveState, setOffersSaveState] = useState<SaveState>("idle");
  const [lastOffersSavedAt, setLastOffersSavedAt] = useState<string | null>(null);
  const [publishState, setPublishState] = useState<PublishState>("idle");
  const [publishedAt, setPublishedAt] = useState<string | null>(null);

  const funnel = useMemo(() => findFunnelById(funnelId), [funnelId, refreshKey]);
  const userProducts = useMemo(() => (user ? listUserProducts(user.uid) : []), [user, refreshKey]);
  const mobileOrders = useMemo(() => listOrders(funnelId), [funnelId, refreshKey]);
  const selectedBlock = useMemo(
    () => landingSections.find((item) => item.id === selectedBlockId) ?? null,
    [landingSections, selectedBlockId],
  );
  const selectedBlockIndex = useMemo(
    () => landingSections.findIndex((item) => item.id === selectedBlockId),
    [landingSections, selectedBlockId],
  );
  const filteredElements = useMemo(() => {
    const q = libraryQuery.trim().toLowerCase();
    if (!q) return libraryElements;
    return libraryElements.filter(
      (item) =>
        item.label.toLowerCase().includes(q) || item.description.toLowerCase().includes(q),
    );
  }, [libraryQuery]);
  const filteredPresets = useMemo(() => {
    const q = libraryQuery.trim().toLowerCase();
    if (!q) return sectionPresets;
    return sectionPresets.filter(
      (item) =>
        item.label.toLowerCase().includes(q) || item.description.toLowerCase().includes(q),
    );
  }, [libraryQuery]);

  useEffect(() => {
    if (!funnel) return;
    const product = getFunnelProduct(funnel.id);
    setProductName(product?.name ?? "");
    setProductPrice(String(product?.price ?? 0));
    setProductType(product?.type ?? "physical");
    setPaymentType(product?.payment_type ?? "cash_on_delivery");
    setCurrency(funnel.currency || "USD");
    const sections = getLandingSections(funnel.id);
    setLandingSections(sections);
    setSelectedBlockId(sections[0]?.id ?? null);
    setOffers(getFunnelOffers(funnel.id));
    setPublishedAt(funnel.published_at);
    setPublishState(funnel.published_at ? "published" : "idle");
  }, [funnel]);

  useEffect(() => {
    if (!selectedBlockId) return;
    if (landingSections.some((item) => item.id === selectedBlockId)) return;
    setSelectedBlockId(landingSections[0]?.id ?? null);
  }, [landingSections, selectedBlockId]);

  useEffect(() => {
    if (!funnel || !offers || isMobile || step !== 3) return;
    setOffersSaveState("saving");
    const timer = window.setTimeout(() => {
      try {
        saveFunnelOffers(funnel.id, offers);
        setOffersSaveState("saved");
        setLastOffersSavedAt(new Date().toISOString());
      } catch {
        setOffersSaveState("error");
      }
    }, 450);
    return () => window.clearTimeout(timer);
  }, [funnel, offers, isMobile, step]);

  if (!funnel) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 py-8">
        <div className="rounded-2xl border border-border bg-card p-6">
          <h1 className="text-xl font-semibold">Funnel no encontrado</h1>
          <Button asChild className="mt-4 rounded-xl">
            <Link to="/funnels">Volver a funnels</Link>
          </Button>
        </div>
      </main>
    );
  }

  if (isMobile) {
    const total = mobileOrders.length;
    const newCount = mobileOrders.filter((o) => o.status === "new").length;
    const completed = mobileOrders.filter((o) => o.status === "completed").length;
    return (
      <main className="mx-auto w-full max-w-3xl space-y-4 px-4 py-6">
        <section className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 text-amber-500" />
            <div>
              <h1 className="text-lg font-semibold">Edicion solo desde PC</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                En mobile solo puedes ver metricas y analisis.
              </p>
            </div>
          </div>
        </section>
        <section className="grid gap-3 sm:grid-cols-3">
          <article className="rounded-xl border border-border bg-card p-4"><p className="text-xs text-muted-foreground">Pedidos</p><p className="text-2xl font-semibold">{total}</p></article>
          <article className="rounded-xl border border-border bg-card p-4"><p className="text-xs text-muted-foreground">Nuevos</p><p className="text-2xl font-semibold">{newCount}</p></article>
          <article className="rounded-xl border border-border bg-card p-4"><p className="text-xs text-muted-foreground">Completados</p><p className="text-2xl font-semibold">{completed}</p></article>
        </section>
      </main>
    );
  }

  const canContinue = Boolean(productName.trim()) && Number(productPrice) > 0;
  const canvasWidthClass =
    deviceMode === "desktop"
      ? "mx-auto max-w-[1040px]"
      : deviceMode === "tablet"
        ? "mx-auto max-w-[760px]"
        : "mx-auto max-w-[420px]";

  const addBlockToCanvas = (type: LandingBlockType) => {
    const next = createBlock(type);
    setLandingSections((current) => [...current, next]);
    setSelectedBlockId(next.id);
  };

  const onDragEnd = (event: DragEndEvent) => {
    const active = String(event.active.id);
    const over = event.over ? String(event.over.id) : null;
    if (!over) return;

    if (active === over) return;
    setLandingSections((current) => {
      const oldIndex = current.findIndex((item) => item.id === active);
      if (oldIndex < 0) return current;
      const newIndex = current.findIndex((item) => item.id === over);
      if (newIndex < 0) return current;
      return arrayMove(current, oldIndex, newIndex);
    });
  };

  const addPreset = (presetId: string) => {
    const blocks = createPresetBlocks(presetId);
    setLandingSections((current) => [...current, ...blocks]);
    setSelectedBlockId(blocks[0]?.id ?? null);
  };

  const duplicateBlock = (block: LandingBlock) => {
    const clone: LandingBlock = { ...block, id: createBlockId() };
    setLandingSections((current) => {
      const index = current.findIndex((item) => item.id === block.id);
      if (index < 0) return [...current, clone];
      return [...current.slice(0, index + 1), clone, ...current.slice(index + 1)];
    });
    setSelectedBlockId(clone.id);
  };

  const removeBlock = (blockId: string) => {
    setLandingSections((current) => current.filter((item) => item.id !== blockId));
    if (selectedBlockId === blockId) {
      setSelectedBlockId(null);
    }
  };

  const moveSelected = (direction: "up" | "down") => {
    if (!selectedBlockId) return;
    setLandingSections((current) => {
      const index = current.findIndex((item) => item.id === selectedBlockId);
      if (index < 0) return current;
      const target = direction === "up" ? index - 1 : index + 1;
      if (target < 0 || target >= current.length) return current;
      return arrayMove(current, index, target);
    });
  };

  const updateSelected = (patch: Partial<LandingBlock>) => {
    if (!selectedBlock) return;
    setLandingSections((current) => current.map((item) => (item.id === selectedBlock.id ? { ...item, ...patch } : item)));
  };

  const saveNowLanding = (sections = landingSections) => {
    saveLandingSections(funnel.id, sections);
  };

  const saveNowOffers = () => {
    if (!offers) return;
    try {
      saveFunnelOffers(funnel.id, offers);
      setOffersSaveState("saved");
      setLastOffersSavedAt(new Date().toISOString());
    } catch {
      setOffersSaveState("error");
    }
  };

  const handlePublishFunnel = () => {
    try {
      setPublishState("publishing");
      saveNowLanding();
      saveNowOffers();
      const published = setFunnelPublished(funnel.id, true);
      if (!published?.published_at) {
        throw new Error("publish_failed");
      }
      setPublishedAt(published.published_at);
      setPublishState("published");
      setRefreshKey((current) => current + 1);
    } catch {
      setPublishState("error");
    }
  };

  return (
    <main className="mx-auto w-full max-w-[1500px] space-y-5 px-4 py-6 sm:px-6 lg:px-8">
      <section className="rounded-2xl border border-border bg-card p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Wizard del funnel</p>
        <h1 className="mt-1 text-2xl font-semibold">{funnel.name}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Paso {step} de 3: {step === 1 ? "Producto y divisa" : step === 2 ? "Editor visual drag & drop" : "Upsells, bundles y descuentos"}
        </p>
        <div className="mt-4 h-2 w-full rounded-full bg-secondary">
          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${step === 1 ? 33 : step === 2 ? 66 : 100}%` }} />
        </div>
      </section>

      {step === 1 ? (
        <section className="mx-auto w-full max-w-3xl rounded-2xl border border-border bg-card p-6">
          <h2 className="text-xl font-semibold">1) Producto (opcional)</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Puedes configurarlo ahora o omitir este paso si solo quieres crear una landing.
          </p>
          <div className="mt-4 space-y-3">
            <div className="space-y-2">
              <Label htmlFor="existing-product">Seleccionar producto existente (opcional)</Label>
              <select
                id="existing-product"
                value={selectedExistingProductId}
                onChange={(event) => {
                  setSelectedExistingProductId(event.target.value);
                  const selected = userProducts.find((item) => item.id === event.target.value);
                  if (!selected) return;
                  setProductName(selected.name);
                  setProductPrice(String(selected.price));
                  setProductType(selected.type);
                  setPaymentType(selected.payment_type);
                }}
                className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">Crear nuevo producto</option>
                {userProducts.filter((item) => item.funnel_id !== funnel.id).map((item) => (
                  <option key={item.id} value={item.id}>{item.name} ({item.funnel_name})</option>
                ))}
              </select>
            </div>
            <div className="space-y-2"><Label htmlFor="product-name">product_name</Label><Input id="product-name" value={productName} onChange={(e) => setProductName(e.target.value)} /></div>
            <div className="space-y-2"><Label htmlFor="product-price">price</Label><Input id="product-price" type="number" min="0" step="0.01" value={productPrice} onChange={(e) => setProductPrice(e.target.value)} /></div>
            <div className="grid gap-3 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="product-type">product_type</Label>
                <select id="product-type" value={productType} onChange={(e) => setProductType(e.target.value as ProductType)} className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <option value="physical">physical</option><option value="digital">digital</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="payment-type">payment_type</Label>
                <select id="payment-type" value={paymentType} onChange={(e) => setPaymentType(e.target.value as PaymentType)} className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <option value="stripe">stripe</option><option value="paypal">paypal</option><option value="cash_on_delivery">cash_on_delivery</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">divisa</Label>
                <select id="currency" value={currency} onChange={(e) => setCurrency(e.target.value as FunnelCurrency)} className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <option value="USD">USD</option><option value="EUR">EUR</option><option value="PEN">PEN</option>
                </select>
              </div>
            </div>
          </div>
          <Button
            type="button"
            className="mt-5 rounded-xl"
            disabled={!canContinue}
            onClick={() => {
              upsertFunnelProduct({ funnelId: funnel.id, name: productName, price: Number(productPrice), type: productType, paymentType });
              updateFunnelCurrency(funnel.id, currency);
              setStep(2);
              setRefreshKey((c) => c + 1);
            }}
          >
            Guardar producto y continuar
          </Button>
          <Button
            type="button"
            variant="outline"
            className="mt-3 rounded-xl"
            onClick={() => setStep(2)}
          >
            Omitir por ahora
          </Button>
        </section>
      ) : null}

      {step === 2 ? (
        <BuilderLandingEditorStep1
          funnelName={funnel.name}
          funnelSlug={funnel.slug}
          initialSections={landingSections}
          onSectionsChange={setLandingSections}
          onPersist={saveNowLanding}
          onBack={() => setStep(1)}
          onContinue={() => setStep(3)}
        />
      ) : null}

      {step === 3 && offers ? (
        <section className="mx-auto w-full max-w-4xl rounded-2xl border border-border bg-card p-6">
          <h2 className="text-xl font-semibold">3) Ofertas: upsells, bundles y descuentos</h2>
          <SaveStatus state={offersSaveState} at={lastOffersSavedAt} />
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <article className="rounded-xl border border-border bg-secondary/20 p-4">
              <label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" checked={offers.upsell_enabled} onChange={(e) => setOffers((c) => (c ? { ...c, upsell_enabled: e.target.checked } : c))} />Upsell</label>
              <div className="mt-3 space-y-2">
                <Input placeholder="Nombre upsell" value={offers.upsell_name} onChange={(e) => setOffers((c) => (c ? { ...c, upsell_name: e.target.value } : c))} />
                <Input type="number" min="0" step="0.01" placeholder="Precio upsell" value={offers.upsell_price} onChange={(e) => setOffers((c) => (c ? { ...c, upsell_price: Number(e.target.value) } : c))} />
              </div>
            </article>
            <article className="rounded-xl border border-border bg-secondary/20 p-4">
              <label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" checked={offers.bundle_enabled} onChange={(e) => setOffers((c) => (c ? { ...c, bundle_enabled: e.target.checked } : c))} />Bundle</label>
              <div className="mt-3 space-y-2">
                <Input placeholder="Nombre bundle" value={offers.bundle_name} onChange={(e) => setOffers((c) => (c ? { ...c, bundle_name: e.target.value } : c))} />
                <Input type="number" min="2" placeholder="Cantidad" value={offers.bundle_quantity} onChange={(e) => setOffers((c) => (c ? { ...c, bundle_quantity: Number(e.target.value) } : c))} />
                <Input type="number" min="0" max="100" placeholder="% descuento" value={offers.bundle_discount_percentage} onChange={(e) => setOffers((c) => (c ? { ...c, bundle_discount_percentage: Number(e.target.value) } : c))} />
              </div>
            </article>
            <article className="rounded-xl border border-border bg-secondary/20 p-4">
              <label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" checked={offers.discount_enabled} onChange={(e) => setOffers((c) => (c ? { ...c, discount_enabled: e.target.checked } : c))} />Descuento</label>
              <div className="mt-3 space-y-2">
                <Input type="number" min="0" max="100" placeholder="% descuento" value={offers.discount_percentage} onChange={(e) => setOffers((c) => (c ? { ...c, discount_percentage: Number(e.target.value) } : c))} />
                <Input placeholder="Codigo" value={offers.discount_code} onChange={(e) => setOffers((c) => (c ? { ...c, discount_code: e.target.value } : c))} />
              </div>
            </article>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <Button type="button" variant="outline" className="rounded-xl" onClick={() => setStep(2)}>Volver al editor</Button>
            <Button type="button" variant="outline" className="rounded-xl" onClick={saveNowOffers}>Guardar ahora</Button>
            <Button
              type="button"
              className="rounded-xl"
              onClick={handlePublishFunnel}
              disabled={publishState === "publishing"}
            >
              {publishState === "publishing" ? "Publicando..." : "Publicar funnel"}
            </Button>
          </div>
          {publishState === "published" && publishedAt ? (
            <p className="mt-3 text-sm text-emerald-400">
              Funnel publicado: {new Date(publishedAt).toLocaleString("es-PE")}
            </p>
          ) : null}
          {publishState === "error" ? (
            <p className="mt-3 text-sm text-destructive">
              No se pudo publicar el funnel. Intenta nuevamente.
            </p>
          ) : null}
        </section>
      ) : null}
    </main>
  );
}
