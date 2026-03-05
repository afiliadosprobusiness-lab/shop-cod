import { useEffect, useMemo, useState } from "react";
import { ExternalLink, Plus } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  findFunnelById,
  getFunnelProduct,
  getLandingSections,
  saveLandingSections,
  setFunnelPublished,
  upsertFunnelProduct,
  type LandingBlock,
  type LandingBlockType,
  type PaymentType,
  type ProductType,
} from "@/lib/funnel-system";

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
    return {
      id,
      type,
      title: "Seccion de beneficios",
      content: "Beneficio 1\nBeneficio 2\nBeneficio 3",
    };
  }

  if (type === "headline") {
    return {
      id,
      type,
      content: "Titular de alto impacto",
    };
  }

  if (type === "text") {
    return {
      id,
      type,
      content: "Descripcion corta del producto.",
    };
  }

  if (type === "image") {
    return {
      id,
      type,
      src: "https://images.unsplash.com/photo-1523275335684-37898b6baf30",
    };
  }

  if (type === "video") {
    return {
      id,
      type,
      src: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    };
  }

  if (type === "button") {
    return {
      id,
      type,
      text: "Comprar ahora",
      href: "#checkout",
    };
  }

  if (type === "testimonials") {
    return {
      id,
      type,
      content: "Cliente A: Excelente producto.\nCliente B: Muy recomendado.",
    };
  }

  if (type === "faq") {
    return {
      id,
      type,
      question: "Pregunta frecuente",
      answer: "Respuesta breve y clara.",
    };
  }

  if (type === "cod_form") {
    return {
      id,
      type,
      title: "Formulario COD",
      text: "Confirm Order",
    };
  }

  return {
    id,
    type: "footer",
    content: "Copyright 2026 - Todos los derechos reservados.",
  };
}

export default function FunnelWorkspacePage() {
  const { funnelId = "" } = useParams();
  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState("0");
  const [productType, setProductType] = useState<ProductType>("physical");
  const [paymentType, setPaymentType] = useState<PaymentType>("cash_on_delivery");
  const [landingSections, setLandingSections] = useState<LandingBlock[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const funnel = useMemo(() => findFunnelById(funnelId), [funnelId, refreshKey]);

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

    setLandingSections(getLandingSections(funnel.id));
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

  const publicBase = `/f/${funnel.slug}`;

  const handleSaveProduct = () => {
    upsertFunnelProduct({
      funnelId: funnel.id,
      name: productName,
      price: Number(productPrice),
      type: productType,
      paymentType,
    });
    setRefreshKey((current) => current + 1);
  };

  const handleSaveLanding = () => {
    saveLandingSections(funnel.id, landingSections);
    setRefreshKey((current) => current + 1);
  };

  const handlePublishToggle = () => {
    setFunnelPublished(funnel.id, !funnel.published_at);
    setRefreshKey((current) => current + 1);
  };

  const updateBlock = (blockId: string, patch: Partial<LandingBlock>) => {
    setLandingSections((current) =>
      current.map((entry) => (entry.id === blockId ? { ...entry, ...patch } : entry)),
    );
  };

  return (
    <main className="mx-auto w-full max-w-7xl space-y-5 px-4 py-6 sm:px-6 lg:px-8">
      <section className="rounded-2xl border border-border bg-card p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Editor del Funnel
            </p>
            <h1 className="truncate text-2xl font-semibold text-foreground">{funnel.name}</h1>
            <p className="text-sm text-muted-foreground">/{funnel.slug}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button type="button" variant="outline" className="rounded-xl" onClick={handlePublishToggle}>
              {funnel.published_at ? "Despublicar" : "Publicar Funnel"}
            </Button>
            <Button asChild variant="ghost" className="rounded-xl" disabled={!funnel.published_at}>
              <Link to={publicBase} target="_blank">
                Ver landing
                <ExternalLink className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <article className="rounded-2xl border border-border bg-card p-5">
          <h2 className="text-lg font-semibold">Producto (uno por funnel)</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Este producto alimenta automaticamente el checkout.
          </p>
          <div className="mt-4 space-y-3">
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
            <div className="grid gap-3 md:grid-cols-2">
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
            </div>
          </div>
          <Button type="button" className="mt-4 rounded-xl" onClick={handleSaveProduct}>
            Guardar producto
          </Button>
        </article>

        <article className="rounded-2xl border border-border bg-card p-5">
          <h2 className="text-lg font-semibold">Rutas del funnel</h2>
          <div className="mt-3 space-y-2 text-sm">
            <p>
              Landing: <span className="font-mono">{publicBase}</span>
            </p>
            <p>
              Checkout: <span className="font-mono">{publicBase}/checkout</span>
            </p>
            <p>
              Thank you: <span className="font-mono">{publicBase}/thank-you</span>
            </p>
          </div>
        </article>
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <article className="rounded-2xl border border-border bg-card p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Editor de Landing (facil y entendible)</h2>
              <p className="text-sm text-muted-foreground">
                Agrega bloques y edita campos sin complejidad tecnica.
              </p>
            </div>
            <Button type="button" className="rounded-xl" onClick={handleSaveLanding}>
              Guardar landing
            </Button>
          </div>

          <div className="mt-4">
            <p className="text-sm font-semibold text-foreground">Bloques rapidos</p>
            <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {quickBlocks.map((type) => (
                <Button
                  key={type}
                  type="button"
                  variant="outline"
                  className="justify-start rounded-xl"
                  onClick={() => setLandingSections((current) => [...current, createBlock(type)])}
                >
                  <Plus className="h-4 w-4" />
                  {blockLabel[type]}
                </Button>
              ))}
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {landingSections.length ? (
              landingSections.map((block, index) => (
                <article key={block.id} className="rounded-xl border border-border bg-secondary/20 p-4">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <span className="rounded-full border border-border bg-background px-2 py-1 text-xs font-medium">
                      {index + 1}. {blockLabel[block.type]}
                    </span>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="rounded-lg"
                        disabled={index === 0}
                        onClick={() =>
                          setLandingSections((current) => {
                            const next = [...current];
                            [next[index - 1], next[index]] = [next[index], next[index - 1]];
                            return next;
                          })
                        }
                      >
                        Subir
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="rounded-lg"
                        disabled={index === landingSections.length - 1}
                        onClick={() =>
                          setLandingSections((current) => {
                            const next = [...current];
                            [next[index + 1], next[index]] = [next[index], next[index + 1]];
                            return next;
                          })
                        }
                      >
                        Bajar
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="rounded-lg text-destructive hover:text-destructive"
                        onClick={() =>
                          setLandingSections((current) => current.filter((entry) => entry.id !== block.id))
                        }
                      >
                        Eliminar
                      </Button>
                    </div>
                  </div>

                  {(block.type === "hero" || block.type === "section" || block.type === "cod_form") && (
                    <div className="space-y-2">
                      <Label htmlFor={`${block.id}-title`}>Titulo</Label>
                      <Input
                        id={`${block.id}-title`}
                        className="rounded-xl"
                        value={block.title ?? ""}
                        onChange={(event) => updateBlock(block.id, { title: event.target.value })}
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
                          onChange={(event) => updateBlock(block.id, { subtitle: event.target.value })}
                        />
                      </div>
                      <div className="grid gap-3 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor={`${block.id}-text`}>Texto del boton</Label>
                          <Input
                            id={`${block.id}-text`}
                            className="rounded-xl"
                            value={block.text ?? ""}
                            onChange={(event) => updateBlock(block.id, { text: event.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`${block.id}-href`}>Enlace del boton</Label>
                          <Input
                            id={`${block.id}-href`}
                            className="rounded-xl"
                            value={block.href ?? ""}
                            onChange={(event) => updateBlock(block.id, { href: event.target.value })}
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
                        onChange={(event) => updateBlock(block.id, { content: event.target.value })}
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
                        onChange={(event) => updateBlock(block.id, { src: event.target.value })}
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
                          onChange={(event) => updateBlock(block.id, { text: event.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`${block.id}-button-href`}>Enlace</Label>
                        <Input
                          id={`${block.id}-button-href`}
                          className="rounded-xl"
                          value={block.href ?? ""}
                          onChange={(event) => updateBlock(block.id, { href: event.target.value })}
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
                          onChange={(event) => updateBlock(block.id, { question: event.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`${block.id}-answer`}>Respuesta</Label>
                        <Input
                          id={`${block.id}-answer`}
                          className="rounded-xl"
                          value={block.answer ?? ""}
                          onChange={(event) => updateBlock(block.id, { answer: event.target.value })}
                        />
                      </div>
                    </div>
                  )}

                  {block.type === "cod_form" && (
                    <div className="mt-3 space-y-2">
                      <Label htmlFor={`${block.id}-cod-button`}>Texto del boton</Label>
                      <Input
                        id={`${block.id}-cod-button`}
                        className="rounded-xl"
                        value={block.text ?? ""}
                        onChange={(event) => updateBlock(block.id, { text: event.target.value })}
                      />
                    </div>
                  )}
                </article>
              ))
            ) : (
              <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                Todavia no hay bloques en la landing.
              </p>
            )}
          </div>
        </article>

        <aside className="rounded-2xl border border-border bg-card p-5">
          <h3 className="text-lg font-semibold">Vista previa rapida</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Orden de bloques que vera el cliente final.
          </p>
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
            {!landingSections.length ? (
              <p className="text-sm text-muted-foreground">Sin bloques para previsualizar.</p>
            ) : null}
          </div>
        </aside>
      </section>
    </main>
  );
}
