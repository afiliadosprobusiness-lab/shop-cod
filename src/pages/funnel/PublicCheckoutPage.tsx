import { FormEvent, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createOrder,
  findFunnelBySlug,
  getFunnelProduct,
  type PaymentType,
} from "@/lib/funnel-system";

function paymentLabel(paymentType: PaymentType) {
  if (paymentType === "stripe") {
    return "Pay with Stripe";
  }
  if (paymentType === "paypal") {
    return "Pay with PayPal";
  }
  return "Confirm Order";
}

export default function PublicCheckoutPage() {
  const navigate = useNavigate();
  const { slug = "" } = useParams();
  const funnel = findFunnelBySlug(slug);
  const product = useMemo(() => (funnel ? getFunnelProduct(funnel.id) : null), [funnel]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [error, setError] = useState("");

  if (!funnel || !funnel.published_at) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 py-10">
        <section className="rounded-2xl border border-border bg-card p-6 text-center">
          <h1 className="text-2xl font-semibold">Checkout no disponible</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Publica el funnel primero para habilitar el checkout.
          </p>
        </section>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 py-10">
        <section className="rounded-2xl border border-border bg-card p-6 text-center">
          <h1 className="text-2xl font-semibold">Producto no configurado</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Agrega el producto del funnel desde el editor para continuar.
          </p>
        </section>
      </main>
    );
  }

  const requiresCodFields = product.payment_type === "cash_on_delivery";

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!name.trim() || !phone.trim()) {
      setError("Completa nombre y telefono.");
      return;
    }

    if (requiresCodFields && (!address.trim() || !city.trim())) {
      setError("Para COD debes completar direccion y ciudad.");
      return;
    }

    setError("");
    createOrder({
      funnelId: funnel.id,
      productId: product.id,
      name,
      phone,
      address: requiresCodFields ? address : "",
      city: requiresCodFields ? city : "",
      paymentType: product.payment_type,
    });

    navigate(`/f/${funnel.slug}/thank-you`);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8">
      <section className="rounded-2xl border border-border bg-card p-6">
        <h1 className="text-2xl font-semibold">Checkout</h1>
        <div className="mt-4 rounded-xl border border-border bg-secondary/20 p-4">
          <p className="font-medium text-foreground">{product.name}</p>
          <p className="text-sm text-muted-foreground">Tipo: {product.type}</p>
          <p className="mt-2 text-lg font-semibold">${product.price.toFixed(2)}</p>
          <p className="mt-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">
            payment_type: {product.payment_type}
          </p>
        </div>

        <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="checkout-name">name</Label>
              <Input
                id="checkout-name"
                className="rounded-xl"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="checkout-phone">phone</Label>
              <Input
                id="checkout-phone"
                className="rounded-xl"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
              />
            </div>
          </div>

          {requiresCodFields ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="checkout-address">address</Label>
                <Input
                  id="checkout-address"
                  className="rounded-xl"
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="checkout-city">city</Label>
                <Input
                  id="checkout-city"
                  className="rounded-xl"
                  value={city}
                  onChange={(event) => setCity(event.target.value)}
                />
              </div>
            </div>
          ) : (
            <p className="rounded-xl border border-border bg-secondary/20 px-3 py-2 text-sm text-muted-foreground">
              El pago se procesa con {product.payment_type}. Al confirmar se registra la orden.
            </p>
          )}

          {error ? (
            <p className="rounded-xl border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          ) : null}

          <div className="flex flex-wrap items-center gap-2">
            <Button type="submit" className="rounded-xl">
              {paymentLabel(product.payment_type)}
            </Button>
            <Button asChild variant="ghost" className="rounded-xl">
              <Link to={`/f/${funnel.slug}`}>Volver a landing</Link>
            </Button>
          </div>
        </form>
      </section>
    </main>
  );
}
