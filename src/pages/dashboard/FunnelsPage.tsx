import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Check,
  ChevronLeft,
  LayoutTemplate,
  Plus,
  Search,
  Trash2,
  Wand2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import MainContent from "@/components/dashboard/MainContent";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  deleteFunnel,
  ensureFunnelEditorDraft,
  getFunnelTemplates,
  loadFunnels,
  saveFunnel,
  slugifyFunnelName,
  type FunnelCurrency,
  type FunnelTemplate,
  type FunnelTemplateId,
} from "@/lib/funnels";
import { subscribeToShopcodData } from "@/lib/live-sync";
import { cn } from "@/lib/utils";

type WizardStep = 1 | 2 | 3;

const previewThemes: Record<
  FunnelTemplateId,
  { shell: string; badge: string; accent: string }
> = {
  blank: {
    shell: "bg-[linear-gradient(135deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))]",
    badge: "bg-card/80 text-foreground",
    accent: "border-border/80",
  },
  ai: {
    shell: "bg-[linear-gradient(135deg,rgba(245,183,36,0.16),rgba(59,130,246,0.16))]",
    badge: "bg-primary/15 text-primary",
    accent: "border-primary/25",
  },
  preset: {
    shell: "bg-[linear-gradient(135deg,rgba(14,165,233,0.15),rgba(34,197,94,0.14))]",
    badge: "bg-emerald-500/10 text-emerald-300",
    accent: "border-emerald-400/20",
  },
};

const fallbackBlankTemplate: FunnelTemplate = {
  id: "blank",
  name: "Plantilla en blanco",
  category: "Base",
  description: "Arranca desde cero con estructura minima.",
  pages: [],
};

function formatConversion(value: number) {
  return `${value.toFixed(1)}%`;
}

function formatVisits(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function FunnelPreview({
  templateId,
  title,
  category,
}: {
  templateId: FunnelTemplateId;
  title: string;
  category: string;
}) {
  const theme = previewThemes[templateId] ?? previewThemes.blank;

  return (
    <div className={`rounded-[1.5rem] border ${theme.accent} p-4 ${theme.shell}`}>
      <div className="flex items-start justify-between gap-3">
        <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${theme.badge}`}>
          {category}
        </span>
        <span className="rounded-full border border-border/70 bg-background/60 px-2.5 py-1 text-[11px] text-muted-foreground">
          Preview
        </span>
      </div>

      <div className="mt-5 grid gap-3">
        <div className="h-3 w-3/4 rounded-full bg-background/70" />
        <div className="h-2.5 w-full rounded-full bg-background/50" />
        <div className="h-2.5 w-5/6 rounded-full bg-background/40" />
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <div className="h-16 rounded-2xl bg-background/55" />
          <div className="h-16 rounded-2xl bg-background/35" />
        </div>
        <div className="mt-2 h-9 w-36 rounded-2xl bg-primary/70" />
      </div>

      <p className="mt-5 text-sm font-semibold text-foreground">{title}</p>
    </div>
  );
}

export default function FunnelsPage() {
  const navigate = useNavigate();
  const sourceTemplates = useMemo(() => getFunnelTemplates(), []);
  const templates = useMemo(
    () => (sourceTemplates.length ? sourceTemplates : [fallbackBlankTemplate]),
    [sourceTemplates],
  );
  const [funnels, setFunnels] = useState(() => loadFunnels());
  const [wizardOpen, setWizardOpen] = useState(false);
  const [step, setStep] = useState<WizardStep>(1);
  const [selectedTemplateId, setSelectedTemplateId] = useState<FunnelTemplateId>("blank");
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [currency, setCurrency] = useState<FunnelCurrency>("USD");
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    return subscribeToShopcodData(() => {
      setFunnels(loadFunnels());
    });
  }, []);

  const filteredTemplates = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    if (!normalizedSearch) {
      return templates;
    }

    return templates.filter((template) => {
      const joined = `${template.name} ${template.category} ${template.description}`.toLowerCase();
      return joined.includes(normalizedSearch);
    });
  }, [searchTerm, templates]);

  const selectedTemplate = useMemo(
    () => templates.find((template) => template.id === selectedTemplateId) ?? templates[0],
    [selectedTemplateId, templates],
  );

  const totalVisits = funnels.reduce((sum, funnel) => sum + funnel.visits, 0);
  const averageConversion =
    funnels.length > 0
      ? funnels.reduce((sum, funnel) => sum + funnel.conversion, 0) / funnels.length
      : 0;

  const validationError = useMemo(() => {
    if (!selectedTemplate) {
      return "Selecciona una plantilla.";
    }

    if (step >= 2 && !name.trim()) {
      return "El nombre del funnel es obligatorio.";
    }

    if (step >= 2 && !slug.trim()) {
      return "El slug del funnel es obligatorio.";
    }

    return null;
  }, [name, selectedTemplate, slug, step]);

  const resetWizard = () => {
    setStep(1);
    setSelectedTemplateId(templates[0]?.id ?? "blank");
    setName("");
    setSlug("");
    setSlugTouched(false);
    setCurrency("USD");
    setSearchTerm("");
    setIsCreating(false);
  };

  const openWizard = () => {
    resetWizard();
    setWizardOpen(true);
  };

  const closeWizard = () => {
    setWizardOpen(false);
  };

  const handleTemplateSelect = (template: FunnelTemplate) => {
    setSelectedTemplateId(template.id);
    setName((previous) => previous || `${template.name} Funnel`);
    setSlug((previous) =>
      slugTouched && previous ? previous : slugifyFunnelName(`${template.name} Funnel`),
    );
  };

  const handleNameChange = (value: string) => {
    setName(value);

    if (!slugTouched) {
      setSlug(slugifyFunnelName(value));
    }
  };

  const handleCreateFunnel = () => {
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setIsCreating(true);

    try {
      const templateId = selectedTemplate?.id ?? "blank";
      const funnel = saveFunnel({
        name,
        slug,
        currency,
        templateId,
      });

      setFunnels(loadFunnels());
      closeWizard();
      toast.success("Funnel creado.", {
        description: `${funnel.name} fue creado y esta listo para editar.`,
      });
      navigate(`/funnels/${funnel.id}/editor`);
    } finally {
      setIsCreating(false);
    }
  };

  const nextStep = () => {
    if (step === 1) {
      setStep(2);
      return;
    }

    if (step === 2) {
      if (validationError) {
        toast.error(validationError);
        return;
      }

      setStep(3);
    }
  };

  const previousStep = () => {
    setStep((current) => (current === 1 ? 1 : ((current - 1) as WizardStep)));
  };

  const handleOpenFunnel = (funnelId: string) => {
    ensureFunnelEditorDraft(funnelId);
    navigate(`/funnels/${funnelId}/editor`);
  };

  const handleDeleteFunnel = (funnelId: string) => {
    const nextFunnels = deleteFunnel(funnelId);

    if (!nextFunnels) {
      toast.error("No se pudo eliminar el funnel.");
      return;
    }

    setFunnels(nextFunnels);
    toast.success("Funnel eliminado.");
  };

  return (
    <MainContent
      eyebrow="Conversion"
      title="Funnels"
      description="Gestiona funnels, monitorea rendimiento y crea nuevos flujos con plantillas."
      actions={
        <Button type="button" className="rounded-2xl" onClick={openWizard}>
          <Plus className="h-4 w-4" />
          Crear funnel
        </Button>
      }
    >
      <section className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-[1.75rem] border border-border/80 bg-card/90 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Funnels
          </p>
          <p className="mt-3 text-3xl font-semibold text-foreground">{funnels.length}</p>
        </div>
        <div className="rounded-[1.75rem] border border-border/80 bg-card/90 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Conversion media
          </p>
          <p className="mt-3 text-3xl font-semibold text-foreground">
            {formatConversion(averageConversion)}
          </p>
        </div>
        <div className="rounded-[1.75rem] border border-border/80 bg-card/90 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Visitas acumuladas
          </p>
          <p className="mt-3 text-3xl font-semibold text-foreground">{formatVisits(totalVisits)}</p>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        {funnels.map((funnel) => {
          const template = templates.find((item) => item.id === funnel.templateId) ?? templates[0];

          return (
            <article
              key={funnel.id}
              className="overflow-hidden rounded-[2rem] border border-border/80 bg-card/90 p-5"
            >
              <FunnelPreview
                templateId={funnel.templateId}
                title={funnel.name}
                category={template?.category ?? "Base"}
              />

              <div className="mt-5 space-y-4">
                <div>
                  <p className="text-lg font-semibold text-foreground">{funnel.name}</p>
                  <p className="text-sm text-muted-foreground">/{funnel.slug}</p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-border/80 bg-secondary/30 p-3">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                      Conversion
                    </p>
                    <p className="mt-2 text-xl font-semibold text-foreground">
                      {formatConversion(funnel.conversion)}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-border/80 bg-secondary/30 p-3">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                      Visitas
                    </p>
                    <p className="mt-2 text-xl font-semibold text-foreground">
                      {formatVisits(funnel.visits)}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-xs text-muted-foreground">
                    {funnel.pages.length} paginas en {funnel.currency}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="rounded-2xl"
                      onClick={() => handleOpenFunnel(funnel.id)}
                    >
                      Abrir funnel
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      className="rounded-2xl text-destructive hover:text-destructive"
                      onClick={() => handleDeleteFunnel(funnel.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                      Borrar
                    </Button>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </section>

      {wizardOpen ? (
        <div className="fixed inset-0 z-50 bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="mx-auto flex h-full w-full max-w-6xl flex-col overflow-hidden rounded-[2rem] border border-border/80 bg-background shadow-2xl">
            <header className="border-b border-border/70 px-5 py-4 lg:px-8">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-3xl font-semibold text-foreground">Elige una plantilla</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Elige una plantilla para comenzar. Puedes personalizarla segun tu producto.
                  </p>
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
                      <div className="relative w-full max-w-xs">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          value={searchTerm}
                          onChange={(event) => setSearchTerm(event.target.value)}
                          placeholder="Buscar plantilla o categoria"
                          className="rounded-xl pl-9"
                        />
                      </div>
                    </div>

                    {!sourceTemplates.length ? (
                      <div className="rounded-2xl border border-dashed border-border/80 bg-secondary/20 p-4 text-sm text-muted-foreground">
                        No hay plantillas cargadas. Se usara plantilla en blanco.
                      </div>
                    ) : null}

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
                              <FunnelPreview
                                templateId={template.id}
                                title={template.name}
                                category={template.category}
                              />
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
                <div className="mx-auto max-w-xl rounded-[2rem] border border-border/80 bg-card/90 p-6">
                  <p className="text-center text-2xl font-semibold text-foreground">Todo listo</p>
                  <p className="mt-2 text-center text-sm text-muted-foreground">
                    Tu funnel esta configurado. Ahora asignale nombre, URL y moneda.
                  </p>

                  <div className="mt-6 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="wizard-funnel-name">Nombre del funnel</Label>
                      <Input
                        id="wizard-funnel-name"
                        value={name}
                        onChange={(event) => handleNameChange(event.target.value)}
                        placeholder="weather island"
                        className="rounded-xl"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="wizard-funnel-slug">URL del funnel</Label>
                      <div className="flex items-center rounded-xl border border-border bg-background px-3">
                        <Input
                          id="wizard-funnel-slug"
                          value={slug}
                          onChange={(event) => {
                            setSlugTouched(true);
                            setSlug(slugifyFunnelName(event.target.value));
                          }}
                          className="h-10 border-0 px-0 shadow-none focus-visible:ring-0"
                        />
                        <span className="text-sm text-muted-foreground">.myecomsite.net</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="wizard-funnel-currency">Seleccionar moneda</Label>
                      <select
                        id="wizard-funnel-currency"
                        value={currency}
                        onChange={(event) => setCurrency(event.target.value as FunnelCurrency)}
                        className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <option value="USD">Use account currency (USD)</option>
                        <option value="EUR">EUR</option>
                        <option value="PEN">PEN</option>
                      </select>
                    </div>
                  </div>
                </div>
              ) : null}

              {step === 3 ? (
                <div className="mx-auto max-w-3xl space-y-5">
                  <div className="text-center">
                    <p className="text-2xl font-semibold text-foreground">Confirmar configuracion</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Revisa los datos y crea el funnel para abrir el constructor.
                    </p>
                  </div>

                  <article className="rounded-[2rem] border border-border/80 bg-card/90 p-5">
                    <FunnelPreview
                      templateId={selectedTemplate.id}
                      title={name || "Nuevo funnel"}
                      category={selectedTemplate.category}
                    />

                    <div className="mt-5 grid gap-3 rounded-2xl border border-border/70 bg-secondary/20 p-4 text-sm">
                      <p>
                        <span className="font-semibold text-foreground">Plantilla:</span> {selectedTemplate.name}
                      </p>
                      <p>
                        <span className="font-semibold text-foreground">Nombre:</span> {name || "Sin nombre"}
                      </p>
                      <p>
                        <span className="font-semibold text-foreground">URL:</span> /{slug || "pendiente"}
                      </p>
                      <p>
                        <span className="font-semibold text-foreground">Moneda:</span> {currency}
                      </p>
                      <p>
                        <span className="font-semibold text-foreground">Paginas base:</span>{" "}
                        {selectedTemplate.pages.length}
                      </p>
                    </div>

                    <div className="mt-4 rounded-2xl border border-border/70 bg-background/40 p-4">
                      <div className="flex items-start gap-3">
                        <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                          {selectedTemplate.id === "ai" ? (
                            <Wand2 className="h-4 w-4" />
                          ) : (
                            <LayoutTemplate className="h-4 w-4" />
                          )}
                        </span>
                        <p className="text-sm text-muted-foreground">
                          Al confirmar, se creara el funnel y se abrira su workspace con resumen, builder,
                          configuracion e idiomas.
                        </p>
                      </div>
                    </div>
                  </article>
                </div>
              ) : null}
            </div>

            <footer className="border-t border-border/70 px-5 py-4 lg:px-8">
              {validationError && step > 1 ? (
                <div className="mb-3 rounded-xl border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {validationError}
                </div>
              ) : null}

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
                    onClick={handleCreateFunnel}
                    disabled={isCreating}
                  >
                    {isCreating ? "Creando..." : "Crear y abrir funnel"}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </footer>
          </div>
        </div>
      ) : null}
    </MainContent>
  );
}
