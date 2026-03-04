import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";
import { isSuperAdminEmail } from "@/lib/superadmin";
import { toast } from "sonner";

interface LoginLocationState {
  from?: string;
}

function GoogleBadge() {
  return (
    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-sm font-bold text-[#4285F4]">
      G
    </span>
  );
}

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isReady, login, loginWithGoogle, user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);

  const nextPath = useMemo(() => {
    const state = location.state as LoginLocationState | null;
    return state?.from || "/dashboard";
  }, [location.state]);

  useEffect(() => {
    if (isReady && isAuthenticated) {
      navigate(isSuperAdminEmail(user?.email) ? "/superadmin" : "/dashboard", {
        replace: true,
      });
    }
  }, [isAuthenticated, isReady, navigate, user?.email]);

  const handleEmailLogin = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email.trim() || !password.trim()) {
      toast.error("Completa tu correo y contrasena.");
      return;
    }

    setIsSubmitting(true);

    window.setTimeout(async () => {
      try {
        const authUser = await login({ email, password });
        const destination = isSuperAdminEmail(authUser.email)
          ? "/superadmin"
          : nextPath === "/superadmin"
            ? "/dashboard"
            : nextPath;
        toast.success("Sesion iniciada correctamente.");
        navigate(destination, { replace: true });
      } catch (error) {
        const authError = error as { code?: string; message?: string };

        if (authError.code === "auth/operation-not-allowed") {
          toast.error("Habilita Email/Password en Firebase Authentication > Sign-in method.");
        } else {
          toast.error(authError.message || "No se pudo iniciar sesion.");
        }
      } finally {
        setIsSubmitting(false);
      }
    }, 350);
  };

  const handleGoogleLogin = () => {
    setIsGoogleSubmitting(true);

    window.setTimeout(async () => {
      try {
        const authUser = await loginWithGoogle();
        const destination = isSuperAdminEmail(authUser.email)
          ? "/superadmin"
          : nextPath === "/superadmin"
            ? "/dashboard"
            : nextPath;
        toast.success("Sesion iniciada con Google.");
        navigate(destination, { replace: true });
      } catch (error) {
        const authError = error as { code?: string; message?: string };

        if (authError.code === "auth/popup-closed-by-user") {
          toast.error("Cerraste la ventana de Google antes de completar el acceso.");
        } else if (authError.code === "auth/unauthorized-domain") {
          toast.error("Agrega este dominio a Authorized Domains en Firebase Auth.");
        } else if (authError.code === "auth/operation-not-allowed") {
          toast.error("Habilita Google en Firebase Authentication > Sign-in method.");
        } else {
          toast.error(authError.message || "No se pudo iniciar sesion con Google.");
        }
      } finally {
        setIsGoogleSubmitting(false);
      }
    }, 350);
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-background px-4 py-10 sm:px-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(229,168,0,0.14),transparent_35%),linear-gradient(180deg,rgba(255,255,255,0),rgba(255,255,255,0))]" />
      <div className="relative mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl items-center">
        <div className="grid w-full gap-8 rounded-3xl border border-border bg-card/95 p-4 shadow-2xl backdrop-blur sm:p-6 lg:grid-cols-[1.1fr_0.9fr] lg:p-8">
          <section className="overflow-hidden rounded-3xl bg-gradient-card p-6 sm:p-8">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" /> Volver al inicio
            </button>

            <div className="mt-8 space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
                <ShieldCheck className="h-4 w-4" />
                Acceso seguro para tu panel ShopCOD
              </div>

              <div className="space-y-4">
                <h1 className="max-w-xl text-4xl font-bold leading-tight sm:text-5xl">
                  Inicia sesion y vuelve a vender con{" "}
                  <span className="text-gradient-gold">checkout COD</span>.
                </h1>
                <p className="max-w-lg text-base text-muted-foreground sm:text-lg">
                  Entra a tu panel para gestionar tiendas, funnels y pedidos desde un
                  solo lugar.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-border/80 bg-background/70 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    Paso 1
                  </p>
                  <p className="mt-2 text-sm font-medium">Entra con correo o Google</p>
                </div>
                <div className="rounded-2xl border border-border/80 bg-background/70 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    Paso 2
                  </p>
                  <p className="mt-2 text-sm font-medium">Gestiona tus tiendas y funnels</p>
                </div>
                <div className="rounded-2xl border border-border/80 bg-background/70 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    Paso 3
                  </p>
                  <p className="mt-2 text-sm font-medium">Guarda y publica sin perder cambios</p>
                </div>
              </div>
            </div>
          </section>

          <section className="flex items-center">
            <div className="w-full rounded-3xl border border-border bg-background p-6 sm:p-8">
              <div className="space-y-2">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                  Login
                </p>
                <h2 className="text-2xl font-bold">Accede a tu cuenta</h2>
                <p className="text-sm text-muted-foreground">
                  Usa tu correo y tu acceso para entrar a ShopCOD.
                </p>
              </div>

              <Button
                type="button"
                variant="outline"
                size="lg"
                className="mt-6 h-12 w-full justify-center"
                onClick={handleGoogleLogin}
                disabled={isGoogleSubmitting || isSubmitting}
              >
                <GoogleBadge />
                {isGoogleSubmitting ? "Conectando..." : "Continuar con Google"}
              </Button>

              <div className="my-6 flex items-center gap-3">
                <div className="h-px flex-1 bg-border" />
                <span className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                  o
                </span>
                <div className="h-px flex-1 bg-border" />
              </div>

              <form className="space-y-5" onSubmit={handleEmailLogin}>
                <div className="space-y-2">
                  <Label htmlFor="email">Correo electronico</Label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      placeholder="ventas@shopcod.app"
                      className="h-12 border-border bg-secondary pl-10"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Contrasena</Label>
                  <div className="relative">
                    <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      autoComplete="current-password"
                      placeholder="Ingresa tu contrasena"
                      className="h-12 border-border bg-secondary pl-10"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="cta"
                  size="xl"
                  className="w-full"
                  disabled={isSubmitting || isGoogleSubmitting}
                >
                  {isSubmitting ? "Ingresando..." : "Iniciar sesion"}
                </Button>
              </form>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
