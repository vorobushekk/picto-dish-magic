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
    if (!body.name) {
      return new Response(
        JSON.stringify({ 
          error: "Missing required field: name is required" 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    // Create an optimized prompt for food photography with language detection
    // If the dish name contains Cyrillic characters, add English translation context
    const containsCyrillic = /[\u0400-\u04FF]/.test(body.name + " " + body.description);
    
    let foodPrompt = `Professional food photography of ${body.name}`;
    if (body.description) {
      foodPrompt += `: ${body.description}`;
    }
    
    // For Russian/Cyrillic dishes, add English context for better image generation
    if (containsCyrillic) {
      foodPrompt += ` (Russian cuisine dish)`;
    }
    
    foodPrompt += `. Beautifully plated on elegant dishware, soft professional lighting, appetizing presentation, high-end restaurant quality, macro photography, food styling, warm ambient lighting, shallow depth of field`;

    console.log("Generating image with prompt:", foodPrompt);

    const output = await replicate.run(
      "black-forest-labs/flux-schnell",
      {
        input: {
          prompt: foodPrompt,
          go_fast: true,
          megapixels: "1",
          num_outputs: 1,
          aspect_ratio: "1:1",
          output_format: "webp",
          output_quality: 80,
          num_inference_steps: 4
        }
      }
    );

    console.log("Generation response:", output);
    
    return new Response(JSON.stringify({ 
      success: true,
      name: body.name,
      description: body.description,
      price: body.price,
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