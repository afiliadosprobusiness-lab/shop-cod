import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { findFunnelBySlug } from "@/lib/funnel-system";

export default function PublicThankYouPage() {
  const { slug = "" } = useParams();
  const funnel = findFunnelBySlug(slug);

  if (!funnel || !funnel.published_at) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 py-10">
        <section className="rounded-2xl border border-border bg-card p-6 text-center">
          <h1 className="text-2xl font-semibold">Pagina no disponible</h1>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      <section className="rounded-2xl border border-border bg-card p-8 text-center">
        <h1 className="text-3xl font-semibold">Thank you for your order</h1>
        <p className="mt-2 text-muted-foreground">
          Hemos recibido tu solicitud correctamente.
        </p>
        <Button asChild className="mt-5 rounded-xl">
          <Link to={`/f/${funnel.slug}`}>Volver al inicio</Link>
        </Button>
      </section>
    </main>
  );
}
