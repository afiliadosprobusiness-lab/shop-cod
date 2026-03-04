import { useEffect, useMemo, useState } from "react";
import { Layers3, Plus, TicketPercent, Trash2 } from "lucide-react";
import { toast } from "sonner";
import MainContent from "@/components/dashboard/MainContent";
import { subscribeToShopcodData } from "@/lib/live-sync";
import {
  deleteOffer,
  loadOffers,
  saveBundleOffer,
  saveDiscountOffer,
  type PlatformOffer,
} from "@/lib/platform-data";
import { loadProducts } from "@/lib/products";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "PEN",
    maximumFractionDigits: 2,
  }).format(value);
}

export default function OffersPage() {
  const [offers, setOffers] = useState<PlatformOffer[]>(() => loadOffers());
  const [products, setProducts] = useState(() => loadProducts());
  const [bundleName, setBundleName] = useState("");
  const [bundleDescription, setBundleDescription] = useState("");
  const [bundlePrice, setBundlePrice] = useState("0");
  const [bundleProducts, setBundleProducts] = useState<string[]>([]);
  const [discountName, setDiscountName] = useState("");
  const [discountCode, setDiscountCode] = useState("");
  const [discountDescription, setDiscountDescription] = useState("");
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">("percentage");
  const [discountValue, setDiscountValue] = useState("10");

  useEffect(() => {
    return subscribeToShopcodData(() => {
      setOffers(loadOffers());
      setProducts(loadProducts());
    });
  }, []);

  const bundleCount = useMemo(
    () => offers.filter((offer) => offer.type === "bundle").length,
    [offers],
  );
  const discountCount = useMemo(
    () => offers.filter((offer) => offer.type === "discount").length,
    [offers],
  );

  const toggleBundleProduct = (productId: string) => {
    setBundleProducts((current) =>
      current.includes(productId)
        ? current.filter((item) => item !== productId)
        : [...current, productId],
    );
  };

  const handleCreateBundle = () => {
    if (!bundleProducts.length) {
      toast.error("Selecciona al menos un producto para el bundle.");
      return;
    }

    const nextOffer = saveBundleOffer({
      name: bundleName,
      description: bundleDescription,
      productIds: bundleProducts,
      bundlePrice: Number(bundlePrice) || 0,
    });

    setOffers(loadOffers());
    setBundleName("");
    setBundleDescription("");
    setBundlePrice("0");
    setBundleProducts([]);
    toast.success("Bundle creado.", {
      description: `${nextOffer.name} ya aparece en tu catalogo de ofertas.`,
    });
  };

  const handleCreateDiscount = () => {
    const nextOffer = saveDiscountOffer({
      name: discountName,
      code: discountCode,
      description: discountDescription,
      discountType,
      value: Number(discountValue) || 0,
    });

    setOffers(loadOffers());
    setDiscountName("");
    setDiscountCode("");
    setDiscountDescription("");
    setDiscountType("percentage");
    setDiscountValue("10");
    toast.success("Descuento creado.", {
      description: `${nextOffer.code} ya esta listo para usarse.`,
    });
  };

  const handleDeleteOffer = (offerId: string) => {
    setOffers(deleteOffer(offerId));
    toast.success("Oferta eliminada.");
  };

  return (
    <MainContent
      eyebrow="Promociones"
      title="Ofertas"
      description="Crea bundles y descuentos desde el panel para aumentar ticket promedio y conversion."
    >
      <section className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-[1.75rem] border border-border/80 bg-card/90 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Ofertas activas
          </p>
          <p className="mt-3 text-3xl font-semibold text-foreground">{offers.length}</p>
        </div>
        <div className="rounded-[1.75rem] border border-border/80 bg-card/90 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Bundles
          </p>
          <p className="mt-3 text-3xl font-semibold text-foreground">{bundleCount}</p>
        </div>
        <div className="rounded-[1.75rem] border border-border/80 bg-card/90 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Descuentos
          </p>
          <p className="mt-3 text-3xl font-semibold text-foreground">{discountCount}</p>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <article className="rounded-[2rem] border border-border/80 bg-card/90 p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Layers3 className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                Ofertas de paquetes
              </p>
              <p className="text-lg font-semibold text-foreground">Crear bundle</p>
            </div>
          </div>

          <div className="mt-5 space-y-4">
            <input
              value={bundleName}
              onChange={(event) => setBundleName(event.target.value)}
              placeholder="Nombre del bundle"
              className="h-11 w-full rounded-2xl border border-border bg-secondary/30 px-4 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <textarea
              value={bundleDescription}
              onChange={(event) => setBundleDescription(event.target.value)}
              placeholder="Describe la oferta del paquete"
              className="min-h-[100px] w-full rounded-2xl border border-border bg-secondary/30 px-4 py-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <input
              value={bundlePrice}
              onChange={(event) => setBundlePrice(event.target.value)}
              placeholder="Precio del bundle"
              type="number"
              min="0"
              className="h-11 w-full rounded-2xl border border-border bg-secondary/30 px-4 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />

            <div className="grid gap-2">
              {products.map((product) => (
                <label
                  key={product.id}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-border/80 bg-secondary/20 px-4 py-3 text-sm"
                >
                  <span className="min-w-0 truncate text-foreground">{product.name}</span>
                  <input
                    type="checkbox"
                    checked={bundleProducts.includes(product.id)}
                    onChange={() => toggleBundleProduct(product.id)}
                    className="h-4 w-4"
                  />
                </label>
              ))}
            </div>

            <button
              type="button"
              onClick={handleCreateBundle}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-95"
            >
              <Plus className="h-4 w-4" />
              Crear bundle
            </button>
          </div>
        </article>

        <article className="rounded-[2rem] border border-border/80 bg-card/90 p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <TicketPercent className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                Codigo de descuento
              </p>
              <p className="text-lg font-semibold text-foreground">Crear descuento</p>
            </div>
          </div>

          <div className="mt-5 space-y-4">
            <input
              value={discountName}
              onChange={(event) => setDiscountName(event.target.value)}
              placeholder="Nombre interno"
              className="h-11 w-full rounded-2xl border border-border bg-secondary/30 px-4 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <input
              value={discountCode}
              onChange={(event) => setDiscountCode(event.target.value.toUpperCase())}
              placeholder="Codigo"
              className="h-11 w-full rounded-2xl border border-border bg-secondary/30 px-4 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <textarea
              value={discountDescription}
              onChange={(event) => setDiscountDescription(event.target.value)}
              placeholder="Describe cuando usar el descuento"
              className="min-h-[100px] w-full rounded-2xl border border-border bg-secondary/30 px-4 py-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <div className="grid gap-4 md:grid-cols-2">
              <select
                value={discountType}
                onChange={(event) =>
                  setDiscountType(event.target.value as "percentage" | "fixed")
                }
                className="h-11 rounded-2xl border border-border bg-secondary/30 px-4 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="percentage">Porcentaje</option>
                <option value="fixed">Monto fijo</option>
              </select>
              <input
                value={discountValue}
                onChange={(event) => setDiscountValue(event.target.value)}
                type="number"
                min="0"
                className="h-11 rounded-2xl border border-border bg-secondary/30 px-4 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            <button
              type="button"
              onClick={handleCreateDiscount}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-95"
            >
              <Plus className="h-4 w-4" />
              Crear descuento
            </button>
          </div>
        </article>
      </section>

      <section className="rounded-[2rem] border border-border/80 bg-card/90 p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          Catalogo de ofertas
        </p>
        <div className="mt-4 grid gap-3">
          {offers.length ? (
            offers.map((offer) => (
              <article
                key={offer.id}
                className="rounded-[1.5rem] border border-border/80 bg-secondary/20 p-4"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                        {offer.type === "bundle" ? "Oferta de paquete" : "Codigo de descuento"}
                      </span>
                      <span className="rounded-full border border-border bg-background/40 px-3 py-1 text-[11px] text-muted-foreground">
                        {offer.active ? "Activa" : "Inactiva"}
                      </span>
                    </div>
                    <p className="mt-3 font-semibold text-foreground">{offer.name}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{offer.description}</p>
                    <p className="mt-2 text-sm text-secondary-foreground">
                      {offer.type === "bundle"
                        ? `${offer.productIds.length} productos · ${formatCurrency(
                            offer.bundlePrice,
                          )}`
                        : offer.discountType === "percentage"
                          ? `${offer.code} · ${offer.value}%`
                          : `${offer.code} · ${formatCurrency(offer.value)}`}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteOffer(offer.id)}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-2xl border border-border px-4 text-sm font-semibold text-destructive transition-colors hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                    Borrar
                  </button>
                </div>
              </article>
            ))
          ) : (
            <div className="rounded-[1.5rem] border border-border/80 bg-secondary/20 p-5 text-sm text-muted-foreground">
              Aun no hay ofertas creadas. Usa los formularios superiores para lanzar bundles o
              descuentos.
            </div>
          )}
        </div>
      </section>
    </MainContent>
  );
}
