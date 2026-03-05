import { useEffect, useMemo, useState } from "react";
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors } from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/lib/auth";
import {
  findFunnelById,
  getFunnelOffers,
  getFunnelProduct,
  getLandingSections,
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

type WizardStep = 1 | 2 | 3;

const quickBlocks: LandingBlockType[] = [
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
  section: "Seccion",
  headline: "Headline",
  text: "Texto",
  image: "Imagen",
  video: "Video",
  button: "Boton",
  testimonials: "Testimonios",
  faq: "FAQ",
  cod_form: "Form COD",
  footer: "Footer",
};

function createBlock(type: LandingBlockType): LandingBlock {
  const id = `blk_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  if (type === "hero") {
    return {
      id,
      type,
      title: "Hero principal",
      subtitle: "Texto de apoyo para convencer al cliente.",
      text: "Comprar ahora",
      href: "#checkout",
    };
  }
  if (type === "section") {
    return { id, type, title: "Seccion", content: "Contenido de la seccion" };
  }
  if (type === "headline") {
    return { id, type, content: "Titulo de alto impacto" };
  }
  if (type === "text") {
    return { id, type, content: "Texto descriptivo del producto." };
  }
  if (type === "image") {
    return { id, type, src: "https://images.unsplash.com/photo-1523275335684-37898b6baf30" };
  }
  if (type === "video") {
    return { id, type, src: "https://www.youtube.com/embed/dQw4w9WgXcQ" };
  }
  if (type === "button") {
    return { id, type, text: "Comprar ahora", href: "#checkout" };
  }
  if (type === "testimonials") {
    return { id, type, content: "Cliente A: Excelente.\nCliente B: Recomendado." };
  }
  if (type === "faq") {
    return { id, type, question: "Pregunta frecuente", answer: "Respuesta clara y corta." };
  }
  if (type === "cod_form") {
    return { id, type, title: "Formulario COD", text: "Confirm Order" };
  }
  return { id, type: "footer", content: "Copyright 2026 - Todos los derechos reservados." };
}

interface SortableBlockCardProps {
  block: LandingBlock;
  onChange: (patch: Partial<LandingBlock>) => void;
  onRemove: () => void;
}

function SortableBlockCard({ block, onChange, onRemove }: SortableBlockCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: block.id,
  });

  return (
    <article
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className="rounded-xl border border-border bg-secondary/20 p-4"
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background"
            {...attributes}
            {...listeners}
            aria-label="Arrastrar bloque"
          >
            <GripVertical className="h-4 w-4" />
          </button>
          <span className="rounded-full border border-border bg-background px-2 py-1 text-xs font-medium">
            {blockLabel[block.type]}
          </span>
        </div>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="rounded-lg text-destructive hover:text-destructive"
          onClick={onRemove}
        >
          Eliminar
        </Button>
      </div>

      {(block.type === "hero" || block.type === "section" || block.type === "cod_form") && (
        <div className="space-y-2">
          <Label htmlFor={`${block.id}-title`}>Titulo</Label>
          <Input
            id={`${block.id}-title`}
            className="rounded-xl"
            value={block.title ?? ""}
            onChange={(event) => onChange({ title: event.target.value })}
          />
        </div>
      )}

      {block.type === "hero" && (
        <div className="mt-3 space-y-3">
          <div className="space-y-2">
            <Label htmlFor={`${block.id}-subtitle`}>Subtitulo</Label>
            <Textarea
              id={`${block.id}-subtitle`}
              className="rounded-xl"
              value={block.subtitle ?? ""}
              onChange={(event) => onChange({ subtitle: event.target.value })}
            />
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor={`${block.id}-text`}>Texto boton</Label>
              <Input
                id={`${block.id}-text`}
                className="rounded-xl"
                value={block.text ?? ""}
                onChange={(event) => onChange({ text: event.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${block.id}-href`}>Enlace boton</Label>
              <Input
                id={`${block.id}-href`}
                className="rounded-xl"
                value={block.href ?? ""}
                onChange={(event) => onChange({ href: event.target.value })}
              />
            </div>
          </div>
        </div>
      )}

      {(block.type === "section" ||
        block.type === "headline" ||
        block.type === "text" ||
        block.type === "testimonials" ||
        block.type === "footer") && (
        <div className="mt-3 space-y-2">
          <Label htmlFor={`${block.id}-content`}>Contenido</Label>
          <Textarea
            id={`${block.id}-content`}
            className="rounded-xl"
            value={block.content ?? ""}
            onChange={(event) => onChange({ content: event.target.value })}
          />
        </div>
      )}

      {(block.type === "image" || block.type === "video") && (
        <div className="mt-3 space-y-2">
          <Label htmlFor={`${block.id}-src`}>URL</Label>
          <Input
            id={`${block.id}-src`}
            className="rounded-xl"
            value={block.src ?? ""}
            onChange={(event) => onChange({ src: event.target.value })}
          />
        </div>
      )}

      {block.type === "button" && (
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor={`${block.id}-button-text`}>Texto</Label>
            <Input
              id={`${block.id}-button-text`}
              className="rounded-xl"
              value={block.text ?? ""}
              onChange={(event) => onChange({ text: event.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${block.id}-button-href`}>Enlace</Label>
            <Input
              id={`${block.id}-button-href`}
              className="rounded-xl"
              value={block.href ?? ""}
              onChange={(event) => onChange({ href: event.target.value })}
            />
          </div>
        </div>
      )}

      {block.type === "faq" && (
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor={`${block.id}-question`}>Pregunta</Label>
            <Input
              id={`${block.id}-question`}
              className="rounded-xl"
              value={block.question ?? ""}
              onChange={(event) => onChange({ question: event.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${block.id}-answer`}>Respuesta</Label>
            <Input
              id={`${block.id}-answer`}
              className="rounded-xl"
              value={block.answer ?? ""}
              onChange={(event) => onChange({ answer: event.target.value })}
            />
          </div>
        </div>
      )}

      {block.type === "cod_form" && (
        <div className="mt-3 space-y-2">
          <Label htmlFor={`${block.id}-cod-button`}>Texto boton</Label>
          <Input
            id={`${block.id}-cod-button`}
            className="rounded-xl"
            value={block.text ?? ""}
            onChange={(event) => onChange({ text: event.target.value })}
          />
        </div>
      )}
    </article>
  );
}

export default function FunnelWorkspacePage() {
  const { funnelId = "" } = useParams();
  const { user } = useAuth();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));
  const [step, setStep] = useState<WizardStep>(1);
  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState("0");
  const [productType, setProductType] = useState<ProductType>("physical");
  const [paymentType, setPaymentType] = useState<PaymentType>("cash_on_delivery");
  const [currency, setCurrency] = useState<FunnelCurrency>("USD");
  const [selectedExistingProductId, setSelectedExistingProductId] = useState("");
  const [landingSections, setLandingSections] = useState<LandingBlock[]>([]);
  const [offers, setOffers] = useState<FunnelOfferRow | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const funnel = useMemo(() => findFunnelById(funnelId), [funnelId, refreshKey]);
  const userProducts = useMemo(() => (user ? listUserProducts(user.uid) : []), [user, refreshKey]);

  useEffect(() => {
    if (!funnel) {
      return;
    }

    const product = getFunnelProduct(funnel.id);
    if (product) {
      setProductName(product.name);
      setProductPrice(String(product.price));
      setProductType(product.type);
      setPaymentType(product.payment_type);
    } else {
      setProductName("");
      setProductPrice("0");
      setProductType("physical");
      setPaymentType("cash_on_delivery");
    }

    setCurrency(funnel.currency || "USD");
    setLandingSections(getLandingSections(funnel.id));
    setOffers(getFunnelOffers(funnel.id));
  }, [funnel]);

  if (!funnel) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 py-8">
        <div className="rounded-2xl border border-border bg-card p-6">
          <h1 className="text-xl font-semibold">Funnel no encontrado</h1>
          <p className="mt-2 text-sm text-muted-foreground">El funnel fue eliminado o no existe.</p>
          <Button asChild className="mt-4 rounded-xl">
            <Link to="/funnels">Volver a funnels</Link>
          </Button>
        </div>
      </main>
    );
  }

  const canContinueFromProductStep = Boolean(productName.trim()) && Number(productPrice) > 0;

  const handleApplyExistingProduct = (productId: string) => {
    setSelectedExistingProductId(productId);
    const selectedProduct = userProducts.find((item) => item.id === productId);

    if (!selectedProduct) {
      return;
    }

    setProductName(selectedProduct.name);
    setProductPrice(String(selectedProduct.price));
    setProductType(selectedProduct.type);
    setPaymentType(selectedProduct.payment_type);
  };

  const handleSaveProductStep = () => {
    if (!canContinueFromProductStep) {
      return;
    }

    upsertFunnelProduct({
      funnelId: funnel.id,
      name: productName,
      price: Number(productPrice),
      type: productType,
      paymentType,
    });
    updateFunnelCurrency(funnel.id, currency);
    setStep(2);
    setRefreshKey((current) => current + 1);
  };

  const handleDragEnd = (event: { active: { id: string | number }; over: { id: string | number } | null }) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    setLandingSections((current) => {
      const oldIndex = current.findIndex((item) => item.id === active.id);
      const newIndex = current.findIndex((item) => item.id === over.id);

      if (oldIndex < 0 || newIndex < 0) {
        return current;
      }

      return arrayMove(current, oldIndex, newIndex);
    });
  };

  const handleSaveLandingStep = () => {
    saveLandingSections(funnel.id, landingSections);
    setStep(3);
    setRefreshKey((current) => current + 1);
  };

  const handleSaveOffersStep = () => {
    if (!offers) {
      return;
    }

    saveFunnelOffers(funnel.id, offers);
    setRefreshKey((current) => current + 1);
  };

  return (
    <main className="mx-auto w-full max-w-7xl space-y-5 px-4 py-6 sm:px-6 lg:px-8">
      <section className="rounded-2xl border border-border bg-card p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Wizard del funnel
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-foreground">{funnel.name}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Paso {step} de 3:{" "}
          {step === 1
            ? "Producto y divisa"
            : step === 2
              ? "Editor Landing drag & drop"
              : "Upsells, bundles y descuentos"}
        </p>
        <div className="mt-4 h-2 w-full rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${step === 1 ? 33 : step === 2 ? 66 : 100}%` }}
          />
        </div>
      </section>

      {step === 1 ? (
        <section className="mx-auto w-full max-w-3xl rounded-2xl border border-border bg-card p-6">
          <h2 className="text-xl font-semibold">1) Primero crea o selecciona producto</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Este bloque va primero para guiar al cliente paso a paso.
          </p>

          <div className="mt-4 space-y-3">
            <div className="space-y-2">
              <Label htmlFor="existing-product">Seleccionar producto existente (opcional)</Label>
              <select
                id="existing-product"
                value={selectedExistingProductId}
                onChange={(event) => handleApplyExistingProduct(event.target.value)}
                className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">Crear nuevo producto</option>
                {userProducts
                  .filter((item) => item.funnel_id !== funnel.id)
                  .map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} ({item.funnel_name})
                    </option>
                  ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="product-name">product_name</Label>
              <Input
                id="product-name"
                value={productName}
                onChange={(event) => setProductName(event.target.value)}
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="product-price">price</Label>
              <Input
                id="product-price"
                type="number"
                min="0"
                step="0.01"
                value={productPrice}
                onChange={(event) => setProductPrice(event.target.value)}
                className="rounded-xl"
              />
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="product-type">product_type</Label>
                <select
                  id="product-type"
                  value={productType}
                  onChange={(event) => setProductType(event.target.value as ProductType)}
                  className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="physical">physical</option>
                  <option value="digital">digital</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="payment-type">payment_type</Label>
                <select
                  id="payment-type"
                  value={paymentType}
                  onChange={(event) => setPaymentType(event.target.value as PaymentType)}
                  className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="stripe">stripe</option>
                  <option value="paypal">paypal</option>
                  <option value="cash_on_delivery">cash_on_delivery</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">divisa</Label>
                <select
                  id="currency"
                  value={currency}
                  onChange={(event) => setCurrency(event.target.value as FunnelCurrency)}
                  className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="PEN">PEN</option>
                </select>
              </div>
            </div>
          </div>

          <Button
            type="button"
            className="mt-5 rounded-xl"
            disabled={!canContinueFromProductStep}
            onClick={handleSaveProductStep}
          >
            Guardar producto y continuar
          </Button>
        </section>
      ) : null}

      {step === 2 ? (
        <section className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
          <article className="rounded-2xl border border-border bg-card p-5">
            <h2 className="text-xl font-semibold">2) Editor de Landing (drag & drop)</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Arrastra bloques para ordenar la pagina y edita su contenido.
            </p>

            <div className="mt-4">
              <p className="text-sm font-semibold text-foreground">Agregar bloques</p>
              <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {quickBlocks.map((type) => (
                  <Button
                    key={type}
                    type="button"
                    variant="outline"
                    className="justify-start rounded-xl"
                    onClick={() => setLandingSections((current) => [...current, createBlock(type)])}
                  >
                    + {blockLabel[type]}
                  </Button>
                ))}
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {landingSections.length ? (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext
                    items={landingSections.map((section) => section.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {landingSections.map((block) => (
                      <SortableBlockCard
                        key={block.id}
                        block={block}
                        onChange={(patch) =>
                          setLandingSections((current) =>
                            current.map((item) => (item.id === block.id ? { ...item, ...patch } : item)),
                          )
                        }
                        onRemove={() =>
                          setLandingSections((current) => current.filter((item) => item.id !== block.id))
                        }
                      />
                    ))}
                  </SortableContext>
                </DndContext>
              ) : (
                <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                  Agrega el primer bloque para empezar.
                </p>
              )}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Button type="button" variant="outline" className="rounded-xl" onClick={() => setStep(1)}>
                Volver
              </Button>
              <Button type="button" className="rounded-xl" onClick={handleSaveLandingStep}>
                Guardar landing y continuar
              </Button>
            </div>
          </article>

          <aside className="rounded-2xl border border-border bg-card p-5">
            <h3 className="text-lg font-semibold">Vista previa rapida</h3>
            <p className="mt-1 text-sm text-muted-foreground">Orden que vera el cliente.</p>
            <div className="mt-4 space-y-3">
              {landingSections.map((block) => (
                <div key={`preview-${block.id}`} className="rounded-xl border border-border bg-secondary/20 p-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                    {blockLabel[block.type]}
                  </p>
                  <p className="mt-1 text-sm text-foreground">
                    {block.title || block.content || block.text || block.question || "Bloque sin texto"}
                  </p>
                </div>
              ))}
            </div>
          </aside>
        </section>
      ) : null}

      {step === 3 && offers ? (
        <section className="mx-auto w-full max-w-4xl rounded-2xl border border-border bg-card p-6">
          <h2 className="text-xl font-semibold">3) Ofertas: upsells, bundles y descuentos</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Configura opciones comerciales despues de terminar el producto y la landing.
          </p>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <article className="rounded-xl border border-border bg-secondary/20 p-4">
              <label className="flex items-center gap-2 text-sm font-medium">
                <input
                  type="checkbox"
                  checked={offers.upsell_enabled}
                  onChange={(event) =>
                    setOffers((current) =>
                      current ? { ...current, upsell_enabled: event.target.checked } : current,
                    )
                  }
                />
                Upsell
              </label>
              <div className="mt-3 space-y-2">
                <Input
                  placeholder="Nombre upsell"
                  value={offers.upsell_name}
                  onChange={(event) =>
                    setOffers((current) => (current ? { ...current, upsell_name: event.target.value } : current))
                  }
                />
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Precio upsell"
                  value={offers.upsell_price}
                  onChange={(event) =>
                    setOffers((current) =>
                      current ? { ...current, upsell_price: Number(event.target.value) } : current,
                    )
                  }
                />
              </div>
            </article>

            <article className="rounded-xl border border-border bg-secondary/20 p-4">
              <label className="flex items-center gap-2 text-sm font-medium">
                <input
                  type="checkbox"
                  checked={offers.bundle_enabled}
                  onChange={(event) =>
                    setOffers((current) =>
                      current ? { ...current, bundle_enabled: event.target.checked } : current,
                    )
                  }
                />
                Bundle
              </label>
              <div className="mt-3 space-y-2">
                <Input
                  placeholder="Nombre bundle"
                  value={offers.bundle_name}
                  onChange={(event) =>
                    setOffers((current) => (current ? { ...current, bundle_name: event.target.value } : current))
                  }
                />
                <Input
                  type="number"
                  min="2"
                  placeholder="Cantidad"
                  value={offers.bundle_quantity}
                  onChange={(event) =>
                    setOffers((current) =>
                      current ? { ...current, bundle_quantity: Number(event.target.value) } : current,
                    )
                  }
                />
                <Input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="% descuento"
                  value={offers.bundle_discount_percentage}
                  onChange={(event) =>
                    setOffers((current) =>
                      current
                        ? { ...current, bundle_discount_percentage: Number(event.target.value) }
                        : current,
                    )
                  }
                />
              </div>
            </article>

            <article className="rounded-xl border border-border bg-secondary/20 p-4">
              <label className="flex items-center gap-2 text-sm font-medium">
                <input
                  type="checkbox"
                  checked={offers.discount_enabled}
                  onChange={(event) =>
                    setOffers((current) =>
                      current ? { ...current, discount_enabled: event.target.checked } : current,
                    )
                  }
                />
                Descuento
              </label>
              <div className="mt-3 space-y-2">
                <Input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="% descuento"
                  value={offers.discount_percentage}
                  onChange={(event) =>
                    setOffers((current) =>
                      current ? { ...current, discount_percentage: Number(event.target.value) } : current,
                    )
                  }
                />
                <Input
                  placeholder="Codigo"
                  value={offers.discount_code}
                  onChange={(event) =>
                    setOffers((current) => (current ? { ...current, discount_code: event.target.value } : current))
                  }
                />
              </div>
            </article>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <Button type="button" variant="outline" className="rounded-xl" onClick={() => setStep(2)}>
              Volver al editor
            </Button>
            <Button type="button" className="rounded-xl" onClick={handleSaveOffersStep}>
              Guardar ofertas
            </Button>
            <Button
              type="button"
              variant="outline"
              className="rounded-xl"
              onClick={() => setFunnelPublished(funnel.id, true)}
            >
              Publicar funnel
            </Button>
          </div>
        </section>
      ) : null}
    </main>
  );
}
