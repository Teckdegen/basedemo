
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, ArrowLeft } from "lucide-react";

const calculatePNL = (holdings, trades) => {
  // Map: token address -> {symbol, name, buyAmounts, buyTotals, sellAmounts, sellTotals}
  const tokenStats = {};

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

  // Get average prices
  const tokens = Object.entries(tokenStats).map(([address, t]) => {
    const avgBuy = t.buyAmounts > 0 ? t.buyTotals / t.buyAmounts : 0;
    const avgSell = t.sellAmounts > 0 ? t.sellTotals / t.sellAmounts : 0;
    const realizedPNL = t.sellTotals - ((t.sellAmounts / (t.buyAmounts || 1)) * t.buyTotals);
    // PNL is total earned from selling minus cost-basis of those sold tokens
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
  const { profile } = useAuth();
  const { holdings, trades } = useSupabaseData();

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <span className="text-xl text-white">Loading...</span>
      </div>
    );
  }

  const tokens = calculatePNL(holdings, trades);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <nav className="sticky top-0 z-50 bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/wallet")}
                className="flex items-center text-white hover:bg-white/10"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                <span>Back to Wallet</span>
              </Button>
              <span className="ml-4 text-xl font-bold text-white">Profit &amp; Loss (PNL)</span>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/app")}
                className="flex items-center text-white hover:bg-white/10"
              >
                <TrendingUp className="w-4 h-4 mr-1" />
                <span>Trade</span>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto p-4 sm:p-8">
        <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 text-white">
          <CardHeader>
            <CardTitle className="text-lg sm:text-2xl">Token-wise Profit &amp; Loss</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-700">
                <thead>
                  <tr>
                    <th className="px-3 py-2 text-left text-sm text-slate-400">Token</th>
                    <th className="px-3 py-2 text-left text-sm text-slate-400">Avg Entry (BASE)</th>
                    <th className="px-3 py-2 text-left text-sm text-slate-400">Avg Exit (BASE)</th>
                    <th className="px-3 py-2 text-left text-sm text-slate-400">Total Bought</th>
                    <th className="px-3 py-2 text-left text-sm text-slate-400">Total Sold</th>
                    <th className="px-3 py-2 text-left text-sm text-slate-400">Profit/Loss (BASE)</th>
                  </tr>
                </thead>
                <tbody>
                  {tokens.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-4 text-slate-400">No trades yet.</td>
                    </tr>
                  ) : (
                    tokens.map(token => (
                      <tr key={token.address} className="odd:bg-slate-800/50 even:bg-slate-900/40">
                        <td className="px-3 py-2 font-semibold">{token.symbol}</td>
                        <td className="px-3 py-2">{token.avgBuy > 0 ? token.avgBuy.toFixed(6) : "--"}</td>
                        <td className="px-3 py-2">{token.avgSell > 0 ? token.avgSell.toFixed(6) : "--"}</td>
                        <td className="px-3 py-2">{token.buyAmounts}</td>
                        <td className="px-3 py-2">{token.sellAmounts}</td>
                        <td className={`px-3 py-2 font-bold ${token.realizedPNL >= 0 ? "text-green-400" : "text-red-400"}`}>
                          {token.realizedPNL > 0 ? "+" : ""}{token.realizedPNL.toFixed(4)}
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
    </div>
  );
};

export default PNLPage;
