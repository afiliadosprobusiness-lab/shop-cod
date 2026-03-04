import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { AuthProvider } from "@/lib/auth";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import DashboardLayout from "./layouts/DashboardLayout";
import SaaSLandingPage from "./pages/SaaSLandingPage";
import EditorPage from "./pages/EditorPage";
import PreviewPage from "./pages/PreviewPage";
import LoginPage from "./pages/LoginPage";
import LandingPage from "./pages/LandingPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderConfirmedPage from "./pages/OrderConfirmedPage";
import DashboardHomePage from "./pages/dashboard/DashboardHomePage";
import DashboardModulePage from "./pages/dashboard/DashboardModulePage";
import FunnelsPage from "./pages/dashboard/FunnelsPage";
import ProductCreatePage from "./pages/dashboard/ProductCreatePage";
import ProductsPage from "./pages/dashboard/ProductsPage";
import StoreDashboardPage from "./pages/dashboard/StoreDashboardPage";
import StoresPage from "./pages/dashboard/StoresPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<SaaSLandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/store/demo" element={<LandingPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/order-confirmed" element={<OrderConfirmedPage />} />
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
              <Route path="orders" element={<DashboardModulePage />} />
              <Route path="analytics" element={<DashboardModulePage />} />
              <Route path="contacts" element={<DashboardModulePage />} />
              <Route path="offers" element={<DashboardModulePage />} />
              <Route path="apps" element={<DashboardModulePage />} />
              <Route path="settings" element={<DashboardModulePage />} />
            </Route>
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
