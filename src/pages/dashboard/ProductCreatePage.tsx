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
  customFieldsEnabled: boolean;
  customFields: ProductCustomField[];
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
    customFieldsEnabled: true,
    customFields: [createCustomField()],
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

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

export default function ProductCreatePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState<ProductFormState>(() => createInitialState());
  const [slugTouched, setSlugTouched] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const validationError = useMemo(() => {
    if (!form.name.trim()) {
      return "El titulo es obligatorio.";
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
        customFields: form.customFieldsEnabled ? form.customFields : [],
        orderBump: null,
        upsell: null,
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
      description="Flujo de creacion estilo LightFunnels con enfoque en informacion comercial y configuracion operativa."
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <Button asChild variant="outline" size="sm" className="rounded-xl">
            <Link to="/products">
              <ArrowLeft className="h-4 w-4" />
              Cancelar
            </Link>
          </Button>
          <Button
            type="submit"
            form="product-create-form"
            size="sm"
            className="rounded-xl"
            disabled={isSaving}
          >
            {isSaving ? "Guardando..." : "Guardar"}
          </Button>
        </div>
      }
    >
      <form
        id="product-create-form"
        className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(20rem,0.85fr)]"
        onSubmit={handleSubmit}
      >
        <div className="space-y-6">
          <section className="rounded-[2rem] border border-border/80 bg-card/90 p-6">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
                  Nuevo producto
                </p>
                <h2 className="text-2xl font-semibold text-foreground">Contenido principal</h2>
              </div>
              <Button type="button" variant="outline" size="sm" className="rounded-xl">
                <Sparkles className="h-4 w-4" />
                Generar con IA
              </Button>
            </div>

            <div className="grid gap-5">
              <div className="space-y-2">
                <Label htmlFor="product-name">Titulo</Label>
                <Input
                  id="product-name"
                  value={form.name}
                  onChange={(event) => handleNameChange(event.target.value)}
                  placeholder="Introduce el titulo del producto"
                  className="rounded-2xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="product-description">Descripcion</Label>
                <Textarea
                  id="product-description"
                  value={form.description}
                  onChange={(event) => updateField("description", event.target.value)}
                  placeholder="Resume beneficios, transformacion y argumentos de venta"
                  className="min-h-[180px] rounded-2xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="product-images">Imagenes</Label>
                <div className="rounded-2xl border border-dashed border-border/80 bg-secondary/20 p-4">
                  <p className="text-sm text-muted-foreground">
                    Pega una URL por linea o arrastra referencias para el equipo.
                  </p>
                  <Textarea
                    id="product-images"
                    value={form.imagesText}
                    onChange={(event) => updateField("imagesText", event.target.value)}
                    placeholder={"https://...\nhttps://..."}
                    className="mt-3 min-h-[96px] rounded-xl"
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-[2rem] border border-border/80 bg-card/90 p-6">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
                  Control de inventario
                </p>
                <h2 className="text-2xl font-semibold text-foreground">Inventario</h2>
              </div>
              <Switch
                id="inventory-tracking"
                checked={form.inventoryTracking}
                onCheckedChange={(checked) => updateField("inventoryTracking", checked)}
                aria-label="Activar inventario"
              />
            </div>

            <p className="text-sm text-muted-foreground">
              Activa el seguimiento de inventario para gestionar stock y disponibilidad.
            </p>

            {form.inventoryTracking ? (
              <div className="mt-4 space-y-2">
                <Label htmlFor="product-inventory">Unidades disponibles</Label>
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
            ) : null}
          </section>

          <section className="rounded-[2rem] border border-border/80 bg-card/90 p-6">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
                  Variantes
                </p>
                <h2 className="text-2xl font-semibold text-foreground">Opciones del producto</h2>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-xl"
                onClick={() =>
                  updateField(
                    "variantsText",
                    `${form.variantsText}${form.variantsText.trim() ? "\n" : ""}Nueva opcion`,
                  )
                }
              >
                <Plus className="h-4 w-4" />
                Anadir opcion
              </Button>
            </div>

            <Textarea
              id="product-variants"
              value={form.variantsText}
              onChange={(event) => updateField("variantsText", event.target.value)}
              placeholder={"Una variante por linea\nRojo\nAzul"}
              className="min-h-[120px] rounded-2xl"
            />
          </section>

          <section className="rounded-[2rem] border border-border/80 bg-card/90 p-6">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
                  Datos personalizados
                </p>
                <h2 className="text-2xl font-semibold text-foreground">CMS de producto</h2>
              </div>
              <Switch
                id="custom-fields-enabled"
                checked={form.customFieldsEnabled}
                onCheckedChange={(checked) => updateField("customFieldsEnabled", checked)}
                aria-label="Activar campos personalizados"
              />
            </div>

            {form.customFieldsEnabled ? (
              <div className="space-y-3">
                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-xl"
                    onClick={addCustomField}
                  >
                    <Plus className="h-4 w-4" />
                    Anadir caracteristica
                  </Button>
                </div>

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
                        placeholder="Caracteristica"
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
                        placeholder="Detalle"
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
            ) : null}
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-[2rem] border border-border/80 bg-card/90 p-6">
            <div className="mb-5 space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
                Informacion del producto
              </p>
              <h2 className="text-2xl font-semibold text-foreground">Comercial</h2>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="product-type">Tipo</Label>
                <select
                  id="product-type"
                  value={form.shipping ? "physical" : "digital"}
                  onChange={(event) => updateField("shipping", event.target.value === "physical")}
                  className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  <option value="physical">Producto fisico</option>
                  <option value="digital">Producto digital</option>
                </select>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="product-price">Precio</Label>
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
                  <Label htmlFor="product-compare-price">Comparar con el precio</Label>
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
                <Label htmlFor="product-tags">Anadir etiquetas</Label>
                <Input
                  id="product-tags"
                  value={form.tagsText}
                  onChange={(event) => updateField("tagsText", event.target.value)}
                  placeholder="belleza, skincare, premium"
                  className="rounded-2xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="product-slug">URL handle</Label>
                <div className="flex min-w-0 items-center gap-2 rounded-2xl border border-input bg-background px-3 py-2">
                  <span className="truncate text-xs text-muted-foreground">
                    https://mystore.myconsite.net/
                  </span>
                  <Input
                    id="product-slug"
                    value={form.slug}
                    onChange={(event) => {
                      setSlugTouched(true);
                      updateField("slug", slugifyProductName(event.target.value));
                    }}
                    placeholder="introduce-un-slug"
                    className="h-auto border-0 bg-transparent p-0 shadow-none focus-visible:ring-0"
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-[2rem] border border-border/80 bg-card/90 p-6">
            <div className="mb-5 space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
                Configuracion del producto
              </p>
              <h2 className="text-2xl font-semibold text-foreground">Resumen</h2>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-border/80 bg-secondary/20 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Precio final
                </p>
                <p className="mt-2 text-2xl font-semibold text-foreground">
                  {formatCurrency(Number(form.price) || 0)}
                </p>
                {Number(form.comparePrice) > Number(form.price) ? (
                  <p className="mt-1 text-sm text-muted-foreground line-through">
                    {formatCurrency(Number(form.comparePrice))}
                  </p>
                ) : null}
              </div>

              <div className="rounded-2xl border border-border/80 bg-secondary/20 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Metrics
                </p>
                <div className="mt-3 grid gap-2 text-sm text-secondary-foreground">
                  <p>Imagenes: {summaryImages.length}</p>
                  <p>Variantes: {summaryVariants.length}</p>
                  <p>Tags: {summaryTags.length}</p>
                  <p>Envio: {form.shipping ? "Activo" : "Sin envio"}</p>
                </div>
              </div>

              {validationError ? (
                <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                  {validationError}
                </div>
              ) : null}
            </div>
          </section>
        </aside>
      </form>
    </MainContent>
  );
}
