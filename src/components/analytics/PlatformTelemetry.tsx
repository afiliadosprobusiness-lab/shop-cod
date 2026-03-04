import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  bootstrapPlatformCloudState,
  recordPlatformEvent,
} from "@/lib/platform-data";

function shouldTrackPath(pathname: string) {
  if (!pathname) {
    return false;
  }

  if (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/products") ||
    pathname.startsWith("/funnels") ||
    pathname.startsWith("/stores") ||
    pathname.startsWith("/orders") ||
    pathname.startsWith("/analytics") ||
    pathname.startsWith("/contacts") ||
    pathname.startsWith("/offers") ||
    pathname.startsWith("/apps") ||
    pathname.startsWith("/settings") ||
    pathname.startsWith("/editor") ||
    pathname.startsWith("/login")
  ) {
    return false;
  }

  return true;
}

export default function PlatformTelemetry() {
  const location = useLocation();

  useEffect(() => {
    void bootstrapPlatformCloudState();
  }, []);

  useEffect(() => {
    const { pathname } = location;

    if (!shouldTrackPath(pathname)) {
      return;
    }

    recordPlatformEvent("page_view", pathname);

    if (pathname === "/checkout") {
      recordPlatformEvent("checkout_started", pathname);
    }
  }, [location]);

  return null;
}
