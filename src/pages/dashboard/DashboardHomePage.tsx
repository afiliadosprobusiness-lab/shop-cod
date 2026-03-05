import { ArrowRight, Workflow } from "lucide-react";
import { Link } from "react-router-dom";
import MainContent from "@/components/dashboard/MainContent";
import { Button } from "@/components/ui/button";

export default function DashboardHomePage() {
  return (
    <MainContent
      eyebrow="Inicio"
      title="Single Product Funnel Builder"
      description="Crea funnels simples, vende un producto, cobra con Stripe/PayPal/COD y gestiona pedidos."
    >
      <section className="rounded-[2rem] border border-border/80 bg-card/90 p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Flujo recomendado
            </p>
            <h2 className="mt-1 text-2xl font-semibold text-foreground">Crear Funnel</h2>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              1) Crea funnel por nombre. 2) Agrega producto unico. 3) Edita landing por bloques.
              4) Publica. 5) Recibe pedidos y gestionalos en el dashboard.
            </p>
          </div>
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
            <Workflow className="h-6 w-6" />
          </span>
        </div>
        <Button asChild className="mt-5 rounded-xl">
          <Link to="/funnels">
            Ir a Funnels
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </section>
    </MainContent>
  );
}
