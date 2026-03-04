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
import Profile from "./pages/client/Profile";

// Admin/Manager pages
import RequestsAdmin from "./pages/admin/RequestsAdmin";

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
            <Route path="/client/profile" element={<ProtectedRoute allowedRoles={["client"]}><Profile /></ProtectedRoute>} />

            {/* Admin/Manager routes */}
            <Route path="/admin/requests" element={<ProtectedRoute allowedRoles={["manager", "admin"]}><RequestsAdmin /></ProtectedRoute>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
