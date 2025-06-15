
import { useCallback, useEffect, useState } from "react";

const INITIAL_BASE_BALANCE = 1500;
const USDC_TOKEN = {
  address: "base-usdc",
  name: "Base USDC",
  symbol: "USDC",
};

type Holding = {
  token_address: string;
  token_name: string;
  token_symbol: string;
  amount: number;
  average_buy_price: number;
  total_invested: number;
};

type Trade = {
  id: string;
  token_address: string;
  token_symbol: string;
  token_name: string;
  trade_type: "buy" | "sell";
  amount: number;
  price_per_token: number;
  total_base: number;
  base_price_usd: number;
  created_at: string;
};

function getLocal<T>(key: string, fallback: T): T {
  const data = localStorage.getItem(key);
  if (!data) return fallback;
  try {
    return JSON.parse(data) as T;
  } catch {
    return fallback;
  }
}

function setLocal<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function useLocalWallet() {
  const [baseBalance, setBaseBalance] = useState(() =>
    getLocal<number>("base_balance", INITIAL_BASE_BALANCE)
  );
  const [holdings, setHoldings] = useState<Holding[]>(() =>
    getLocal<Holding[]>("holdings", [
      {
        token_address: USDC_TOKEN.address,
        token_name: USDC_TOKEN.name,
        token_symbol: USDC_TOKEN.symbol,
        amount: INITIAL_BASE_BALANCE,
        average_buy_price: 1,
        total_invested: INITIAL_BASE_BALANCE,
      },
    ])
  );
  const [trades, setTrades] = useState<Trade[]>(() => getLocal<Trade[]>("trades", []));

  // Persist in localStorage
  useEffect(() => {
    setLocal("base_balance", baseBalance);
  }, [baseBalance]);
  useEffect(() => {
    setLocal("holdings", holdings);
  }, [holdings]);
  useEffect(() => {
    setLocal("trades", trades);
  }, [trades]);

  // Reset wallet (for testing/demo)
  const reset = useCallback(() => {
    setBaseBalance(INITIAL_BASE_BALANCE);
    setHoldings([
      {
        token_address: USDC_TOKEN.address,
        token_name: USDC_TOKEN.name,
        token_symbol: USDC_TOKEN.symbol,
        amount: INITIAL_BASE_BALANCE,
        average_buy_price: 1,
        total_invested: INITIAL_BASE_BALANCE,
      },
    ]);
    setTrades([]);
    setLocal("base_balance", INITIAL_BASE_BALANCE);
    setLocal("holdings", [
      {
        token_address: USDC_TOKEN.address,
        token_name: USDC_TOKEN.name,
        token_symbol: USDC_TOKEN.symbol,
        amount: INITIAL_BASE_BALANCE,
        average_buy_price: 1,
        total_invested: INITIAL_BASE_BALANCE,
      },
    ]);
    setLocal("trades", []);
  }, []);

  // Execute trade (buy/sell)
  const executeTrade = useCallback(
    (
      token_address: string,
      token_symbol: string,
      token_name: string,
      tradeType: "buy" | "sell",
      amount: number,
      pricePerToken: number,
      totalBase: number,
      basePriceUsd: number
    ) => {
      let newBalance = baseBalance;
      let newHoldings = [...holdings];
      const now = new Date().toISOString();

      let holding = newHoldings.find((h) => h.token_address === token_address);
      if (!holding) {
        holding = {
          token_address,
          token_name,
          token_symbol,
          amount: 0,
          average_buy_price: 0,
          total_invested: 0,
        };
        newHoldings.push(holding);
      }
      if (tradeType === "buy") {
        // decrease base, increase tokens
        if (totalBase > baseBalance) {
          return { error: "Insufficient base" };
        }
        const prevAmount = holding.amount;
        const prevInvested = holding.total_invested;
        holding.amount += amount;
        holding.total_invested += totalBase;
        holding.average_buy_price =
          holding.amount > 0 ? holding.total_invested / holding.amount : 0;
        newBalance -= totalBase;
      } else {
        // sell tokens, increase base
        if (amount > holding.amount) {
          return { error: "Insufficient tokens" };
        }
        const proportionSold = amount / holding.amount;
        const investedInSold = holding.total_invested * proportionSold;
        holding.amount -= amount;
        holding.total_invested -= investedInSold;
        // Remove holding if amount near zero
        if (holding.amount <= 0.000001) {
          newHoldings = newHoldings.filter((h) => h.token_address !== token_address);
        } else {
          holding.average_buy_price =
            holding.amount > 0 ? holding.total_invested / holding.amount : 0;
        }
        newBalance += totalBase;
      }

      setBaseBalance(newBalance);
      setHoldings(newHoldings);

      setTrades([
        {
          id: `${Date.now()}-${Math.random()}`,
          token_address,
          token_symbol,
          token_name,
          trade_type: tradeType,
          amount,
          price_per_token: pricePerToken,
          total_base: totalBase,
          base_price_usd: basePriceUsd,
          created_at: now,
        },
        ...trades,
      ]);

      return { error: null };
    },
    [baseBalance, holdings, trades]
  );

  return {
    baseBalance,
    holdings,
    trades,
    executeTrade,
    reset,
  };
}
