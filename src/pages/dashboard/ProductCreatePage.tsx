import { useMemo, useState, type FormEvent } from "react";
import { ArrowLeft, Plus, Sparkles, Trash2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import MainContent from "@/components/dashboard/MainContent";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  saveProduct,
  slugifyProductName,
  type ProductCustomField,
  type ProductOffer,
} from "@/lib/products";

interface ProductFormState {
  name: string;
  description: string;
  imagesText: string;
  price: string;
  comparePrice: string;
  sku: string;
  tagsText: string;
  slug: string;
  inventory: string;
  inventoryTracking: boolean;
  variantsText: string;
  shipping: boolean;
  customFields: ProductCustomField[];
  orderBumpEnabled: boolean;
  orderBumpName: string;
  orderBumpDescription: string;
  orderBumpPrice: string;
  upsellEnabled: boolean;
  upsellName: string;
  upsellDescription: string;
  upsellPrice: string;
}

function createCustomField(): ProductCustomField {
  return {
    id: `cf-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    key: "",
    value: "",
  };
}

function createInitialState(): ProductFormState {
  return {
    name: "",
    description: "",
    imagesText: "",
    price: "",
    comparePrice: "",
    sku: "",
    tagsText: "",
    slug: "",
    inventory: "0",
    inventoryTracking: true,
    variantsText: "",
    shipping: true,
    customFields: [createCustomField()],
    orderBumpEnabled: false,
    orderBumpName: "",
    orderBumpDescription: "",
    orderBumpPrice: "",
    upsellEnabled: false,
    upsellName: "",
    upsellDescription: "",
    upsellPrice: "",
  };
}

function parseListByLine(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseTags(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function buildOffer(
  enabled: boolean,
  name: string,
  description: string,
  price: string,
): ProductOffer | null {
  if (!enabled) {
    return null;
  }

  return {
    name,
    description,
    price: Number(price) || 0,
  };
}

export default function ProductCreatePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState<ProductFormState>(() => createInitialState());
  const [slugTouched, setSlugTouched] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const validationError = useMemo(() => {
    if (!form.name.trim()) {
      return "El nombre es obligatorio.";
    }

    if (!form.sku.trim()) {
      return "El SKU es obligatorio.";
    }

    if (!(Number(form.price) > 0)) {
      return "El precio debe ser mayor que cero.";
    }

    if (!form.slug.trim()) {
      return "El slug es obligatorio.";
    }

    return null;
  }, [form.name, form.price, form.sku, form.slug]);

  const summaryTags = parseTags(form.tagsText);
  const summaryVariants = parseListByLine(form.variantsText);
  const summaryImages = parseListByLine(form.imagesText);

  const updateField = <Key extends keyof ProductFormState,>(
    key: Key,
    value: ProductFormState[Key],
  ) => {
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  const handleNameChange = (value: string) => {
    setForm((previous) => ({
      ...previous,
      name: value,
      slug: slugTouched ? previous.slug : slugifyProductName(value),
    }));
  };

  const handleCustomFieldChange = (
    fieldId: string,
    key: keyof ProductCustomField,
    value: string,
  ) => {
    setForm((previous) => ({
      ...previous,
      customFields: previous.customFields.map((field) =>
        field.id === fieldId ? { ...field, [key]: value } : field,
      ),
    }));
  };

  const addCustomField = () => {
    setForm((previous) => ({
      ...previous,
      customFields: [...previous.customFields, createCustomField()],
    }));
  };

  const removeCustomField = (fieldId: string) => {
    setForm((previous) => {
      const nextFields = previous.customFields.filter((field) => field.id !== fieldId);
      return {
        ...previous,
        customFields: nextFields.length ? nextFields : [createCustomField()],
      };
    });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (validationError) {
      toast.error(validationError);
      return;
    }

    setIsSaving(true);

    try {
      const product = saveProduct({
        name: form.name,
        description: form.description,
        price: Number(form.price) || 0,
        comparePrice: Number(form.comparePrice) || 0,
        images: parseListByLine(form.imagesText),
        variants: parseListByLine(form.variantsText),
        inventory: Number(form.inventory) || 0,
        sku: form.sku,
        slug: form.slug,
        tags: parseTags(form.tagsText),
        inventoryTracking: form.inventoryTracking,
        shipping: form.shipping,
        customFields: form.customFields,
        orderBump: buildOffer(
          form.orderBumpEnabled,
          form.orderBumpName,
          form.orderBumpDescription,
          form.orderBumpPrice,
        ),
        upsell: buildOffer(
          form.upsellEnabled,
          form.upsellName,
          form.upsellDescription,
          form.upsellPrice,
        ),
      });

      toast.success("Producto creado.", {
        description: `${product.name} se guardo en el catalogo local.`,
      });
      navigate("/products");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <MainContent
      eyebrow="Catalogo"
      title="Nuevo producto"
      description="Crea un producto completo con informacion, configuracion comercial e incrementos de pedido."
      actions={
        <Button asChild variant="outline" className="rounded-2xl">
          <Link to="/products">
            <ArrowLeft className="h-4 w-4" />
            Volver a productos
          </Link>
        </Button>
      }
    >
      <form className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(20rem,0.7fr)]" onSubmit={handleSubmit}>
        <div className="space-y-6">
          <section className="rounded-[2rem] border border-border/80 bg-card/90 p-6">
            <div className="mb-5 space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
                Informacion del producto
              </p>
              <h2 className="text-2xl font-semibold text-foreground">Base comercial</h2>
            </div>

            <div className="grid gap-5">
              <div className="space-y-2">
                <Label htmlFor="product-name">Name</Label>
                <Input
                  id="product-name"
                  value={form.name}
                  onChange={(event) => handleNameChange(event.target.value)}
                  placeholder="Ej. Glow Serum Pro"
                  className="rounded-2xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="product-description">Description</Label>
                <Textarea
                  id="product-description"
                  value={form.description}
                  onChange={(event) => updateField("description", event.target.value)}
                  placeholder="Resume beneficios, transformacion y argumentos de venta"
                  className="min-h-[120px] rounded-2xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="product-images">Images</Label>
                <Textarea
                  id="product-images"
                  value={form.imagesText}
                  onChange={(event) => updateField("imagesText", event.target.value)}
                  placeholder={"Una URL por linea\nhttps://..."}
                  className="min-h-[100px] rounded-2xl"
                />
              </div>
            </div>
          </section>

          <section className="rounded-[2rem] border border-border/80 bg-card/90 p-6">
            <div className="mb-5 space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
                Detalles
              </p>
              <h2 className="text-2xl font-semibold text-foreground">Precio y metadata</h2>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="product-price">Price</Label>
                <Input
                  id="product-price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={(event) => updateField("price", event.target.value)}
                  placeholder="0.00"
                  className="rounded-2xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="product-compare-price">Compare Price</Label>
                <Input
                  id="product-compare-price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.comparePrice}
                  onChange={(event) => updateField("comparePrice", event.target.value)}
                  placeholder="0.00"
                  className="rounded-2xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="product-sku">SKU</Label>
                <Input
                  id="product-sku"
                  value={form.sku}
                  onChange={(event) => updateField("sku", event.target.value)}
                  placeholder="SKU-001"
                  className="rounded-2xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="product-slug">Slug</Label>
                <Input
                  id="product-slug"
                  value={form.slug}
                  onChange={(event) => {
                    setSlugTouched(true);
                    updateField("slug", slugifyProductName(event.target.value));
                  }}
                  placeholder="glow-serum-pro"
                  className="rounded-2xl"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="product-tags">Tags</Label>
                <Input
                  id="product-tags"
                  value={form.tagsText}
                  onChange={(event) => updateField("tagsText", event.target.value)}
                  placeholder="belleza, skincare, premium"
                  className="rounded-2xl"
                />
              </div>
            </div>
          </section>

          <section className="rounded-[2rem] border border-border/80 bg-card/90 p-6">
            <div className="mb-5 space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
                Configuracion
              </p>
              <h2 className="text-2xl font-semibold text-foreground">Operacion y estructura</h2>
            </div>

            <div className="grid gap-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-3xl border border-border/80 bg-secondary/30 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <Label htmlFor="inventory-tracking">Inventory tracking</Label>
                      <p className="text-sm text-muted-foreground">
                        Controla stock disponible y alertas de inventario.
                      </p>
                    </div>
                    <Switch
                      id="inventory-tracking"
                      checked={form.inventoryTracking}
                      onCheckedChange={(checked) => updateField("inventoryTracking", checked)}
                    />
                  </div>
                </div>

                <div className="rounded-3xl border border-border/80 bg-secondary/30 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <Label htmlFor="shipping-enabled">Shipping</Label>
                      <p className="text-sm text-muted-foreground">
                        Define si el producto requiere envio fisico.
                      </p>
                    </div>
                    <Switch
                      id="shipping-enabled"
                      checked={form.shipping}
                      onCheckedChange={(checked) => updateField("shipping", checked)}
                    />
                  </div>
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="product-inventory">Inventory</Label>
                  <Input
                    id="product-inventory"
                    type="number"
                    min="0"
                    step="1"
                    value={form.inventory}
                    onChange={(event) => updateField("inventory", event.target.value)}
                    placeholder="0"
                    className="rounded-2xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="product-variants">Variants</Label>
                  <Textarea
                    id="product-variants"
                    value={form.variantsText}
                    onChange={(event) => updateField("variantsText", event.target.value)}
                    placeholder={"Una variante por linea\nRojo\nAzul"}
                    className="min-h-[100px] rounded-2xl"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Custom fields</h3>
                    <p className="text-sm text-muted-foreground">
                      Agrega atributos propios para ventas, fulfillment o marketing.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-2xl"
                    onClick={addCustomField}
                  >
                    <Plus className="h-4 w-4" />
                    Agregar campo
                  </Button>
                </div>

                <div className="space-y-3">
                  {form.customFields.map((field) => (
                    <div
                      key={field.id}
                      className="grid gap-3 rounded-3xl border border-border/80 bg-secondary/20 p-4 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)_auto]"
                    >
                      <div className="space-y-2">
                        <Label htmlFor={`${field.id}-key`}>Campo</Label>
                        <Input
                          id={`${field.id}-key`}
                          value={field.key}
                          onChange={(event) =>
                            handleCustomFieldChange(field.id, "key", event.target.value)
                          }
                          placeholder="Origen"
                          className="rounded-2xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`${field.id}-value`}>Valor</Label>
                        <Input
                          id={`${field.id}-value`}
                          value={field.value}
                          onChange={(event) =>
                            handleCustomFieldChange(field.id, "value", event.target.value)
                          }
                          placeholder="Corea"
                          className="rounded-2xl"
                        />
                      </div>
                      <div className="flex items-end">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="rounded-2xl"
                          onClick={() => removeCustomField(field.id)}
                          aria-label="Eliminar campo"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-[2rem] border border-border/80 bg-card/90 p-6">
            <div className="mb-5 space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
                Incrementos de pedido
              </p>
              <h2 className="text-2xl font-semibold text-foreground">Order bump y upsell</h2>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-3xl border border-border/80 bg-secondary/20 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-foreground">Order bump</p>
                    <p className="text-sm text-muted-foreground">
                      Oferta adicional en el checkout.
                    </p>
                  </div>
                  <Switch
                    checked={form.orderBumpEnabled}
                    onCheckedChange={(checked) => updateField("orderBumpEnabled", checked)}
                    aria-label="Activar order bump"
                  />
                </div>

                {form.orderBumpEnabled ? (
                  <div className="mt-4 grid gap-3">
                    <Input
                      value={form.orderBumpName}
                      onChange={(event) => updateField("orderBumpName", event.target.value)}
                      placeholder="Nombre del order bump"
                      className="rounded-2xl"
                    />
                    <Textarea
                      value={form.orderBumpDescription}
                      onChange={(event) =>
                        updateField("orderBumpDescription", event.target.value)
                      }
                      placeholder="Descripcion corta"
                      className="min-h-[90px] rounded-2xl"
                    />
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.orderBumpPrice}
                      onChange={(event) => updateField("orderBumpPrice", event.target.value)}
                      placeholder="Precio"
                      className="rounded-2xl"
                    />
                  </div>
                ) : null}
              </div>

              <div className="rounded-3xl border border-border/80 bg-secondary/20 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-foreground">Upsell</p>
                    <p className="text-sm text-muted-foreground">
                      Oferta posterior para aumentar el ticket promedio.
                    </p>
                  </div>
                  <Switch
                    checked={form.upsellEnabled}
                    onCheckedChange={(checked) => updateField("upsellEnabled", checked)}
                    aria-label="Activar upsell"
                  />
                </div>

                {form.upsellEnabled ? (
                  <div className="mt-4 grid gap-3">
                    <Input
                      value={form.upsellName}
                      onChange={(event) => updateField("upsellName", event.target.value)}
                      placeholder="Nombre del upsell"
                      className="rounded-2xl"
                    />
                    <Textarea
                      value={form.upsellDescription}
                      onChange={(event) => updateField("upsellDescription", event.target.value)}
                      placeholder="Descripcion corta"
                      className="min-h-[90px] rounded-2xl"
                    />
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.upsellPrice}
                      onChange={(event) => updateField("upsellPrice", event.target.value)}
                      placeholder="Precio"
                      className="rounded-2xl"
                    />
                  </div>
                ) : null}
              </div>
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-[2rem] border border-border/80 bg-card/90 p-6 xl:sticky xl:top-28">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-3xl border border-primary/20 bg-primary/10 text-primary">
                <Sparkles className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Preview rapido
                </p>
                <p className="text-lg font-semibold text-foreground">
                  {form.name.trim() || "Nuevo producto"}
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div className="rounded-3xl border border-border/80 bg-secondary/20 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Precio
                </p>
                <p className="mt-2 text-2xl font-semibold text-foreground">
                  ${Number(form.price || 0).toFixed(2)}
                </p>
                {Number(form.comparePrice) > Number(form.price) ? (
                  <p className="mt-1 text-sm text-muted-foreground line-through">
                    ${Number(form.comparePrice).toFixed(2)}
                  </p>
                ) : null}
              </div>

              <div className="rounded-3xl border border-border/80 bg-secondary/20 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Metadata
                </p>
                <div className="mt-3 space-y-2 text-sm text-secondary-foreground">
                  <p>SKU: {form.sku.trim() || "Pendiente"}</p>
                  <p>Slug: /{form.slug.trim() || "pendiente"}</p>
                  <p>Inventario: {form.inventoryTracking ? form.inventory : "No rastreado"}</p>
                </div>
              </div>

              <div className="rounded-3xl border border-border/80 bg-secondary/20 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Resumen
                </p>
                <div className="mt-3 grid gap-2 text-sm text-secondary-foreground">
                  <p>Imagenes: {summaryImages.length}</p>
                  <p>Variantes: {summaryVariants.length}</p>
                  <p>Tags: {summaryTags.length}</p>
                  <p>Custom fields: {form.customFields.filter((field) => field.key || field.value).length}</p>
                </div>
              </div>

              {validationError ? (
                <div className="rounded-3xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                  {validationError}
                </div>
              ) : null}

              <Button type="submit" className="w-full rounded-2xl" disabled={isSaving}>
                {isSaving ? "Guardando..." : "Guardar producto"}
              </Button>
            </div>
          </section>
        </aside>
      </form>
    </MainContent>
  );
}
