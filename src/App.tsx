import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";

import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

// Client pages
import ClientDashboard from "./pages/client/Dashboard";
import CreateRequest from "./pages/client/CreateRequest";
import MyRequests from "./pages/client/MyRequests";
import RequestDetail from "./pages/client/RequestDetail";
import Profile from "./pages/client/Profile";

// Admin/Manager pages
import RequestsAdmin from "./pages/admin/RequestsAdmin";
import RequestDetailAdmin from "./pages/admin/RequestDetailAdmin";
import WarehousesAdmin from "./pages/admin/WarehousesAdmin";
import UsersAdmin from "./pages/admin/UsersAdmin";
import DirectoriesAdmin from "./pages/admin/DirectoriesAdmin";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />

            {/* Client routes */}
            <Route path="/client/dashboard" element={<ProtectedRoute allowedRoles={["client"]}><ClientDashboard /></ProtectedRoute>} />
            <Route path="/client/create" element={<ProtectedRoute allowedRoles={["client"]}><CreateRequest /></ProtectedRoute>} />
            <Route path="/client/requests" element={<ProtectedRoute allowedRoles={["client"]}><MyRequests /></ProtectedRoute>} />
            <Route path="/client/requests/:id" element={<ProtectedRoute allowedRoles={["client"]}><RequestDetail /></ProtectedRoute>} />
            <Route path="/client/profile" element={<ProtectedRoute allowedRoles={["client"]}><Profile /></ProtectedRoute>} />

            {/* Admin/Manager routes */}
            <Route path="/admin/requests" element={<ProtectedRoute allowedRoles={["manager", "admin"]}><RequestsAdmin /></ProtectedRoute>} />
            <Route path="/admin/requests/:id" element={<ProtectedRoute allowedRoles={["manager", "admin"]}><RequestDetailAdmin /></ProtectedRoute>} />
            <Route path="/admin/warehouses" element={<ProtectedRoute allowedRoles={["admin"]}><WarehousesAdmin /></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute allowedRoles={["admin"]}><UsersAdmin /></ProtectedRoute>} />
            <Route path="/admin/directories" element={<ProtectedRoute allowedRoles={["admin"]}><DirectoriesAdmin /></ProtectedRoute>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
