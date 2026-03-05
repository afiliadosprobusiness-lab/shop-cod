import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Index() {
  return (
    <main className="min-h-screen bg-background px-4 py-12 sm:px-6">
      <div className="mx-auto w-full max-w-4xl space-y-6">
        <section className="rounded-[2rem] border border-border bg-card p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            ShopCOD
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
            SIMPLE Funnel Builder
          </h1>
          <p className="mt-4 max-w-2xl text-base text-muted-foreground">
            Crea un funnel, vende un producto, cobra con Stripe/PayPal/COD y gestiona pedidos.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button asChild className="rounded-xl">
              <Link to="/register">Comenzar</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-xl">
              <Link to="/login">Iniciar sesion</Link>
            </Button>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <article className="rounded-2xl border border-border bg-card p-5">
            <h2 className="text-lg font-semibold">1. Create Funnel</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Ingresas nombre y el sistema crea Landing, Checkout y Thank You.
            </p>
          </article>
          <article className="rounded-2xl border border-border bg-card p-5">
            <h2 className="text-lg font-semibold">2. Add Product</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Un producto por funnel con tipo y metodo de pago.
            </p>
          </article>
          <article className="rounded-2xl border border-border bg-card p-5">
            <h2 className="text-lg font-semibold">3. Receive Orders</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Publicas y gestionas pedidos por estado desde el dashboard.
            </p>
          </article>
        </section>
      </div>
    </main>
  );
}
