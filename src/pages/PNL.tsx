
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, ArrowLeft, Sparkles } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface TokenStats {
  symbol: string;
  name: string;
  buyAmounts: number;
  buyTotals: number;
  sellAmounts: number;
  sellTotals: number;
  buyPrices: number[];
  sellPrices: number[];
}

interface TokenPNL {
  address: string;
  symbol: string;
  name: string;
  avgBuy: number;
  avgSell: number;
  buyAmounts: number;
  sellAmounts: number;
  realizedPNL: number;
}

const calculatePNL = (holdings: any[], trades: any[]): TokenPNL[] => {
  // Map: token address -> TokenStats
  const tokenStats: Record<string, TokenStats> = {};

  trades.forEach((trade) => {
    const entry = tokenStats[trade.token_address] || {
      symbol: trade.token_symbol,
      name: trade.token_name || trade.token_symbol,
      buyAmounts: 0,
      buyTotals: 0,
      sellAmounts: 0,
      sellTotals: 0,
      buyPrices: [],
      sellPrices: [],
    };
    
    if (trade.trade_type === "buy") {
      entry.buyAmounts += trade.amount;
      entry.buyTotals += trade.total_base;
      entry.buyPrices.push(Number(trade.price_per_token));
    }
    if (trade.trade_type === "sell") {
      entry.sellAmounts += trade.amount;
      entry.sellTotals += trade.total_base;
      entry.sellPrices.push(Number(trade.price_per_token));
    }
    tokenStats[trade.token_address] = entry;
  });

  // Get average prices and calculate PNL
  const tokens = Object.entries(tokenStats).map(([address, t]) => {
    const avgBuy = t.buyAmounts > 0 ? t.buyTotals / t.buyAmounts : 0;
    const avgSell = t.sellAmounts > 0 ? t.sellTotals / t.sellAmounts : 0;
    const realizedPNL = t.sellTotals - ((t.sellAmounts / (t.buyAmounts || 1)) * t.buyTotals);
    
    return {
      address,
      symbol: t.symbol,
      name: t.name,
      avgBuy,
      avgSell,
      buyAmounts: t.buyAmounts,
      sellAmounts: t.sellAmounts,
      realizedPNL,
    };
  });

  return tokens;
};

const PNLPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, holdings, trades, loading } = useSupabaseData();

  const tokens = calculatePNL(holdings, trades);

  const { data: aiSummary, isLoading: isSummaryLoading } = useQuery({
    queryKey: ['pnlSummary', tokens.map(t => t.address)],
    queryFn: async () => {
      if (tokens.length === 0) {
        return "Start trading to get an AI-powered summary of your performance!";
      }

      const { data, error } = await supabase.functions.invoke('pnl-summary', {
        body: { pnlData: tokens },
      });

      if (error) {
        console.error("Error fetching AI summary:", error);
        return 'Could not generate AI summary at this time. Please try again later.';
      }

      return data.summary;
    },
    enabled: !loading,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#6366f1' }}>
        <span className="text-xl text-white">Loading...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: '#6366f1' }}>
      {/* Header */}
      <nav className="flex justify-between items-center p-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/demowallet")}
            className="flex items-center gap-2 text-white hover:bg-white/10 rounded-xl px-3"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden md:inline-block">Back to Portfolio</span>
          </Button>
          
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-blue-600 font-black text-lg">BD</span>
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full"></div>
              <div className="absolute top-2 -right-2 w-2 h-2 bg-white rounded-full"></div>
            </div>
            <span className="text-2xl font-bold text-white">P&L Report</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/trade")}
            className="flex items-center gap-2 text-white hover:bg-white/10"
          >
            <TrendingUp className="w-4 h-4" />
            Trade
          </Button>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto p-4 sm:p-8">
        <Card className="mb-6 bg-white/10 backdrop-blur-sm border-white/20 text-white rounded-2xl">
            <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-lg sm:text-2xl">
                    <Sparkles className="w-6 h-6 text-yellow-400" />
                    <span>AI Performance Summary</span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                {isSummaryLoading ? (
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-full bg-slate-700" />
                        <Skeleton className="h-4 w-full bg-slate-700" />
                        <Skeleton className="h-4 w-3/4 bg-slate-700" />
                    </div>
                ) : (
                    <p className="text-blue-100 whitespace-pre-line">
                        {aiSummary}
                    </p>
                )}
            </CardContent>
        </Card>
      
        <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white rounded-2xl">
          <CardHeader>
            <CardTitle className="text-lg sm:text-2xl">Token-wise Profit &amp; Loss</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/20">
                <thead>
                  <tr>
                    <th className="px-3 py-2 text-left text-sm text-blue-200">Token</th>
                    <th className="px-3 py-2 text-left text-sm text-blue-200">Avg Entry</th>
                    <th className="px-3 py-2 text-left text-sm text-blue-200">Avg Exit</th>
                    <th className="px-3 py-2 text-left text-sm text-blue-200">Total Bought</th>
                    <th className="px-3 py-2 text-left text-sm text-blue-200">Total Sold</th>
                    <th className="px-3 py-2 text-left text-sm text-blue-200">Profit/Loss</th>
                  </tr>
                </thead>
                <tbody>
                  {tokens.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-blue-200">
                        <div className="flex flex-col items-center gap-3">
                          <TrendingUp className="w-12 h-12 text-blue-300/50" />
                          <div>
                            <p className="text-lg font-medium">No trades yet</p>
                            <p className="text-sm text-blue-300">Start trading to see your P&L data here</p>
                          </div>
                          <Button
                            onClick={() => navigate("/trade")}
                            className="mt-2 bg-white/20 hover:bg-white/30 text-white border border-white/30"
                          >
                            Start Trading
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    tokens.map(token => (
                      <tr key={token.address} className="odd:bg-white/5 even:bg-white/10">
                        <td className="px-3 py-2 font-semibold">{token.symbol}</td>
                        <td className="px-3 py-2">{token.avgBuy > 0 ? `$${token.avgBuy.toFixed(6)}` : "--"}</td>
                        <td className="px-3 py-2">{token.avgSell > 0 ? `$${token.avgSell.toFixed(6)}` : "--"}</td>
                        <td className="px-3 py-2">{token.buyAmounts.toFixed(2)}</td>
                        <td className="px-3 py-2">{token.sellAmounts.toFixed(2)}</td>
                        <td className={`px-3 py-2 font-bold ${token.realizedPNL >= 0 ? "text-green-400" : "text-red-400"}`}>
                          {token.realizedPNL > 0 ? "+" : ""}${token.realizedPNL.toFixed(4)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/20 mt-20 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center text-blue-200">
          <p>Built for educational purposes. Trade responsibly in real markets.</p>
        </div>
      </footer>
    </div>
  );
};

export default PNLPage;
