import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Prompt is required' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Calling OpenAI with prompt:', prompt.substring(0, 100) + '...');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'You are a menu analysis expert. Analyze restaurant menu images and extract dish information as JSON. Always respond with valid JSON in the exact format: {"success": true, "dishes": [{"name": "dish name", "description": "description or empty string"}]}'
          },
          { role: 'user', content: prompt }
        ],
        max_tokens: 2000,
        temperature: 0.3
      }),
    });

    if (!response.ok) {
      console.error('OpenAI API error:', response.status, await response.text());
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Failed to analyze menu' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    console.log('OpenAI response:', data);
    
    const generatedText = data.choices[0].message.content;
    
    // Try to parse the response as JSON
    try {
      const parsedResult = JSON.parse(generatedText);
      console.log('Parsed result:', parsedResult);
      return new Response(JSON.stringify(parsedResult), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (parseError) {
      console.error('Failed to parse OpenAI response as JSON:', parseError);
      // Return a fallback response
      return new Response(JSON.stringify({ 
        success: true, 
        dishes: [{ 
          name: "Menu Item", 
          description: generatedText 
        }] 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

  } catch (error) {
    console.error('Error in openai-chat function:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message || 'Internal server error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});