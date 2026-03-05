import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import PlatformTelemetry from "@/components/analytics/PlatformTelemetry";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import SuperAdminRoute from "@/components/auth/SuperAdminRoute";
import { AuthProvider } from "@/lib/auth";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import DashboardLayout from "./layouts/DashboardLayout";
import Index from "./pages/Index";
import EditorPage from "./pages/EditorPage";
import PreviewPage from "./pages/PreviewPage";
import SuperAdminPage from "./pages/SuperAdminPage";
import LoginPage from "./pages/LoginPage";
import LandingPage from "./pages/LandingPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderConfirmedPage from "./pages/OrderConfirmedPage";
import DashboardHomePage from "./pages/dashboard/DashboardHomePage";
import DashboardModulePage from "./pages/dashboard/DashboardModulePage";
import AnalyticsPage from "./pages/dashboard/AnalyticsPage";
import AppsPage from "./pages/dashboard/AppsPage";
import ContactsPage from "./pages/dashboard/ContactsPage";
import FunnelsPage from "./pages/dashboard/FunnelsPage";
import OffersPage from "./pages/dashboard/OffersPage";
import OrdersPage from "./pages/dashboard/OrdersPage";
import ProductCreatePage from "./pages/dashboard/ProductCreatePage";
import ProductsPage from "./pages/dashboard/ProductsPage";
import SettingsPage from "./pages/dashboard/SettingsPage";
import StoreDashboardPage from "./pages/dashboard/StoreDashboardPage";
import StoresPage from "./pages/dashboard/StoresPage";
import FunnelWorkspacePage from "./pages/funnel/FunnelWorkspacePage";
import PublicCheckoutPage from "./pages/funnel/PublicCheckoutPage";
import PublicLandingPage from "./pages/funnel/PublicLandingPage";
import PublicThankYouPage from "./pages/funnel/PublicThankYouPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <PlatformTelemetry />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<LoginPage />} />
            <Route
              path="/superadmin"
              element={
                <SuperAdminRoute>
                  <SuperAdminPage />
                </SuperAdminRoute>
              }
            />
            <Route path="/store/demo" element={<LandingPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/order-confirmed" element={<OrderConfirmedPage />} />
            <Route path="/f/:slug" element={<PublicLandingPage />} />
            <Route path="/f/:slug/checkout" element={<PublicCheckoutPage />} />
            <Route path="/f/:slug/thank-you" element={<PublicThankYouPage />} />
            <Route
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<DashboardHomePage />} />
              <Route path="products" element={<ProductsPage />} />
              <Route path="products/new" element={<ProductCreatePage />} />
              <Route path="funnels" element={<FunnelsPage />} />
              <Route path="stores/:storeId" element={<StoreDashboardPage />} />
              <Route path="stores" element={<StoresPage />} />
              <Route path="orders" element={<OrdersPage />} />
              <Route path="analytics" element={<AnalyticsPage />} />
              <Route path="contacts" element={<ContactsPage />} />
              <Route path="offers" element={<OffersPage />} />
              <Route path="apps" element={<AppsPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="*" element={<DashboardModulePage />} />
            </Route>
            <Route
              path="/funnels/:funnelId/editor"
              element={
                <ProtectedRoute>
                  <FunnelWorkspacePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/editor/:storeId"
              element={
                <ProtectedRoute>
                  <EditorPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/preview/:storeId"
              element={
                <ProtectedRoute>
                  <PreviewPage />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
