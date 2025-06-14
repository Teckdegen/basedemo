
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const AuthPage = () => {
  const { isConnected } = useAccount();
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isConnected && user && !loading) {
      navigate("/app");
    }
  }, [isConnected, user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <div className="text-white text-xl font-bold">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-black/40 backdrop-blur-md border-white/20 text-white">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Connect Wallet</CardTitle>
          <p className="text-gray-400">
            Connect your wallet to start trading on Base DEX!
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center space-y-8">
            <ConnectButton />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthPage;
