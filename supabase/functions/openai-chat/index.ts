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
    const { prompt, imageData } = await req.json();

    if (!prompt) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Prompt is required' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Calling OpenAI with vision prompt for menu analysis');

    // Create messages array for vision API
    const messages = [
      { 
        role: 'system', 
        content: 'You are a menu analysis expert. Return ONLY strict, valid JSON matching exactly: {"success": true, "dishes": [{"name": "dish name", "description": "description or empty string"}]}. Rules: - Use double quotes for all JSON strings. - Escape any inner double quotes with a backslash. - No markdown, code fences, comments, or trailing commas. - Do not add extra fields or text.'
      }
    ];

    // If imageData is provided, use vision format
    if (imageData) {
      messages.push({
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          {
            type: 'image_url',
            image_url: {
              url: imageData
            }
          }
        ]
      });
    } else {
      // Fallback to text-only
      messages.push({ role: 'user', content: prompt });
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o', // Vision-capable model
        messages: messages,
        max_tokens: 1500, // Use max_tokens for gpt-4o
        response_format: { type: "json_object" } // Force JSON output
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Failed to analyze menu' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    console.log('OpenAI response received successfully');
    console.log('Token usage:', data.usage);
    
    const generatedText = data.choices[0].message.content;
    console.log('Raw OpenAI response:', generatedText);
    
    // Check for empty response
    if (!generatedText || generatedText.trim() === '') {
      console.error('Empty content from OpenAI. Full response:', JSON.stringify(data));
      return new Response(JSON.stringify({ 
        success: false,
        error: 'OpenAI returned empty response',
        provider_response: data
      }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Clean the response by removing markdown code blocks if present
    let cleanedText = generatedText.trim();
    
    // Remove markdown code blocks (```json and ```)
    if (cleanedText.startsWith('```json')) {
      cleanedText = cleanedText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    
    // Normalize smart quotes to straight quotes to help JSON parsing
    cleanedText = cleanedText.replace(/[“”]/g, '"').replace(/[‘’]/g, "'");
    
    console.log('Cleaned text for parsing:', cleanedText);
    
    // Try to parse the cleaned response as JSON
    try {
      const parsedResult = JSON.parse(cleanedText);
      console.log('Successfully parsed menu analysis:', parsedResult);
      return new Response(JSON.stringify(parsedResult), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (parseError) {
      console.error('Failed to parse OpenAI response as JSON:', parseError);
      console.error('Raw response was:', generatedText);
      console.error('Cleaned text was:', cleanedText);
      
      // Attempt to auto-repair common issues and parse again
      try {
        let repaired = cleanedText;

        // 1) Replace single-quoted strings with double-quoted strings
        repaired = repaired.replace(/'([^'\\]*(?:\\.[^'\\]*)*)'/g, (_m, grp) => `"${grp.replace(/"/g, '\\"')}"`);

        // 2) Quote unquoted values for name/description (until next comma/}}])
        const quoteValue = (key: string, text: string) =>
          text.replace(new RegExp(`("${key}"\\s*:\\s*)(?!["{\[])([^,}\\]]+)`, 'g'), (_m, p1, p2) => {
            const val = p2.trim();
            return `${p1}"${val.replace(/"/g, '\\"')}"`;
          });

        repaired = quoteValue('name', repaired);
        repaired = quoteValue('description', repaired);

        // 3) Remove trailing commas before closing braces/brackets
        repaired = repaired.replace(/,\s*(\}|\])/g, '$1');

        // 4) Fix duplicate closing braces (e.g., "]}}" -> "]}")
        repaired = repaired.replace(/\}\s*\}/g, '}');
        repaired = repaired.replace(/\]\s*\}\s*\}/g, ']}');
        console.log('Applied duplicate brace fix');

        console.log('Repaired text for parsing:', repaired);
        const parsedRepaired = JSON.parse(repaired);
        console.log('Successfully parsed after repair:', parsedRepaired);
        return new Response(JSON.stringify(parsedRepaired), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (repairError) {
        console.error('Repair attempt failed:', repairError);
      }
      
      // Return the raw response for debugging
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Failed to parse JSON response',
        raw_response: generatedText,
        cleaned_response: cleanedText,
        parse_error: (parseError as Error).message
      }), {
        status: 500,
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