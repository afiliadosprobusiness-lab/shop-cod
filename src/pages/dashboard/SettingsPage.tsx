import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { CreditCard, FileText, Globe, Home, Link2, Mail, Package, Plus, Shield, Truck, Users, Webhook } from "lucide-react";
import { toast } from "sonner";
import MainContent from "@/components/dashboard/MainContent";
import PlanUpgradeDialog from "@/components/plans/PlanUpgradeDialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { subscribeToShopcodData } from "@/lib/live-sync";
import { getMultiUserAccess, type ShopPlanId } from "@/lib/plans";
import { loadPlatformSettings, savePlatformSettings, type PlatformSettings } from "@/lib/platform-data";
import { cn } from "@/lib/utils";

const groups = [
  { label: "Cuenta", items: [{ id: "general", label: "General", icon: Home }, { id: "shipping", label: "Envio", icon: Truck }, { id: "members", label: "Miembros", icon: Users }, { id: "billing", label: "Facturacion y facturas", icon: CreditCard }, { id: "domains", label: "Dominios", icon: Globe }, { id: "digital", label: "Productos digitales", icon: Package }] },
  { label: "Vitrina", items: [{ id: "legal", label: "Legal", icon: FileText }, { id: "emails", label: "Correos", icon: Mail }, { id: "security", label: "Seguridad", icon: Shield }] },
  { label: "Integraciones", items: [{ id: "payments", label: "Pasarelas de pago", icon: CreditCard }, { id: "tracking", label: "Seguimiento", icon: Link2 }, { id: "webhooks", label: "Webhooks", icon: Webhook }] },
] as const;

type SectionId = (typeof groups)[number]["items"][number]["id"];

const sectionCopy: Record<SectionId, { title: string; description: string }> = {
  general: { title: "Cuenta", description: "Datos base del workspace, soporte y direccion fiscal." },
  shipping: { title: "Shipping groups", description: "Controla grupos, tarifas y regiones de envio." },
  members: { title: "Miembros y administradores", description: "Invita usuarios y asigna permisos parciales." },
  billing: { title: "Resumen de cuenta", description: "Consulta plan actual, limites y proximos cobros." },
  domains: { title: "Dominios", description: "Conecta dominios y define cual sera el principal." },
  digital: { title: "Archivos", description: "Sube entregables para tus productos digitales." },
  legal: { title: "Legal", description: "Edita politicas de reembolso, privacidad y terminos." },
  emails: { title: "Correos", description: "Gestiona recuperacion de carritos abandonados." },
  security: { title: "Seguridad", description: "Bloqueos, captcha y limites antifraude." },
  payments: { title: "Pasarelas de pago", description: "Moneda, conversion, gateways y contrasena temporal." },
  tracking: { title: "Seguimiento de eventos", description: "Conecta pixels y herramientas de medicion." },
  webhooks: { title: "Webhooks", description: "Envia eventos a herramientas externas." },
};

const permissions = ["Home", "Products", "Contacts", "Settings", "Funnels", "Orders", "Analytics", "Discounts", "Contact Form Data", "Stores"] as const;
const apps = ["Lightmail", "Lightskool", "Aplicaciones"] as const;

function id(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function money(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
}

function fileSize(size: number) {
  if (size >= 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(2)} MB`;
  if (size >= 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${size} B`;
}

function Card({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-border/80 bg-background/70 p-5 shadow-sm">
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={cn("grid gap-2", className)}>
      <span className="text-sm font-medium text-foreground">{label}</span>
      {children}
    </label>
  );
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<PlatformSettings>(() => loadPlatformSettings());
  const [activeSection, setActiveSection] = useState<SectionId>("general");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteAdmin, setInviteAdmin] = useState(false);
  const [invitePermissions, setInvitePermissions] = useState<string[]>([]);
  const [inviteApps, setInviteApps] = useState<string[]>([]);
  const [webhookOpen, setWebhookOpen] = useState(false);
  const [webhookEvent, setWebhookEvent] = useState("New order");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [webhookVersion, setWebhookVersion] = useState("v2");
  const [gatewayOpen, setGatewayOpen] = useState(false);
  const [gatewayName, setGatewayName] = useState("");
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [countryDraft, setCountryDraft] = useState("");
  const [ipDraft, setIpDraft] = useState("");
  const [currencyDraft, setCurrencyDraft] = useState("");
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [requiredPlanId, setRequiredPlanId] = useState<ShopPlanId>("scale");
  const [upgradeReason, setUpgradeReason] = useState("");

  useEffect(() => subscribeToShopcodData(() => setSettings(loadPlatformSettings())), []);

  const copy = sectionCopy[activeSection];
  const accountInitial = useMemo(() => settings.accountName.trim().charAt(0).toUpperCase() || "S", [settings.accountName]);

  const patch = (updater: (current: PlatformSettings) => PlatformSettings) => setSettings((current) => updater(current));

  const save = () => {
    const next = savePlatformSettings(settings);
    setSettings(next);
    toast.success("Configuracion guardada.");
  };

  const addMember = () => {
    const email = inviteEmail.trim().toLowerCase();
    if (!email) {
      toast.error("Ingresa un correo para invitar al miembro.");
      return;
    }
    patch((current) => ({
      ...current,
      members: {
        ...current.members,
        members: [
          { id: id("member"), email, isAdmin: inviteAdmin, permissions: inviteAdmin ? ["All access"] : invitePermissions, apps: inviteApps },
          ...current.members.members,
        ],
      },
    }));
    setInviteOpen(false);
    setInviteEmail("");
    setInviteAdmin(false);
    setInvitePermissions([]);
    setInviteApps([]);
  };

  const addWebhook = () => {
    const url = webhookUrl.trim();
    if (!url) {
      toast.error("Ingresa la URL del webhook.");
      return;
    }
    patch((current) => ({
      ...current,
      webhooks: {
        items: [{ id: id("webhook"), event: webhookEvent, url, version: webhookVersion, createdAt: new Date().toISOString() }, ...current.webhooks.items],
      },
    }));
    setWebhookOpen(false);
    setWebhookUrl("");
  };

  const addGateway = () => {
    const name = gatewayName.trim();
    if (!name) {
      toast.error("Ingresa el nombre de la pasarela.");
      return;
    }
    patch((current) => ({
      ...current,
      payments: { ...current.payments, gateways: [...current.payments.gateways, { id: id("gateway"), name, active: true }] },
    }));
    setGatewayOpen(false);
    setGatewayName("");
  };

  const uploadDigitalFiles = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;
    patch((current) => ({
      ...current,
      digitalProducts: {
        ...current.digitalProducts,
        files: [...files.map((file) => ({ id: id("asset"), name: file.name, sizeLabel: fileSize(file.size) })), ...current.digitalProducts.files],
      },
    }));
    event.target.value = "";
  };

  const addCountry = () => {
    const value = countryDraft.trim();
    if (!value) return;
    patch((current) => ({ ...current, security: { ...current.security, blockedCountries: [...current.security.blockedCountries, value] } }));
    setCountryDraft("");
  };

  const addIp = () => {
    const value = ipDraft.trim();
    if (!value) return;
    patch((current) => ({ ...current, security: { ...current.security, blockedIps: [...current.security.blockedIps, value] } }));
    setIpDraft("");
  };

  const addCurrency = () => {
    const value = currencyDraft.trim();
    if (!value) return;
    patch((current) => ({
      ...current,
      payments: { ...current.payments, additionalCurrencies: Array.from(new Set([...current.payments.additionalCurrencies, value])) },
    }));
    setCurrencyDraft("");
  };

  const openInviteDialog = () => {
    const access = getMultiUserAccess();

    if (!access.allowed) {
      setRequiredPlanId(access.requiredPlan.id);
      setUpgradeReason(access.reason);
      setUpgradeModalOpen(true);
      return;
    }

    setInviteOpen(true);
  };

  const renderSection = () => {
    switch (activeSection) {
      case "general":
        return (
          <div className="grid gap-6">
            <Card title="Cuenta">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Nombre de la cuenta" className="md:col-span-2"><Input value={settings.accountName} onChange={(e) => patch((c) => ({ ...c, accountName: e.target.value }))} /></Field>
                <Field label="Correo del propietario"><Input value={settings.ownerEmail} onChange={(e) => patch((c) => ({ ...c, ownerEmail: e.target.value }))} /></Field>
                <Field label="Correo del formulario de contacto"><Input value={settings.supportEmail} onChange={(e) => patch((c) => ({ ...c, supportEmail: e.target.value }))} /></Field>
                <Field label="Subdominio" className="md:col-span-2"><div className="flex overflow-hidden rounded-md border border-input bg-background"><Input value={settings.subdomain} onChange={(e) => patch((c) => ({ ...c, subdomain: e.target.value }))} className="rounded-none border-0 shadow-none focus-visible:ring-0" /><span className="inline-flex items-center border-l border-border px-3 text-sm text-muted-foreground">.mylightfunnels.com</span></div></Field>
              </div>
            </Card>
            <Card title="Direccion">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Nombre legal" className="md:col-span-2"><Input value={settings.legalName} onChange={(e) => patch((c) => ({ ...c, legalName: e.target.value }))} /></Field>
                <Field label="Empresa"><Input value={settings.companyName} onChange={(e) => patch((c) => ({ ...c, companyName: e.target.value }))} /></Field>
                <Field label="Telefono"><Input value={settings.phone} onChange={(e) => patch((c) => ({ ...c, phone: e.target.value }))} /></Field>
                <Field label="Linea de direccion 1" className="md:col-span-2"><Input value={settings.addressLine1} onChange={(e) => patch((c) => ({ ...c, addressLine1: e.target.value }))} /></Field>
                <Field label="Linea de direccion 2" className="md:col-span-2"><Input value={settings.addressLine2} onChange={(e) => patch((c) => ({ ...c, addressLine2: e.target.value }))} /></Field>
                <Field label="Ciudad"><Input value={settings.city} onChange={(e) => patch((c) => ({ ...c, city: e.target.value }))} /></Field>
                <Field label="Codigo postal"><Input value={settings.postalCode} onChange={(e) => patch((c) => ({ ...c, postalCode: e.target.value }))} /></Field>
                <Field label="Pais"><Input value={settings.country} onChange={(e) => patch((c) => ({ ...c, country: e.target.value }))} /></Field>
                <Field label="Zona horaria"><Input value={settings.timezone} onChange={(e) => patch((c) => ({ ...c, timezone: e.target.value }))} /></Field>
              </div>
            </Card>
          </div>
        );
      case "shipping":
        return (
          <div className="grid gap-6">
            <Card title="Shipping groups" description="Configura tus tarifas de envio y regiones avanzadas.">
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end"><Button type="button" variant="outline" className="rounded-2xl" onClick={() => patch((c) => ({ ...c, shipping: { ...c.shipping, groups: [...c.shipping.groups, { id: id("ship-group"), name: `Custom shipping ${c.shipping.groups.length + 1}`, rateLabel: "$0.00 flat rate", regionLabel: "Nueva region" }] } }))}><Plus className="mr-2 h-4 w-4" />Anadir nuevo grupo de envio</Button></div>
              <div className="mt-4 grid gap-3">{settings.shipping.groups.map((group) => <div key={group.id} className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-secondary/20 p-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-medium text-foreground">{group.name}</p><p className="text-sm text-muted-foreground">{group.regionLabel}</p></div><div className="flex items-center gap-3"><span className="text-sm text-foreground">{group.rateLabel}</span><Button type="button" variant="ghost" size="sm" onClick={() => patch((c) => ({ ...c, shipping: { ...c.shipping, groups: c.shipping.groups.filter((item) => item.id !== group.id) } }))}>Borrar</Button></div></div>)}</div>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end"><Button type="button" variant="ghost" className="rounded-2xl" onClick={() => patch((c) => ({ ...c, shipping: { ...c.shipping, advancedRegions: [...c.shipping.advancedRegions, { id: id("ship-region"), country: "Nuevo pais", regionLabel: "Ciudad o zona personalizada" }] } }))}><Plus className="mr-2 h-4 w-4" />Anadir nuevas regiones de pais</Button></div>
              <div className="mt-4 grid gap-3">{settings.shipping.advancedRegions.map((region) => <div key={region.id} className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-background/80 p-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-medium text-foreground">{region.country}</p><p className="text-sm text-muted-foreground">{region.regionLabel}</p></div><Button type="button" variant="ghost" size="sm" onClick={() => patch((c) => ({ ...c, shipping: { ...c.shipping, advancedRegions: c.shipping.advancedRegions.filter((item) => item.id !== region.id) } }))}>Quitar</Button></div>)}</div>
            </Card>
          </div>
        );
      case "members":
        return (
          <div className="grid gap-6">
            <Card title={`Miembros y administradores (${settings.members.admins.length + settings.members.members.length} de ${settings.billing.memberLimit})`} description="Invita administradores o miembros con acceso parcial.">
              <div className="grid gap-3">{settings.members.admins.map((admin) => <div key={admin.id} className="rounded-2xl border border-border/70 bg-secondary/20 p-4"><p className="font-medium text-foreground">{admin.name}</p><p className="text-sm text-muted-foreground">{admin.email}</p></div>)}</div>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-between"><p className="text-sm text-muted-foreground">Puedes invitar hasta {settings.billing.memberLimit} miembros en este plan.</p><Button type="button" variant="outline" className="rounded-2xl" onClick={openInviteDialog}><Plus className="mr-2 h-4 w-4" />Anadir miembro</Button></div>
              <div className="mt-4 grid gap-3">{settings.members.members.length ? settings.members.members.map((member) => <div key={member.id} className="rounded-2xl border border-border/70 bg-background/80 p-4"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="truncate font-medium text-foreground">{member.email}</p><p className="text-sm text-muted-foreground">{member.isAdmin ? "Admin" : "Permisos parciales"}</p></div><Button type="button" variant="ghost" size="sm" onClick={() => patch((c) => ({ ...c, members: { ...c.members, members: c.members.members.filter((item) => item.id !== member.id) } }))}>Quitar</Button></div><div className="mt-3 flex flex-wrap gap-2">{(member.isAdmin ? ["Acceso total"] : member.permissions).map((permission) => <span key={permission} className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">{permission}</span>)}</div></div>) : <div className="rounded-2xl border border-dashed border-border p-5 text-sm text-muted-foreground">Aun no hay miembros adicionales.</div>}</div>
            </Card>
          </div>
        );
      case "billing":
        return (
          <div className="grid gap-6">
            <Card title="Resumen de cuenta" description="Un resumen del estado y plan de tu cuenta.">
              <div className="grid gap-4 md:grid-cols-3"><div className="rounded-2xl border border-border/70 bg-secondary/20 p-4"><p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Miembro desde</p><p className="mt-2 text-xl font-semibold text-foreground">{settings.billing.memberSince}</p></div><div className="rounded-2xl border border-border/70 bg-secondary/20 p-4"><p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Plan activo</p><p className="mt-2 text-xl font-semibold text-foreground">{settings.billing.planName}</p></div><div className="rounded-2xl border border-border/70 bg-secondary/20 p-4"><p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Estado</p><p className="mt-2 text-xl font-semibold text-foreground">{settings.billing.status === "active" ? "Activo" : "Pendiente"}</p></div></div>
              <div className="mt-4 grid gap-4 md:grid-cols-2"><div className="space-y-3 rounded-2xl border border-border/70 bg-background/80 p-4"><div className="flex justify-between text-sm"><span>Precio</span><span>{money(settings.billing.planPrice)}</span></div><div className="flex justify-between text-sm"><span>Dominios</span><span>{settings.billing.domainsIncluded}</span></div><div className="flex justify-between text-sm"><span>Comisiones de transaccion</span><span>{settings.billing.transactionFee}%</span></div><div className="flex justify-between text-sm"><span>Comision COD</span><span>{settings.billing.codFee}%</span></div><div className="flex justify-between text-sm"><span>Miembros</span><span>Hasta {settings.billing.memberLimit}</span></div><div className="flex justify-between text-sm"><span>Subidas de archivos</span><span>{settings.billing.fileStorageGb} GB</span></div></div><div className="space-y-3 rounded-2xl border border-border/70 bg-background/80 p-4"><div className="flex justify-between text-sm"><span>Proximo pago</span><span>{settings.billing.nextPaymentDate}</span></div><div className="flex justify-between text-sm"><span>Plan {settings.billing.planName}</span><span>{money(settings.billing.planPrice)}</span></div><div className="border-t border-border/70 pt-3"><div className="flex justify-between font-medium"><span>Total a pagar</span><span>{money(settings.billing.planPrice)}</span></div></div></div></div>
              <div className="mt-4 rounded-2xl border border-border/70 bg-secondary/20 p-4 text-sm text-foreground">Umbral de facturacion: {settings.billing.billingThreshold}</div>
            </Card>
          </div>
        );
      case "domains":
        return (
          <div className="grid gap-6">
            <Card title="Dominios" description="Conecta dominios personalizados y usa el conector de dominios.">
              <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 text-sm text-muted-foreground">La propagacion de DNS puede tardar hasta 72 horas.</div>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-end"><Button type="button" variant="outline" className="rounded-2xl" onClick={() => patch((c) => ({ ...c, domains: { ...c.domains, connectorEnabled: true, connectedDomains: [...c.domains.connectedDomains, { id: id("domain"), host: `custom-${c.domains.connectedDomains.length + 1}.com`, isPrimary: false, status: "pending", sslStatus: "pending" }] } }))}>Conectar existente</Button><Button type="button" className="rounded-2xl" onClick={() => patch((c) => ({ ...c, domains: { ...c.domains, connectedDomains: [...c.domains.connectedDomains, { id: id("domain"), host: `buy-${c.domains.connectedDomains.length + 1}.shopcod.app`, isPrimary: false, status: "pending", sslStatus: "pending" }] } }))}>Comprar nuevo dominio</Button></div>
              <div className="mt-4 rounded-3xl border border-border/70 bg-background/80 p-5"><p className="font-medium text-foreground">Conector de dominios de ShopCOD</p><p className="mt-1 text-sm text-muted-foreground">Agiliza conexiones con Namecheap, GoDaddy y configuraciones manuales.</p><Button type="button" variant="ghost" className="mt-2 px-0 text-primary">Instalar extension</Button></div>
              <div className="mt-4 grid gap-3">{settings.domains.connectedDomains.map((domain) => <div key={domain.id} className="grid gap-4 rounded-2xl border border-border/70 bg-secondary/20 p-4 lg:grid-cols-[minmax(0,1fr)_8rem_8rem_auto]"><div className="min-w-0">{domain.isPrimary ? <span className="inline-flex rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">Dominio principal</span> : null}<p className="mt-2 break-words font-medium text-foreground">{domain.host}</p></div><div className="text-sm"><p className="text-muted-foreground">Estado</p><p className="mt-1 font-medium text-foreground">{domain.status === "connected" ? "Conectado" : "Pendiente"}</p></div><div className="text-sm"><p className="text-muted-foreground">SSL</p><p className="mt-1 font-medium text-foreground">{domain.sslStatus === "active" ? "Activo" : "Pendiente"}</p></div><div className="flex flex-wrap gap-2 lg:justify-end">{!domain.isPrimary ? <Button type="button" variant="outline" size="sm" onClick={() => patch((c) => ({ ...c, domains: { ...c.domains, connectedDomains: c.domains.connectedDomains.map((item) => ({ ...item, isPrimary: item.id === domain.id })) } }))}>Hacer principal</Button> : null}<Button type="button" variant="ghost" size="sm" onClick={() => patch((c) => ({ ...c, domains: { ...c.domains, connectedDomains: c.domains.connectedDomains.filter((item) => item.id !== domain.id) } }))}>Quitar</Button></div></div>)}</div>
            </Card>
          </div>
        );
      case "digital":
        return (
          <div className="grid gap-6">
            <Card title="Archivos" description="Arrastra y suelta o selecciona archivos para tus productos digitales.">
              <label className="flex min-h-52 cursor-pointer flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-border bg-secondary/10 px-6 py-10 text-center transition-colors hover:border-primary/40 hover:bg-primary/5"><span className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">Anadir archivo</span><span className="max-w-xl text-sm text-muted-foreground">El tamano maximo sugerido del archivo es 10 GB.</span><input type="file" multiple className="sr-only" onChange={uploadDigitalFiles} /></label>
              <div className="mt-4 grid gap-3">{settings.digitalProducts.files.length ? settings.digitalProducts.files.map((file) => <div key={file.id} className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-background/80 p-4 sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><p className="truncate font-medium text-foreground">{file.name}</p><p className="text-sm text-muted-foreground">{file.sizeLabel}</p></div><Button type="button" variant="ghost" size="sm" onClick={() => patch((c) => ({ ...c, digitalProducts: { ...c.digitalProducts, files: c.digitalProducts.files.filter((item) => item.id !== file.id) } }))}>Borrar</Button></div>) : <div className="rounded-2xl border border-dashed border-border p-5 text-sm text-muted-foreground">Aun no tienes archivos subidos.</div>}</div>
            </Card>
          </div>
        );
      case "legal":
        return (
          <div className="grid gap-6">
            <Card title="Politica de reembolsos"><Field label="Politica de reembolsos"><Textarea value={settings.legal.refundPolicy} onChange={(e) => patch((c) => ({ ...c, legal: { ...c.legal, refundPolicy: e.target.value } }))} className="min-h-40" /></Field><Button type="button" variant="outline" className="mt-3 w-fit rounded-2xl" onClick={() => patch((c) => ({ ...c, legal: { ...c.legal, refundPolicy: "Aceptamos reembolsos dentro de los primeros 7 dias bajo las condiciones publicadas por la tienda." } }))}>Crear desde plantilla</Button></Card>
            <Card title="Politica de privacidad"><Field label="Politica de privacidad"><Textarea value={settings.legal.privacyPolicy} onChange={(e) => patch((c) => ({ ...c, legal: { ...c.legal, privacyPolicy: e.target.value } }))} className="min-h-40" /></Field><Button type="button" variant="outline" className="mt-3 w-fit rounded-2xl" onClick={() => patch((c) => ({ ...c, legal: { ...c.legal, privacyPolicy: "Tratamos datos personales solo para procesar pedidos, soporte y comunicaciones autorizadas." } }))}>Crear desde plantilla</Button></Card>
            <Card title="Terminos del servicio"><Field label="Terminos del servicio"><Textarea value={settings.legal.termsOfService} onChange={(e) => patch((c) => ({ ...c, legal: { ...c.legal, termsOfService: e.target.value } }))} className="min-h-40" /></Field><Button type="button" variant="outline" className="mt-3 w-fit rounded-2xl" onClick={() => patch((c) => ({ ...c, legal: { ...c.legal, termsOfService: "Al comprar aceptas las condiciones de uso, pagos, entregas y validacion COD publicadas por la tienda." } }))}>Crear desde plantilla</Button></Card>
          </div>
        );
      case "emails":
        return (
          <div className="grid gap-6">
            <Card title="Recuperacion de carritos abandonados" description="Activa una secuencia automatica para recuperar ventas perdidas.">
              <div className="rounded-3xl border border-border/70 bg-secondary/20 p-5"><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-medium text-foreground">Lightmail recovery</p><p className="text-sm text-muted-foreground">Gestiona y personaliza los correos de recuperacion.</p></div><div className="flex items-center gap-3"><span className="text-sm text-muted-foreground">{settings.emails.abandonedCartEnabled ? "Activo" : "Pausado"}</span><Switch checked={settings.emails.abandonedCartEnabled} onCheckedChange={(checked) => patch((c) => ({ ...c, emails: { ...c.emails, abandonedCartEnabled: checked } }))} /></div></div><div className="mt-5 grid gap-4 md:grid-cols-2"><Field label="Espera antes del primer correo (minutos)"><Input type="number" min={5} value={settings.emails.abandonedCartDelayMinutes} onChange={(e) => patch((c) => ({ ...c, emails: { ...c.emails, abandonedCartDelayMinutes: Math.max(5, Number(e.target.value) || 5) } }))} /></Field><Field label="Asunto"><Input value={settings.emails.abandonedCartSubject} onChange={(e) => patch((c) => ({ ...c, emails: { ...c.emails, abandonedCartSubject: e.target.value } }))} /></Field><Field label="Vista previa" className="md:col-span-2"><Textarea value={settings.emails.abandonedCartPreview} onChange={(e) => patch((c) => ({ ...c, emails: { ...c.emails, abandonedCartPreview: e.target.value } }))} className="min-h-28" /></Field></div><Button type="button" variant="outline" className="mt-4 rounded-2xl">Abrir aplicacion</Button></div>
            </Card>
          </div>
        );
      case "security":
        return (
          <div className="grid gap-6">
            <Card title="Lista de paises bloqueados"><div className="flex flex-col gap-3 sm:flex-row"><Input value={countryDraft} onChange={(e) => setCountryDraft(e.target.value)} placeholder="Anadir pais" /><Button type="button" variant="outline" onClick={addCountry}><Plus className="mr-2 h-4 w-4" />Anadir pais</Button></div><div className="mt-4 flex flex-wrap gap-2">{settings.security.blockedCountries.length ? settings.security.blockedCountries.map((country) => <button key={country} type="button" className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground" onClick={() => patch((c) => ({ ...c, security: { ...c.security, blockedCountries: c.security.blockedCountries.filter((item) => item !== country) } }))}>{country}</button>) : <p className="text-sm text-muted-foreground">Aun no se han anadido paises.</p>}</div></Card>
            <Card title="IPs de clientes bloqueados"><div className="flex flex-col gap-3 sm:flex-row"><Input value={ipDraft} onChange={(e) => setIpDraft(e.target.value)} placeholder="Anadir direccion IP" /><Button type="button" variant="outline" onClick={addIp}><Plus className="mr-2 h-4 w-4" />Anadir direccion IP</Button></div><div className="mt-4 flex flex-wrap gap-2">{settings.security.blockedIps.length ? settings.security.blockedIps.map((ip) => <button key={ip} type="button" className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground" onClick={() => patch((c) => ({ ...c, security: { ...c.security, blockedIps: c.security.blockedIps.filter((item) => item !== ip) } }))}>{ip}</button>) : <p className="text-sm text-muted-foreground">Aun no se han anadido IPs.</p>}</div></Card>
            <Card title="Controles operativos"><div className="grid gap-4"><div className="flex items-center justify-between rounded-2xl border border-border/70 bg-secondary/20 p-4"><div><p className="font-medium text-foreground">Acceso de soporte</p><p className="text-sm text-muted-foreground">Otorga acceso temporal al soporte.</p></div><Switch checked={settings.security.supportAccess} onCheckedChange={(checked) => patch((c) => ({ ...c, security: { ...c.security, supportAccess: checked } }))} /></div><div className="flex items-center justify-between rounded-2xl border border-border/70 bg-secondary/20 p-4"><div><p className="font-medium text-foreground">Captcha</p><p className="text-sm text-muted-foreground">Agrega una capa esencial de seguridad.</p></div><Switch checked={settings.security.captchaEnabled} onCheckedChange={(checked) => patch((c) => ({ ...c, security: { ...c.security, captchaEnabled: checked } }))} /></div><div className="grid gap-4 md:grid-cols-2"><Field label="Maximo de articulos por pedido"><Input type="number" min={1} value={settings.security.maxItemsPerOrder} onChange={(e) => patch((c) => ({ ...c, security: { ...c.security, maxItemsPerOrder: Math.max(1, Number(e.target.value) || 1) } }))} /></Field><Field label="Retraso minimo entre pedidos COD (minutos)"><Input type="number" min={1} value={settings.security.codRetryDelayMinutes} onChange={(e) => patch((c) => ({ ...c, security: { ...c.security, codRetryDelayMinutes: Math.max(1, Number(e.target.value) || 1) } }))} /></Field></div></div></Card>
          </div>
        );
      case "payments":
        return (
          <div className="grid gap-6">
            <Card title="Moneda de la cuenta"><div className="grid gap-4 md:grid-cols-2"><Field label="Moneda"><Select value={settings.payments.accountCurrency} onValueChange={(value) => patch((c) => ({ ...c, payments: { ...c.payments, accountCurrency: value } }))}><SelectTrigger><SelectValue placeholder="Selecciona moneda" /></SelectTrigger><SelectContent><SelectItem value="United States Dollar">United States Dollar</SelectItem><SelectItem value="Peruvian Sol">Peruvian Sol</SelectItem><SelectItem value="Euro">Euro</SelectItem></SelectContent></Select></Field><Field label="Formato de moneda"><Input value={settings.payments.currencyFormat} onChange={(e) => patch((c) => ({ ...c, payments: { ...c.payments, currencyFormat: e.target.value } }))} /></Field></div></Card>
            <Card title="Conversion de moneda"><div className="grid gap-3"><label className="flex items-center gap-3 text-sm text-foreground"><Checkbox checked={settings.payments.autoDetectLocalCurrency} onCheckedChange={(checked) => patch((c) => ({ ...c, payments: { ...c.payments, autoDetectLocalCurrency: Boolean(checked) } }))} />Cambiar automaticamente a la moneda local del visitante</label><label className="flex items-center gap-3 text-sm text-foreground"><Checkbox checked={settings.payments.useAllCurrencies} onCheckedChange={(checked) => patch((c) => ({ ...c, payments: { ...c.payments, useAllCurrencies: Boolean(checked) } }))} />Usar todas las monedas</label><label className="flex items-center gap-3 text-sm text-foreground"><Checkbox checked={settings.payments.autoAddMissingCurrency} onCheckedChange={(checked) => patch((c) => ({ ...c, payments: { ...c.payments, autoAddMissingCurrency: Boolean(checked) } }))} />Agregar automaticamente la moneda faltante del pais del visitante</label></div><div className="mt-4 flex flex-col gap-3 sm:flex-row"><Input value={currencyDraft} onChange={(e) => setCurrencyDraft(e.target.value)} placeholder="Buscar o anadir moneda" /><Button type="button" variant="outline" onClick={addCurrency}><Plus className="mr-2 h-4 w-4" />Agregar</Button></div><div className="mt-4 flex flex-wrap gap-2">{settings.payments.additionalCurrencies.length ? settings.payments.additionalCurrencies.map((currency) => <button key={currency} type="button" className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground" onClick={() => patch((c) => ({ ...c, payments: { ...c.payments, additionalCurrencies: c.payments.additionalCurrencies.filter((item) => item !== currency) } }))}>{currency}</button>) : <p className="text-sm text-muted-foreground">Aun no tienes monedas anadidas.</p>}</div></Card>
            <Card title="Pasarelas de pago"><div className="mb-4 flex justify-end"><Button type="button" variant="outline" className="rounded-2xl" onClick={() => setGatewayOpen(true)}><Plus className="mr-2 h-4 w-4" />Add a payment gateway</Button></div><div className="grid gap-3">{settings.payments.gateways.map((gateway) => <div key={gateway.id} className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-background/80 p-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-medium text-foreground">{gateway.name}</p><p className="text-sm text-muted-foreground">{gateway.active ? "Activa" : "Desactivada"}</p></div><Button type="button" variant={gateway.active ? "outline" : "default"} size="sm" onClick={() => patch((c) => ({ ...c, payments: { ...c.payments, gateways: c.payments.gateways.map((item) => item.id === gateway.id ? { ...item, active: !item.active } : item) } }))}>{gateway.active ? "Desactivar" : "Activar"}</Button></div>)}</div></Card>
            <Card title="Contrasena temporal de tienda" description="Mientras no registres un metodo de pago, tu tienda conserva una proteccion temporal."><div className="flex flex-col gap-4 rounded-3xl border border-primary/20 bg-primary/5 p-5 lg:flex-row lg:items-center lg:justify-between"><div><p className="font-medium text-foreground">La contrasena de tus funnels es: {settings.payments.temporaryStorePassword}</p><p className="mt-1 text-sm text-muted-foreground">Para removerla, primero necesitas anadir un metodo de pago.</p></div><Button type="button" variant="ghost" className="justify-start rounded-2xl text-primary lg:justify-center" onClick={() => setPaymentModalOpen(true)}>Remove password</Button></div></Card>
          </div>
        );
      case "tracking":
        return (
          <div className="grid gap-6">
            <Card title="Seguimiento de eventos" description="Agrega los IDs de medicion para atribucion y remarketing."><div className="grid gap-4 md:grid-cols-2"><Field label="Google Analytics"><Input value={settings.tracking.googleAnalyticsId} placeholder="UA-0000000-0" onChange={(e) => patch((c) => ({ ...c, tracking: { ...c.tracking, googleAnalyticsId: e.target.value } }))} /></Field><Field label="Google Tag Manager"><Input value={settings.tracking.googleTagManagerId} placeholder="GTM-000000" onChange={(e) => patch((c) => ({ ...c, tracking: { ...c.tracking, googleTagManagerId: e.target.value } }))} /></Field><Field label="Google Ads"><Input value={settings.tracking.googleAdsId} placeholder="AW-000000000" onChange={(e) => patch((c) => ({ ...c, tracking: { ...c.tracking, googleAdsId: e.target.value } }))} /></Field><Field label="Snapchat Pixel"><Input value={settings.tracking.snapchatPixelId} placeholder="SNAP-PIXEL-ID" onChange={(e) => patch((c) => ({ ...c, tracking: { ...c.tracking, snapchatPixelId: e.target.value } }))} /></Field><Field label="Facebook Pixel"><Input value={settings.tracking.facebookPixelId} placeholder="FB-PIXEL-ID" onChange={(e) => patch((c) => ({ ...c, tracking: { ...c.tracking, facebookPixelId: e.target.value } }))} /></Field><Field label="TikTok Pixel"><Input value={settings.tracking.tiktokPixelId} placeholder="TT-PIXEL-ID" onChange={(e) => patch((c) => ({ ...c, tracking: { ...c.tracking, tiktokPixelId: e.target.value } }))} /></Field><Field label="Pinterest Pixel" className="md:col-span-2"><Input value={settings.tracking.pinterestPixelId} placeholder="PIN-PIXEL-ID" onChange={(e) => patch((c) => ({ ...c, tracking: { ...c.tracking, pinterestPixelId: e.target.value } }))} /></Field></div></Card>
          </div>
        );
      case "webhooks":
        return (
          <div className="grid gap-6">
            <Card title="Webhooks" description="Envia eventos del sistema a aplicaciones externas."><div className="mb-4 flex justify-end"><Button type="button" variant="outline" className="rounded-2xl" onClick={() => setWebhookOpen(true)}><Plus className="mr-2 h-4 w-4" />Anadir nuevo webhook</Button></div><div className="grid gap-3">{settings.webhooks.items.length ? settings.webhooks.items.map((item) => <div key={item.id} className="grid gap-4 rounded-2xl border border-border/70 bg-background/80 p-4 lg:grid-cols-[10rem_minmax(0,1fr)_6rem_auto]"><div className="text-sm"><p className="text-muted-foreground">Evento</p><p className="mt-1 font-medium text-foreground">{item.event}</p></div><div className="min-w-0 text-sm"><p className="text-muted-foreground">URL</p><p className="mt-1 break-words font-medium text-foreground">{item.url}</p></div><div className="text-sm"><p className="text-muted-foreground">Version</p><p className="mt-1 font-medium text-foreground">{item.version}</p></div><div className="flex items-center lg:justify-end"><Button type="button" variant="ghost" size="sm" onClick={() => patch((c) => ({ ...c, webhooks: { items: c.webhooks.items.filter((entry) => entry.id !== item.id) } }))}>Borrar</Button></div></div>) : <div className="rounded-2xl border border-dashed border-border p-5 text-sm text-muted-foreground">Aun no has creado webhooks.</div>}</div></Card>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <MainContent eyebrow="Preferencias" title="Configuracion" description="Centraliza envios, miembros, dominios, seguridad, pagos e integraciones de tu cuenta." actions={<Button type="button" className="rounded-2xl" onClick={save}>Guardar cambios</Button>}>
        <section className="grid gap-6 xl:grid-cols-[18rem_minmax(0,1fr)]">
          <aside className="rounded-[2rem] border border-border/80 bg-card/90 p-5">
            <div className="border-b border-border/70 pb-4"><div className="flex items-center gap-3"><div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-base font-semibold text-primary-foreground">{accountInitial}</div><div className="min-w-0"><p className="truncate font-semibold text-foreground">{settings.accountName}</p><p className="truncate text-sm text-muted-foreground">{settings.ownerEmail}</p></div></div></div>
            <div className="mt-5 space-y-5">{groups.map((group) => <div key={group.label}><p className="mb-2 px-3 text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">{group.label}</p><div className="space-y-1">{group.items.map((item) => { const Icon = item.icon; const active = item.id === activeSection; return <button key={item.id} type="button" onClick={() => setActiveSection(item.id)} className={cn("flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm transition-colors", active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-secondary/30 hover:text-foreground")}><Icon className="h-4 w-4" /><span className="min-w-0 truncate">{item.label}</span></button>; })}</div></div>)}</div>
          </aside>
          <article className="min-w-0 rounded-[2rem] border border-border/80 bg-card/90 p-5 lg:p-6">
            <div className="flex flex-col gap-5 border-b border-border/70 pb-5 sm:flex-row sm:items-start"><div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-xl font-semibold text-primary-foreground">{accountInitial}</div><div className="min-w-0 flex-1"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">{groups.flatMap((group) => group.items).find((item) => item.id === activeSection)?.label}</p><h2 className="mt-2 text-2xl font-semibold text-foreground">{copy.title}</h2><p className="mt-2 max-w-3xl text-sm text-muted-foreground">{copy.description}</p></div></div>
            <div className="mt-6 min-w-0">{renderSection()}</div>
          </article>
        </section>
      </MainContent>

      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent className="max-w-3xl rounded-3xl"><DialogHeader><DialogTitle>Anadir miembro</DialogTitle><DialogDescription>Invita un miembro y define sus permisos.</DialogDescription></DialogHeader><div className="grid gap-5"><Field label="Correo electronico"><Input value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="Introduce el correo electronico" /></Field><label className="flex items-center gap-3 rounded-2xl border border-border/70 bg-secondary/20 p-4 text-sm font-medium text-foreground"><Checkbox checked={inviteAdmin} onCheckedChange={(checked) => setInviteAdmin(checked === true)} />Admin</label><div className="grid gap-4 rounded-2xl border border-border/70 bg-secondary/20 p-4"><p className="text-sm font-medium text-foreground">Permisos parciales</p><div className="grid gap-3 md:grid-cols-2">{permissions.map((permission) => <label key={permission} className="flex items-center gap-3 text-sm text-foreground"><Checkbox checked={invitePermissions.includes(permission)} disabled={inviteAdmin} onCheckedChange={(checked) => setInvitePermissions((current) => checked === true ? [...current, permission] : current.filter((item) => item !== permission))} />{permission}</label>)}</div><div className="grid gap-2 sm:grid-cols-3">{apps.map((app) => <label key={app} className="flex items-center gap-3 text-sm text-foreground"><Checkbox checked={inviteApps.includes(app)} onCheckedChange={(checked) => setInviteApps((current) => checked === true ? [...current, app] : current.filter((item) => item !== app))} />{app}</label>)}</div></div></div><DialogFooter><Button type="button" variant="outline" onClick={() => setInviteOpen(false)}>Cancelar</Button><Button type="button" onClick={addMember}>Enviar invitacion</Button></DialogFooter></DialogContent>
      </Dialog>

      <Dialog open={webhookOpen} onOpenChange={setWebhookOpen}>
        <DialogContent className="rounded-3xl"><DialogHeader><DialogTitle>Crear webhook</DialogTitle><DialogDescription>Crea un webhook para enviar informacion de eventos.</DialogDescription></DialogHeader><div className="grid gap-4"><Field label="Evento"><Select value={webhookEvent} onValueChange={setWebhookEvent}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="New order">New order</SelectItem><SelectItem value="Order updated">Order updated</SelectItem><SelectItem value="Contact captured">Contact captured</SelectItem></SelectContent></Select></Field><Field label="URL del webhook"><Input value={webhookUrl} onChange={(e) => setWebhookUrl(e.target.value)} placeholder="URL donde deseas enviar datos del evento" /></Field><Field label="Version"><Select value={webhookVersion} onValueChange={setWebhookVersion}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="v1">v1</SelectItem><SelectItem value="v2">v2</SelectItem></SelectContent></Select></Field></div><DialogFooter><Button type="button" variant="outline" onClick={() => setWebhookOpen(false)}>Cancelar</Button><Button type="button" onClick={addWebhook}>Crear webhook</Button></DialogFooter></DialogContent>
      </Dialog>

      <Dialog open={gatewayOpen} onOpenChange={setGatewayOpen}>
        <DialogContent className="rounded-3xl"><DialogHeader><DialogTitle>Agregar pasarela</DialogTitle><DialogDescription>Registra una nueva pasarela para esta cuenta.</DialogDescription></DialogHeader><Field label="Nombre de la pasarela"><Input value={gatewayName} onChange={(e) => setGatewayName(e.target.value)} placeholder="Ej. Stripe, PayPal, Mercado Pago" /></Field><DialogFooter><Button type="button" variant="outline" onClick={() => setGatewayOpen(false)}>Cancelar</Button><Button type="button" onClick={addGateway}>Agregar</Button></DialogFooter></DialogContent>
      </Dialog>

      <Dialog open={paymentModalOpen} onOpenChange={setPaymentModalOpen}>
        <DialogContent className="max-w-xl rounded-3xl"><DialogHeader><DialogTitle>Metodo de pago</DialogTitle><DialogDescription>Falta el metodo de pago. Para eliminar la contrasena de tus funnels, necesitas anadir un metodo de pago.</DialogDescription></DialogHeader><div className="flex justify-center py-2"><div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 text-primary"><CreditCard className="h-10 w-10" /></div></div><DialogFooter><Button type="button" variant="outline" onClick={() => setPaymentModalOpen(false)}>Cerrar</Button><Button type="button" onClick={() => { setActiveSection("payments"); setPaymentModalOpen(false); }}>Gestionar metodos de pago</Button></DialogFooter></DialogContent>
      </Dialog>

      <PlanUpgradeDialog
        open={upgradeModalOpen}
        onOpenChange={setUpgradeModalOpen}
        featureName="Gestion de miembros"
        reason={upgradeReason}
        requiredPlanId={requiredPlanId}
      />
    </>
  );
}
