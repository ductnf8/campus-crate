import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AIChatWidget from "@/components/AIChatWidget";
import Index from "./pages/Index";
import ItemDetail from "./pages/ItemDetail";
import PostItem from "./pages/PostItem";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import Favorites from "./pages/Favorites";
import EditItem from "./pages/EditItem";
import Admin from "./pages/Admin";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import SellerProfile from "./pages/SellerProfile";
import Upgrade from "./pages/Upgrade";
import SellerOrders from "./pages/SellerOrders";
import Deposit from "./pages/Deposit";
import MyPurchases from "./pages/MyPurchases";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/item/:id" element={<ItemDetail />} />
                <Route path="/post" element={<PostItem />} />
                <Route path="/edit/:id" element={<EditItem />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/favorites" element={<Favorites />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout/:id" element={<Checkout />} />
                <Route path="/seller/:id" element={<SellerProfile />} />
                <Route path="/upgrade" element={<Upgrade />} />
                <Route path="/seller/orders" element={<SellerOrders />} />
                <Route path="/deposit" element={<Deposit />} />
                <Route path="/my-purchases" element={<MyPurchases />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
            <AIChatWidget />
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
