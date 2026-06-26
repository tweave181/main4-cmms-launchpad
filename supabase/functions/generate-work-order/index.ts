import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { description } = await req.json();
    if (!description || typeof description !== 'string') {
      return new Response(JSON.stringify({ error: 'description is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const apiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'AI not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const resp = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Lovable-API-Key': apiKey,
        'X-Lovable-AIG-SDK': 'manual',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          {
            role: 'system',
            content:
              'You convert a maintenance task description into a structured work order. Return a concise professional title (max 80 chars), an expanded description, priority (low|medium|high|urgent), and work_type (corrective|preventive|emergency|inspection). Choose values that best match the task.',
          },
          { role: 'user', content: description },
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'create_work_order',
              description: 'Create a structured work order',
              parameters: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  description: { type: 'string' },
                  priority: { type: 'string', enum: ['low', 'medium', 'high', 'urgent'] },
                  work_type: {
                    type: 'string',
                    enum: ['corrective', 'preventive', 'emergency', 'inspection'],
                  },
                },
                required: ['title', 'description', 'priority', 'work_type'],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: 'function', function: { name: 'create_work_order' } },
      }),
    });

    if (!resp.ok) {
      const body = await resp.text();
      console.error('AI gateway error', resp.status, body);
      return new Response(
        JSON.stringify({
          error:
            resp.status === 429
              ? 'Rate limit reached. Please try again shortly.'
              : resp.status === 402
              ? 'AI credits exhausted. Please add credits to continue.'
              : 'AI generation failed',
        }),
        { status: resp.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await resp.json();
    const call = data?.choices?.[0]?.message?.tool_calls?.[0];
    const args = call?.function?.arguments ? JSON.parse(call.function.arguments) : null;
    if (!args) {
      return new Response(JSON.stringify({ error: 'No structured output' }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(args), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
