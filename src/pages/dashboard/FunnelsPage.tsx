import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  ChevronLeft,
  LayoutTemplate,
  Plus,
  Sparkles,
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

function formatConversion(value: number) {
  return `${value.toFixed(1)}%`;
}

function formatVisits(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function getTemplate(templateId: FunnelTemplateId) {
  return getFunnelTemplates().find((template) => template.id === templateId) ?? getFunnelTemplates()[0];
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
  const theme = previewThemes[templateId];

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
  const templates = useMemo(() => getFunnelTemplates(), []);
  const [funnels, setFunnels] = useState(() => loadFunnels());
  const [wizardOpen, setWizardOpen] = useState(false);
  const [step, setStep] = useState<WizardStep>(1);
  const [selectedTemplateId, setSelectedTemplateId] = useState<FunnelTemplateId>("blank");
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [currency, setCurrency] = useState<FunnelCurrency>("USD");
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    return subscribeToShopcodData(() => {
      setFunnels(loadFunnels());
    });
  }, []);

  const selectedTemplate =
    templates.find((template) => template.id === selectedTemplateId) ?? templates[0];

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

  const openWizard = () => {
    setWizardOpen(true);
    setStep(1);
    setSelectedTemplateId("blank");
    setName("");
    setSlug("");
    setSlugTouched(false);
    setCurrency("USD");
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
      const funnel = saveFunnel({
        name,
        slug,
        currency,
        templateId: selectedTemplateId,
      });

      setFunnels(loadFunnels());
      toast.success("Funnel creado.", {
        description: `${funnel.name} se preparo y se abrira en el editor.`,
      });
      navigate(`/editor/${funnel.id}`);
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

  const handleOpenEditor = (funnelId: string) => {
    ensureFunnelEditorDraft(funnelId);
    navigate(`/editor/${funnelId}`);
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
      description="Gestiona funnels, monitorea rendimiento y crea nuevas rutas con un wizard guiado por plantillas."
      actions={
        <Button type="button" className="rounded-2xl" onClick={openWizard}>
          <Plus className="h-4 w-4" />
          Nuevo Funnel
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

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(22rem,0.8fr)]">
        <div className="space-y-6">
          <div className="grid gap-5 xl:grid-cols-2">
            {funnels.map((funnel) => {
              const template = getTemplate(funnel.templateId);

              return (
                <article
                  key={funnel.id}
                  className="overflow-hidden rounded-[2rem] border border-border/80 bg-card/90 p-5"
                >
                  <FunnelPreview
                    templateId={funnel.templateId}
                    title={funnel.name}
                    category={template.category}
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
                          onClick={() => handleOpenEditor(funnel.id)}
                        >
                          Abrir editor
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
          </div>
        </div>

        <aside className="rounded-[2rem] border border-border/80 bg-card/90 p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                Wizard de creacion
              </p>
              <p className="mt-1 text-lg font-semibold text-foreground">Nuevo funnel</p>
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
                Abre el wizard para seleccionar plantilla, configurar nombre, slug y moneda, y
                terminar con redireccion directa al editor visual.
              </p>
            </div>
          ) : (
            <div className="mt-6 space-y-6">
              <div className="grid gap-2 sm:grid-cols-3">
                {[1, 2, 3].map((stepNumber) => (
                  <div
                    key={stepNumber}
                    className={`rounded-2xl border px-3 py-3 text-center text-sm ${
                      step === stepNumber
                        ? "border-primary bg-primary/10 text-primary"
                        : step > stepNumber
                          ? "border-border bg-secondary/40 text-foreground"
                          : "border-border/70 bg-background/40 text-muted-foreground"
                    }`}
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
                      Elige la base con la que quieres iniciar tu funnel.
                    </p>
                  </div>

                  <div className="grid gap-4">
                    {templates.map((template) => {
                      const isActive = template.id === selectedTemplateId;

                      return (
                        <button
                          key={template.id}
                          type="button"
                          onClick={() => handleTemplateSelect(template)}
                          className={`rounded-[1.5rem] border p-4 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                            isActive
                              ? "border-primary bg-primary/8"
                              : "border-border/80 bg-secondary/15 hover:border-primary/20"
                          }`}
                        >
                          <FunnelPreview
                            templateId={template.id}
                            title={template.name}
                            category={template.category}
                          />
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
                    <p className="text-lg font-semibold text-foreground">Configurar funnel</p>
                    <p className="text-sm text-muted-foreground">
                      Define la base operativa antes de enviarlo al editor.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="funnel-name">Nombre</Label>
                    <Input
                      id="funnel-name"
                      value={name}
                      onChange={(event) => handleNameChange(event.target.value)}
                      placeholder="Ej. Glow COD Sprint"
                      className="rounded-2xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="funnel-slug">Slug</Label>
                    <Input
                      id="funnel-slug"
                      value={slug}
                      onChange={(event) => {
                        setSlugTouched(true);
                        setSlug(slugifyFunnelName(event.target.value));
                      }}
                      placeholder="glow-cod-sprint"
                      className="rounded-2xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="funnel-currency">Moneda</Label>
                    <select
                      id="funnel-currency"
                      value={currency}
                      onChange={(event) => setCurrency(event.target.value as FunnelCurrency)}
                      className="h-11 w-full rounded-2xl border border-border bg-secondary/20 px-4 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="PEN">PEN</option>
                    </select>
                  </div>
                </div>
              ) : null}

              {step === 3 ? (
                <div className="space-y-5">
                  <div>
                    <p className="text-lg font-semibold text-foreground">Crear funnel</p>
                    <p className="text-sm text-muted-foreground">
                      Revisa la configuracion y crea el funnel para continuar en el editor.
                    </p>
                  </div>

                  <div className="rounded-[1.5rem] border border-border/80 bg-secondary/20 p-4">
                    <FunnelPreview
                      templateId={selectedTemplate.id}
                      title={name || "Nuevo funnel"}
                      category={selectedTemplate.category}
                    />

                    <div className="mt-4 grid gap-3 text-sm text-secondary-foreground">
                      <p>Plantilla: {selectedTemplate.name}</p>
                      <p>Slug: /{slug || "pendiente"}</p>
                      <p>Moneda: {currency}</p>
                      <p>Paginas iniciales: {selectedTemplate.pages.length}</p>
                    </div>
                  </div>

                  <div className="rounded-[1.5rem] border border-border/80 bg-background/30 p-4">
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        {selectedTemplate.id === "ai" ? (
                          <Wand2 className="h-4 w-4" />
                        ) : (
                          <LayoutTemplate className="h-4 w-4" />
                        )}
                      </span>
                      <div>
                        <p className="font-semibold text-foreground">Listo para guardar</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Al confirmar, se guardara la configuracion y se abrira `/editor/:storeId`
                          con una base compatible.
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
                  onClick={step === 1 ? () => setWizardOpen(false) : previousStep}
                >
                  <ChevronLeft className="h-4 w-4" />
                  {step === 1 ? "Cerrar" : "Anterior"}
                </Button>

                {step < 3 ? (
                  <Button type="button" className="rounded-2xl" onClick={nextStep}>
                    Siguiente
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    className="rounded-2xl"
                    onClick={handleCreateFunnel}
                    disabled={isCreating}
                  >
                    <Sparkles className="h-4 w-4" />
                    {isCreating ? "Creando..." : "Crear funnel"}
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
