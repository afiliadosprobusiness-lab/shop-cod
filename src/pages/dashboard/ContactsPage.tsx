import { useEffect, useMemo, useState } from "react";
import { Phone, UserRound, Users } from "lucide-react";
import MainContent from "@/components/dashboard/MainContent";
import { subscribeToShopcodData } from "@/lib/live-sync";
import { loadContacts, type PlatformContact } from "@/lib/platform-data";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "PEN",
    maximumFractionDigits: 2,
  }).format(value);
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<PlatformContact[]>(() => loadContacts());
  const [search, setSearch] = useState("");

  useEffect(() => {
    return subscribeToShopcodData(() => {
      setContacts(loadContacts());
    });
  }, []);

  const filteredContacts = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) {
      return contacts;
    }

    return contacts.filter(
      (contact) =>
        contact.fullName.toLowerCase().includes(term) ||
        contact.phone.toLowerCase().includes(term) ||
        contact.city.toLowerCase().includes(term),
    );
  }, [contacts, search]);

  const buyers = contacts.filter((contact) => contact.kind === "buyer").length;

  return (
    <MainContent
      eyebrow="CRM"
      title="Contactos"
      description="Aqui se guardan los clientes y leads capturados desde el formulario COD y sus compras asociadas."
    >
      <section className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-[1.75rem] border border-border/80 bg-card/90 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Contactos
          </p>
          <p className="mt-3 text-3xl font-semibold text-foreground">{contacts.length}</p>
        </div>
        <div className="rounded-[1.75rem] border border-border/80 bg-card/90 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Compradores
          </p>
          <p className="mt-3 text-3xl font-semibold text-foreground">{buyers}</p>
        </div>
        <div className="rounded-[1.75rem] border border-border/80 bg-card/90 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Base activa
          </p>
          <p className="mt-3 text-3xl font-semibold text-foreground">
            {contacts.filter((contact) => contact.totalOrders > 0).length}
          </p>
        </div>
      </section>

      <section className="rounded-[2rem] border border-border/80 bg-card/90 p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Clientes y leads
            </p>
            <p className="mt-1 text-lg font-semibold text-foreground">
              Historial comercial conectado al checkout
            </p>
          </div>

          <label className="block w-full lg:max-w-sm">
            <span className="sr-only">Buscar contacto</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por nombre, telefono o ciudad"
              className="h-11 w-full rounded-2xl border border-border bg-secondary/30 px-4 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </label>
        </div>

        <div className="mt-5 grid gap-4">
          {filteredContacts.length ? (
            filteredContacts.map((contact) => (
              <article
                key={contact.id}
                className="rounded-[1.5rem] border border-border/80 bg-secondary/20 p-4"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        {contact.kind === "buyer" ? (
                          <Users className="h-4 w-4" />
                        ) : (
                          <UserRound className="h-4 w-4" />
                        )}
                      </span>
                      <div>
                        <p className="font-semibold text-foreground">{contact.fullName}</p>
                        <p className="text-sm text-muted-foreground">
                          {contact.city}, {contact.department}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-3 text-sm text-muted-foreground">
                      <span className="inline-flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        {contact.phone}
                      </span>
                      <span>{contact.totalOrders} pedidos</span>
                    </div>
                  </div>

                  <div className="grid gap-2 text-sm lg:min-w-[14rem]">
                    <div className="rounded-2xl border border-border/70 bg-background/40 px-3 py-2">
                      <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                        Ticket acumulado
                      </p>
                      <p className="mt-1 font-semibold text-foreground">
                        {formatCurrency(contact.totalSpent)}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-border/70 bg-background/40 px-3 py-2">
                      <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                        Ultima actividad
                      </p>
                      <p className="mt-1 font-semibold text-foreground">
                        {new Date(contact.updatedAt).toLocaleString("en-US")}
                      </p>
                    </div>
                  </div>
                </div>
              </article>
            ))
          ) : (
            <div className="rounded-[1.5rem] border border-border/80 bg-secondary/20 p-5 text-sm text-muted-foreground">
              Todavia no hay contactos. Cuando alguien compre o envie el formulario COD, quedara
              registrado aqui.
            </div>
          )}
        </div>
      </section>
    </MainContent>
  );
}
