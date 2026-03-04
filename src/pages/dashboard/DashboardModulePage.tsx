import { ArrowLeft, ArrowRight } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import MainContent from "@/components/dashboard/MainContent";
import { dashboardNavItems, getDashboardNavItem } from "@/components/dashboard/navigation";
import { Button } from "@/components/ui/button";

export default function DashboardModulePage() {
  const location = useLocation();
  const section = getDashboardNavItem(location.pathname);
  const currentIndex = dashboardNavItems.findIndex((item) => item.path === section.path);
  const nextSection = dashboardNavItems[(currentIndex + 1) % dashboardNavItems.length];
  const Icon = section.icon;

  return (
    <MainContent
      eyebrow={section.eyebrow}
      title={section.label}
      description={section.description}
      actions={
        <>
          <Button asChild variant="outline" className="rounded-2xl">
            <Link to="/dashboard">
              <ArrowLeft className="h-4 w-4" />
              Volver a inicio
            </Link>
          </Button>
          <Button asChild className="rounded-2xl">
            <Link to={nextSection.path}>
              Ir a {nextSection.label}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </>
      }
    >
      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,0.65fr)]">
        <article className="overflow-hidden rounded-[2rem] border border-border/80 bg-card/90 p-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-3">
              <span className="inline-flex rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
                Modulo activo
              </span>
              <h2 className="text-2xl font-semibold text-foreground">
                Estructura base preparada para {section.label.toLowerCase()}
              </h2>
              <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                Este espacio ya usa el layout compartido del panel y queda listo para crecer con
                widgets, tablas y flujos especificos sin rehacer la arquitectura.
              </p>
            </div>

            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl border border-primary/20 bg-primary/10 text-primary">
              <Icon className="h-7 w-7" />
            </span>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {section.highlights.map((highlight) => (
              <div
                key={highlight}
                className="rounded-3xl border border-border/80 bg-secondary/40 p-5"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Enfoque
                </p>
                <p className="mt-3 text-sm font-medium text-secondary-foreground">{highlight}</p>
              </div>
            ))}
          </div>
        </article>

        <aside className="space-y-4 rounded-[2rem] border border-border/80 bg-secondary/40 p-6">
          <div className="rounded-3xl border border-border/80 bg-card/80 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Siguiente paso
            </p>
            <p className="mt-3 text-sm text-secondary-foreground">
              Usa este modulo como contenedor para datos reales, tablas y automatizaciones del
              dominio correspondiente.
            </p>
          </div>

          <div className="rounded-3xl border border-border/80 bg-card/80 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Navegacion
            </p>
            <p className="mt-3 text-sm text-secondary-foreground">
              El sidebar mantiene el contexto y el topbar conserva utilidades globales en toda la
              experiencia.
            </p>
          </div>
        </aside>
      </section>
    </MainContent>
  );
}
