import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { findFunnelBySlug, getFunnelProduct, getLandingSections } from "@/lib/funnel-system";

function normalizeButtonHref(slug: string, href?: string) {
  const value = href?.trim();
  if (!value || value === "#checkout") {
    return `/f/${slug}/checkout`;
  }
  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }
  return `/f/${slug}/checkout`;
}

export default function PublicLandingPage() {
  const { slug = "" } = useParams();
  const funnel = findFunnelBySlug(slug);

  if (!funnel || !funnel.published_at) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 py-10">
        <section className="rounded-2xl border border-border bg-card p-6 text-center">
          <h1 className="text-2xl font-semibold">Funnel no disponible</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Publica el funnel desde el dashboard para verlo aqui.
          </p>
        </section>
      </main>
    );
  }

  const product = getFunnelProduct(funnel.id);
  const sections = getLandingSections(funnel.id);

  return (
    <main className="mx-auto w-full max-w-4xl space-y-5 px-4 py-8">
      {sections.map((section) => {
        if (section.type === "headline") {
          return (
            <section key={section.id} className="rounded-2xl border border-border bg-card p-6 text-center">
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                {section.content || funnel.name}
              </h1>
            </section>
          );
        }

        if (section.type === "text") {
          return (
            <section key={section.id} className="rounded-2xl border border-border bg-card p-6">
              <p className="whitespace-pre-wrap text-base leading-7 text-muted-foreground">
                {section.content}
              </p>
            </section>
          );
        }

        if (section.type === "image") {
          return (
            <section key={section.id} className="overflow-hidden rounded-2xl border border-border bg-card">
              <img
                src={section.src}
                alt={product?.name || funnel.name}
                className="h-auto w-full object-cover"
                loading="lazy"
              />
            </section>
          );
        }

        if (section.type === "video") {
          return (
            <section key={section.id} className="rounded-2xl border border-border bg-card p-4">
              <div className="aspect-video overflow-hidden rounded-xl border border-border">
                <iframe
                  title="Video"
                  src={section.src}
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </section>
          );
        }

        if (section.type === "button") {
          const target = normalizeButtonHref(funnel.slug, section.href);
          const isExternal = target.startsWith("http");
          return (
            <section key={section.id} className="rounded-2xl border border-border bg-card p-6 text-center">
              <Button asChild size="lg" className="rounded-xl">
                {isExternal ? (
                  <a href={target} target="_blank" rel="noreferrer">
                    {section.text || "Continuar"}
                  </a>
                ) : (
                  <Link to={target}>{section.text || "Continuar"}</Link>
                )}
              </Button>
            </section>
          );
        }

        if (section.type === "testimonials") {
          return (
            <section key={section.id} className="rounded-2xl border border-border bg-card p-6">
              <h2 className="text-xl font-semibold">Testimonials</h2>
              <p className="mt-2 text-muted-foreground">{section.content}</p>
            </section>
          );
        }

        return (
          <section key={section.id} className="rounded-2xl border border-border bg-card p-6">
            <h2 className="text-xl font-semibold">FAQ</h2>
            <p className="mt-3 font-medium">{section.question}</p>
            <p className="mt-1 text-muted-foreground">{section.answer}</p>
          </section>
        );
      })}

      {!sections.length ? (
        <section className="rounded-2xl border border-border bg-card p-6 text-center text-muted-foreground">
          Landing sin contenido.
        </section>
      ) : null}
    </main>
  );
}
