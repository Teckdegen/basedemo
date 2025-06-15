
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, User, Send, Loader2, RefreshCcw, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { DrawerClose } from "@/components/ui/drawer";

interface TokenData {
  address: string;
  name: string;
  symbol: string;
  price: number;
  priceChange24h: number;
  pairAddress?: string;
}

interface Message {
  role: 'user' | 'model';
  content: string;
}

interface WalletInfo {
  balance: number;
  portfolio: Record<string, number>;
  tokenDetails: Record<string, TokenData>;
}

interface AiChatProps {
  selectedToken?: TokenData | null;
  inDialog?: boolean;
  walletInfo?: WalletInfo | null;
}

export const AiChat = ({ selectedToken, inDialog, walletInfo }: AiChatProps) => {
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const savedMessages = localStorage.getItem('ai-chat-history');
      if (savedMessages) {
        return JSON.parse(savedMessages);
      }
    } catch (error) {
      console.error('Failed to parse chat history from localStorage', error);
    }
    return [
      { role: 'model', content: "Hello! I'm Base Demo AI, your intelligent trading assistant. I can see your current wallet balance and help analyze tokens. How can I assist you today?" }
    ];
  });
  
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('ai-chat-history', JSON.stringify(messages));
    } catch (error) {
      console.error('Failed to save chat history to localStorage', error);
    }
  }, [messages]);

  const scrollToBottom = () => {
    setTimeout(() => {
        const scrollableViewport = document.querySelector('[data-radix-scroll-area-viewport]');
        if (scrollableViewport) {
            scrollableViewport.scrollTop = scrollableViewport.scrollHeight;
        }
    }, 100);
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Check if a string looks like a 0x... contract address
  const extractCA = (text: string) => {
    const match = text.match(/\b0x[a-fA-F0-9]{40,}\b/);
    return match ? match[0] : null;
  };

  // Enhanced system message with wallet context and AI identity
  const getWalletSystemPrompt = () => {
    let systemPrompt = "SYSTEM: You are 'Base Demo AI', an intelligent trading assistant specialized in cryptocurrency analysis. ";
    
    if (walletInfo) {
      const { balance, portfolio, tokenDetails } = walletInfo;
      let holdings = Object.entries(portfolio)
        .filter(([token, amount]) => amount > 0)
        .map(([token, amount]) => {
          const sym = tokenDetails[token]?.symbol || "";
          return `${amount} ${sym}`.trim();
        });
      
      systemPrompt += `You are integrated with a demo trading wallet. The user's current wallet status: Balance: ${balance.toFixed(4)} USDC, Token holdings: ${holdings.join(", ") || "none"}. `;
    }
    
    systemPrompt += "If asked about your name or identity, respond that you are 'Base Demo AI'. " +
      "You can analyze contract addresses, provide trading insights, and answer questions about the user's portfolio. " +
      "Always be helpful, concise, and focus on actionable trading advice. " +
      "If the user sends an EVM contract address (0x...), analyze that token and provide helpful insights.";
    
    return systemPrompt;
  };

  const sendMessage = async (messageContent: string) => {
    if (!messageContent.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: messageContent };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    scrollToBottom();

    // Enhanced prompt with system context and contract address detection
    let systemPrompt = getWalletSystemPrompt();
    let ca = extractCA(messageContent);
    let prompt = systemPrompt + "\n" +
      (ca ? `USER SENT CONTRACT ADDRESS: ${ca}\n` : "") +
      `USER MESSAGE: ${messageContent}`;

    try {
      const { data, error } = await supabase.functions.invoke('gemini-chat', {
        body: { prompt },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      const aiMessage: Message = { role: 'model', content: data.response };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error: any) {
      console.error('Error calling edge function:', error);
      const errorMessage: Message = { role: 'model', content: `Sorry, something went wrong: ${error.message}` };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      sendMessage(input);
      setInput('');
    }
  };

  const handlePromptClick = (prompt: string) => {
    sendMessage(prompt);
  };

  const handleClearHistory = () => {
    setMessages([{ role: 'model', content: "Hello! I'm Base Demo AI, your intelligent trading assistant. I can see your current wallet balance and help analyze tokens. How can I assist you today?" }]);
  };

  return (
    <div className="flex flex-col h-[70vh] bg-slate-900/80 backdrop-blur-sm rounded-t-lg">
      <div className="p-4 border-b border-slate-700 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-white flex items-center">
            <Bot className="w-5 h-5 mr-2 text-cyan-400" />
            Base Demo AI
          </h2>
          <p className="text-sm text-slate-400">Your intelligent trading assistant</p>
          {walletInfo && (
            <p className="text-xs text-green-400 mt-1">
              💰 Balance: {walletInfo.balance.toFixed(2)} USDC • 📊 Holdings: {Object.entries(walletInfo.portfolio).filter(([_,v])=>v>0).length} tokens
            </p>
          )}
        </div>
        <div className="flex items-center space-x-2">
            {messages.length > 1 && (
                <Button variant="ghost" size="sm" onClick={handleClearHistory} className="text-slate-400 hover:text-white hover:bg-slate-700">
                    <RefreshCcw className="w-4 h-4 mr-2" />
                    Clear
                </Button>
            )}
            {inDialog && (
              <DrawerClose asChild>
                <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white hover:bg-slate-700 h-9 w-9">
                  <X className="w-4 h-4" />
                </Button>
              </DrawerClose>
            )}
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {messages.map((msg, index) => (
            <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
              {msg.role === 'model' && <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center"><Bot className="w-5 h-5 text-cyan-400" /></div>}
              <div className={`max-w-xs md:max-w-md p-3 rounded-lg ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300'}`}>
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              </div>
              {msg.role === 'user' && <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center"><User className="w-5 h-5 text-slate-300" /></div>}
            </div>
          ))}
          {isLoading && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center"><Bot className="w-5 h-5 text-cyan-400" /></div>
              <div className="max-w-xs md:max-w-md p-3 rounded-lg bg-slate-800 text-slate-300">
                <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
              </div>
            </div>
          )}
        </div>
         {messages.length <= 1 && (
            <div className="p-4 pt-0">
                <p className="text-sm text-slate-400 mb-3">Try asking me:</p>
                <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" className="bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-300" onClick={() => handlePromptClick("What's my current balance?")}>My balance?</Button>
                    <Button variant="outline" size="sm" className="bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-300" onClick={() => handlePromptClick("What are some trending tokens?")}>Trending tokens?</Button>
                    {selectedToken && (
                        <>
                            <Button variant="outline" size="sm" className="bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-300" onClick={() => handlePromptClick(`Analyze ${selectedToken.symbol}`)}>Analyze {selectedToken.symbol}</Button>
                        </>
                    )}
                    <Button variant="outline" size="sm" className="bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-300" onClick={() => handlePromptClick("Analyze my portfolio")}>Analyze portfolio</Button>
                </div>
            </div>
        )}
      </ScrollArea>
      <div className="p-4 border-t border-slate-700">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your balance, send a contract address, or get trading insights..."
            className="bg-slate-800 border-slate-700 text-white placeholder-slate-500"
            disabled={isLoading}
          />
          <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </form>
      </div>
    </div>
  );
};
