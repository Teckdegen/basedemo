
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Web3Provider } from "@/providers/Web3Provider";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import TradingApp from "./pages/App";        // this is the trading interface page
import Wallet from "./pages/Wallet";
import TokenTradePage from "./pages/TokenTradePage";
import NotFound from "./pages/NotFound";
import PNLPage from "./pages/PNL";
import BountiesPage from "./pages/Bounties";
import BountyDetailPage from "./pages/BountyDetailPage"; // New

const queryClient = new QueryClient();

const App = () => (
  <Web3Provider>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/app" element={<TradingApp />} />
              <Route path="/wallet" element={<Wallet />} />
              <Route path="/pnl" element={<PNLPage />} />
              <Route path="/trade/:tokenAddress" element={<TokenTradePage />} />
              <Route path="/bounties" element={<BountiesPage />} />
              <Route path="/bounties/:bountyId" element={<BountyDetailPage />} /> {/* Single bounty page */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </Web3Provider>
);

export default App;
