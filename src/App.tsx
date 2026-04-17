import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import AdminDashboard from "./pages/AdminDashboard";
import TenantDashboard from "./pages/TenantDashboard";
import HouseRules from "./pages/HouseRules";
import ReportIssue from "./pages/ReportIssue";
import EmergencyInfo from "./pages/EmergencyInfo";
import NotFound from "./pages/NotFound";
import Properties from "./pages/Properties";
import AdminIssues from "./pages/AdminIssues";
import AdminTenants from "./pages/AdminTenants";
import TenantIssues from "./pages/TenantIssues";
import Notices from "./pages/Notices";
import InformationCenter from "./pages/InformationCenter";
import UsefulContacts from "./pages/UsefulContacts";
import Documents from "./pages/Documents";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();
  if (loading) return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Loading...</div>;
  if (!session) return <Navigate to="/auth" replace />;
  return <>{children}</>;
}

function DashboardRouter() {
  const { role, loading } = useAuth();
  if (loading) return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Loading...</div>;
  if (role === "admin") return <AdminDashboard />;
  return <TenantDashboard />;
}

function AuthRoute() {
  const { session, loading } = useAuth();
  if (loading) return null;
  if (session) return <Navigate to="/dashboard" replace />;
  return <Auth />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/auth" element={<AuthRoute />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/dashboard" element={<ProtectedRoute><DashboardRouter /></ProtectedRoute>} />
            <Route path="/report-issue" element={<ProtectedRoute><ReportIssue /></ProtectedRoute>} />
            <Route path="/emergency" element={<ProtectedRoute><EmergencyInfo /></ProtectedRoute>} />
            <Route path="/properties" element={<ProtectedRoute><Properties /></ProtectedRoute>} />
            <Route path="/issues" element={<ProtectedRoute><AdminIssues /></ProtectedRoute>} />
            <Route path="/tenants" element={<ProtectedRoute><AdminTenants /></ProtectedRoute>} />
            <Route path="/my-issues" element={<ProtectedRoute><TenantIssues /></ProtectedRoute>} />
            <Route path="/notices" element={<ProtectedRoute><Notices /></ProtectedRoute>} />
            <Route path="/documents" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
            <Route path="/info-centre" element={<ProtectedRoute><InformationCenter /></ProtectedRoute>} />
            <Route path="/contacts" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
            <Route path="/house-rules" element={<ProtectedRoute><HouseRules /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
