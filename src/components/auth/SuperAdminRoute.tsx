import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { isSuperAdminEmail } from "@/lib/superadmin";

export default function SuperAdminRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isReady, user } = useAuth();
  const location = useLocation();

  if (!isReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6">
        <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 text-center">
          <p className="text-sm font-semibold text-foreground">Validando acceso root...</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Estamos confirmando tus permisos de superadmin.
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        replace
        to="/login"
        state={{ from: `${location.pathname}${location.search}${location.hash}` }}
      />
    );
  }

  if (!isSuperAdminEmail(user?.email)) {
    return <Navigate replace to="/dashboard" />;
  }

  return <>{children}</>;
}
