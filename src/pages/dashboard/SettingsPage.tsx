import { useEffect, useMemo, useState } from "react";
import {
  CreditCard,
  Globe,
  Home,
  Mail,
  Package,
  Shield,
  Truck,
  Users,
  Webhook,
} from "lucide-react";
import { toast } from "sonner";
import MainContent from "@/components/dashboard/MainContent";
import { Button } from "@/components/ui/button";
import { subscribeToShopcodData } from "@/lib/live-sync";
import {
  loadPlatformSettings,
  savePlatformSettings,
  type PlatformSettings,
} from "@/lib/platform-data";

const settingSections = [
  { id: "general", label: "General", icon: Home },
  { id: "shipping", label: "Envio", icon: Truck },
  { id: "members", label: "Miembros", icon: Users },
  { id: "billing", label: "Facturacion", icon: CreditCard },
  { id: "domains", label: "Dominios", icon: Globe },
  { id: "digital", label: "Productos digitales", icon: Package },
  { id: "emails", label: "Correos", icon: Mail },
  { id: "security", label: "Seguridad", icon: Shield },
  { id: "webhooks", label: "Webhooks", icon: Webhook },
] as const;

type SettingSectionId = (typeof settingSections)[number]["id"];

export default function SettingsPage() {
  const [settings, setSettings] = useState<PlatformSettings>(() => loadPlatformSettings());
  const [activeSection, setActiveSection] = useState<SettingSectionId>("general");

  useEffect(() => {
    return subscribeToShopcodData(() => {
      setSettings(loadPlatformSettings());
    });
  }, []);

  const accountInitial = useMemo(
    () => settings.accountName.trim().charAt(0).toUpperCase() || "S",
    [settings.accountName],
  );

  const updateField = (field: keyof PlatformSettings, value: string) => {
    setSettings((current) => ({ ...current, [field]: value }));
  };

  const handleSave = () => {
    savePlatformSettings(settings);
    toast.success("Configuracion guardada.");
  };

  return (
    <MainContent
      eyebrow="Preferencias"
      title="Configuracion"
      description="Administra los datos de tu cuenta, dominios, correos y parametros operativos del workspace."
      actions={
        <Button type="button" className="rounded-2xl" onClick={handleSave}>
          Guardar cambios
        </Button>
      }
    >
      <section className="grid gap-6 xl:grid-cols-[18rem_minmax(0,1fr)]">
        <aside className="rounded-[2rem] border border-border/80 bg-card/90 p-5">
          <div className="border-b border-border/70 pb-4">
            <p className="font-semibold text-foreground">{settings.accountName}</p>
            <p className="mt-1 text-sm text-muted-foreground">{settings.ownerEmail}</p>
          </div>

          <div className="mt-5 space-y-1">
            {settingSections.map((section) => {
              const Icon = section.icon;
              const isActive = section.id === activeSection;

              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => setActiveSection(section.id)}
                  className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm transition-colors ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-secondary/30 hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {section.label}
                </button>
              );
            })}
          </div>
        </aside>

        <article className="rounded-[2rem] border border-border/80 bg-card/90 p-5 lg:p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-xl font-semibold text-primary-foreground">
              {accountInitial}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                {settingSections.find((section) => section.id === activeSection)?.label}
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-foreground">Cuenta</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Ajusta la informacion principal de la cuenta y los datos que se usan en
                facturacion, comunicaciones y dominio.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-6">
            <section className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2 md:col-span-2">
                <span className="text-sm font-medium text-foreground">Nombre de la cuenta</span>
                <input
                  value={settings.accountName}
                  onChange={(event) => updateField("accountName", event.target.value)}
                  className="h-11 w-full rounded-2xl border border-border bg-secondary/30 px-4 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-foreground">
                  Correo del propietario
                </span>
                <input
                  value={settings.ownerEmail}
                  onChange={(event) => updateField("ownerEmail", event.target.value)}
                  className="h-11 w-full rounded-2xl border border-border bg-secondary/30 px-4 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-foreground">Correo de soporte</span>
                <input
                  value={settings.supportEmail}
                  onChange={(event) => updateField("supportEmail", event.target.value)}
                  className="h-11 w-full rounded-2xl border border-border bg-secondary/30 px-4 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </label>
              <label className="space-y-2 md:col-span-2">
                <span className="text-sm font-medium text-foreground">Subdominio</span>
                <div className="flex overflow-hidden rounded-2xl border border-border bg-secondary/30">
                  <input
                    value={settings.subdomain}
                    onChange={(event) => updateField("subdomain", event.target.value)}
                    className="h-11 min-w-0 flex-1 bg-transparent px-4 text-sm text-foreground focus-visible:outline-none"
                  />
                  <span className="inline-flex items-center border-l border-border px-4 text-sm text-muted-foreground">
                    .shopcod.app
                  </span>
                </div>
              </label>
            </section>

            <section className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2 md:col-span-2">
                <span className="text-sm font-medium text-foreground">Nombre legal</span>
                <input
                  value={settings.legalName}
                  onChange={(event) => updateField("legalName", event.target.value)}
                  className="h-11 w-full rounded-2xl border border-border bg-secondary/30 px-4 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-foreground">Empresa</span>
                <input
                  value={settings.companyName}
                  onChange={(event) => updateField("companyName", event.target.value)}
                  className="h-11 w-full rounded-2xl border border-border bg-secondary/30 px-4 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-foreground">Telefono</span>
                <input
                  value={settings.phone}
                  onChange={(event) => updateField("phone", event.target.value)}
                  className="h-11 w-full rounded-2xl border border-border bg-secondary/30 px-4 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </label>
              <label className="space-y-2 md:col-span-2">
                <span className="text-sm font-medium text-foreground">Direccion</span>
                <input
                  value={settings.addressLine1}
                  onChange={(event) => updateField("addressLine1", event.target.value)}
                  className="h-11 w-full rounded-2xl border border-border bg-secondary/30 px-4 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </label>
              <label className="space-y-2 md:col-span-2">
                <span className="text-sm font-medium text-foreground">Linea de direccion 2</span>
                <input
                  value={settings.addressLine2}
                  onChange={(event) => updateField("addressLine2", event.target.value)}
                  className="h-11 w-full rounded-2xl border border-border bg-secondary/30 px-4 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-foreground">Ciudad</span>
                <input
                  value={settings.city}
                  onChange={(event) => updateField("city", event.target.value)}
                  className="h-11 w-full rounded-2xl border border-border bg-secondary/30 px-4 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-foreground">Codigo postal</span>
                <input
                  value={settings.postalCode}
                  onChange={(event) => updateField("postalCode", event.target.value)}
                  className="h-11 w-full rounded-2xl border border-border bg-secondary/30 px-4 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-foreground">Pais</span>
                <input
                  value={settings.country}
                  onChange={(event) => updateField("country", event.target.value)}
                  className="h-11 w-full rounded-2xl border border-border bg-secondary/30 px-4 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-foreground">Zona horaria</span>
                <input
                  value={settings.timezone}
                  onChange={(event) => updateField("timezone", event.target.value)}
                  className="h-11 w-full rounded-2xl border border-border bg-secondary/30 px-4 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </label>
            </section>
          </div>
        </article>
      </section>
    </MainContent>
  );
}
