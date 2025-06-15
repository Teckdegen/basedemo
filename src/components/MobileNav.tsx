
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X, Wallet, TrendingUp, Home, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

const MobileNav = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const menuItems = [
    { label: 'Trading', icon: Home, path: '/app' },
    { label: 'Wallet', icon: Wallet, path: '/wallet' },
    { label: 'P&L', icon: TrendingUp, path: '/pnl' },
    { label: 'Bounties', icon: Trophy, path: '/bounties' },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="bg-slate-900 border-slate-700 w-64">
        <SheetHeader>
          <SheetTitle className="text-white text-left">Navigation</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col space-y-2 mt-6">
          {menuItems.map((item) => (
            <Button
              key={item.path}
              variant="ghost"
              onClick={() => handleNavigation(item.path)}
              className="justify-start text-white hover:bg-white/10 py-3"
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.label}
            </Button>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileNav;
