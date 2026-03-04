import { useEffect, useMemo, useState } from "react";
import {
  Ban,
  Crown,
  Power,
  ShieldCheck,
  Trash2,
  Users,
  Wallet,
  Workflow,
} from "lucide-react";
import { toast } from "sonner";
import MainContent from "@/components/dashboard/MainContent";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth";
import { subscribeToShopcodData } from "@/lib/live-sync";
import { getPlanDefinition, resolvePlanId, type ShopPlanId } from "@/lib/plans";
import {
  bootstrapSuperAdminClientsFromCloud,
  deleteSuperAdminClient,
  loadSuperAdminClients,
  toggleSuperAdminClientStatus,
  updateSuperAdminClientPlan,
  type SuperAdminClient,
} from "@/lib/superadmin";

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

function ClientMetric({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: typeof Users;
}) {
  return (
    <div className="rounded-[1.75rem] border border-border/80 bg-card/90 p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          {label}
        </p>
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <p className="mt-3 text-3xl font-semibold text-foreground">{value}</p>
    </div>
  );
}

const planOptions: ShopPlanId[] = ["starter", "pro", "scale"];

export default function SuperAdminPage() {
  const { user, logout } = useAuth();
  const [clients, setClients] = useState<SuperAdminClient[]>(() => loadSuperAdminClients());
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  useEffect(() => {
    return subscribeToShopcodData(() => {
      setClients(loadSuperAdminClients());
    });
  }, []);

  useEffect(() => {
    let isMounted = true;

    const refreshClients = () => {
      void bootstrapSuperAdminClientsFromCloud().then((nextClients) => {
        if (!isMounted) {
          return;
        }

        setClients(nextClients);
      });
    };

    refreshClients();

    const onFocus = () => {
      refreshClients();
    };

    window.addEventListener("focus", onFocus);
    const intervalId = window.setInterval(refreshClients, 15000);

    return () => {
      isMounted = false;
      window.removeEventListener("focus", onFocus);
      window.clearInterval(intervalId);
    };
  }, []);

  const filteredClients = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return clients.filter((client) => {
      const matchesStatus =
        statusFilter === "all" ? true : client.status === statusFilter;
      const matchesQuery =
        !normalizedQuery ||
        client.workspaceName.toLowerCase().includes(normalizedQuery) ||
        client.companyName.toLowerCase().includes(normalizedQuery) ||
        client.ownerEmail.toLowerCase().includes(normalizedQuery);

      return matchesStatus && matchesQuery;
    });
  }, [clients, query, statusFilter]);

  const snapshot = useMemo(() => {
    const managedClients = clients.filter((client) => !client.isProtected);
    const activeClients = managedClients.filter((client) => client.status === "active");
    const inactiveClients = managedClients.filter((client) => client.status === "inactive");
    const revenue = managedClients.reduce((sum, client) => sum + client.revenue, 0);
    const funnels = managedClients.reduce((sum, client) => sum + client.funnelsCount, 0);

    return {
      total: managedClients.length,
      active: activeClients.length,
      inactive: inactiveClients.length,
      revenue,
      funnels,
    };
  }, [clients]);

  const handleToggleClient = (client: SuperAdminClient) => {
    if (client.isProtected) {
      toast.error("El superadmin root no puede modificarse.");
      return;
    }

    const nextClients = toggleSuperAdminClientStatus(client.id);
    setClients(nextClients);
    toast.success(
      client.status === "active" ? "Cliente desactivado." : "Cliente activado.",
    );
  };

  const handleDeleteClient = (client: SuperAdminClient) => {
    if (client.isProtected) {
      toast.error("El superadmin root no puede borrarse.");
      return;
    }

    const nextClients = deleteSuperAdminClient(client.id);
    setClients(nextClients);
    toast.success("Cliente eliminado.");
  };

  const handlePlanChange = (client: SuperAdminClient, nextPlanId: ShopPlanId) => {
    if (client.isProtected) {
      toast.error("El superadmin root no puede cambiar de plan.");
      return;
    }

    if (resolvePlanId(client.planName) === nextPlanId) {
      return;
    }

    const nextClients = updateSuperAdminClientPlan(client.id, nextPlanId);
    setClients(nextClients);
    toast.success(`Plan actualizado a ${getPlanDefinition(nextPlanId).name}.`);
  };

  const handleLogout = async () => {
    await logout();
    toast.success("Sesion cerrada.");
  };

  return (
    <div className="min-h-screen bg-background">
      <MainContent
        eyebrow="Root control"
        title="Superadmin"
        description="Panel central para administrar clientes de ShopCOD, activar o desactivar accesos y mantener protegida la cuenta root."
        actions={
          <>
            <div className="rounded-2xl border border-border/80 bg-card/80 px-4 py-2 text-sm text-muted-foreground">
              Root: <span className="font-medium text-foreground">{user?.email}</span>
            </div>
            <Button type="button" variant="outline" className="rounded-2xl" onClick={handleLogout}>
              Cerrar sesion
            </Button>
          </>
        }
      >
        <section className="grid gap-4 lg:grid-cols-4">
          <ClientMetric label="Clientes" value={String(snapshot.total)} icon={Users} />
          <ClientMetric label="Activos" value={String(snapshot.active)} icon={ShieldCheck} />
          <ClientMetric label="Inactivos" value={String(snapshot.inactive)} icon={Ban} />
          <ClientMetric label="Facturacion" value={formatMoney(snapshot.revenue)} icon={Wallet} />
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
          <article className="rounded-[2rem] border border-border/80 bg-card/90 p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                  Clientes administrados
                </p>
                <h2 className="mt-2 text-xl font-semibold text-foreground">
                  Opera cuentas, planes y accesos
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  El root de superadmin siempre permanece activo y no puede eliminarse.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Buscar por workspace, empresa o correo"
                  className="min-w-0 rounded-2xl"
                />
                <div className="flex rounded-2xl border border-border/80 bg-background p-1">
                  {(["all", "active", "inactive"] as const).map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setStatusFilter(value)}
                      className={`rounded-xl px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] transition-colors ${
                        statusFilter === value
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {value === "all"
                        ? "Todos"
                        : value === "active"
                          ? "Activos"
                          : "Inactivos"}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-4">
              {filteredClients.length ? (
                filteredClients.map((client) => (
                  <div
                    key={client.id}
                    className="rounded-[1.5rem] border border-border/80 bg-secondary/20 p-4"
                  >
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate text-lg font-semibold text-foreground">
                            {client.workspaceName}
                          </p>
                          <Badge
                            variant={
                              client.status === "active" ? "default" : "secondary"
                            }
                          >
                            {client.status === "active" ? "Activo" : "Inactivo"}
                          </Badge>
                          {client.isProtected ? (
                            <Badge variant="outline" className="border-primary/40 text-primary">
                              <Crown className="mr-1 h-3 w-3" />
                              Protegido
                            </Badge>
                          ) : null}
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {client.companyName} · {client.ownerName}
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {client.ownerEmail}
                        </p>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-4 xl:min-w-[26rem]">
                        <div className="rounded-2xl border border-border/70 bg-background/80 p-3">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                            Plan
                          </p>
                          <p className="mt-2 text-sm font-medium text-foreground">
                            {client.planName}
                          </p>
                        </div>
                        <div className="rounded-2xl border border-border/70 bg-background/80 p-3">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                            Tiendas
                          </p>
                          <p className="mt-2 text-sm font-medium text-foreground">
                            {client.storesCount}
                          </p>
                        </div>
                        <div className="rounded-2xl border border-border/70 bg-background/80 p-3">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                            Funnels
                          </p>
                          <p className="mt-2 text-sm font-medium text-foreground">
                            {client.funnelsCount}
                          </p>
                        </div>
                        <div className="rounded-2xl border border-border/70 bg-background/80 p-3">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                            Pedidos
                          </p>
                          <p className="mt-2 text-sm font-medium text-foreground">
                            {client.ordersCount}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
                      <div className="min-w-0 space-y-3">
                        <p className="text-sm text-muted-foreground">
                          Facturacion estimada:{" "}
                          <span className="font-medium text-foreground">
                            {formatMoney(client.revenue)}
                          </span>
                        </p>

                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                            Cambiar plan con un clic
                          </p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {planOptions.map((planId) => {
                              const plan = getPlanDefinition(planId);
                              const currentPlanId = client.isProtected
                                ? null
                                : resolvePlanId(client.planName);
                              const isActivePlan = currentPlanId === planId;

                              return (
                                <button
                                  key={`${client.id}-${planId}`}
                                  type="button"
                                  onClick={() => handlePlanChange(client, planId)}
                                  disabled={client.isProtected || isActivePlan}
                                  className={`rounded-xl border px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                                    isActivePlan
                                      ? "border-primary bg-primary text-primary-foreground"
                                      : "border-border/80 bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground disabled:hover:border-border/80 disabled:hover:text-muted-foreground"
                                  } disabled:cursor-not-allowed disabled:opacity-60`}
                                >
                                  {plan.name}
                                </button>
                              );
                            })}
                          </div>
                          {client.isProtected ? (
                            <p className="mt-2 text-xs text-muted-foreground">
                              La cuenta root conserva su nivel protegido y no cambia de plan.
                            </p>
                          ) : null}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 lg:justify-end">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="rounded-xl"
                          disabled={client.isProtected}
                          onClick={() => handleToggleClient(client)}
                        >
                          <Power className="h-4 w-4" />
                          {client.status === "active" ? "Desactivar" : "Activar"}
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="rounded-xl"
                          disabled={client.isProtected}
                          onClick={() => handleDeleteClient(client)}
                        >
                          <Trash2 className="h-4 w-4" />
                          Eliminar cliente
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-[1.5rem] border border-dashed border-border p-6 text-sm text-muted-foreground">
                  No hay clientes que coincidan con tu filtro actual.
                </div>
              )}
            </div>
          </article>

          <aside className="rounded-[2rem] border border-border/80 bg-card/90 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Estado del root
            </p>

            <div className="mt-4 space-y-4">
              <div className="rounded-[1.5rem] border border-primary/20 bg-primary/5 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                    <Crown className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Cuenta root protegida</p>
                    <p className="text-sm text-muted-foreground">afiliadosprobusiness@gmail.com</p>
                  </div>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">
                  Esta cuenta nunca puede desactivarse ni eliminarse desde el frontend.
                </p>
              </div>

              <div className="rounded-[1.5rem] border border-border/80 bg-secondary/20 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Embudos activos
                </p>
                <p className="mt-2 text-2xl font-semibold text-foreground">
                  {snapshot.funnels}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Suma de funnels administrados entre clientes activos e inactivos.
                </p>
              </div>

              <div className="rounded-[1.5rem] border border-border/80 bg-secondary/20 p-4">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Workflow className="h-4 w-4 text-primary" />
                  Acciones incluidas
                </div>
                <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                  <li>Activar y desactivar clientes al instante.</li>
                  <li>Eliminar cualquier cliente excepto la cuenta root.</li>
                  <li>Subir o bajar el plan de cada cuenta en un clic.</li>
                  <li>Buscar por workspace, empresa o correo.</li>
                </ul>
              </div>
            </div>
          </aside>
        </section>
      </MainContent>
    </div>
  );
}
