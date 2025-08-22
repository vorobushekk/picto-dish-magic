import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Replicate from "https://esm.sh/replicate@0.25.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const REPLICATE_API_TOKEN = Deno.env.get('REPLICATE_API_TOKEN');
    if (!REPLICATE_API_TOKEN) {
      throw new Error('REPLICATE_API_TOKEN is not set');
    }

    const replicate = new Replicate({
      auth: REPLICATE_API_TOKEN,
    });

    const body = await req.json();
    console.log('Request body:', body);

    // Check if it's a status check request
    if (body.predictionId) {
      console.log("Checking status for prediction:", body.predictionId);
      const prediction = await replicate.predictions.get(body.predictionId);
      console.log("Status check response:", prediction);
      return new Response(JSON.stringify(prediction), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate required fields for image generation
    if (!body.name || !body.description) {
      return new Response(
        JSON.stringify({ 
          error: "Missing required fields: name and description are required" 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    // Create an optimized prompt for food photography
    const foodPrompt = `Professional food photography of ${body.name}: ${body.description}. Beautifully plated on elegant dishware, soft professional lighting, appetizing presentation, high-end restaurant quality, macro photography, food styling, warm ambient lighting, shallow depth of field`;

    console.log("Generating image with prompt:", foodPrompt);

    const output = await replicate.run(
      "ideogram-ai/ideogram-v3-turbo",
      {
        input: {
          prompt: foodPrompt,
          aspect_ratio: "1:1",
          model: "V_3_TURBO",
          magic_prompt_option: "Auto"
        }
      }
    );

    console.log("Generation response:", output);
    
    return new Response(JSON.stringify({ 
      success: true,
      name: body.name,
      description: body.description,
      imageUrl: Array.isArray(output) ? output[0] : output,
      prompt: foodPrompt
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error("Error in generate-dish-images function:", error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});