
import React from "react";
import { cn } from "@/lib/utils";

interface WalletCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export const WalletCard: React.FC<WalletCardProps> = ({ children, className = "", ...props }) => (
  <div
    className={cn(
      "bg-gradient-to-br from-slate-950/80 to-blue-900/80 border border-blue-600/10 rounded-2xl shadow-lg p-5 backdrop-blur-md transition-all duration-300",
      className
    )}
    {...props}
  >
    {children}
  </div>
);
