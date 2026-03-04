import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";
import { getDashboardNavItem } from "@/components/dashboard/navigation";
import { useAuth } from "@/lib/auth";

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [workspace, setWorkspace] = useState("Workspace principal");

  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [location.pathname]);

  const activeSection = getDashboardNavItem(location.pathname);

  const handleLogout = async () => {
    await logout();
    toast.success("Sesion cerrada.");
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,183,36,0.12),transparent_30%),radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.05),transparent_28%)]" />

      <div className="relative flex min-h-screen">
        <Sidebar
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
          onLogout={handleLogout}
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar
            sectionLabel={activeSection.label}
            workspace={workspace}
            onWorkspaceChange={setWorkspace}
            onOpenSidebar={() => setIsMobileSidebarOpen(true)}
            user={user}
          />
          <Outlet />
        </div>
      </div>
    </div>
  );
}
