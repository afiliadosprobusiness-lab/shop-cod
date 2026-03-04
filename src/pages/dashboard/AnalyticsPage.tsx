import { useEffect, useState } from "react";
import { BarChart3, DollarSign, MousePointerClick, Users } from "lucide-react";
import MainContent from "@/components/dashboard/MainContent";
import { subscribeToShopcodData } from "@/lib/live-sync";
import {
  getPlatformAnalyticsSnapshot,
  type PlatformAnalyticsSnapshot,
} from "@/lib/platform-data";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "PEN",
    maximumFractionDigits: 2,
  }).format(value);
}

export default function AnalyticsPage() {
  const [snapshot, setSnapshot] = useState<PlatformAnalyticsSnapshot>(() =>
    getPlatformAnalyticsSnapshot(),
  );

  useEffect(() => {
    return subscribeToShopcodData(() => {
      setSnapshot(getPlatformAnalyticsSnapshot());
    });
  }, []);

  const peakSales = Math.max(...snapshot.salesByDay.map((point) => point.sales), 1);

  return (
    <MainContent
      eyebrow="Insights"
      title="Analiticas"
      description="Monitorea KPIs clave del negocio en tiempo real con base en pedidos, contactos y actividad comercial real."
    >
      <section className="grid gap-4 lg:grid-cols-4">
        <div className="rounded-[1.75rem] border border-border/80 bg-card/90 p-5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Visitantes
            </p>
            <MousePointerClick className="h-4 w-4 text-primary" />
          </div>
          <p className="mt-3 text-3xl font-semibold text-foreground">{snapshot.visitors}</p>
        </div>
        <div className="rounded-[1.75rem] border border-border/80 bg-card/90 p-5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Pedidos
            </p>
            <BarChart3 className="h-4 w-4 text-primary" />
          </div>
          <p className="mt-3 text-3xl font-semibold text-foreground">{snapshot.orders}</p>
        </div>
        <div className="rounded-[1.75rem] border border-border/80 bg-card/90 p-5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Ventas
            </p>
            <DollarSign className="h-4 w-4 text-primary" />
          </div>
          <p className="mt-3 text-3xl font-semibold text-foreground">
            {formatCurrency(snapshot.sales)}
          </p>
        </div>
        <div className="rounded-[1.75rem] border border-border/80 bg-card/90 p-5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Conversion
            </p>
            <Users className="h-4 w-4 text-primary" />
          </div>
          <p className="mt-3 text-3xl font-semibold text-foreground">
            {snapshot.conversionRate.toFixed(2)}%
          </p>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <article className="rounded-[2rem] border border-border/80 bg-card/90 p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                Ventas recientes
              </p>
              <p className="mt-1 text-lg font-semibold text-foreground">
                Ticket promedio: {formatCurrency(snapshot.avgTicket)}
              </p>
            </div>
            <span className="rounded-full border border-border bg-secondary/40 px-3 py-1 text-xs text-muted-foreground">
              Valor catalogo: {formatCurrency(snapshot.catalogValue)}
            </span>
          </div>

          <div className="mt-6 grid gap-3">
            {snapshot.salesByDay.length ? (
              snapshot.salesByDay.map((point) => (
                <div key={point.label} className="space-y-2">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="font-medium text-foreground">{point.label}</span>
                    <span className="text-muted-foreground">
                      {point.orders} pedidos · {formatCurrency(point.sales)}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-secondary/40">
                    <div
                      className="h-2 rounded-full bg-primary"
                      style={{ width: `${Math.max(8, (point.sales / peakSales) * 100)}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-[1.5rem] border border-border/80 bg-secondary/20 p-5 text-sm text-muted-foreground">
                Aun no hay ventas registradas. Cuando entren pedidos desde el checkout, veras la
                curva diaria aqui.
              </div>
            )}
          </div>
        </article>

        <aside className="rounded-[2rem] border border-border/80 bg-card/90 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Productos mas vendidos
          </p>
          <div className="mt-4 space-y-3">
            {snapshot.topProducts.length ? (
              snapshot.topProducts.map((product) => (
                <div
                  key={product.name}
                  className="rounded-[1.5rem] border border-border/80 bg-secondary/20 p-4"
                >
                  <p className="font-semibold text-foreground">{product.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {product.unitsSold} unidades · {formatCurrency(product.revenue)}
                  </p>
                </div>
              ))
            ) : (
              <div className="rounded-[1.5rem] border border-border/80 bg-secondary/20 p-4 text-sm text-muted-foreground">
                Los productos con ventas reales apareceran aqui cuando existan pedidos.
              </div>
            )}
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <div className="rounded-[1.5rem] border border-border/80 bg-secondary/20 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Page views
              </p>
              <p className="mt-2 text-2xl font-semibold text-foreground">{snapshot.pageViews}</p>
            </div>
            <div className="rounded-[1.5rem] border border-border/80 bg-secondary/20 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Checkouts iniciados
              </p>
              <p className="mt-2 text-2xl font-semibold text-foreground">
                {snapshot.checkoutsStarted}
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-border/80 bg-secondary/20 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Tiendas activas
              </p>
              <p className="mt-2 text-2xl font-semibold text-foreground">{snapshot.activeStores}</p>
            </div>
            <div className="rounded-[1.5rem] border border-border/80 bg-secondary/20 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Funnels activos
              </p>
              <p className="mt-2 text-2xl font-semibold text-foreground">
                {snapshot.activeFunnels}
              </p>
            </div>
          </div>
        </aside>
      </section>
    </MainContent>
  );
}
