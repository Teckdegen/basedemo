import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Web3Provider } from "@/providers/Web3Provider";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import TradingApp from "./pages/TradingApp";
import Portfolio from "./pages/Portfolio";
import DemoWallet from "./pages/DemoWallet";
import TokenTradePage from "./pages/TokenTradePage";
import NotFound from "./pages/NotFound";
import PNLPage from "./pages/PNL";
import TasksPage from "./pages/Bounties";
import TaskDetailPage from "./pages/BountyDetailPage";

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
              <Route path="/trade" element={<TradingApp />} />
              <Route path="/portfolio" element={<Portfolio />} />
              <Route path="/wallet" element={<Portfolio />} />
              <Route path="/demowallet" element={<DemoWallet />} />
              <Route path="/pnl" element={<PNLPage />} />
              <Route path="/trade/:tokenAddress" element={<TokenTradePage />} />
              <Route path="/tasks" element={<TasksPage />} />
              <Route path="/bounties" element={<TasksPage />} />
              <Route path="/tasks/:bountyId" element={<TaskDetailPage />} />
              <Route path="/bounties/:bountyId" element={<TaskDetailPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </Web3Provider>
);

export default App;
