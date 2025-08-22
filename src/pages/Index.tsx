import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MenuUpload } from '@/components/MenuUpload';
import { GeneratedDishes } from '@/components/GeneratedDishes';
import { Sparkles, Wand2, ChefHat, Camera } from 'lucide-react';
import { toast } from 'sonner';
import heroImage from '@/assets/hero-food.jpg';

interface GeneratedDish {
  name: string;
  description: string;
  imageUrl?: string;
  isGeneratingImage?: boolean;
}

const Index = () => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [generatedDishes, setGeneratedDishes] = useState<GeneratedDish[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingImages, setIsGeneratingImages] = useState(false);

  // Remove unused imports and mock data since we're using real AI analysis now

  const handleFileUpload = (file: File) => {
    setUploadedFile(file);
    setGeneratedDishes([]); // Clear previous results
  };

  const handleClearUpload = () => {
    setUploadedFile(null);
    setGeneratedDishes([]);
  };

  const handleGenerateMagic = async () => {
    if (!uploadedFile) {
      toast.error('Please upload a menu first');
      return;
    }

    setIsGenerating(true);
    toast.success('✨ AI is analyzing your menu...');

    try {
      // Resize image to reduce processing time
      const resizeImage = (file: File, maxWidth: number = 1024): Promise<string> => {
        return new Promise((resolve) => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const img = new Image();
          
          img.onload = () => {
            const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
            canvas.width = img.width * ratio;
            canvas.height = img.height * ratio;
            
            ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
            resolve(canvas.toDataURL('image/jpeg', 0.8));
          };
          
          img.src = URL.createObjectURL(file);
        });
      };

      const optimizedImage = await resizeImage(uploadedFile);
      
      const prompt = `Analyze this restaurant menu image and extract all dish information. For each dish, identify the name and description. Return the data as a JSON array with objects containing 'name' and 'description' fields. Focus only on actual food items, ignore prices, categories, and restaurant info. If a dish has no description, use an empty string.`;

      try {
        const response = await fetch('https://mbrrizfxlihigzyxqazu.supabase.co/functions/v1/openai-chat', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1icnJpemZ4bGloaWd6eXhxYXp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4MjI0ODMsImV4cCI6MjA3MTM5ODQ4M30.jRg5iCGq_47euABiuEobUBOetoAjkrTx2qyQWVnWIdo`,
            'Content-Type': 'application/json',
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1icnJpemZ4bGloaWd6eXhxYXp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4MjI0ODMsImV4cCI6MjA3MTM5ODQ4M30.jRg5iCGq_47euABiuEobUBOetoAjkrTx2qyQWVnWIdo'
          },
          body: JSON.stringify({ 
            prompt: prompt,
            imageData: optimizedImage 
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to analyze menu');
        }

        const data = await response.json();
        
        // Parse the dishes from the AI response
        if (data.success && data.dishes) {
          setGeneratedDishes(data.dishes);
          setIsGenerating(false); // stop skeletons so results can show
          toast.success(`🎉 Found ${data.dishes.length} dishes! Now generating images...`);
          // Kick off image generation without blocking UI
          void generateImagesForDishes(data.dishes);
        } else {
          throw new Error('Invalid response format');
        }
      } catch (error) {
        console.error('Error calling edge function:', error);
        toast.error('Failed to analyze menu. Please try again.');
      } finally {
        setIsGenerating(false);
      }
    } catch (error) {
      console.error('Error processing file:', error);
      toast.error('Failed to process the uploaded file');
      setIsGenerating(false);
    }
  };

  const generateImagesForDishes = async (dishes: GeneratedDish[]) => {
    setIsGeneratingImages(true);
    toast.success('🎨 Generating stunning food images...');

    try {
      // Start with dishes marked as generating, but show them immediately
      const updatedDishes = dishes.map(dish => ({
        ...dish,
        isGeneratingImage: true
      }));
      setGeneratedDishes([...updatedDishes]);

      // Generate images for all dishes in parallel
      const imagePromises = updatedDishes.map(async (dish, index) => {
        try {
          const response = await fetch('https://mbrrizfxlihigzyxqazu.supabase.co/functions/v1/generate-dish-images', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1icnJpemZ4bGloaWd6eXhxYXp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4MjI0ODMsImV4cCI6MjA3MTM5ODQ4M30.jRg5iCGq_47euABiuEobUBOetoAjkrTx2qyQWVnWIdo`,
              'Content-Type': 'application/json',
              'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1icnJpemZ4bGloaWd6eXhxYXp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4MjI0ODMsImV4cCI6MjA3MTM5ODQ4M30.jRg5iCGq_47euABiuEobUBOetoAjkrTx2qyQWVnWIdo'
            },
            body: JSON.stringify({ 
              name: dish.name,
              description: dish.description || 'Delicious dish'
            }),
          });

          if (response.ok) {
            const data = await response.json();
            if (data.success && data.imageUrl) {
              updatedDishes[index].imageUrl = data.imageUrl;
              updatedDishes[index].isGeneratingImage = false;
              
              // Update state immediately to show this completed dish
              setGeneratedDishes([...updatedDishes]);
              
              toast.success(`✨ ${dish.name} is ready!`);
              return { success: true, dish: dish.name };
            }
          }
          
          updatedDishes[index].isGeneratingImage = false;
          setGeneratedDishes([...updatedDishes]);
          toast.error(`Failed to generate image for ${dish.name}`);
          return { success: false, dish: dish.name };
          
        } catch (error) {
          console.error(`Error generating image for ${dish.name}:`, error);
          updatedDishes[index].isGeneratingImage = false;
          setGeneratedDishes([...updatedDishes]);
          toast.error(`Failed to generate image for ${dish.name}`);
          return { success: false, dish: dish.name };
        }
      });

      // Wait for all images to complete
      const results = await Promise.allSettled(imagePromises);
      const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
      
      if (successful === dishes.length) {
        toast.success('🎉 All dishes are ready to serve!');
      } else {
        toast.success(`✨ ${successful}/${dishes.length} images generated successfully!`);
      }
      
    } catch (error) {
      console.error('Error generating images:', error);
      toast.error('Failed to generate images');
    } finally {
      setIsGeneratingImages(false);
    }
  };

  const handleGenerateImages = async () => {
    if (generatedDishes.length === 0) {
      toast.error('No dishes to generate images for');
      return;
    }

    setIsGeneratingImages(true);
    toast.success('🎨 Generating stunning food images...');

    try {
      const updatedDishes = [...generatedDishes];
      
      // Mark all dishes as generating
      updatedDishes.forEach(dish => dish.isGeneratingImage = true);
      setGeneratedDishes([...updatedDishes]);

      // Generate images for each dish
      for (let i = 0; i < updatedDishes.length; i++) {
        const dish = updatedDishes[i];
        
        try {
          const response = await fetch('https://mbrrizfxlihigzyxqazu.supabase.co/functions/v1/generate-dish-images', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1icnJpemZ4bGloaWd6eXhxYXp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4MjI0ODMsImV4cCI6MjA3MTM5ODQ4M30.jRg5iCGq_47euABiuEobUBOetoAjkrTx2qyQWVnWIdo`,
              'Content-Type': 'application/json',
              'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1icnJpemZ4bGloaWd6eXhxYXp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4MjI0ODMsImV4cCI6MjA3MTM5ODQ4M30.jRg5iCGq_47euABiuEobUBOetoAjkrTx2qyQWVnWIdo'
            },
            body: JSON.stringify({ 
              name: dish.name,
              description: dish.description || 'Delicious dish'
            }),
          });

          if (response.ok) {
            const data = await response.json();
            if (data.success && data.imageUrl) {
              updatedDishes[i].imageUrl = data.imageUrl;
              toast.success(`✨ Generated image for ${dish.name}!`);
            } else {
              toast.error(`Failed to generate image for ${dish.name}`);
            }
          } else {
            toast.error(`Failed to generate image for ${dish.name}`);
          }
        } catch (error) {
          console.error(`Error generating image for ${dish.name}:`, error);
          toast.error(`Failed to generate image for ${dish.name}`);
        }
        
        updatedDishes[i].isGeneratingImage = false;
        setGeneratedDishes([...updatedDishes]);
      }

      toast.success('🎉 All images generated successfully!');
    } catch (error) {
      console.error('Error generating images:', error);
      toast.error('Failed to generate images');
    } finally {
      setIsGeneratingImages(false);
    }
  };

  const handleGenerateSingleImage = async (dishIndex: number) => {
    const dish = generatedDishes[dishIndex];
    if (!dish) return;

    const updatedDishes = [...generatedDishes];
    updatedDishes[dishIndex].isGeneratingImage = true;
    setGeneratedDishes(updatedDishes);

    try {
      const response = await fetch('https://mbrrizfxlihigzyxqazu.supabase.co/functions/v1/generate-dish-images', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1icnJpemZ4bGloaWd6eXhxYXp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4MjI0ODMsImV4cCI6MjA3MTM5ODQ4M30.jRg5iCGq_47euABiuEobUBOetoAjkrTx2qyQWVnWIdo`,
          'Content-Type': 'application/json',
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1icnJpemZ4bGloaWd6eXhxYXp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4MjI0ODMsImV4cCI6MjA3MTM5ODQ4M30.jRg5iCGq_47euABiuEobUBOetoAjkrTx2qyQWVnWIdo'
        },
        body: JSON.stringify({ 
          name: dish.name,
          description: dish.description || 'Delicious dish'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.imageUrl) {
          updatedDishes[dishIndex].imageUrl = data.imageUrl;
          toast.success(`✨ Generated image for ${dish.name}!`);
        } else {
          toast.error(`Failed to generate image for ${dish.name}`);
        }
      } else {
        toast.error(`Failed to generate image for ${dish.name}`);
      }
    } catch (error) {
      console.error(`Error generating image for ${dish.name}:`, error);
      toast.error(`Failed to generate image for ${dish.name}`);
    }

    updatedDishes[dishIndex].isGeneratingImage = false;
    setGeneratedDishes(updatedDishes);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-90" />
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="relative container mx-auto px-4 py-20 text-center">
          <div className="animate-float">
            <ChefHat className="h-16 w-16 text-white mx-auto mb-6" />
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Turn Menus into{' '}
            <span className="relative">
              Magic
              <Sparkles className="absolute -top-2 -right-2 h-8 w-8 text-yellow-300 animate-pulse" />
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
            Upload any menu and watch as AI transforms each dish into stunning, mouth-watering visuals. ✨🍴
          </p>
        </div>
      </section>

      {/* Upload Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-primary mb-4">
              Upload Your Menu
            </h2>
            <p className="text-muted-foreground text-lg">
              Drag and drop your menu image, and let our AI work its magic
            </p>
          </div>

          <MenuUpload
            onUpload={handleFileUpload}
            uploadedFile={uploadedFile}
            onClear={handleClearUpload}
          />

          {uploadedFile && (
            <div className="text-center">
              <Button
                variant="magic"
                size="xl"
                onClick={handleGenerateMagic}
                disabled={isGenerating || isGeneratingImages}
                className="shadow-glow"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                    Analyzing Menu...
                  </>
                ) : isGeneratingImages ? (
                  <>
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                    Generating Images...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-5 w-5" />
                    Generate Magic ✨
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Results Section */}
      <section className="container mx-auto px-4 pb-16">
        <div className="max-w-6xl mx-auto">
          <GeneratedDishes 
            dishes={generatedDishes} 
            isLoading={isGenerating}
            onGenerateImage={handleGenerateSingleImage}
          />
        </div>
      </section>

      {/* Features Section */}
      <section className="gradient-card py-16 mt-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary mb-4">
              Why Choose Menu Magic?
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Transform your restaurant's visual appeal with AI-powered food photography
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center p-6 rounded-xl bg-white/50 shadow-card">
              <div className="gradient-primary rounded-full p-3 w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-lg text-primary mb-2">AI-Powered</h3>
              <p className="text-muted-foreground">
                Advanced AI analyzes your menu and creates stunning visuals for every dish
              </p>
            </div>

            <div className="text-center p-6 rounded-xl bg-white/50 shadow-card">
              <div className="gradient-primary rounded-full p-3 w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                <Camera className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-lg text-primary mb-2">Professional Quality</h3>
              <p className="text-muted-foreground">
                Restaurant-quality food photography that makes every dish irresistible
              </p>
            </div>

            <div className="text-center p-6 rounded-xl bg-white/50 shadow-card">
              <div className="gradient-primary rounded-full p-3 w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                <Wand2 className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-lg text-primary mb-2">Instant Results</h3>
              <p className="text-muted-foreground">
                Get beautiful dish images in seconds, ready for your website or social media
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;