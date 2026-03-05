import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Calendar,
  Eye,
  Globe2,
  Home,
  Languages,
  Plus,
  Settings,
  Sparkles,
  TriangleAlert,
  Wrench,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  FunnelBuilderEditor,
  addPage,
  syncFunnelPagesFromNodes,
  type FunnelGraph,
  type FunnelNodeType,
} from "@/builders/funnel-builder";
import { loadEditorState, publishEditorState, saveEditorState } from "@/lib/editor";
import {
  ensureFunnelEditorDraft,
  findFunnel,
  slugifyFunnelName,
  updateFunnel,
  type FunnelCurrency,
} from "@/lib/funnels";
import {
  loadFunnelWorkspaceConfig,
  saveFunnelWorkspaceConfig,
  type FunnelWorkspaceStatus,
} from "@/lib/funnel-workspace";
import { cn } from "@/lib/utils";

type FunnelWorkspaceTab = "summary" | "builder" | "settings" | "languages";
type FunnelSettingsSection =
  | "general"
  | "gateways"
  | "security"
  | "tracking"
  | "currency";

const availableLanguages = [
  { code: "es", label: "Espanol" },
  { code: "en", label: "English" },
  { code: "pt", label: "Portugues" },
];

const pageTypeCards: Array<{
  id: FunnelNodeType;
  label: string;
  accent: string;
}> = [
  { id: "product", label: "Product Page", accent: "bg-sky-500/10 text-sky-300" },
  { id: "checkout", label: "Checkout Page", accent: "bg-amber-500/10 text-amber-300" },
  { id: "upsell", label: "Upsell Page", accent: "bg-violet-500/10 text-violet-300" },
  { id: "downsell", label: "Downsell Page", accent: "bg-rose-500/10 text-rose-300" },
  { id: "thankyou", label: "Thank You Page", accent: "bg-emerald-500/10 text-emerald-300" },
  { id: "leadCapture", label: "Lead Capture", accent: "bg-cyan-500/10 text-cyan-300" },
  { id: "article", label: "Article Page", accent: "bg-indigo-500/10 text-indigo-300" },
  { id: "blank", label: "Blank Page", accent: "bg-zinc-500/10 text-zinc-300" },
];

function emptyGraph(funnelId: string, name: string): FunnelGraph {
  return {
    id: funnelId,
    name,
    nodes: [],
    pages: [],
    connections: [],
  };
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

function getNodeLabel(type: FunnelNodeType) {
  const labels: Record<FunnelNodeType, string> = {
    landing: "Landing",
    product: "Product",
    checkout: "Checkout",
    upsell: "Upsell",
    downsell: "Downsell",
    thankyou: "Thank you",
    leadCapture: "Lead capture",
    article: "Article",
    blank: "Blank",
  };

  return labels[type];
}

function getNextNodePosition(graph: FunnelGraph) {
  if (!graph.nodes.length) {
    return { x: 160, y: 190 };
  }

  const lastNode = graph.nodes[graph.nodes.length - 1];
  return {
    x: lastNode.position.x + 340,
    y: lastNode.position.y + (graph.nodes.length % 2 === 0 ? 20 : -20),
  };
}

function readWorkspaceDraft(funnelId: string) {
  const funnel = findFunnel(funnelId);
  const editorState = loadEditorState(funnelId);
  const workspaceConfig = loadFunnelWorkspaceConfig(funnelId);

  if (!funnel) {
    return null;
  }

  return {
    funnel,
    graph: editorState?.funnelBuilder ?? emptyGraph(funnelId, funnel.name),
    workspaceConfig,
  };
}

export default function FunnelWorkspacePage() {
  const navigate = useNavigate();
  const { funnelId = "" } = useParams();
  const [activeTab, setActiveTab] = useState<FunnelWorkspaceTab>("builder");
  const [settingsSection, setSettingsSection] = useState<FunnelSettingsSection>("general");
  const [showPagePicker, setShowPagePicker] = useState(false);
  const [funnelName, setFunnelName] = useState("");
  const [funnelSlug, setFunnelSlug] = useState("");
  const [currency, setCurrency] = useState<FunnelCurrency>("USD");
  const [headerScripts, setHeaderScripts] = useState("");
  const [faviconUrl, setFaviconUrl] = useState("");
  const [autocompleteAddress, setAutocompleteAddress] = useState(false);
  const [fireLeadEvent, setFireLeadEvent] = useState(false);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(["es"]);
  const [status, setStatus] = useState<FunnelWorkspaceStatus>("draft");
  const [graph, setGraph] = useState<FunnelGraph>(() => emptyGraph(funnelId, "Nuevo funnel"));
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    const prepared = ensureFunnelEditorDraft(funnelId);

    if (!prepared) {
      return;
    }

    const draft = readWorkspaceDraft(funnelId);

    if (!draft) {
      return;
    }

    setFunnelName(draft.funnel.name);
    setFunnelSlug(draft.funnel.slug);
    setCurrency(draft.funnel.currency);
    setGraph(syncFunnelPagesFromNodes(draft.graph));
    setHeaderScripts(draft.workspaceConfig.headerScripts);
    setFaviconUrl(draft.workspaceConfig.faviconUrl);
    setAutocompleteAddress(draft.workspaceConfig.autocompleteAddress);
    setFireLeadEvent(draft.workspaceConfig.fireLeadEvent);
    setSelectedLanguages(
      draft.workspaceConfig.languages.length ? draft.workspaceConfig.languages : ["es"],
    );
    setStatus(draft.workspaceConfig.status);
    setHasUnsavedChanges(false);
  }, [funnelId]);

  const currentFunnel = useMemo(() => findFunnel(funnelId), [funnelId]);

  const summary = useMemo(() => {
    const visitors = graph.nodes.reduce((sum, node) => sum + node.analytics.visits, 0);
    const orders = graph.nodes
      .filter((node) => node.type === "checkout")
      .reduce((sum, node) => sum + node.analytics.clicks, 0);
    const revenue = orders * 39;
    const epc = visitors > 0 ? revenue / visitors : 0;
    const conversion = visitors > 0 ? (orders / visitors) * 100 : 0;

    return {
      visitors,
      orders,
      revenue,
      epc,
      conversion,
    };
  }, [graph.nodes]);

  const persistGraph = (nextGraph: FunnelGraph) => {
    const baseState = loadEditorState(funnelId);
    saveEditorState(
      funnelId,
      baseState?.blocks ?? [],
      baseState?.profile ?? null,
      baseState?.pageBuilder ?? null,
      baseState?.pageBuilderPages ?? null,
      syncFunnelPagesFromNodes(nextGraph),
      baseState?.storeBuilder ?? null,
    );
  };

  const handleGraphChange = (nextGraph: FunnelGraph) => {
    const normalizedGraph = syncFunnelPagesFromNodes(nextGraph);
    setGraph(normalizedGraph);
    setHasUnsavedChanges(true);
    persistGraph(normalizedGraph);
  };

  const addFunnelPage = (type: FunnelNodeType) => {
    const { graph: nextGraph } = addPage(graph, type, getNextNodePosition(graph));
    handleGraphChange(nextGraph);
    setShowPagePicker(false);
  };

  const handleToggleLanguage = (languageCode: string) => {
    setSelectedLanguages((current) =>
      current.includes(languageCode)
        ? current.filter((language) => language !== languageCode)
        : [...current, languageCode],
    );
    setHasUnsavedChanges(true);
  };

  const handleSaveWorkspace = () => {
    if (!funnelName.trim()) {
      toast.error("El nombre del funnel es obligatorio.");
      return;
    }

    if (!funnelSlug.trim()) {
      toast.error("El slug del funnel es obligatorio.");
      return;
    }

    const updatedFunnel = updateFunnel(funnelId, {
      name: funnelName,
      slug: slugifyFunnelName(funnelSlug),
      currency,
    });

    if (!updatedFunnel) {
      toast.error("No se pudo guardar la configuracion del funnel.");
      return;
    }

    saveFunnelWorkspaceConfig(funnelId, {
      headerScripts,
      faviconUrl,
      autocompleteAddress,
      fireLeadEvent,
      languages: selectedLanguages.length ? selectedLanguages : ["es"],
      status,
    });
    persistGraph(graph);
    setHasUnsavedChanges(false);
    toast.success("Funnel guardado.", {
      description: `${updatedFunnel.name} quedo actualizado.`,
    });
  };

  const handlePublishWorkspace = () => {
    const baseState = loadEditorState(funnelId);
    const publishedState = publishEditorState(
      funnelId,
      baseState?.blocks ?? [],
      baseState?.profile ?? null,
      baseState?.pageBuilder ?? null,
      baseState?.pageBuilderPages ?? null,
      graph,
      baseState?.storeBuilder ?? null,
    );

    if (!publishedState) {
      toast.error("No se pudo publicar el funnel.");
      return;
    }

    setStatus("published");
    saveFunnelWorkspaceConfig(funnelId, { status: "published" });
    setHasUnsavedChanges(false);
    toast.success("Funnel publicado.");
  };

  if (!currentFunnel) {
    return (
      <main className="min-h-screen bg-background px-6 py-10">
        <div className="mx-auto max-w-5xl rounded-[2rem] border border-border/80 bg-card/90 p-8">
          <p className="text-lg font-semibold text-foreground">Funnel no encontrado</p>
          <p className="mt-2 text-sm text-muted-foreground">
            El funnel solicitado no existe o fue eliminado.
          </p>
          <Button asChild className="mt-6 rounded-2xl">
            <Link to="/funnels">
              <ArrowLeft className="h-4 w-4" />
              Volver a funnels
            </Link>
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100/60">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/95 backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 lg:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="rounded-xl"
              onClick={() => navigate("/funnels")}
              aria-label="Volver a funnels"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">{funnelName}</p>
              <p className="text-xs text-muted-foreground">/{funnelSlug}</p>
            </div>
            <span className="rounded-full border border-border bg-card px-2.5 py-1 text-xs font-semibold text-foreground">
              {currency}
            </span>
          </div>

          <nav className="flex flex-wrap items-center gap-1 rounded-2xl border border-border bg-card p-1">
            <button
              type="button"
              onClick={() => setActiveTab("summary")}
              className={cn(
                "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                activeTab === "summary"
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Home className="h-4 w-4" />
              Resumen
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("builder")}
              className={cn(
                "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                activeTab === "builder"
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Wrench className="h-4 w-4" />
              Construir y Disenar
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("settings")}
              className={cn(
                "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                activeTab === "settings"
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Settings className="h-4 w-4" />
              Configuracion
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("languages")}
              className={cn(
                "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                activeTab === "languages"
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Languages className="h-4 w-4" />
              Idiomas
            </button>
          </nav>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={status}
              onChange={(event) => {
                setStatus(event.target.value as FunnelWorkspaceStatus);
                setHasUnsavedChanges(true);
              }}
              className="h-10 rounded-xl border border-border bg-card px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="draft">No Publicado</option>
              <option value="published">Publicado</option>
            </select>
            <Button type="button" variant="outline" className="rounded-xl" onClick={handleSaveWorkspace}>
              {hasUnsavedChanges ? "Guardar cambios" : "Guardar"}
            </Button>
            <Button type="button" className="rounded-xl" onClick={handlePublishWorkspace}>
              Publicar
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1700px] px-4 py-6 lg:px-6">
        {activeTab === "summary" ? (
          <section className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
              <article className="rounded-3xl border border-border/80 bg-card/90 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Visitantes
                </p>
                <p className="mt-3 text-3xl font-semibold text-foreground">{summary.visitors}</p>
              </article>
              <article className="rounded-3xl border border-border/80 bg-card/90 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Pedidos
                </p>
                <p className="mt-3 text-3xl font-semibold text-foreground">{summary.orders}</p>
              </article>
              <article className="rounded-3xl border border-border/80 bg-card/90 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Ingresos
                </p>
                <p className="mt-3 text-3xl font-semibold text-foreground">
                  {formatCurrency(summary.revenue)}
                </p>
              </article>
              <article className="rounded-3xl border border-border/80 bg-card/90 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  EPC
                </p>
                <p className="mt-3 text-3xl font-semibold text-foreground">
                  {formatCurrency(summary.epc)}
                </p>
              </article>
              <article className="rounded-3xl border border-border/80 bg-card/90 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Tasa de conversion
                </p>
                <p className="mt-3 text-3xl font-semibold text-foreground">
                  {summary.conversion.toFixed(2)}%
                </p>
              </article>
            </div>

            <article className="rounded-3xl border border-border/80 bg-card/90 p-5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-xl font-semibold text-foreground">Rendimiento de las paginas</h2>
                <div className="inline-flex items-center gap-2 rounded-xl border border-border/80 bg-secondary/30 px-3 py-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {new Date().toLocaleDateString("en-US", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </div>
              </div>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[36rem] text-left text-sm">
                  <thead className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    <tr>
                      <th className="pb-3 font-medium">Pagina</th>
                      <th className="pb-3 font-medium">Visitas</th>
                      <th className="pb-3 font-medium">CTR</th>
                      <th className="pb-3 font-medium">Clics</th>
                    </tr>
                  </thead>
                  <tbody>
                    {graph.nodes.length ? (
                      graph.nodes.map((node) => (
                        <tr key={node.id} className="border-t border-border/70">
                          <td className="py-3 font-medium text-foreground">{getNodeLabel(node.type)}</td>
                          <td className="py-3 text-muted-foreground">{node.analytics.visits}</td>
                          <td className="py-3 text-muted-foreground">
                            {node.analytics.conversionRate.toFixed(1)}%
                          </td>
                          <td className="py-3 text-muted-foreground">{node.analytics.clicks}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="py-10 text-center text-muted-foreground">
                          No hay paginas en este funnel.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </article>
          </section>
        ) : null}

        {activeTab === "builder" ? (
          <section className="relative">
            {graph.nodes.length ? (
              <div className="relative">
                <FunnelBuilderEditor
                  graph={graph}
                  onGraphChange={handleGraphChange}
                  onOpenPage={(node) =>
                    toast.info(`${getNodeLabel(node.type)} listo para edicion visual en la siguiente iteracion.`)
                  }
                  onPreviewPage={(node) =>
                    toast.info(`Preview de ${getNodeLabel(node.type)} en esta ruta disponible en la siguiente iteracion.`)
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowPagePicker((current) => !current)}
                  className="fixed bottom-7 right-7 z-30 inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl transition-colors hover:opacity-90"
                  aria-label="Agregar pagina al funnel"
                >
                  <Plus className="h-6 w-6" />
                </button>
              </div>
            ) : (
              <div className="rounded-[2rem] border border-border/80 bg-card/90 px-6 py-16 text-center">
                <p className="text-3xl font-semibold text-foreground">No hay paginas</p>
                <p className="mt-3 text-lg text-muted-foreground">
                  Usa el boton de abajo para crear la primera pagina del funnel.
                </p>
                <button
                  type="button"
                  onClick={() => setShowPagePicker(true)}
                  className="mt-7 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-colors hover:opacity-90"
                  aria-label="Agregar primera pagina"
                >
                  <Plus className="h-8 w-8" />
                </button>
              </div>
            )}

            {showPagePicker ? (
              <div
                className={cn(
                  "mt-5 rounded-[2rem] border border-border/80 bg-card/95 p-4 shadow-xl",
                  graph.nodes.length ? "fixed bottom-24 right-6 z-40 w-[20rem] lg:w-[22rem]" : "mx-auto max-w-xl",
                )}
              >
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                    Add new page
                  </p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="rounded-xl"
                    onClick={() => setShowPagePicker(false)}
                  >
                    Cerrar
                  </Button>
                </div>

                <div className="grid grid-cols-3 gap-2.5">
                  {pageTypeCards.map((card) => (
                    <button
                      key={card.id}
                      type="button"
                      onClick={() => addFunnelPage(card.id)}
                      className="rounded-2xl border border-border/80 bg-secondary/20 p-3 text-center transition-colors hover:border-primary/30 hover:bg-primary/5"
                    >
                      <span className={cn("mx-auto inline-flex rounded-full px-2 py-1 text-[10px] font-semibold", card.accent)}>
                        {card.label}
                      </span>
                    </button>
                  ))}
                  <div className="rounded-2xl border border-dashed border-border/80 bg-secondary/10 p-3 text-center">
                    <span className="mx-auto inline-flex rounded-full bg-muted px-2 py-1 text-[10px] font-semibold text-muted-foreground">
                      Split test
                    </span>
                    <p className="mt-2 text-xs text-muted-foreground">Proximamente</p>
                  </div>
                </div>
              </div>
            ) : null}
          </section>
        ) : null}

        {activeTab === "settings" ? (
          <section className="grid gap-5 lg:grid-cols-[18rem_minmax(0,1fr)]">
            <aside className="rounded-[2rem] border border-border/80 bg-card/90 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                Configuracion
              </p>
              <div className="mt-4 space-y-1.5">
                <button
                  type="button"
                  onClick={() => setSettingsSection("general")}
                  className={cn(
                    "flex w-full items-center justify-between rounded-2xl px-3 py-2 text-sm transition-colors",
                    settingsSection === "general"
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground",
                  )}
                >
                  General
                </button>
                <button
                  type="button"
                  onClick={() => setSettingsSection("gateways")}
                  className={cn(
                    "flex w-full items-center justify-between rounded-2xl px-3 py-2 text-sm transition-colors",
                    settingsSection === "gateways"
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground",
                  )}
                >
                  Pasarelas de pago
                  <TriangleAlert className="h-4 w-4 text-amber-500" />
                </button>
                <button
                  type="button"
                  onClick={() => setSettingsSection("security")}
                  className={cn(
                    "flex w-full items-center justify-between rounded-2xl px-3 py-2 text-sm transition-colors",
                    settingsSection === "security"
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground",
                  )}
                >
                  Seguridad
                </button>
                <button
                  type="button"
                  onClick={() => setSettingsSection("tracking")}
                  className={cn(
                    "flex w-full items-center justify-between rounded-2xl px-3 py-2 text-sm transition-colors",
                    settingsSection === "tracking"
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground",
                  )}
                >
                  Seguimiento
                  <TriangleAlert className="h-4 w-4 text-amber-500" />
                </button>
                <button
                  type="button"
                  onClick={() => setSettingsSection("currency")}
                  className={cn(
                    "flex w-full items-center justify-between rounded-2xl px-3 py-2 text-sm transition-colors",
                    settingsSection === "currency"
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground",
                  )}
                >
                  Moneda
                </button>
              </div>
            </aside>

            <article className="rounded-[2rem] border border-border/80 bg-card/90 p-5">
              {settingsSection === "general" ? (
                <div className="space-y-5">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="text-2xl font-semibold text-foreground">Configuracion del Funnel</h2>
                    <Button type="button" variant="outline" className="rounded-xl">
                      <Eye className="h-4 w-4" />
                      Vista previa
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="funnel-name-settings">Nombre del funnel</Label>
                    <Input
                      id="funnel-name-settings"
                      className="rounded-2xl"
                      value={funnelName}
                      onChange={(event) => {
                        setFunnelName(event.target.value);
                        setHasUnsavedChanges(true);
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="funnel-slug-settings">URL del funnel</Label>
                    <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-border/80 bg-secondary/20 px-3 py-2.5 text-sm">
                      <span className="text-muted-foreground">shopcod.site/</span>
                      <Input
                        id="funnel-slug-settings"
                        value={funnelSlug}
                        onChange={(event) => {
                          setFunnelSlug(slugifyFunnelName(event.target.value));
                          setHasUnsavedChanges(true);
                        }}
                        className="h-8 min-w-[12rem] border-0 bg-transparent px-0 py-0 shadow-none focus-visible:ring-0"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="funnel-header-scripts">Scripts personalizados</Label>
                    <Textarea
                      id="funnel-header-scripts"
                      className="min-h-[8rem] rounded-2xl"
                      placeholder="Funnel header scripts"
                      value={headerScripts}
                      onChange={(event) => {
                        setHeaderScripts(event.target.value);
                        setHasUnsavedChanges(true);
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="funnel-favicon">Favicon URL</Label>
                    <Input
                      id="funnel-favicon"
                      className="rounded-2xl"
                      placeholder="https://..."
                      value={faviconUrl}
                      onChange={(event) => {
                        setFaviconUrl(event.target.value);
                        setHasUnsavedChanges(true);
                      }}
                    />
                  </div>

                  <label className="flex items-center gap-3 rounded-2xl border border-border/80 bg-secondary/20 px-3 py-3 text-sm text-foreground">
                    <input
                      type="checkbox"
                      checked={autocompleteAddress}
                      onChange={(event) => {
                        setAutocompleteAddress(event.target.checked);
                        setHasUnsavedChanges(true);
                      }}
                      className="h-4 w-4 rounded border-border"
                    />
                    Habilitar autocompletado de direccion
                  </label>

                  <label className="flex items-center gap-3 rounded-2xl border border-border/80 bg-secondary/20 px-3 py-3 text-sm text-foreground">
                    <input
                      type="checkbox"
                      checked={fireLeadEvent}
                      onChange={(event) => {
                        setFireLeadEvent(event.target.checked);
                        setHasUnsavedChanges(true);
                      }}
                      className="h-4 w-4 rounded border-border"
                    />
                    Disparar evento Lead en lugar de Purchase
                  </label>
                </div>
              ) : null}

              {settingsSection === "currency" ? (
                <div className="space-y-5">
                  <h2 className="text-2xl font-semibold text-foreground">Moneda de operacion</h2>
                  <div className="space-y-2">
                    <Label htmlFor="funnel-currency-settings">Moneda principal</Label>
                    <select
                      id="funnel-currency-settings"
                      value={currency}
                      onChange={(event) => {
                        setCurrency(event.target.value as FunnelCurrency);
                        setHasUnsavedChanges(true);
                      }}
                      className="h-11 w-full rounded-2xl border border-border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="PEN">PEN</option>
                    </select>
                  </div>
                </div>
              ) : null}

              {settingsSection === "gateways" ? (
                <div className="space-y-4">
                  <h2 className="text-2xl font-semibold text-foreground">Pasarelas de pago</h2>
                  <div className="rounded-2xl border border-dashed border-border/80 bg-secondary/20 p-4 text-sm text-muted-foreground">
                    Configura Stripe, PayPal o Mercado Pago desde Configuracion global del workspace.
                  </div>
                </div>
              ) : null}

              {settingsSection === "security" ? (
                <div className="space-y-4">
                  <h2 className="text-2xl font-semibold text-foreground">Seguridad</h2>
                  <div className="rounded-2xl border border-border/80 bg-secondary/20 p-4">
                    <div className="flex items-start gap-3">
                      <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Sparkles className="h-4 w-4" />
                      </span>
                      <p className="text-sm text-muted-foreground">
                        Usa este panel para reforzar reglas de anti-fraude y restricciones por pais.
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}

              {settingsSection === "tracking" ? (
                <div className="space-y-4">
                  <h2 className="text-2xl font-semibold text-foreground">Seguimiento</h2>
                  <div className="rounded-2xl border border-dashed border-border/80 bg-secondary/20 p-4 text-sm text-muted-foreground">
                    Pega pixeles y scripts en "Scripts personalizados" para activar tracking.
                  </div>
                </div>
              ) : null}
            </article>
          </section>
        ) : null}

        {activeTab === "languages" ? (
          <section className="space-y-5">
            <article className="rounded-[2rem] border border-border/80 bg-card/90 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-semibold text-foreground">Idiomas del funnel</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Activa idiomas para duplicar contenido y manejar traducciones por pagina.
                  </p>
                </div>
                <span className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-secondary/20 px-3 py-1.5 text-xs font-semibold text-foreground">
                  <Globe2 className="h-4 w-4 text-primary" />
                  {selectedLanguages.length} activos
                </span>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-3">
                {availableLanguages.map((language) => {
                  const isEnabled = selectedLanguages.includes(language.code);

                  return (
                    <button
                      key={language.code}
                      type="button"
                      onClick={() => handleToggleLanguage(language.code)}
                      className={cn(
                        "rounded-2xl border p-4 text-left transition-colors",
                        isEnabled
                          ? "border-primary/30 bg-primary/10"
                          : "border-border/80 bg-secondary/10 hover:border-primary/20",
                      )}
                    >
                      <p className="text-lg font-semibold text-foreground">{language.label}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                        {language.code}
                      </p>
                    </button>
                  );
                })}
              </div>
            </article>
          </section>
        ) : null}
      </div>
    </main>
  );
}
