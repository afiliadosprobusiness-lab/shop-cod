import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Globe2,
  Languages,
  Layers3,
  Package,
  Settings,
  ShoppingCart,
  Store as StoreIcon,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import MainContent from "@/components/dashboard/MainContent";
import { Button } from "@/components/ui/button";
import { loadEditorState } from "@/lib/editor";
import {
  getPaymentMethodOptions,
  getStoreDashboardSnapshot,
  getStoreTemplate,
  type StoreCurrency,
  type StoreDashboardSectionId,
} from "@/lib/stores";
import { cn } from "@/lib/utils";

const dashboardSections: {
  id: StoreDashboardSectionId;
  label: string;
  description: string;
}[] = [
  {
    id: "summary",
    label: "Resumen",
    description: "Metricas base y tablas de rendimiento.",
  },
  {
    id: "products",
    label: "Productos",
    description: "Catalogo principal y performance.",
  },
  {
    id: "collections",
    label: "Colecciones",
    description: "Agrupaciones y cobertura del catalogo.",
  },
  {
    id: "orders",
    label: "Pedidos",
    description: "Estado operativo de conversion y fulfillment.",
  },
  {
    id: "pages",
    label: "Pages",
    description: "Mapa de paginas activas de la tienda.",
  },
  {
    id: "languages",
    label: "Idiomas",
    description: "Idiomas activos y en preparacion.",
  },
  {
    id: "settings",
    label: "Configuracion",
    description: "Parametros comerciales y operativos.",
  },
];

function formatNumber(value: number) {
  return new Intl.NumberFormat("es-PE").format(value);
}

function formatPercent(value: number) {
  return `${value.toFixed(2)}%`;
}

function formatCurrency(value: number, currency: StoreCurrency) {
  const localeByCurrency: Record<StoreCurrency, string> = {
    USD: "en-US",
    EUR: "es-ES",
    PEN: "es-PE",
  };

  return new Intl.NumberFormat(localeByCurrency[currency], {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "PEN" ? 0 : 2,
  }).format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-PE", {
    dateStyle: "medium",
  }).format(new Date(value));
}

export default function StoreDashboardPage() {
  const navigate = useNavigate();
  const { storeId = "" } = useParams();
  const [activeSection, setActiveSection] = useState<StoreDashboardSectionId>("summary");

  useEffect(() => {
    setActiveSection("summary");
  }, [storeId]);

  const snapshot = useMemo(() => getStoreDashboardSnapshot(storeId), [storeId]);
  const editorState = useMemo(
    () => (snapshot ? loadEditorState(snapshot.store.id) : null),
    [snapshot],
  );

  if (!snapshot) {
    return (
      <MainContent
        eyebrow="Storefronts"
        title="Tienda no encontrada"
        description="La tienda solicitada no existe en este navegador o fue eliminada."
        actions={
          <Button asChild variant="outline" className="rounded-2xl">
            <Link to="/stores">
              <ArrowLeft className="h-4 w-4" />
              Volver a tiendas
            </Link>
          </Button>
        }
      >
        <section className="rounded-[2rem] border border-dashed border-border bg-card/70 p-8 text-center">
          <p className="text-lg font-semibold text-foreground">No hay datos para este storeId</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Revisa la lista en `/stores` y vuelve a entrar desde una tienda existente.
          </p>
        </section>
      </MainContent>
    );
  }

  const selectedSection =
    dashboardSections.find((section) => section.id === activeSection) ?? dashboardSections[0];
  const template = getStoreTemplate(snapshot.store.templateId);
  const paymentMethodLabel =
    getPaymentMethodOptions().find((option) => option.id === snapshot.store.paymentMethod)?.title ??
    "Metodo no disponible";
  const builderState = editorState?.storeBuilder;
  const products = builderState?.products ?? [];
  const collections = builderState?.collections ?? [];
  const orderStatusCards = [
    {
      label: "Nuevos",
      value: Math.max(4, Math.round(snapshot.metrics.orders * 0.28)),
    },
    {
      label: "Confirmados",
      value: Math.max(6, Math.round(snapshot.metrics.orders * 0.42)),
    },
    {
      label: "Despachados",
      value: Math.max(3, Math.round(snapshot.metrics.orders * 0.21)),
    },
    {
      label: "Entregados",
      value: Math.max(2, Math.round(snapshot.metrics.orders * 0.09)),
    },
  ];

  return (
    <MainContent
      eyebrow="Storefronts"
      title={snapshot.store.name}
      description={`Panel interno de /stores/${snapshot.store.id} con resumen operativo, analytics basicos y navegacion interna por secciones.`}
      actions={
        <>
          <Button asChild variant="outline" className="rounded-2xl">
            <Link to="/stores">
              <ArrowLeft className="h-4 w-4" />
              Volver
            </Link>
          </Button>
          <Button type="button" className="rounded-2xl" onClick={() => navigate(`/editor/${snapshot.store.id}`)}>
            Abrir editor
            <ArrowRight className="h-4 w-4" />
          </Button>
        </>
      }
    >
      <section className="rounded-[2rem] border border-border/80 bg-card/90 p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
                Tienda activa
              </span>
              <span className="rounded-full border border-border/70 bg-secondary/35 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                {template.name}
              </span>
              <span className="rounded-full border border-border/70 bg-secondary/35 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                {paymentMethodLabel}
              </span>
            </div>
            <div>
              <p className="text-lg font-semibold text-foreground">Navegacion interna</p>
              <p className="text-sm text-muted-foreground">{selectedSection.description}</p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[22rem]">
            <div className="rounded-2xl border border-border/80 bg-secondary/25 p-4">
              <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Slug</p>
              <p className="mt-2 font-semibold text-foreground">/{snapshot.store.slug}</p>
            </div>
            <div className="rounded-2xl border border-border/80 bg-secondary/25 p-4">
              <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Moneda</p>
              <p className="mt-2 font-semibold text-foreground">{snapshot.store.currency}</p>
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {dashboardSections.map((section) => (
            <button
              key={section.id}
              type="button"
              onClick={() => setActiveSection(section.id)}
              className={cn(
                "rounded-2xl border px-4 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                activeSection === section.id
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border/80 bg-secondary/20 text-muted-foreground hover:border-primary/20 hover:text-foreground",
              )}
            >
              {section.label}
            </button>
          ))}
        </div>
      </section>

      {activeSection === "summary" ? (
        <>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-[1.75rem] border border-border/80 bg-card/90 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Visitantes
              </p>
              <p className="mt-3 text-3xl font-semibold text-foreground">
                {formatNumber(snapshot.metrics.visitors)}
              </p>
            </div>
            <div className="rounded-[1.75rem] border border-border/80 bg-card/90 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Pedidos
              </p>
              <p className="mt-3 text-3xl font-semibold text-foreground">
                {formatNumber(snapshot.metrics.orders)}
              </p>
            </div>
            <div className="rounded-[1.75rem] border border-border/80 bg-card/90 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Ventas
              </p>
              <p className="mt-3 text-3xl font-semibold text-foreground">
                {formatCurrency(snapshot.metrics.sales, snapshot.store.currency)}
              </p>
            </div>
            <div className="rounded-[1.75rem] border border-border/80 bg-card/90 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Conversion rate
              </p>
              <p className="mt-3 text-3xl font-semibold text-foreground">
                {formatPercent(snapshot.metrics.conversionRate)}
              </p>
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
            <article className="rounded-[2rem] border border-border/80 bg-card/90 p-5">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Package className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-lg font-semibold text-foreground">Productos mas vendidos</p>
                  <p className="text-sm text-muted-foreground">
                    Ranking inicial construido desde el draft local de la tienda.
                  </p>
                </div>
              </div>

              <div className="mt-5 overflow-x-auto">
                <table className="w-full min-w-[32rem] text-left text-sm">
                  <thead className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    <tr>
                      <th className="pb-3 font-medium">Producto</th>
                      <th className="pb-3 font-medium">Unidades</th>
                      <th className="pb-3 font-medium">Ventas</th>
                      <th className="pb-3 font-medium">Stock</th>
                    </tr>
                  </thead>
                  <tbody>
                    {snapshot.topProducts.map((product) => (
                      <tr key={product.id} className="border-t border-border/70">
                        <td className="py-3 font-medium text-foreground">{product.name}</td>
                        <td className="py-3 text-muted-foreground">{formatNumber(product.unitsSold)}</td>
                        <td className="py-3 text-muted-foreground">
                          {formatCurrency(product.revenue, snapshot.store.currency)}
                        </td>
                        <td className="py-3 text-muted-foreground">{formatNumber(product.stock)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>

            <article className="rounded-[2rem] border border-border/80 bg-card/90 p-5">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Globe2 className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-lg font-semibold text-foreground">Fuentes de trafico</p>
                  <p className="text-sm text-muted-foreground">
                    Desglose base de adquisicion para monitoreo rapido.
                  </p>
                </div>
              </div>

              <div className="mt-5 overflow-x-auto">
                <table className="w-full min-w-[32rem] text-left text-sm">
                  <thead className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    <tr>
                      <th className="pb-3 font-medium">Fuente</th>
                      <th className="pb-3 font-medium">Visitantes</th>
                      <th className="pb-3 font-medium">Pedidos</th>
                      <th className="pb-3 font-medium">Conv.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {snapshot.trafficSources.map((source) => (
                      <tr key={source.source} className="border-t border-border/70">
                        <td className="py-3 font-medium text-foreground">{source.source}</td>
                        <td className="py-3 text-muted-foreground">{formatNumber(source.visitors)}</td>
                        <td className="py-3 text-muted-foreground">{formatNumber(source.orders)}</td>
                        <td className="py-3 text-muted-foreground">
                          {formatPercent(source.conversionRate)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>
          </section>
        </>
      ) : null}

      {activeSection === "products" ? (
        <section className="rounded-[2rem] border border-border/80 bg-card/90 p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Package className="h-5 w-5" />
            </span>
            <div>
              <p className="text-lg font-semibold text-foreground">Catalogo principal</p>
              <p className="text-sm text-muted-foreground">
                Productos sincronizados desde el store builder local.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => (
              <article
                key={product.id}
                className="rounded-[1.5rem] border border-border/80 bg-secondary/20 p-4"
              >
                <p className="font-semibold text-foreground">{product.name}</p>
                <p className="mt-1 text-sm text-muted-foreground">{product.description}</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                      Precio
                    </p>
                    <p className="mt-1 text-sm font-semibold text-foreground">
                      {formatCurrency(product.price, snapshot.store.currency)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                      Stock
                    </p>
                    <p className="mt-1 text-sm font-semibold text-foreground">{product.stock}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {activeSection === "collections" ? (
        <section className="rounded-[2rem] border border-border/80 bg-card/90 p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Layers3 className="h-5 w-5" />
            </span>
            <div>
              <p className="text-lg font-semibold text-foreground">Colecciones</p>
              <p className="text-sm text-muted-foreground">
                Organizacion del catalogo disponible en la tienda.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {collections.map((collection) => (
              <article
                key={collection.id}
                className="rounded-[1.5rem] border border-border/80 bg-secondary/20 p-4"
              >
                <p className="font-semibold text-foreground">{collection.name}</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {collection.productIds.length} productos asociados.
                </p>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {activeSection === "orders" ? (
        <section className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {orderStatusCards.map((card) => (
              <div
                key={card.label}
                className="rounded-[1.75rem] border border-border/80 bg-card/90 p-5"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  {card.label}
                </p>
                <p className="mt-3 text-3xl font-semibold text-foreground">{card.value}</p>
              </div>
            ))}
          </div>

          <div className="rounded-[2rem] border border-border/80 bg-card/90 p-5">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <ShoppingCart className="h-5 w-5" />
              </span>
              <div>
                <p className="text-lg font-semibold text-foreground">Operacion basica</p>
                <p className="text-sm text-muted-foreground">
                  Resumen rapido para seguimiento comercial sin backend conectado.
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-border/80 bg-secondary/20 p-4">
                <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  Ticket promedio
                </p>
                <p className="mt-2 font-semibold text-foreground">
                  {formatCurrency(
                    snapshot.metrics.sales / Math.max(1, snapshot.metrics.orders),
                    snapshot.store.currency,
                  )}
                </p>
              </div>
              <div className="rounded-2xl border border-border/80 bg-secondary/20 p-4">
                <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  Entrega estimada
                </p>
                <p className="mt-2 font-semibold text-foreground">24-72 horas</p>
              </div>
              <div className="rounded-2xl border border-border/80 bg-secondary/20 p-4">
                <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  Pago actual
                </p>
                <p className="mt-2 font-semibold text-foreground">{paymentMethodLabel}</p>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {activeSection === "pages" ? (
        <section className="rounded-[2rem] border border-border/80 bg-card/90 p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <StoreIcon className="h-5 w-5" />
            </span>
            <div>
              <p className="text-lg font-semibold text-foreground">Pages</p>
              <p className="text-sm text-muted-foreground">
                Estructura inicial de paginas generada para la tienda.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {snapshot.store.pages.map((page, index) => (
              <article
                key={page.id}
                className="rounded-[1.5rem] border border-border/80 bg-secondary/20 p-4"
              >
                <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  Pagina {index + 1}
                </p>
                <p className="mt-2 font-semibold text-foreground">{page.name}</p>
                <p className="mt-1 text-sm text-muted-foreground">Tipo: {page.type}</p>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {activeSection === "languages" ? (
        <section className="rounded-[2rem] border border-border/80 bg-card/90 p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Languages className="h-5 w-5" />
            </span>
            <div>
              <p className="text-lg font-semibold text-foreground">Idiomas</p>
              <p className="text-sm text-muted-foreground">
                Configuracion base por moneda y mercado objetivo.
              </p>
            </div>
          </div>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[28rem] text-left text-sm">
              <thead className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                <tr>
                  <th className="pb-3 font-medium">Idioma</th>
                  <th className="pb-3 font-medium">Codigo</th>
                  <th className="pb-3 font-medium">Estado</th>
                </tr>
              </thead>
              <tbody>
                {snapshot.languages.map((language) => (
                  <tr key={language.code} className="border-t border-border/70">
                    <td className="py-3 font-medium text-foreground">{language.label}</td>
                    <td className="py-3 text-muted-foreground">{language.code}</td>
                    <td className="py-3">
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-1 text-xs font-medium",
                          language.status === "principal"
                            ? "bg-primary/10 text-primary"
                            : language.status === "activo"
                              ? "bg-emerald-500/10 text-emerald-300"
                              : "bg-secondary/60 text-muted-foreground",
                        )}
                      >
                        {language.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {activeSection === "settings" ? (
        <section className="rounded-[2rem] border border-border/80 bg-card/90 p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Settings className="h-5 w-5" />
            </span>
            <div>
              <p className="text-lg font-semibold text-foreground">Configuracion</p>
              <p className="text-sm text-muted-foreground">
                Parametros clave de la tienda y del checkout local.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <div className="rounded-[1.5rem] border border-border/80 bg-secondary/20 p-4">
              <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                Plantilla
              </p>
              <p className="mt-2 font-semibold text-foreground">{template.name}</p>
            </div>
            <div className="rounded-[1.5rem] border border-border/80 bg-secondary/20 p-4">
              <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                Metodo de pago
              </p>
              <p className="mt-2 font-semibold text-foreground">{paymentMethodLabel}</p>
            </div>
            <div className="rounded-[1.5rem] border border-border/80 bg-secondary/20 p-4">
              <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                Creada
              </p>
              <p className="mt-2 font-semibold text-foreground">
                {formatDate(snapshot.store.createdAt)}
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-border/80 bg-secondary/20 p-4">
              <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                Dominio base
              </p>
              <p className="mt-2 font-semibold text-foreground break-all">
                {builderState?.checkout.domains[0] ?? `${snapshot.store.slug}.shopcod.co`}
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-border/80 bg-secondary/20 p-4">
              <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                Monedas habilitadas
              </p>
              <p className="mt-2 font-semibold text-foreground">
                {builderState?.checkout.enabledCurrencies.join(", ") || snapshot.store.currency}
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-border/80 bg-secondary/20 p-4">
              <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                Order bumps
              </p>
              <p className="mt-2 font-semibold text-foreground">
                {builderState?.checkout.orderBumps.length ?? 0}
              </p>
            </div>
          </div>
        </section>
      ) : null}
    </MainContent>
  );
}
