import { AppWindow, Sparkles } from "lucide-react";
import MainContent from "@/components/dashboard/MainContent";

export default function AppsPage() {
  return (
    <MainContent
      eyebrow="Ecosistema"
      title="Aplicaciones"
      description="Proximamente tendras integraciones y herramientas extra para ampliar el stack de ShopCOD."
    >
      <section className="rounded-[2rem] border border-border/80 bg-card/90 p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <span className="inline-flex rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
              Proximamente
            </span>
            <h2 className="mt-4 text-2xl font-semibold text-foreground">
              Marketplace de aplicaciones en camino
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
              Este modulo quedara listo para conectar pasarelas, tracking, automatizaciones,
              remarketing y herramientas de soporte sin salir del panel.
            </p>
          </div>

          <span className="flex h-16 w-16 items-center justify-center rounded-3xl border border-primary/20 bg-primary/10 text-primary">
            <AppWindow className="h-7 w-7" />
          </span>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-border/80 bg-secondary/20 p-5">
            <p className="text-sm font-semibold text-foreground">Integraciones</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Conectores para pagos, CRM y plataformas de anuncios.
            </p>
          </div>
          <div className="rounded-3xl border border-border/80 bg-secondary/20 p-5">
            <p className="text-sm font-semibold text-foreground">Automatizaciones</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Flujos para seguimiento, recuperacion y postventa.
            </p>
          </div>
          <div className="rounded-3xl border border-border/80 bg-secondary/20 p-5">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <p className="text-sm font-semibold text-foreground">Add-ons</p>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Herramientas nuevas para hacer crecer el ecosistema de ShopCOD.
            </p>
          </div>
        </div>
      </section>
    </MainContent>
  );
}
