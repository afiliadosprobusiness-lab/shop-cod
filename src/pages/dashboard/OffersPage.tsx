import { useEffect, useMemo, useState } from "react";
import { Layers3, Plus, Tag, TicketPercent, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import MainContent from "@/components/dashboard/MainContent";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { normalizeDiscountPercentage, normalizeOrderBumpQuantity } from "@/lib/product-offers";
import { subscribeToShopcodData } from "@/lib/live-sync";
import {
  deleteOffer,
  loadOffers,
  saveBundleOffer,
  saveDiscountOffer,
  saveOrderBumpOffer,
  saveUpsellOffer,
  type PlatformOffer,
} from "@/lib/platform-data";
import { loadProducts } from "@/lib/products";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
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

  const [upsellProductId, setUpsellProductId] = useState("");
  const [upsellPrice, setUpsellPrice] = useState("");

  const [orderBumpProductId, setOrderBumpProductId] = useState("");
  const [orderBumpQuantity, setOrderBumpQuantity] = useState("2");
  const [orderBumpDiscount, setOrderBumpDiscount] = useState("10");

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
  const upsellCount = useMemo(
    () => offers.filter((offer) => offer.type === "upsell").length,
    [offers],
  );
  const orderBumpCount = useMemo(
    () => offers.filter((offer) => offer.type === "order-bump").length,
    [offers],
  );

  const selectedUpsellProduct = useMemo(
    () => products.find((product) => product.id === upsellProductId) ?? null,
    [products, upsellProductId],
  );
  const selectedOrderBumpProduct = useMemo(
    () => products.find((product) => product.id === orderBumpProductId) ?? null,
    [products, orderBumpProductId],
  );

  const normalizedOrderBumpQuantity = normalizeOrderBumpQuantity(Number(orderBumpQuantity));
  const normalizedOrderBumpDiscount = normalizeDiscountPercentage(Number(orderBumpDiscount));
  const orderBumpListPrice =
    (selectedOrderBumpProduct?.price ?? 0) * normalizedOrderBumpQuantity;
  const orderBumpFinalPrice =
    orderBumpListPrice * (1 - normalizedOrderBumpDiscount / 100);

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

  const handleCreateUpsell = () => {
    if (!upsellProductId) {
      toast.error("Selecciona un producto para crear el upsell.");
      return;
    }

    try {
      const nextOffer = saveUpsellOffer({
        productId: upsellProductId,
        customPrice:
          upsellPrice.trim() !== "" && Number.isFinite(Number(upsellPrice))
            ? Number(upsellPrice)
            : undefined,
      });

      setOffers(loadOffers());
      setUpsellProductId("");
      setUpsellPrice("");
      toast.success("Upsell creado.", {
        description: `${nextOffer.name} quedo registrado como incremento post-checkout.`,
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo crear el upsell.");
    }
  };

  const handleCreateOrderBump = () => {
    if (!orderBumpProductId) {
      toast.error("Selecciona un producto para crear el order bump.");
      return;
    }

    try {
      const nextOffer = saveOrderBumpOffer({
        productId: orderBumpProductId,
        quantity: Number(orderBumpQuantity) || 2,
        discountPercentage: Number(orderBumpDiscount) || 0,
      });

      setOffers(loadOffers());
      setOrderBumpProductId("");
      setOrderBumpQuantity("2");
      setOrderBumpDiscount("10");
      toast.success("Order bump creado.", {
        description: `${nextOffer.name} quedo listo para checkout.`,
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo crear el order bump.");
    }
  };

  const handleDeleteOffer = (offerId: string) => {
    setOffers(deleteOffer(offerId));
    toast.success("Oferta eliminada.");
  };

  return (
    <MainContent
      eyebrow="Promociones"
      title="Ofertas"
      description="Configura bundles, descuentos, upsells y order bumps por cantidad desde un solo panel."
    >
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
        <div className="rounded-[1.75rem] border border-border/80 bg-card/90 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Incrementos
          </p>
          <p className="mt-3 text-3xl font-semibold text-foreground">
            {upsellCount + orderBumpCount}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Upsell: {upsellCount} | Order bump: {orderBumpCount}
          </p>
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
            <div className="space-y-2">
              <Label htmlFor="bundle-name">Nombre</Label>
              <Input
                id="bundle-name"
                value={bundleName}
                onChange={(event) => setBundleName(event.target.value)}
                placeholder="Nombre del bundle"
                className="rounded-2xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bundle-description">Descripcion</Label>
              <Textarea
                id="bundle-description"
                value={bundleDescription}
                onChange={(event) => setBundleDescription(event.target.value)}
                placeholder="Describe la oferta del paquete"
                className="min-h-[100px] rounded-2xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bundle-price">Precio del bundle</Label>
              <Input
                id="bundle-price"
                value={bundlePrice}
                onChange={(event) => setBundlePrice(event.target.value)}
                type="number"
                min="0"
                className="rounded-2xl"
              />
            </div>

            {products.length ? (
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
            ) : (
              <div className="rounded-2xl border border-dashed border-border/80 bg-secondary/20 p-4">
                <p className="text-sm text-muted-foreground">
                  No hay productos disponibles para armar un bundle.
                </p>
                <Button asChild variant="outline" size="sm" className="mt-3 rounded-xl">
                  <Link to="/products/new">
                    <Plus className="h-4 w-4" />
                    Crear producto
                  </Link>
                </Button>
              </div>
            )}

            <Button type="button" onClick={handleCreateBundle} className="rounded-2xl">
              <Plus className="h-4 w-4" />
              Crear bundle
            </Button>
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
            <div className="space-y-2">
              <Label htmlFor="discount-name">Nombre interno</Label>
              <Input
                id="discount-name"
                value={discountName}
                onChange={(event) => setDiscountName(event.target.value)}
                placeholder="Nombre interno"
                className="rounded-2xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="discount-code">Codigo</Label>
              <Input
                id="discount-code"
                value={discountCode}
                onChange={(event) => setDiscountCode(event.target.value.toUpperCase())}
                placeholder="CODIGO"
                className="rounded-2xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="discount-description">Descripcion</Label>
              <Textarea
                id="discount-description"
                value={discountDescription}
                onChange={(event) => setDiscountDescription(event.target.value)}
                placeholder="Describe cuando usar el descuento"
                className="min-h-[100px] rounded-2xl"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-medium text-foreground">Tipo</span>
                <select
                  value={discountType}
                  onChange={(event) =>
                    setDiscountType(event.target.value as "percentage" | "fixed")
                  }
                  className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="percentage">Porcentaje</option>
                  <option value="fixed">Monto fijo</option>
                </select>
              </label>
              <div className="space-y-2">
                <Label htmlFor="discount-value">Valor</Label>
                <Input
                  id="discount-value"
                  value={discountValue}
                  onChange={(event) => setDiscountValue(event.target.value)}
                  type="number"
                  min="0"
                  className="rounded-2xl"
                />
              </div>
            </div>

            <Button type="button" onClick={handleCreateDiscount} className="rounded-2xl">
              <Plus className="h-4 w-4" />
              Crear descuento
            </Button>
          </div>
        </article>

        <article className="rounded-[2rem] border border-border/80 bg-card/90 p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Tag className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                Incremento post compra
              </p>
              <p className="text-lg font-semibold text-foreground">Crear upsell</p>
            </div>
          </div>

          <div className="mt-5 space-y-4">
            {products.length ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="upsell-product">Producto</Label>
                  <select
                    id="upsell-product"
                    value={upsellProductId}
                    onChange={(event) => {
                      const nextProductId = event.target.value;
                      const nextProduct = products.find((product) => product.id === nextProductId);
                      setUpsellProductId(nextProductId);
                      setUpsellPrice(nextProduct ? String(nextProduct.price) : "");
                    }}
                    className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="">Selecciona un producto</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="upsell-price">Precio de upsell</Label>
                  <Input
                    id="upsell-price"
                    value={upsellPrice}
                    onChange={(event) => setUpsellPrice(event.target.value)}
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    className="rounded-2xl"
                  />
                </div>

                {selectedUpsellProduct ? (
                  <div className="rounded-2xl border border-border/80 bg-secondary/20 p-4 text-sm">
                    <p className="font-semibold text-foreground">{selectedUpsellProduct.name}</p>
                    <p className="mt-1 break-words text-muted-foreground">
                      {selectedUpsellProduct.description || "Sin descripcion"}
                    </p>
                  </div>
                ) : null}

                <Button type="button" onClick={handleCreateUpsell} className="rounded-2xl">
                  <Plus className="h-4 w-4" />
                  Crear upsell
                </Button>
              </>
            ) : (
              <div className="rounded-2xl border border-dashed border-border/80 bg-secondary/20 p-4">
                <p className="text-sm text-muted-foreground">
                  No hay productos para configurar upsell.
                </p>
                <Button asChild variant="outline" size="sm" className="mt-3 rounded-xl">
                  <Link to="/products/new">
                    <Plus className="h-4 w-4" />
                    Crear producto
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </article>

        <article className="rounded-[2rem] border border-border/80 bg-card/90 p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Tag className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                Incremento en checkout
              </p>
              <p className="text-lg font-semibold text-foreground">Crear order bump</p>
            </div>
          </div>

          <div className="mt-5 space-y-4">
            {products.length ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="order-bump-product">Producto base</Label>
                  <select
                    id="order-bump-product"
                    value={orderBumpProductId}
                    onChange={(event) => setOrderBumpProductId(event.target.value)}
                    className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="">Selecciona un producto</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="order-bump-quantity">Cantidad</Label>
                    <Input
                      id="order-bump-quantity"
                      value={orderBumpQuantity}
                      onChange={(event) => setOrderBumpQuantity(event.target.value)}
                      type="number"
                      min="2"
                      step="1"
                      className="rounded-2xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="order-bump-discount">Descuento (%)</Label>
                    <Input
                      id="order-bump-discount"
                      value={orderBumpDiscount}
                      onChange={(event) => setOrderBumpDiscount(event.target.value)}
                      type="number"
                      min="0"
                      max="100"
                      step="1"
                      className="rounded-2xl"
                    />
                  </div>
                </div>

                <div className="rounded-2xl border border-primary/20 bg-primary/10 p-4 text-sm">
                  <p className="font-semibold text-foreground">
                    Pack x{normalizedOrderBumpQuantity}: {formatCurrency(orderBumpFinalPrice)}
                  </p>
                  <p className="text-muted-foreground">
                    Precio regular: {formatCurrency(orderBumpListPrice)} | Descuento: {normalizedOrderBumpDiscount}%
                  </p>
                </div>

                <Button type="button" onClick={handleCreateOrderBump} className="rounded-2xl">
                  <Plus className="h-4 w-4" />
                  Crear order bump
                </Button>
              </>
            ) : (
              <div className="rounded-2xl border border-dashed border-border/80 bg-secondary/20 p-4">
                <p className="text-sm text-muted-foreground">
                  No hay productos para configurar order bump.
                </p>
                <Button asChild variant="outline" size="sm" className="mt-3 rounded-xl">
                  <Link to="/products/new">
                    <Plus className="h-4 w-4" />
                    Crear producto
                  </Link>
                </Button>
              </div>
            )}
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
                        {offer.type === "bundle"
                          ? "Bundle"
                          : offer.type === "discount"
                            ? "Descuento"
                            : offer.type === "upsell"
                              ? "Upsell"
                              : "Order bump"}
                      </span>
                      <span className="rounded-full border border-border bg-background/40 px-3 py-1 text-[11px] text-muted-foreground">
                        {offer.active ? "Activa" : "Inactiva"}
                      </span>
                    </div>
                    <p className="mt-3 font-semibold text-foreground">{offer.name}</p>
                    <p className="mt-1 break-words text-sm text-muted-foreground">
                      {offer.description || "Sin descripcion"}
                    </p>
                    <p className="mt-2 text-sm text-secondary-foreground">
                      {offer.type === "bundle"
                        ? `${offer.productIds.length} productos | ${formatCurrency(offer.bundlePrice)}`
                        : offer.type === "discount"
                          ? offer.discountType === "percentage"
                            ? `${offer.code} | ${offer.value}%`
                            : `${offer.code} | ${formatCurrency(offer.value)}`
                          : offer.type === "upsell"
                            ? `Producto: ${offer.productId} | ${formatCurrency(offer.price)}`
                            : `Producto: ${offer.productId} | x${offer.quantity} | ${offer.discountPercentage}% | ${formatCurrency(offer.price)}`}
                    </p>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-2xl text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => handleDeleteOffer(offer.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                    Borrar
                  </Button>
                </div>
              </article>
            ))
          ) : (
            <div className="rounded-[1.5rem] border border-border/80 bg-secondary/20 p-5 text-sm text-muted-foreground">
              Aun no hay ofertas creadas. Usa los formularios superiores para lanzar bundles,
              descuentos o incrementos.
            </div>
          )}
        </div>
      </section>
    </MainContent>
  );
}
