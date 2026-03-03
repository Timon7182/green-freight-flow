import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import CreateOrder from "./pages/customer/CreateOrder";
import MyOrders from "./pages/customer/MyOrders";
import Orders from "./pages/carrier/Orders";
import MyCarrierOrders from "./pages/carrier/MyCarrierOrders";
import ChatPage from "./pages/Chat";
import NewsPage from "./pages/News";
import MarketplacePage from "./pages/Marketplace";
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
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/customer/create" element={<CreateOrder />} />
            <Route path="/customer/orders" element={<MyOrders />} />
            <Route path="/carrier/orders" element={<Orders />} />
            <Route path="/carrier/my-orders" element={<MyCarrierOrders />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/news" element={<NewsPage />} />
            <Route path="/marketplace" element={<MarketplacePage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
