import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  ChevronLeft,
  CreditCard,
  LayoutGrid,
  Package2,
  Plus,
  Store as StoreIcon,
  Trash2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import MainContent from "@/components/dashboard/MainContent";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  deleteStore,
  ensureStoreEditorDraft,
  getPaymentMethodOptions,
  getStoreTemplate,
  getStoreTemplates,
  loadStores,
  saveStore,
  slugifyStoreName,
  type PaymentMethodOption,
  type Store,
  type StoreCurrency,
  type StorePaymentMethod,
  type StoreTemplate,
  type StoreTemplateId,
} from "@/lib/stores";
import { subscribeToShopcodData } from "@/lib/live-sync";

type WizardStep = 1 | 2 | 3;

const templateThemes: Record<StoreTemplateId, { shell: string; accent: string; badge: string }> = {
  singleProduct: {
    shell: "bg-[linear-gradient(135deg,rgba(244,114,182,0.14),rgba(251,191,36,0.12))]",
    accent: "border-primary/20",
    badge: "bg-primary/12 text-primary",
  },
  catalog: {
    shell: "bg-[linear-gradient(135deg,rgba(56,189,248,0.14),rgba(16,185,129,0.14))]",
    accent: "border-sky-400/20",
    badge: "bg-sky-500/10 text-sky-300",
  },
  flashSale: {
    shell: "bg-[linear-gradient(135deg,rgba(248,113,113,0.14),rgba(251,146,60,0.14))]",
    accent: "border-orange-400/20",
    badge: "bg-orange-500/10 text-orange-300",
  },
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-PE", {
    dateStyle: "medium",
  }).format(new Date(value));
}

function getPaymentMethodLabel(
  paymentMethods: PaymentMethodOption[],
  paymentMethod: StorePaymentMethod,
) {
  return (
    paymentMethods.find((option) => option.id === paymentMethod)?.title ?? "Metodo no disponible"
  );
}

function StoreTemplatePreview({ template }: { template: StoreTemplate }) {
  const theme = templateThemes[template.id];

  return (
    <div className={cn("rounded-[1.5rem] border p-4", theme.accent, theme.shell)}>
      <div className="flex items-start justify-between gap-3">
        <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-semibold", theme.badge)}>
          {template.category}
        </span>
        <span className="rounded-full border border-border/70 bg-background/60 px-2.5 py-1 text-[11px] text-muted-foreground">
          {template.pages.length} paginas
        </span>
      </div>

      <div className="mt-5 grid gap-3">
        <div className="h-20 rounded-[1.25rem] border border-background/40 bg-background/40 p-3">
          <div className="h-2.5 w-1/2 rounded-full bg-background/70" />
          <div className="mt-3 h-2.5 w-5/6 rounded-full bg-background/45" />
          <div className="mt-2 h-2.5 w-3/4 rounded-full bg-background/35" />
          <div className="mt-4 h-7 w-28 rounded-2xl bg-primary/70" />
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="h-12 rounded-2xl bg-background/55" />
          <div className="h-12 rounded-2xl bg-background/35" />
        </div>
      </div>

      <p className="mt-5 text-sm font-semibold text-foreground">{template.name}</p>
    </div>
  );
}

function StoreCard({
  store,
  paymentMethods,
  onOpenDashboard,
  onOpenEditor,
  onDelete,
}: {
  store: Store;
  paymentMethods: PaymentMethodOption[];
  onOpenDashboard: (storeId: string) => void;
  onOpenEditor: (storeId: string) => void;
  onDelete: (storeId: string) => void;
}) {
  const template = getStoreTemplate(store.templateId);

  return (
    <article className="overflow-hidden rounded-[2rem] border border-border/80 bg-card/90 p-5">
      <StoreTemplatePreview template={template} />

      <div className="mt-5 space-y-4">
        <div>
          <p className="text-lg font-semibold text-foreground">{store.name}</p>
          <p className="text-sm text-muted-foreground">/{store.slug}</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-border/80 bg-secondary/30 p-3">
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              Pago
            </p>
            <p className="mt-2 text-sm font-semibold text-foreground">
              {getPaymentMethodLabel(paymentMethods, store.paymentMethod)}
            </p>
          </div>
          <div className="rounded-2xl border border-border/80 bg-secondary/30 p-3">
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              Configuracion
            </p>
            <p className="mt-2 text-sm font-semibold text-foreground">
              {store.pages.length} paginas en {store.currency}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">Actualizada el {formatDate(store.updatedAt)}</p>
          <div className="flex flex-wrap gap-2">
            <Button type="button" className="rounded-2xl" onClick={() => onOpenDashboard(store.id)}>
              Ver panel
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              className="rounded-2xl"
              onClick={() => onOpenEditor(store.id)}
            >
              Abrir editor
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="rounded-2xl text-destructive hover:text-destructive"
              onClick={() => onDelete(store.id)}
            >
              <Trash2 className="h-4 w-4" />
              Borrar
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function StoresPage() {
  const navigate = useNavigate();
  const templates = useMemo(() => getStoreTemplates(), []);
  const paymentMethods = useMemo(() => getPaymentMethodOptions(), []);
  const [stores, setStores] = useState(() => loadStores());
  const [wizardOpen, setWizardOpen] = useState(false);
  const [step, setStep] = useState<WizardStep>(1);
  const [selectedTemplateId, setSelectedTemplateId] = useState<StoreTemplateId>("singleProduct");
  const [paymentMethod, setPaymentMethod] = useState<StorePaymentMethod>("separateCheckout");
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [currency, setCurrency] = useState<StoreCurrency>("USD");
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    return subscribeToShopcodData(() => {
      setStores(loadStores());
    });
  }, []);

  const selectedTemplate =
    templates.find((template) => template.id === selectedTemplateId) ?? templates[0];

  const totalPages = stores.reduce((sum, store) => sum + store.pages.length, 0);
  const embeddedPaymentStores = stores.filter(
    (store) => store.paymentMethod === "productPagePayment",
  ).length;

  const validationError = useMemo(() => {
    if (!selectedTemplate) {
      return "Selecciona una plantilla.";
    }

    if (step >= 3 && !name.trim()) {
      return "El nombre de la tienda es obligatorio.";
    }

    if (step >= 3 && !slug.trim()) {
      return "El slug de la tienda es obligatorio.";
    }

    return null;
  }, [name, selectedTemplate, slug, step]);

  const openWizard = () => {
    setWizardOpen(true);
    setStep(1);
    setSelectedTemplateId("singleProduct");
    setPaymentMethod("separateCheckout");
    setName("");
    setSlug("");
    setSlugTouched(false);
    setCurrency("USD");
  };

  const closeWizard = () => {
    setWizardOpen(false);
    setStep(1);
    setSelectedTemplateId("singleProduct");
    setPaymentMethod("separateCheckout");
    setName("");
    setSlug("");
    setSlugTouched(false);
    setCurrency("USD");
  };

  const handleTemplateSelect = (template: StoreTemplate) => {
    setSelectedTemplateId(template.id);
    setName((previous) => previous || `${template.name} Store`);
    setSlug((previous) =>
      slugTouched && previous ? previous : slugifyStoreName(`${template.name} Store`),
    );
  };

  const handleNameChange = (value: string) => {
    setName(value);

    if (!slugTouched) {
      setSlug(slugifyStoreName(value));
    }
  };

  const handleCreateStore = () => {
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setIsCreating(true);

    try {
      const store = saveStore({
        name,
        slug,
        currency,
        templateId: selectedTemplateId,
        paymentMethod,
      });

      setStores(loadStores());
      closeWizard();
      toast.success("Tienda creada.", {
        description: `${store.name} ya esta disponible en tu lista y lista para editar.`,
      });
    } finally {
      setIsCreating(false);
    }
  };

  const nextStep = () => {
    setStep((current) => (current < 3 ? ((current + 1) as WizardStep) : current));
  };

  const previousStep = () => {
    setStep((current) => (current > 1 ? ((current - 1) as WizardStep) : current));
  };

  const handleOpenEditor = (storeId: string) => {
    const store = ensureStoreEditorDraft(storeId);

    if (!store) {
      toast.error("No se encontro la tienda.");
      return;
    }

    navigate(`/editor/${store.id}`);
  };

  const handleOpenDashboard = (storeId: string) => {
    navigate(`/stores/${storeId}`);
  };

  const handleDeleteStore = (storeId: string) => {
    const nextStores = deleteStore(storeId);

    if (!nextStores) {
      toast.error("No se pudo eliminar la tienda.");
      return;
    }

    setStores(nextStores);
    toast.success("Tienda eliminada.");
  };

  return (
    <MainContent
      eyebrow="Storefronts"
      title="Tiendas"
      description="Lista tus tiendas y construye nuevas con un wizard de 3 pasos para plantilla, pagos y configuracion."
      actions={
        <Button type="button" className="rounded-2xl" onClick={openWizard}>
          <Plus className="h-4 w-4" />
          Nueva tienda
        </Button>
      }
    >
      <section className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-[1.75rem] border border-border/80 bg-card/90 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Tiendas
          </p>
          <p className="mt-3 text-3xl font-semibold text-foreground">{stores.length}</p>
        </div>
        <div className="rounded-[1.75rem] border border-border/80 bg-card/90 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Pagos embebidos
          </p>
          <p className="mt-3 text-3xl font-semibold text-foreground">{embeddedPaymentStores}</p>
        </div>
        <div className="rounded-[1.75rem] border border-border/80 bg-card/90 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Paginas totales
          </p>
          <p className="mt-3 text-3xl font-semibold text-foreground">{totalPages}</p>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(22rem,0.8fr)]">
        <div className="space-y-6">
          {stores.length === 0 ? (
            <div className="rounded-[2rem] border border-dashed border-border bg-card/70 p-8 text-center">
              <p className="text-lg font-semibold text-foreground">Todavia no hay tiendas</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Crea la primera tienda para empezar a estructurar tu catalogo y pagos.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 xl:grid-cols-2">
              {stores.map((store) => (
                <StoreCard
                  key={store.id}
                  store={store}
                  paymentMethods={paymentMethods}
                  onOpenDashboard={handleOpenDashboard}
                  onOpenEditor={handleOpenEditor}
                  onDelete={handleDeleteStore}
                />
              ))}
            </div>
          )}
        </div>

        <aside className="rounded-[2rem] border border-border/80 bg-card/90 p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                Wizard de creacion
              </p>
              <p className="mt-1 text-lg font-semibold text-foreground">Nueva tienda</p>
            </div>
            {!wizardOpen ? (
              <Button type="button" variant="outline" className="rounded-2xl" onClick={openWizard}>
                Iniciar
              </Button>
            ) : null}
          </div>

          {!wizardOpen ? (
            <div className="mt-6 rounded-[1.5rem] border border-border/80 bg-secondary/20 p-5">
              <p className="text-sm text-secondary-foreground">
                Activa el wizard para elegir una plantilla, definir como cobrara la tienda y
                guardar nombre, slug y moneda en una sola ruta.
              </p>
            </div>
          ) : (
            <div className="mt-6 space-y-6">
              <div className="grid gap-2 sm:grid-cols-3">
                {[1, 2, 3].map((stepNumber) => (
                  <div
                    key={stepNumber}
                    className={cn(
                      "rounded-2xl border px-3 py-3 text-center text-sm",
                      step === stepNumber
                        ? "border-primary bg-primary/10 text-primary"
                        : step > stepNumber
                          ? "border-border bg-secondary/40 text-foreground"
                          : "border-border/70 bg-background/40 text-muted-foreground",
                    )}
                  >
                    Paso {stepNumber}
                  </div>
                ))}
              </div>

              {step === 1 ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-lg font-semibold text-foreground">Seleccionar plantilla</p>
                    <p className="text-sm text-muted-foreground">
                      Elige la base visual y estructural para arrancar tu tienda.
                    </p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    {templates.map((template) => {
                      const isActive = template.id === selectedTemplateId;

                      return (
                        <button
                          key={template.id}
                          type="button"
                          onClick={() => handleTemplateSelect(template)}
                          className={cn(
                            "rounded-[1.5rem] border p-4 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                            isActive
                              ? "border-primary bg-primary/8"
                              : "border-border/80 bg-secondary/15 hover:border-primary/20",
                          )}
                        >
                          <StoreTemplatePreview template={template} />
                          <div className="mt-4 space-y-1">
                            <p className="font-semibold text-foreground">{template.name}</p>
                            <p className="text-sm text-muted-foreground">{template.description}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              {step === 2 ? (
                <div className="space-y-5">
                  <div>
                    <p className="text-lg font-semibold text-foreground">
                      Seleccionar metodo de pago
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Decide si el cobro vive en un checkout separado o dentro de la pagina de
                      producto.
                    </p>
                  </div>

                  <div className="grid gap-4">
                    {paymentMethods.map((option) => {
                      const isActive = option.id === paymentMethod;

                      return (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => setPaymentMethod(option.id)}
                          className={cn(
                            "rounded-[1.5rem] border p-4 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                            isActive
                              ? "border-primary bg-primary/8"
                              : "border-border/80 bg-secondary/15 hover:border-primary/20",
                          )}
                        >
                          <div className="flex items-start gap-4">
                            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                              {option.id === "separateCheckout" ? (
                                <CreditCard className="h-5 w-5" />
                              ) : (
                                <Package2 className="h-5 w-5" />
                              )}
                            </span>
                            <div className="min-w-0">
                              <p className="font-semibold text-foreground">{option.title}</p>
                              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                                {option.description}
                              </p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              {step === 3 ? (
                <div className="space-y-5">
                  <div>
                    <p className="text-lg font-semibold text-foreground">Configurar tienda</p>
                    <p className="text-sm text-muted-foreground">
                      Define nombre, slug y moneda antes de guardar la tienda.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="store-name">Nombre</Label>
                    <Input
                      id="store-name"
                      value={name}
                      onChange={(event) => handleNameChange(event.target.value)}
                      placeholder="Ej. Glow Market COD"
                      className="rounded-2xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="store-slug">Slug</Label>
                    <Input
                      id="store-slug"
                      value={slug}
                      onChange={(event) => {
                        setSlugTouched(true);
                        setSlug(slugifyStoreName(event.target.value));
                      }}
                      placeholder="glow-market-cod"
                      className="rounded-2xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="store-currency">Moneda</Label>
                    <select
                      id="store-currency"
                      value={currency}
                      onChange={(event) => setCurrency(event.target.value as StoreCurrency)}
                      className="h-11 w-full rounded-2xl border border-border bg-secondary/20 px-4 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="PEN">PEN</option>
                    </select>
                  </div>

                  <div className="rounded-[1.5rem] border border-border/80 bg-secondary/20 p-4">
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <StoreIcon className="h-4 w-4" />
                      </span>
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground">
                          {selectedTemplate.name} con {getPaymentMethodLabel(paymentMethods, paymentMethod)}
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Se generaran {paymentMethod === "productPagePayment" ? selectedTemplate.pages.length - 1 : selectedTemplate.pages.length} paginas iniciales en {currency}.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}

              {validationError ? (
                <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {validationError}
                </div>
              ) : null}

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-2xl"
                  onClick={step === 1 ? closeWizard : previousStep}
                >
                  <ChevronLeft className="h-4 w-4" />
                  {step === 1 ? "Cerrar" : "Anterior"}
                </Button>

                {step < 3 ? (
                  <Button type="button" className="rounded-2xl" onClick={nextStep}>
                    {step === 1 ? (
                      <LayoutGrid className="h-4 w-4" />
                    ) : (
                      <CreditCard className="h-4 w-4" />
                    )}
                    Siguiente
                  </Button>
                ) : (
                  <Button
                    type="button"
                    className="rounded-2xl"
                    onClick={handleCreateStore}
                    disabled={isCreating}
                  >
                    <Plus className="h-4 w-4" />
                    {isCreating ? "Creando..." : "Crear tienda"}
                  </Button>
                )}
              </div>
            </div>
          )}
        </aside>
      </section>
    </MainContent>
  );
}
