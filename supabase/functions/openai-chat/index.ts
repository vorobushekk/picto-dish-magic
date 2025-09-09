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
        content: 'You are a menu analysis expert. Always respond with valid JSON only. Return exactly this format: {"success": true, "dishes": [{"name": "dish name", "description": "description or empty string"}]}. IMPORTANT: Never use quotation marks or double quotes in dish names or descriptions. Use single quotes or remove quotes entirely. No additional text, no markdown, just the JSON object.'
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
        model: 'gpt-4o-mini', // Vision-capable model
        messages: messages,
        max_tokens: 1000,
        temperature: 0.3
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
    
    const generatedText = data.choices[0].message.content;
    console.log('Raw OpenAI response:', generatedText);
    
    // Clean the response by removing markdown code blocks if present
    let cleanedText = generatedText.trim();
    
    // Remove markdown code blocks (```json and ```)
    if (cleanedText.startsWith('```json')) {
      cleanedText = cleanedText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    
    // Fix common JSON parsing issues with escaped quotes in dish names
    // Replace problematic escaped quotes with single quotes
    cleanedText = cleanedText.replace(/\\"([^"]*?)\\"/g, "'$1'");
    
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
      
      // Return the raw response for debugging
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Failed to parse JSON response',
        raw_response: generatedText,
        cleaned_response: cleanedText,
        parse_error: parseError.message
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