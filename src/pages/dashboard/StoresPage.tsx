import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Check,
  ChevronLeft,
  CreditCard,
  Grid2x2,
  House,
  Package2,
  Plus,
  Search,
  SlidersHorizontal,
  Store as StoreIcon,
  Trash2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import MainContent from "@/components/dashboard/MainContent";
import PlanUpgradeDialog from "@/components/plans/PlanUpgradeDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { getStoreCreationAccess, type ShopPlanId } from "@/lib/plans";
import {
  deleteStore,
  getPaymentMethodOptions,
  getStoreTemplate,
  getStoreTemplates,
  loadStores,
  saveStore,
  slugifyStoreName,
  type PaymentMethodOption,
  type Store,
  type StoreCurrency,
  type StorePage,
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

const wizardStepMeta: Record<WizardStep, { title: string; description: string }> = {
  1: {
    title: "Elige una plantilla",
    description: "Elige una plantilla para comenzar. Puedes personalizarla segun tu producto.",
  },
  2: {
    title: "Elige el tipo de pago",
    description: "Elige como te gustaria que tus clientes completen su compra y lo configuraremos por ti.",
  },
  3: {
    title: "Todo listo",
    description: "Tu tienda esta lista. Ahora elijamos un nombre.",
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

function getSetupPages(template: StoreTemplate, paymentMethod: StorePaymentMethod) {
  if (paymentMethod !== "productPagePayment") {
    return template.pages;
  }

  return template.pages
    .filter((page) => page.type !== "checkout")
    .map((page) => (page.type === "product" ? { ...page, name: `${page.name} + Pago` } : page));
}

function getPageIcon(pageType: StorePage["type"]) {
  if (pageType === "home") {
    return House;
  }

  if (pageType === "catalog") {
    return Grid2x2;
  }

  if (pageType === "product") {
    return Package2;
  }

  if (pageType === "checkout") {
    return CreditCard;
  }

  return BadgeCheck;
}

function getWizardProgress(step: WizardStep) {
  if (step === 1) {
    return "25%";
  }

  if (step === 2) {
    return "50%";
  }

  return "100%";
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
  onDelete,
}: {
  store: Store;
  paymentMethods: PaymentMethodOption[];
  onOpenDashboard: (storeId: string) => void;
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
  const [templateSearch, setTemplateSearch] = useState("");
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [requiredPlanId, setRequiredPlanId] = useState<ShopPlanId>("pro");
  const [upgradeReason, setUpgradeReason] = useState("");

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

  const filteredTemplates = useMemo(() => {
    const normalizedSearch = templateSearch.trim().toLowerCase();

    if (!normalizedSearch) {
      return templates;
    }

    return templates.filter((template) => {
      const joined = `${template.name} ${template.category} ${template.description}`.toLowerCase();
      return joined.includes(normalizedSearch);
    });
  }, [templateSearch, templates]);

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

  const setupPages = useMemo(
    () => getSetupPages(selectedTemplate, paymentMethod),
    [paymentMethod, selectedTemplate],
  );

  const resetWizard = () => {
    setStep(1);
    setSelectedTemplateId("singleProduct");
    setPaymentMethod("separateCheckout");
    setName("");
    setSlug("");
    setSlugTouched(false);
    setCurrency("USD");
    setTemplateSearch("");
    setIsCreating(false);
  };

  const openWizard = () => {
    const access = getStoreCreationAccess(stores.length);

    if (!access.allowed) {
      setRequiredPlanId(access.requiredPlan.id);
      setUpgradeReason(access.reason);
      setUpgradeModalOpen(true);
      return;
    }

    resetWizard();
    setWizardOpen(true);
  };

  const closeWizard = () => {
    setWizardOpen(false);
    resetWizard();
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
        description: `${store.name} esta lista. Te llevamos a su dashboard.`,
      });
      navigate(`/stores/${store.id}`);
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
      description="Lista tus tiendas y construye nuevas con el mismo proceso guiado que funnels."
      actions={
        <Button type="button" className="rounded-2xl" onClick={openWizard}>
          <Plus className="h-4 w-4" />
          Crear tienda
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

      <section className="space-y-6">
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
                onDelete={handleDeleteStore}
              />
            ))}
          </div>
        )}
      </section>

      {wizardOpen ? (
        <div className="fixed inset-0 z-50 bg-slate-950/70 p-0 backdrop-blur-sm sm:p-4">
          <div className="mx-auto flex h-full w-full flex-col overflow-hidden bg-background sm:rounded-[2rem] sm:border sm:border-border/80 sm:shadow-2xl">
            <header className="border-b border-border/70 px-5 py-4 lg:px-8">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-3xl font-semibold text-foreground">{wizardStepMeta[step].title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{wizardStepMeta[step].description}</p>
                </div>
                <div className="flex min-w-[12rem] items-center gap-3">
                  <div className="h-2 flex-1 rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${(step / 3) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">{step} de 3 pasos</span>
                </div>
              </div>
            </header>

            <div className="flex-1 overflow-auto p-5 lg:p-8">
              {step === 1 ? (
                <div className="grid gap-6 xl:grid-cols-[16rem_minmax(0,1fr)]">
                  <aside className="rounded-[1.5rem] border border-border/80 bg-card/90 p-4">
                    <p className="text-sm font-semibold text-foreground">Precios</p>
                    <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                      <label className="flex items-center gap-2">
                        <input type="checkbox" checked readOnly className="h-4 w-4 rounded" />
                        Todo
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" checked readOnly className="h-4 w-4 rounded" />
                        Gratis
                      </label>
                    </div>

                    <p className="mt-6 text-sm font-semibold text-foreground">Categoria</p>
                    <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                      <label className="flex items-center gap-2">
                        <input type="checkbox" checked readOnly className="h-4 w-4 rounded" />
                        Todo
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" readOnly className="h-4 w-4 rounded" />
                        Ecommerce
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" readOnly className="h-4 w-4 rounded" />
                        Direct response
                      </label>
                    </div>
                  </aside>

                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          className="rounded-xl border border-primary/30 bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary"
                        >
                          Todas las plantillas
                        </button>
                        <button
                          type="button"
                          className="rounded-xl border border-border/80 bg-card px-3 py-1.5 text-sm text-muted-foreground"
                        >
                          Plantillas propias
                        </button>
                        <button
                          type="button"
                          className="rounded-xl border border-border/80 bg-card px-3 py-1.5 text-sm text-muted-foreground"
                        >
                          Plantillas compradas
                        </button>
                      </div>

                      <div className="flex w-full max-w-md items-center gap-2">
                        <Button type="button" variant="ghost" className="rounded-xl border border-border/80">
                          <SlidersHorizontal className="h-4 w-4" />
                          Mas recientes
                        </Button>
                        <div className="relative min-w-0 flex-1">
                          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            value={templateSearch}
                            onChange={(event) => setTemplateSearch(event.target.value)}
                            placeholder="Buscar por plantilla o categoria"
                            className="rounded-xl pl-9"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                      {filteredTemplates.map((template) => {
                        const isActive = template.id === selectedTemplateId;

                        return (
                          <button
                            key={template.id}
                            type="button"
                            onClick={() => handleTemplateSelect(template)}
                            className={cn(
                              "rounded-[1.5rem] border p-3 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                              isActive
                                ? "border-primary bg-primary/8 ring-2 ring-primary/30"
                                : "border-border/80 bg-card hover:border-primary/20",
                            )}
                          >
                            <div className="relative">
                              {isActive ? (
                                <span className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground">
                                  <Check className="h-4 w-4" />
                                </span>
                              ) : null}
                              <StoreTemplatePreview template={template} />
                            </div>
                            <p className="mt-3 text-base font-semibold text-foreground">{template.name}</p>
                            <p className="mt-1 text-sm text-muted-foreground">{template.description}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : null}

              {step === 2 ? (
                <div className="space-y-8">
                  <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_3rem_minmax(0,1fr)]">
                    {paymentMethods.map((option, index) => {
                      const isActive = option.id === paymentMethod;
                      const isSeparateCheckout = option.id === "separateCheckout";
                      const title = isSeparateCheckout
                        ? "Pagina de pago separada"
                        : "Pago en la pagina del producto";
                      const badge = isSeparateCheckout ? "Predeterminado" : "COD";
                      const subtitle = isSeparateCheckout
                        ? "Envia a los clientes a una pagina de pago dedicada. Perfecto para anadir pasos o informacion adicional."
                        : "Los clientes compran directamente desde la pagina del producto. Ideal para compras rapidas o pagos contra entrega.";

                      return (
                        <div key={option.id} className={index === 1 ? "lg:col-start-3" : undefined}>
                          <button
                            type="button"
                            onClick={() => setPaymentMethod(option.id)}
                            className={cn(
                              "w-full rounded-[1.75rem] border text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                              isActive
                                ? "border-primary bg-primary/5 shadow-[0_0_0_3px_rgba(59,130,246,0.2)]"
                                : "border-border/80 bg-card hover:border-primary/30",
                            )}
                          >
                            <div className="h-44 rounded-t-[1.75rem] bg-[linear-gradient(135deg,#2d9cff,#2c6bff)] p-6">
                              <div className="mx-auto h-full w-full max-w-[15rem] rounded-[1.25rem] bg-white/90 p-4">
                                <div className="h-4 w-20 rounded-full bg-slate-300" />
                                <div className="mt-4 h-3 w-full rounded-full bg-slate-200" />
                                <div className="mt-2 h-3 w-4/5 rounded-full bg-slate-200" />
                                <div className="mt-4 h-14 rounded-xl border-2 border-dashed border-sky-400/80 bg-sky-100/70" />
                              </div>
                            </div>

                            <div className="space-y-3 rounded-b-[1.75rem] p-5">
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <p className="font-semibold text-foreground">
                                    {title}
                                    <span className="ml-2 rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-muted-foreground">
                                      {badge}
                                    </span>
                                  </p>
                                  <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
                                </div>
                                <span
                                  className={cn(
                                    "mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border",
                                    isActive
                                      ? "border-primary bg-primary text-primary-foreground"
                                      : "border-border bg-background",
                                  )}
                                >
                                  {isActive ? <Check className="h-3.5 w-3.5" /> : null}
                                </span>
                              </div>
                            </div>
                          </button>
                        </div>
                      );
                    })}

                    <div className="hidden items-center justify-center text-sm uppercase tracking-[0.2em] text-muted-foreground lg:flex">
                      OR
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-foreground">Paginas incluidas:</p>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
                      {setupPages.map((page) => {
                        const Icon = getPageIcon(page.type);

                        return (
                          <div
                            key={page.id}
                            className="rounded-2xl border border-border/80 bg-card/90 px-4 py-4 text-center"
                          >
                            <span className="mx-auto inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                              <Icon className="h-4 w-4" />
                            </span>
                            <p className="mt-3 text-sm font-medium text-foreground">{page.name}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : null}

              {step === 3 ? (
                <div className="relative mx-auto flex w-full max-w-3xl justify-center px-2 py-6">
                  <span className="absolute left-6 top-10 h-5 w-5 rounded-sm bg-sky-300/60" />
                  <span className="absolute right-6 top-20 h-4 w-4 rounded-full bg-red-300/80" />
                  <span className="absolute left-16 bottom-16 h-3 w-10 rotate-45 rounded-full bg-emerald-300/70" />
                  <span className="absolute right-24 bottom-20 h-4 w-12 -rotate-45 rounded-full bg-yellow-300/70" />
                  <span className="absolute left-1/3 top-2 h-3 w-3 rounded-full bg-primary/40" />
                  <span className="absolute right-1/3 bottom-8 h-3 w-3 rounded-full bg-primary/30" />

                  <article className="w-full max-w-xl rounded-[2rem] border border-border/80 bg-card/95 p-6 shadow-2xl shadow-black/10">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-border/70 bg-background">
                      <StoreIcon className="h-8 w-8 text-primary" />
                    </div>

                    <div className="mt-4 text-center">
                      <p className="text-3xl font-semibold text-foreground">Todo listo!</p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Tu tienda esta lista. Ahora elijamos un nombre.
                      </p>
                    </div>

                    <div className="mt-6 space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="store-name">Nombre de la tienda</Label>
                        <Input
                          id="store-name"
                          value={name}
                          onChange={(event) => handleNameChange(event.target.value)}
                          placeholder="soap station"
                          className="rounded-xl"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="store-slug">URL de la tienda</Label>
                        <div className="flex items-center rounded-xl border border-border bg-background px-3">
                          <Input
                            id="store-slug"
                            value={slug}
                            onChange={(event) => {
                              setSlugTouched(true);
                              setSlug(slugifyStoreName(event.target.value));
                            }}
                            className="h-10 border-0 px-0 shadow-none focus-visible:ring-0"
                          />
                          <span className="text-sm text-muted-foreground">.myecomsite.net</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="store-currency">Seleccionar moneda</Label>
                        <select
                          id="store-currency"
                          value={currency}
                          onChange={(event) => setCurrency(event.target.value as StoreCurrency)}
                          className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <option value="USD">United States Dollar</option>
                          <option value="EUR">Euro</option>
                          <option value="PEN">Peruvian Sol</option>
                        </select>
                      </div>
                    </div>
                  </article>
                </div>
              ) : null}
            </div>

            <footer className="border-t border-border/70 px-5 py-4 lg:px-8">
              {validationError && step > 2 ? (
                <div className="mb-3 rounded-xl border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {validationError}
                </div>
              ) : null}

              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-3 rounded-2xl border border-border/70 bg-card px-3 py-2">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-primary/40 text-xs font-semibold text-primary">
                    {getWizardProgress(step)}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground">Configuracion de la tienda</p>
                    <p className="text-xs text-muted-foreground">
                      {step === 1
                        ? "Plantilla e idioma"
                        : step === 2
                          ? "Seleccionar paginas de la tienda"
                          : "Nombre, URL y moneda"}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-xl"
                    onClick={step === 1 ? closeWizard : previousStep}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    {step === 1 ? "Cancelar" : "Anterior"}
                  </Button>

                  {step < 3 ? (
                    <Button type="button" className="rounded-xl" onClick={nextStep}>
                      Siguiente
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      className="rounded-xl"
                      onClick={handleCreateStore}
                      disabled={isCreating}
                    >
                      {isCreating ? "Creando..." : "Abrir tienda"}
                    </Button>
                  )}
                </div>
              </div>
            </footer>
          </div>
        </div>
      ) : null}

      <PlanUpgradeDialog
        open={upgradeModalOpen}
        onOpenChange={setUpgradeModalOpen}
        featureName="Crear una nueva tienda"
        reason={upgradeReason}
        requiredPlanId={requiredPlanId}
      />
    </MainContent>
  );
}
