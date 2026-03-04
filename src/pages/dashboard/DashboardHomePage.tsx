import { ArrowRight, Store, Workflow } from "lucide-react";
import { Link } from "react-router-dom";
import MainContent from "@/components/dashboard/MainContent";
import { Button } from "@/components/ui/button";

const homeCards = [
  {
    title: "Crear tienda online",
    description:
      "Lanza una tienda con catalogo, checkout y configuracion listos para vender.",
    ctaTo: "/stores",
    icon: Store,
    chips: ["Catalogo", "Checkout", "Workspace listo"],
  },
  {
    title: "Crear funnel",
    description:
      "Construye tu embudo, edita cada pagina visualmente y mejora la conversion.",
    ctaTo: "/funnels",
    icon: Workflow,
    chips: ["Secuencias", "Conversion", "Testing rapido"],
  },
];

export default function DashboardHomePage() {
  return (
    <MainContent
      eyebrow="Inicio"
      title="¿Cómo quieres vender?"
      description="Elige cómo quieres vender tu producto y te guiaremos en la configuración."
    >
      <section className="grid gap-6 xl:grid-cols-2">
        {homeCards.map((card) => {
          const Icon = card.icon;

          return (
            <article
              key={card.title}
              className="group relative overflow-hidden rounded-[2rem] border border-border/80 bg-card/90 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-gold-lg"
            >
              <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-[radial-gradient(circle_at_top_left,rgba(245,183,36,0.18),transparent_60%)]" />

              <div className="relative flex h-full flex-col">
                <div className="flex items-start justify-between gap-4">
                  <span className="inline-flex rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
                    Nuevo modulo
                  </span>
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-3xl border border-primary/20 bg-primary/10 text-primary">
                    <Icon className="h-6 w-6" />
                  </span>
                </div>

                <div className="mt-8 space-y-3">
                  <h2 className="text-2xl font-semibold text-foreground">{card.title}</h2>
                  <p className="text-sm leading-6 text-muted-foreground">{card.description}</p>
                </div>

                <div className="mt-6 flex flex-wrap gap-2">
                  {card.chips.map((chip) => (
                    <span
                      key={chip}
                      className="rounded-full border border-border bg-secondary/70 px-3 py-1 text-xs text-secondary-foreground"
                    >
                      {chip}
                    </span>
                  ))}
                </div>

                <div className="mt-8 pt-2">
                  <Button asChild className="rounded-2xl">
                    <Link to={card.ctaTo}>
                      Comenzar
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </article>
          );
        })}
      </section>

      <section className="rounded-[2rem] border border-border/80 bg-secondary/40 p-6">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-border/80 bg-card/80 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Vende mejor
            </p>
            <p className="mt-3 text-sm text-secondary-foreground">
              Centraliza productos, tiendas y funnels desde un solo panel.
            </p>
          </div>
          <div className="rounded-3xl border border-border/80 bg-card/80 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Opera rapido
            </p>
            <p className="mt-3 text-sm text-secondary-foreground">
              Revisa pedidos, contactos y ofertas sin salir del dashboard.
            </p>
          </div>
          <div className="rounded-3xl border border-border/80 bg-card/80 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Mide en tiempo real
            </p>
            <p className="mt-3 text-sm text-secondary-foreground">
              Sigue ventas, conversion y actividad comercial con datos vivos.
            </p>
          </div>
        </div>
      </section>
    </MainContent>
  );
}
