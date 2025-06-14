
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Note: OPENAI_API_KEY needs to be set in Supabase project's Edge Function secrets.
const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!openAIApiKey) {
      throw new Error("Missing OPENAI_API_KEY. Please set it in your Supabase project's secrets.");
    }
      
    const { pnlData } = await req.json();

    if (!pnlData || pnlData.length === 0) {
      return new Response(JSON.stringify({ summary: "No trading data available to analyze." }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const prompt = `
You are a crypto trading analyst for a bot called 'BaseDefi'. Based on the following Profit & Loss (PNL) data for a user's trades, provide a concise summary of their performance.

The data is an array of JSON objects, where each object represents a token they have traded. 'realizedPNL' is the profit or loss in the BASE currency.

Your summary should:
1.  Start with a brief, encouraging opening.
2.  State the total realized PNL by summing up the 'realizedPNL' from all tokens.
3.  Identify the most profitable token and the least profitable token (or biggest loss).
4.  Provide one or two actionable insights or observations based on the data (e.g., "You're seeing great results with X, consider doubling down," or "Your strategy with Y seems to be a weak point.").
5.  Keep the entire summary to 4-5 sentences. Be friendly and professional.

Here is the PNL data:
${JSON.stringify(pnlData, null, 2)}
`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a friendly and insightful crypto trading analyst.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 250,
      }),
    });
    
    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText} - ${errorBody}`);
    }

    const data = await response.json();
    const summary = data.choices[0].message.content;

    return new Response(JSON.stringify({ summary }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in pnl-summary function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
