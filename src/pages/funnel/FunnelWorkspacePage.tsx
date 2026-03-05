import { useEffect, useMemo, useState } from "react";
import {
  DndContext,
  type DragEndEvent,
  PointerSensor,
  closestCenter,
  useDraggable,
  useDroppable,
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
import { AlertCircle, GripVertical, Monitor, Smartphone, Tablet } from "lucide-react";
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

type WizardStep = 1 | 2 | 3;
type DeviceMode = "desktop" | "tablet" | "mobile";
type SaveState = "idle" | "saving" | "saved" | "error";

const blockTypes: LandingBlockType[] = [
  "hero",
  "section",
  "headline",
  "text",
  "image",
  "video",
  "button",
  "testimonials",
  "faq",
  "cod_form",
  "footer",
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

function createBlock(type: LandingBlockType): LandingBlock {
  const id = `blk_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  if (type === "hero") {
    return { id, type, title: "Hero principal", subtitle: "Subtitulo", text: "Comprar ahora", href: "#checkout" };
  }
  if (type === "section") return { id, type, title: "Seccion", content: "Contenido" };
  if (type === "headline") return { id, type, content: "Titulo de alto impacto" };
  if (type === "text") return { id, type, content: "Texto descriptivo." };
  if (type === "image") return { id, type, src: "https://images.unsplash.com/photo-1523275335684-37898b6baf30" };
  if (type === "video") return { id, type, src: "https://www.youtube.com/embed/dQw4w9WgXcQ" };
  if (type === "button") return { id, type, text: "Comprar ahora", href: "#checkout" };
  if (type === "testimonials") return { id, type, content: "Cliente A: Excelente." };
  if (type === "faq") return { id, type, question: "Pregunta frecuente", answer: "Respuesta breve." };
  if (type === "cod_form") return { id, type, title: "Formulario COD", text: "Confirm Order" };
  return { id, type: "footer", content: "Copyright 2026 - Todos los derechos reservados." };
}

function SaveStatus({ state, at }: { state: SaveState; at: string | null }) {
  if (state === "saving") return <p className="text-xs text-muted-foreground">Guardando cambios...</p>;
  if (state === "error") return <p className="text-xs text-destructive">Error de guardado automatico</p>;
  if (state === "saved" && at)
    return <p className="text-xs text-muted-foreground">Guardado automatico {new Date(at).toLocaleTimeString("es-PE")}</p>;
  return <p className="text-xs text-muted-foreground">Sin cambios pendientes</p>;
}

function LibraryItem({ type }: { type: LandingBlockType }) {
  const { setNodeRef, listeners, attributes, isDragging } = useDraggable({ id: `lib-${type}` });
  return (
    <button
      ref={setNodeRef}
      type="button"
      className={cn(
        "w-full rounded-xl border border-border bg-card px-3 py-2 text-left text-sm hover:border-primary/40",
        isDragging ? "opacity-50" : "",
      )}
      {...listeners}
      {...attributes}
    >
      + {blockLabel[type]}
    </button>
  );
}

function CanvasCard({
  block,
  selected,
  onSelect,
  onDelete,
}: {
  block: LandingBlock;
  selected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}) {
  const { setNodeRef, transform, transition, attributes, listeners } = useSortable({ id: block.id });
  return (
    <article
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn("rounded-xl border bg-card p-3", selected ? "border-primary" : "border-border")}
      onClick={onSelect}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Mover bloque"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-secondary/20"
            {...listeners}
            {...attributes}
          >
            <GripVertical className="h-4 w-4" />
          </button>
          <span className="rounded-full border border-border bg-secondary/20 px-2 py-1 text-xs">{blockLabel[block.type]}</span>
        </div>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="rounded-lg text-destructive hover:text-destructive"
          onClick={(event) => {
            event.stopPropagation();
            onDelete();
          }}
        >
          Eliminar
        </Button>
      </div>
      <p className="text-sm text-foreground">{block.title || block.content || block.text || block.question || "Bloque visual"}</p>
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
  const [landingSaveState, setLandingSaveState] = useState<SaveState>("idle");
  const [offersSaveState, setOffersSaveState] = useState<SaveState>("idle");
  const [lastLandingSavedAt, setLastLandingSavedAt] = useState<string | null>(null);
  const [lastOffersSavedAt, setLastOffersSavedAt] = useState<string | null>(null);

  const funnel = useMemo(() => findFunnelById(funnelId), [funnelId, refreshKey]);
  const userProducts = useMemo(() => (user ? listUserProducts(user.uid) : []), [user, refreshKey]);
  const mobileOrders = useMemo(() => listOrders(funnelId), [funnelId, refreshKey]);
  const selectedBlock = useMemo(
    () => landingSections.find((item) => item.id === selectedBlockId) ?? null,
    [landingSections, selectedBlockId],
  );
  const { setNodeRef: setCanvasDropRef, isOver } = useDroppable({ id: "canvas-drop" });

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
  }, [funnel]);

  useEffect(() => {
    if (!funnel || isMobile || step !== 2) return;
    setLandingSaveState("saving");
    const timer = window.setTimeout(() => {
      try {
        saveLandingSections(funnel.id, landingSections);
        setLandingSaveState("saved");
        setLastLandingSavedAt(new Date().toISOString());
      } catch {
        setLandingSaveState("error");
      }
    }, 450);
    return () => window.clearTimeout(timer);
  }, [funnel, isMobile, landingSections, step]);

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

  const onDragEnd = (event: DragEndEvent) => {
    const active = String(event.active.id);
    const over = event.over ? String(event.over.id) : null;
    if (!over) return;

    if (active.startsWith("lib-")) {
      const type = active.replace("lib-", "") as LandingBlockType;
      const next = createBlock(type);
      setLandingSections((current) => {
        if (over === "canvas-drop") return [...current, next];
        const index = current.findIndex((item) => item.id === over);
        if (index < 0) return [...current, next];
        return [...current.slice(0, index), next, ...current.slice(index)];
      });
      setSelectedBlockId(next.id);
      return;
    }

    if (active === over) return;
    setLandingSections((current) => {
      const oldIndex = current.findIndex((item) => item.id === active);
      if (oldIndex < 0) return current;
      if (over === "canvas-drop") return arrayMove(current, oldIndex, current.length - 1);
      const newIndex = current.findIndex((item) => item.id === over);
      if (newIndex < 0) return current;
      return arrayMove(current, oldIndex, newIndex);
    });
  };

  const updateSelected = (patch: Partial<LandingBlock>) => {
    if (!selectedBlock) return;
    setLandingSections((current) => current.map((item) => (item.id === selectedBlock.id ? { ...item, ...patch } : item)));
  };

  const saveNowLanding = () => {
    try {
      saveLandingSections(funnel.id, landingSections);
      setLandingSaveState("saved");
      setLastLandingSavedAt(new Date().toISOString());
    } catch {
      setLandingSaveState("error");
    }
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
          <h2 className="text-xl font-semibold">1) Primero crea o selecciona producto</h2>
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
        </section>
      ) : null}

      {step === 2 ? (
        <section className="rounded-2xl border border-border bg-card p-3 lg:p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-secondary/20 px-3 py-2">
            <div>
              <p className="text-sm font-semibold">Editor visual de landing</p>
              <SaveStatus state={landingSaveState} at={lastLandingSavedAt} />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex rounded-lg border border-border bg-background p-1">
                <button type="button" className={cn("rounded-md px-2 py-1", deviceMode === "desktop" ? "bg-primary/15 text-primary" : "")} onClick={() => setDeviceMode("desktop")}><Monitor className="h-4 w-4" /></button>
                <button type="button" className={cn("rounded-md px-2 py-1", deviceMode === "tablet" ? "bg-primary/15 text-primary" : "")} onClick={() => setDeviceMode("tablet")}><Tablet className="h-4 w-4" /></button>
                <button type="button" className={cn("rounded-md px-2 py-1", deviceMode === "mobile" ? "bg-primary/15 text-primary" : "")} onClick={() => setDeviceMode("mobile")}><Smartphone className="h-4 w-4" /></button>
              </div>
              <Button type="button" variant="outline" size="sm" className="rounded-lg" onClick={saveNowLanding}>Guardar ahora</Button>
              <Button type="button" variant="outline" size="sm" className="rounded-lg" onClick={() => setStep(1)}>Volver</Button>
              <Button type="button" size="sm" className="rounded-lg" onClick={() => setStep(3)}>Continuar</Button>
            </div>
          </div>

          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <div className="grid gap-3 lg:grid-cols-[260px_minmax(0,1fr)_300px]">
              <aside className="rounded-xl border border-border bg-secondary/15 p-3">
                <p className="text-sm font-semibold">Build Your Page</p>
                <p className="mt-1 text-xs text-muted-foreground">Arrastra elementos al canvas.</p>
                <div className="mt-3 space-y-2">{blockTypes.map((type) => <LibraryItem key={type} type={type} />)}</div>
              </aside>

              <section className="rounded-xl border border-border bg-background p-3">
                <div
                  ref={setCanvasDropRef}
                  className={cn(
                    "min-h-[620px] rounded-xl border border-dashed p-3 transition-colors",
                    isOver ? "border-primary/60 bg-primary/5" : "border-border",
                    deviceMode === "desktop" ? "mx-auto max-w-[980px]" : deviceMode === "tablet" ? "mx-auto max-w-[760px]" : "mx-auto max-w-[420px]",
                  )}
                >
                  {landingSections.length ? (
                    <SortableContext items={landingSections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
                      <div className="space-y-3">
                        {landingSections.map((block) => (
                          <CanvasCard
                            key={block.id}
                            block={block}
                            selected={selectedBlockId === block.id}
                            onSelect={() => setSelectedBlockId(block.id)}
                            onDelete={() => {
                              setLandingSections((c) => c.filter((i) => i.id !== block.id));
                              if (selectedBlockId === block.id) setSelectedBlockId(null);
                            }}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  ) : (
                    <div className="flex min-h-[580px] items-center justify-center rounded-lg border border-dashed border-border text-sm text-muted-foreground">
                      Arrastra un bloque desde la izquierda.
                    </div>
                  )}
                </div>
              </section>

              <aside className="rounded-xl border border-border bg-secondary/15 p-3">
                <p className="text-sm font-semibold">Properties</p>
                {!selectedBlock ? (
                  <p className="mt-2 text-xs text-muted-foreground">Selecciona un bloque del canvas.</p>
                ) : (
                  <div className="mt-3 space-y-2">
                    <div className="rounded-lg border border-border bg-card px-2 py-1 text-xs">{blockLabel[selectedBlock.type]}</div>

                    {(selectedBlock.type === "hero" || selectedBlock.type === "section" || selectedBlock.type === "cod_form") && (
                      <>
                        <Label htmlFor="prop-title">Titulo</Label>
                        <Input id="prop-title" value={selectedBlock.title ?? ""} onChange={(e) => updateSelected({ title: e.target.value })} />
                      </>
                    )}
                    {selectedBlock.type === "hero" && (
                      <>
                        <Label htmlFor="prop-sub">Subtitulo</Label>
                        <Textarea id="prop-sub" value={selectedBlock.subtitle ?? ""} onChange={(e) => updateSelected({ subtitle: e.target.value })} />
                        <Label htmlFor="prop-htxt">Texto boton</Label>
                        <Input id="prop-htxt" value={selectedBlock.text ?? ""} onChange={(e) => updateSelected({ text: e.target.value })} />
                        <Label htmlFor="prop-hlnk">Enlace boton</Label>
                        <Input id="prop-hlnk" value={selectedBlock.href ?? ""} onChange={(e) => updateSelected({ href: e.target.value })} />
                      </>
                    )}
                    {(selectedBlock.type === "section" || selectedBlock.type === "headline" || selectedBlock.type === "text" || selectedBlock.type === "testimonials" || selectedBlock.type === "footer") && (
                      <>
                        <Label htmlFor="prop-content">Contenido</Label>
                        <Textarea id="prop-content" value={selectedBlock.content ?? ""} onChange={(e) => updateSelected({ content: e.target.value })} />
                      </>
                    )}
                    {(selectedBlock.type === "image" || selectedBlock.type === "video") && (
                      <>
                        <Label htmlFor="prop-src">URL</Label>
                        <Input id="prop-src" value={selectedBlock.src ?? ""} onChange={(e) => updateSelected({ src: e.target.value })} />
                      </>
                    )}
                    {selectedBlock.type === "button" && (
                      <>
                        <Label htmlFor="prop-btxt">Texto</Label>
                        <Input id="prop-btxt" value={selectedBlock.text ?? ""} onChange={(e) => updateSelected({ text: e.target.value })} />
                        <Label htmlFor="prop-blnk">Enlace</Label>
                        <Input id="prop-blnk" value={selectedBlock.href ?? ""} onChange={(e) => updateSelected({ href: e.target.value })} />
                      </>
                    )}
                    {selectedBlock.type === "faq" && (
                      <>
                        <Label htmlFor="prop-q">Pregunta</Label>
                        <Input id="prop-q" value={selectedBlock.question ?? ""} onChange={(e) => updateSelected({ question: e.target.value })} />
                        <Label htmlFor="prop-a">Respuesta</Label>
                        <Textarea id="prop-a" value={selectedBlock.answer ?? ""} onChange={(e) => updateSelected({ answer: e.target.value })} />
                      </>
                    )}
                    {selectedBlock.type === "cod_form" && (
                      <>
                        <Label htmlFor="prop-codtxt">Texto boton</Label>
                        <Input id="prop-codtxt" value={selectedBlock.text ?? ""} onChange={(e) => updateSelected({ text: e.target.value })} />
                      </>
                    )}
                  </div>
                )}
              </aside>
            </div>
          </DndContext>
        </section>
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
              onClick={() => {
                saveNowLanding();
                saveNowOffers();
                setFunnelPublished(funnel.id, true);
              }}
            >
              Publicar funnel
            </Button>
          </div>
        </section>
      ) : null}
    </main>
  );
}
