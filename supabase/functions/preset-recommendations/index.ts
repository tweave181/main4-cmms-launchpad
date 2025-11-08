import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PresetData {
  id: string;
  name: string;
  category?: string;
  usageCount: number;
  lastUsed?: string;
  insights?: {
    trend: 'increasing' | 'decreasing' | 'stable';
    trendPercentage: number;
    mostActiveDay?: string;
    avgDailyUsage: number;
    recentActivity: 'active' | 'inactive' | 'moderate';
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { presets } = await req.json() as { presets: PresetData[] };
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Prepare preset summary for AI analysis
    const presetSummary = presets.map(p => ({
      name: p.name,
      category: p.category || 'Uncategorized',
      usageCount: p.usageCount || 0,
      daysSinceLastUsed: p.lastUsed 
        ? Math.floor((Date.now() - new Date(p.lastUsed).getTime()) / (1000 * 60 * 60 * 24))
        : 999,
      trend: p.insights?.trend || 'stable',
      trendPercentage: p.insights?.trendPercentage || 0,
      recentActivity: p.insights?.recentActivity || 'moderate',
      avgDailyUsage: p.insights?.avgDailyUsage || 0,
      mostActiveDay: p.insights?.mostActiveDay,
    }));

    const systemPrompt = `You are an AI assistant that analyzes inventory filter preset usage patterns and provides actionable recommendations. 

Your task is to analyze the provided preset data and suggest which presets users should:
1. KEEP - High value, actively used presets
2. ARCHIVE - Low usage presets that might be useful later
3. COMBINE - Similar presets that could be merged
4. DELETE - Unused or redundant presets

Consider:
- Usage frequency and trends
- Recent activity patterns
- Similar categories or patterns
- Time since last use

Return 3-5 specific, actionable recommendations with clear reasoning.`;

    const userPrompt = `Analyze these inventory filter presets and provide recommendations:

${JSON.stringify(presetSummary, null, 2)}

Provide recommendations for optimizing this preset library.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "provide_recommendations",
              description: "Return preset optimization recommendations",
              parameters: {
                type: "object",
                properties: {
                  recommendations: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        action: { 
                          type: "string", 
                          enum: ["keep", "archive", "combine", "delete"]
                        },
                        presetNames: {
                          type: "array",
                          items: { type: "string" }
                        },
                        reason: { type: "string" },
                        priority: {
                          type: "string",
                          enum: ["high", "medium", "low"]
                        }
                      },
                      required: ["action", "presetNames", "reason", "priority"],
                      additionalProperties: false
                    }
                  }
                },
                required: ["recommendations"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "provide_recommendations" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { 
            status: 429, 
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to your workspace." }),
          { 
            status: 402, 
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI service error" }),
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall) {
      throw new Error("No tool call in response");
    }

    const recommendations = JSON.parse(toolCall.function.arguments);

    return new Response(
      JSON.stringify(recommendations),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );

  } catch (error) {
    console.error("Error in preset-recommendations:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error" 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
