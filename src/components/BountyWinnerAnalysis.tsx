
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, TrendingUp, DollarSign, Clock, Users } from 'lucide-react';
import { useBountyWinnerDetection } from '@/hooks/useBountyWinnerDetection';
import { toast } from '@/hooks/use-toast';

interface BountyWinnerAnalysisProps {
  bountyId: string;
  isAdmin?: boolean;
}

export function BountyWinnerAnalysis({ bountyId, isAdmin = false }: BountyWinnerAnalysisProps) {
  const { 
    bounty, 
    entries, 
    userPerformances, 
    winner, 
    loading, 
    declareWinner,
    refreshData 
  } = useBountyWinnerDetection(bountyId);

  const handleDeclareWinner = async () => {
    const result = await declareWinner();
    if (result?.success) {
      toast({ title: "Winner declared!", description: `${winner?.wallet_address} has been declared the winner.` });
      refreshData();
    } else {
      toast({ title: "Error", description: result?.error || "Failed to declare winner." });
    }
  };

  if (loading) {
    return (
      <Card className="bg-slate-800/80 border-cyan-400/20">
        <CardContent className="p-6">
          <div className="text-white">Loading bounty analysis...</div>
        </CardContent>
      </Card>
    );
  }

  if (!bounty) {
    return (
      <Card className="bg-slate-800/80 border-cyan-400/20">
        <CardContent className="p-6">
          <div className="text-white">Bounty not found.</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Bounty Overview */}
      <Card className="bg-slate-800/80 border-cyan-400/20">
        <CardHeader>
          <CardTitle className="text-cyan-300 flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Bounty Performance Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-slate-700/50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-blue-400">Total Entries</span>
              </div>
              <div className="text-2xl font-bold text-white">{entries.length}</div>
            </div>
            <div className="bg-slate-700/50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-green-400" />
                <span className="text-sm text-green-400">Entry Price</span>
              </div>
              <div className="text-2xl font-bold text-white">{bounty.entry_price} BASE</div>
            </div>
            <div className="bg-slate-700/50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-yellow-400" />
                <span className="text-sm text-yellow-400">Status</span>
              </div>
              <div className="text-lg font-semibold text-white">
                {bounty.winner_wallet ? 'Completed' : 'Active'}
              </div>
            </div>
          </div>

          {bounty.winner_wallet && (
            <div className="bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 p-4 rounded-lg border border-yellow-500/30 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                <span className="text-yellow-400 font-semibold">Winner Declared</span>
              </div>
              <div className="text-white font-mono text-sm">{bounty.winner_wallet}</div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Leaderboard */}
      <Card className="bg-slate-800/80 border-cyan-400/20">
        <CardHeader>
          <CardTitle className="text-cyan-300 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Performance Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          {userPerformances.length === 0 ? (
            <div className="text-slate-400 text-center py-8">
              No performance data available yet.
            </div>
          ) : (
            <div className="space-y-3">
              {userPerformances.map((performance, index) => (
                <div
                  key={performance.wallet_address}
                  className={`p-4 rounded-lg border ${
                    index === 0 
                      ? 'bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border-yellow-500/30' 
                      : 'bg-slate-700/30 border-slate-600/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        index === 0 ? 'bg-yellow-500 text-black' : 'bg-slate-600 text-white'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-mono text-sm text-white">
                          {performance.wallet_address.substring(0, 8)}...{performance.wallet_address.substring(-6)}
                        </div>
                        <div className="text-xs text-slate-400">
                          {performance.trades_count} trades
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-bold ${
                        performance.profit_loss >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {performance.profit_loss >= 0 ? '+' : ''}${performance.profit_loss.toFixed(2)}
                      </div>
                      <div className={`text-sm ${
                        performance.percentage_gain >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {performance.percentage_gain >= 0 ? '+' : ''}{performance.percentage_gain.toFixed(2)}%
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {isAdmin && !bounty.winner_wallet && winner && (
            <div className="mt-6 pt-4 border-t border-slate-600">
              <div className="bg-green-500/10 p-4 rounded-lg border border-green-500/30 mb-4">
                <div className="text-green-400 font-semibold mb-2">Recommended Winner:</div>
                <div className="text-white font-mono text-sm">{winner.wallet_address}</div>
                <div className="text-green-400 text-sm">
                  Profit: +${winner.profit_loss.toFixed(2)} ({winner.percentage_gain.toFixed(2)}%)
                </div>
              </div>
              <Button 
                onClick={handleDeclareWinner}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                <Trophy className="w-4 h-4 mr-2" />
                Declare Winner
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
