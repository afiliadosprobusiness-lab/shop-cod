import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  ChevronDown,
  Eye,
  ExternalLink,
  FileText,
  Globe2,
  Languages,
  Layers3,
  Package,
  RefreshCcw,
  Settings,
  ShoppingCart,
  SlidersHorizontal,
  Store as StoreIcon,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
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

const dashboardSections: Array<{
  id: StoreDashboardSectionId;
  label: string;
  icon: typeof StoreIcon;
}> = [
  { id: "summary", label: "Resumen", icon: StoreIcon },
  { id: "products", label: "Productos", icon: Package },
  { id: "collections", label: "Colecciones", icon: Layers3 },
  { id: "orders", label: "Pedidos", icon: ShoppingCart },
  { id: "pages", label: "Pages", icon: FileText },
  { id: "languages", label: "Idiomas", icon: Languages },
  { id: "settings", label: "Configuracion", icon: Settings },
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
      <main className="flex-1 overflow-x-hidden">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
          <section className="rounded-[2rem] border border-dashed border-border bg-card/70 p-8 text-center">
            <p className="text-lg font-semibold text-foreground">Tienda no encontrada</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Revisa la lista en `/stores` y vuelve a entrar desde una tienda existente.
            </p>
            <Button asChild variant="outline" className="mt-5 rounded-2xl">
              <Link to="/stores">
                <ArrowLeft className="h-4 w-4" />
                Volver a tiendas
              </Link>
            </Button>
          </section>
        </div>
      </main>
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
  const averageTicket = snapshot.metrics.sales / Math.max(1, snapshot.metrics.orders);
  const domain = builderState?.checkout.domains[0] ?? `${snapshot.store.slug}.shopcod.co`;
  const enabledCurrencies = builderState?.checkout.enabledCurrencies.join(", ") || snapshot.store.currency;
  const orderBumps = builderState?.checkout.orderBumps.length ?? 0;
  const bundles = builderState?.bundles.length ?? 0;
  const addedToCart = Math.max(0, Math.round(snapshot.metrics.visitors * 0.18));
  const reachedCheckout = Math.max(0, Math.round(snapshot.metrics.visitors * 0.09));

  const summaryContent = (
    <section className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-3xl font-semibold text-foreground">Resumen de la tienda</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Esto es lo que esta sucediendo con tu tienda.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" className="rounded-xl">
            <RefreshCcw className="h-4 w-4" />
            Actualizar
          </Button>
          <Button type="button" variant="outline" className="rounded-xl">
            <SlidersHorizontal className="h-4 w-4" />
            Filtrar por producto
          </Button>
          <Button type="button" variant="outline" className="rounded-xl">
            <CalendarDays className="h-4 w-4" />
            {formatDate(new Date().toISOString())}
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <article className="rounded-[1.5rem] border border-primary/35 bg-primary/5 p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <Globe2 className="h-6 w-6" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Prepara tu tienda
              </p>
              <p className="mt-1 text-2xl font-semibold text-foreground">
                Paso 3 de 3: Anadir dominio personalizado
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Vincula tu dominio unico y con marca para establecer tu presencia online.
              </p>
            </div>
          </div>

          <Button type="button" variant="outline" className="rounded-xl">
            + Anadir dominio personalizado
          </Button>
        </div>
      </article>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <article className="rounded-2xl border border-border/80 bg-card/90 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Visitantes</p>
          <p className="mt-2 text-3xl font-semibold text-foreground">{formatNumber(snapshot.metrics.visitors)}</p>
        </article>
        <article className="rounded-2xl border border-border/80 bg-card/90 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Pedidos</p>
          <p className="mt-2 text-3xl font-semibold text-foreground">{formatNumber(snapshot.metrics.orders)}</p>
        </article>
        <article className="rounded-2xl border border-border/80 bg-card/90 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Ventas</p>
          <p className="mt-2 text-3xl font-semibold text-foreground">
            {formatCurrency(snapshot.metrics.sales, snapshot.store.currency)}
          </p>
        </article>
        <article className="rounded-2xl border border-border/80 bg-card/90 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Tasa de conversion</p>
          <p className="mt-2 text-3xl font-semibold text-foreground">
            {formatPercent(snapshot.metrics.conversionRate)}
          </p>
        </article>
        <article className="rounded-2xl border border-border/80 bg-card/90 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">VPP</p>
          <p className="mt-2 text-3xl font-semibold text-foreground">
            {formatCurrency(averageTicket, snapshot.store.currency)}
          </p>
        </article>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <article className="rounded-[1.5rem] border border-border/80 bg-card/90 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Tasas de conversion
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[22rem] text-left text-sm">
              <thead className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                <tr>
                  <th className="pb-3 font-medium">Tipo</th>
                  <th className="pb-3 font-medium">Total</th>
                  <th className="pb-3 font-medium">%</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border/70">
                  <td className="py-3 font-medium text-foreground">Anadido al carrito</td>
                  <td className="py-3 text-muted-foreground">{formatNumber(addedToCart)}</td>
                  <td className="py-3 text-muted-foreground">
                    {formatPercent((addedToCart / Math.max(1, snapshot.metrics.visitors)) * 100)}
                  </td>
                </tr>
                <tr className="border-t border-border/70">
                  <td className="py-3 font-medium text-foreground">Llego al pago</td>
                  <td className="py-3 text-muted-foreground">{formatNumber(reachedCheckout)}</td>
                  <td className="py-3 text-muted-foreground">
                    {formatPercent((reachedCheckout / Math.max(1, snapshot.metrics.visitors)) * 100)}
                  </td>
                </tr>
                <tr className="border-t border-border/70">
                  <td className="py-3 font-medium text-foreground">Comprado</td>
                  <td className="py-3 text-muted-foreground">{formatNumber(snapshot.metrics.orders)}</td>
                  <td className="py-3 text-muted-foreground">
                    {formatPercent(snapshot.metrics.conversionRate)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </article>

        <article className="rounded-[1.5rem] border border-border/80 bg-card/90 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Ventas adicionales y ofertas
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[22rem] text-left text-sm">
              <thead className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                <tr>
                  <th className="pb-3 font-medium">Tipo</th>
                  <th className="pb-3 font-medium">Conteo</th>
                  <th className="pb-3 font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border/70">
                  <td className="py-3 font-medium text-foreground">Paquetes</td>
                  <td className="py-3 text-muted-foreground">{formatNumber(bundles)}</td>
                  <td className="py-3 text-muted-foreground">-</td>
                </tr>
                <tr className="border-t border-border/70">
                  <td className="py-3 font-medium text-foreground">Incrementos de pedido</td>
                  <td className="py-3 text-muted-foreground">{formatNumber(orderBumps)}</td>
                  <td className="py-3 text-muted-foreground">-</td>
                </tr>
                <tr className="border-t border-border/70">
                  <td className="py-3 font-medium text-foreground">Upsells con un clic</td>
                  <td className="py-3 text-muted-foreground">0</td>
                  <td className="py-3 text-muted-foreground">-</td>
                </tr>
              </tbody>
            </table>
          </div>
        </article>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <article className="rounded-[1.5rem] border border-border/80 bg-card/90 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Productos mas vendidos
          </p>
          <div className="mt-4 space-y-3">
            {snapshot.topProducts.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Agrega productos en el builder para poblar este bloque.
              </p>
            ) : (
              snapshot.topProducts.map((product) => (
                <div key={product.id} className="rounded-xl border border-border/80 bg-secondary/20 p-3">
                  <p className="font-semibold text-foreground">{product.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {product.unitsSold} unidades | {formatCurrency(product.revenue, snapshot.store.currency)}
                  </p>
                </div>
              ))
            )}
          </div>
        </article>

        <article className="rounded-[1.5rem] border border-border/80 bg-card/90 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Principales fuentes de trafico
          </p>
          <div className="mt-4 space-y-3">
            {snapshot.trafficSources.map((source) => (
              <div key={source.source} className="rounded-xl border border-border/80 bg-secondary/20 p-3">
                <p className="font-semibold text-foreground">{source.source}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {source.visitors} visitas | {source.orders} pedidos | {formatPercent(source.conversionRate)}
                </p>
              </div>
            ))}
          </div>
        </article>
      </div>
    </section>
  );

  return (
    <main className="flex-1 overflow-x-hidden">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
        <p className="text-sm text-muted-foreground">
          <Link to="/stores" className="hover:text-foreground">
            Todas las tiendas
          </Link>{" "}
          &gt;{" "}
          <span className="font-semibold text-foreground">{snapshot.store.name}</span>
        </p>

        <section className="rounded-[1.75rem] border border-border/80 bg-card/90 p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-border/80 bg-secondary/20">
                <StoreIcon className="h-6 w-6 text-foreground" />
              </span>
              <div>
                <p className="text-3xl font-semibold text-foreground">{snapshot.store.name}</p>
                <a
                  className="mt-1 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                  href={`https://${domain}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Globe2 className="h-4 w-4" />
                  https://{domain}
                </a>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                className="rounded-xl"
                onClick={() => navigate(`/preview/${snapshot.store.id}`)}
              >
                <Eye className="h-4 w-4" />
                Vista previa de la tienda
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="rounded-xl"
                onClick={() => navigate(`/editor/${snapshot.store.id}`)}
              >
                <ExternalLink className="h-4 w-4" />
                Personalizar plantilla
              </Button>
              <Button type="button" variant="outline" className="rounded-xl border-emerald-300 bg-emerald-100 text-emerald-700">
                Publicado
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="mt-5 overflow-x-auto">
            <div className="inline-flex min-w-full gap-1 border-b border-border/70">
              {dashboardSections.map((section) => {
                const Icon = section.icon;
                const isActive = section.id === activeSection;

                return (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => setActiveSection(section.id)}
                    className={cn(
                      "flex items-center gap-2 rounded-t-xl border border-transparent px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      isActive
                        ? "border-border/70 border-b-background bg-background text-primary"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {section.label}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {activeSection === "summary" ? (
          summaryContent
        ) : (
          <section className="rounded-[1.5rem] border border-border/80 bg-card/90 p-5">
            <p className="text-lg font-semibold text-foreground">{selectedSection.label}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Vista operativa de {selectedSection.label.toLowerCase()} para la tienda {snapshot.store.name}.
            </p>

            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <article className="rounded-xl border border-border/80 bg-secondary/20 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Plantilla</p>
                <p className="mt-2 font-semibold text-foreground">{template.name}</p>
              </article>
              <article className="rounded-xl border border-border/80 bg-secondary/20 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Metodo de pago</p>
                <p className="mt-2 font-semibold text-foreground">{paymentMethodLabel}</p>
              </article>
              <article className="rounded-xl border border-border/80 bg-secondary/20 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Monedas</p>
                <p className="mt-2 font-semibold text-foreground">{enabledCurrencies}</p>
              </article>
            </div>

            <div className="mt-4 rounded-xl border border-border/80 bg-secondary/20 p-4">
              <p className="text-sm text-muted-foreground">
                Productos: <span className="font-semibold text-foreground">{products.length}</span> | Colecciones:{" "}
                <span className="font-semibold text-foreground">{collections.length}</span> | Order bumps:{" "}
                <span className="font-semibold text-foreground">{orderBumps}</span> | Creada:{" "}
                <span className="font-semibold text-foreground">{formatDate(snapshot.store.createdAt)}</span>
              </p>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
