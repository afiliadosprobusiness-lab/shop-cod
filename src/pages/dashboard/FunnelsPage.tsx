import { useEffect, useState } from "react";
import { ExternalLink, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import MainContent from "@/components/dashboard/MainContent";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";
import {
  createFunnel,
  listFunnelsByUser,
  type FunnelRow,
} from "@/lib/funnel-system";
import { subscribeToShopcodData } from "@/lib/live-sync";

export default function FunnelsPage() {
  const { user } = useAuth();
  const [funnelName, setFunnelName] = useState("");
  const [funnels, setFunnels] = useState<FunnelRow[]>([]);

  useEffect(() => {
    if (!user) {
      return;
    }

    setFunnels(listFunnelsByUser(user.uid));
    return subscribeToShopcodData(() => {
      setFunnels(listFunnelsByUser(user.uid));
    });
  }, [user]);

  const handleCreateFunnel = () => {
    if (!user || !funnelName.trim()) {
      return;
    }

    createFunnel({
      name: funnelName,
      userId: user.uid,
      userEmail: user.email,
    });
    setFunnelName("");
    setFunnels(listFunnelsByUser(user.uid));
  };

  return (
    <MainContent
      eyebrow="Funnel Builder"
      title="Funnels"
      description="Crea funnels simples para vender un solo producto, publicar y recibir pedidos."
    >
      <section className="rounded-[1.75rem] border border-border/80 bg-card/90 p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-end">
          <div className="min-w-0 flex-1 space-y-2">
            <Label htmlFor="funnel-name">Nombre del funnel</Label>
            <Input
              id="funnel-name"
              value={funnelName}
              onChange={(event) => setFunnelName(event.target.value)}
              placeholder="Ejemplo: Funnel crema antiacne"
              className="rounded-xl"
            />
          </div>
          <Button
            type="button"
            onClick={handleCreateFunnel}
            disabled={!funnelName.trim() || !user}
            className="rounded-xl"
          >
            <Plus className="h-4 w-4" />
            Crear Funnel
          </Button>
        </div>
      </section>

      <section className="overflow-hidden rounded-[1.75rem] border border-border/80 bg-card/90">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-secondary/50 text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Funnel</th>
                <th className="px-4 py-3 font-medium">Slug</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium">Creado</th>
                <th className="px-4 py-3 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {funnels.length ? (
                funnels.map((funnel) => (
                  <tr key={funnel.id} className="border-t border-border/70">
                    <td className="px-4 py-3 font-medium text-foreground">{funnel.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">/{funnel.slug}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full border border-border bg-secondary/40 px-2 py-1 text-xs">
                        {funnel.published_at ? "Publicado" : "Borrador"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(funnel.created_at).toLocaleDateString("es-PE")}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <Button asChild size="sm" variant="outline" className="rounded-lg">
                          <Link to={`/funnels/${funnel.id}/editor`}>Editar</Link>
                        </Button>
                        <Button
                          asChild
                          size="sm"
                          variant="ghost"
                          className="rounded-lg"
                          disabled={!funnel.published_at}
                        >
                          <Link to={`/f/${funnel.slug}`} target="_blank">
                            Ver
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Link>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                    Crea tu primer funnel para empezar.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </MainContent>
  );
}
