import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { MenuUpload } from '@/components/MenuUpload';
import { GeneratedDishes } from '@/components/GeneratedDishes';
import { Sparkles, Wand2, ChefHat, Camera, Globe } from 'lucide-react';
import { toast } from 'sonner';
import heroImage from '@/assets/hero-food.jpg';

interface GeneratedDish {
  name: string;
  description: string;
  price?: string;
  imageUrl?: string;
  isGeneratingImage?: boolean;
}

// Language detection and localization
const detectLanguage = (dishes: GeneratedDish[]): 'ru' | 'en' => {
  const text = dishes.map(dish => `${dish.name} ${dish.description}`).join(' ');
  return /[\u0400-\u04FF]/.test(text) ? 'ru' : 'en';
};

const translations = {
  en: {
    heroTitle: 'Menu Magic',
    heroSubtitle: 'Upload any menu without pictures and get it back with stunning visuals of every dish. Decide what to eat easier! ✨🍴',
    uploadTitle: 'Upload Your Picture-Less Menu',
    uploadSubtitle: 'Transform any text-only menu into a visual feast that helps you choose',
    generateButton: 'Add Pictures ✨',
    analyzing: 'Analyzing Menu...',
    generatingImages: 'Generating Images...',
    whyChooseTitle: 'Why Our Service?',
    whyChooseSubtitle: 'Help you decide what to order by turning text-only menus into visual experiences',
    uploadFirst: 'Please upload a menu first',
    analyzing_toast: '✨ AI is analyzing your menu...',
    dish_ready: (name: string) => `✨ ${name} is ready!`,
    all_ready: '🎉 All dishes are ready to serve!',
    some_ready: (successful: number, total: number) => `✨ ${successful}/${total} images generated successfully!`,
    failed_generate: (name: string) => `Failed to generate image for ${name}`,
    ai_powered: 'AI-Powered',
    professional_quality: 'Professional Quality',
    instant_results: 'Instant Results',
    footerPhrase: '🍽️ Order with confidence - no more menu regrets! ✨',
    uploadPlaceholder: 'Upload a menu and click "Add Pictures ✨" to see stunning dish visuals here!'
  },
  ru: {
    heroTitle: 'Магия меню',
    heroSubtitle: 'Загрузите любое меню без картинок и получите его с потрясающими изображениями каждого блюда. Выбирать стало проще! ✨🍴',
    uploadTitle: 'Загрузите ваше меню без картинок',
    uploadSubtitle: 'Превратите любое текстовое меню в визуальный пир, который поможет вам выбрать',
    generateButton: 'Создать картинки ✨',
    analyzing: 'Анализируем меню...',
    generatingImages: 'Создаём изображения...',
    whyChooseTitle: 'Почему наш сервис?',
    whyChooseSubtitle: 'Помогаем принять решение о заказе, превращая текстовые меню в визуальные',
    uploadFirst: 'Пожалуйста, сначала загрузите меню',
    analyzing_toast: '✨ ИИ анализирует ваше меню...',
    dish_ready: (name: string) => `✨ ${name} готово!`,
    all_ready: '🎉 Все блюда готовы к подаче!',
    some_ready: (successful: number, total: number) => `✨ ${successful}/${total} изображений создано успешно!`,
    failed_generate: (name: string) => `Не удалось создать изображение для ${name}`,
    ai_powered: 'На основе ИИ',
    professional_quality: 'Профессиональное качество',
    instant_results: 'Мгновенные результаты',
    footerPhrase: '🍽️ Заказывайте уверенно - никаких сожалений о выборе! ✨',
    uploadPlaceholder: 'Загрузите меню и нажмите "Создать картинки ✨", чтобы увидеть потрясающие изображения блюд!'
  }
};

const Index = () => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [generatedDishes, setGeneratedDishes] = useState<GeneratedDish[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingImages, setIsGeneratingImages] = useState(false);
  const [manualLanguage, setManualLanguage] = useState<'ru' | 'en' | null>(null);

  // Use manual language selection or auto-detect based on generated dishes
  const language = useMemo(() => {
    return manualLanguage || detectLanguage(generatedDishes);
  }, [manualLanguage, generatedDishes]);
  
  const t = translations[language];

  const toggleLanguage = () => {
    setManualLanguage(language === 'en' ? 'ru' : 'en');
  };

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
      toast.error(t.uploadFirst);
      return;
    }

    setIsGenerating(true);
    toast.success(t.analyzing_toast);

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
      
      const prompt = `Analyze this restaurant menu image and extract all dish information systematically.

EXTRACT FOR EACH DISH:
1. NAME: Exact dish name as written (preserve original text)
2. DESCRIPTION: Brief description or ingredients listed
3. PRICE: Price with currency symbol if clearly visible, otherwise empty string

FORMATTING REQUIREMENTS:
- Use ONLY straight quotes (") in JSON - never smart quotes
- Keep descriptions concise and clear
- Extract prices as strings with currency symbols when visible
- Use empty strings for missing information

FOCUS ON:
- Actual food/drink items only
- Clear, readable dish names
- Ingredient lists or brief descriptions
- Visible pricing information

IGNORE:
- Restaurant name/branding
- Category headers
- Contact information
- Promotional text
- Hours/policies

Return JSON matching this exact structure:
{"success": true, "dishes": [{"name": "dish name", "description": "description", "price": "price or empty"}]}`;

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
              description: dish.description || 'Delicious dish',
              price: dish.price
            }),
          });

          if (response.ok) {
            const data = await response.json();
            if (data.success && data.imageUrl) {
              updatedDishes[index].imageUrl = data.imageUrl;
              updatedDishes[index].isGeneratingImage = false;
              
              // Update state immediately to show this completed dish
              setGeneratedDishes([...updatedDishes]);
              
              toast.success(t.dish_ready(dish.name));
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
          toast.error(t.failed_generate(dish.name));
          return { success: false, dish: dish.name };
        }
      });

      // Wait for all images to complete
      const results = await Promise.allSettled(imagePromises);
      const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
      
      if (successful === dishes.length) {
        toast.success(t.all_ready);
      } else {
        toast.success(t.some_ready(successful, dishes.length));
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
              description: dish.description || 'Delicious dish',
              price: dish.price
            }),
          });

          if (response.ok) {
            const data = await response.json();
            if (data.success && data.imageUrl) {
              updatedDishes[i].imageUrl = data.imageUrl;
              toast.success(`✨ Generated image for ${dish.name}!`);
            } else {
          toast.error(t.failed_generate(dish.name));
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
          description: dish.description || 'Delicious dish',
          price: dish.price
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
      {/* Language Toggle - Sticky Header */}
      <div className="sticky top-0 z-50 w-full">
        <div className="flex justify-end p-4">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleLanguage}
            className="bg-white/95 backdrop-blur-md hover:bg-white border-white/30 shadow-lg transition-all duration-300 hover:scale-105"
          >
            <Globe className="h-4 w-4 mr-2" />
            {language.toUpperCase()}
          </Button>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden -mt-20 pt-20">
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
            {language === 'ru' ? (
              <>
                Магия{' '}
                <span className="relative">
                  меню
                  <Sparkles className="absolute -top-2 -right-2 h-8 w-8 text-yellow-300 animate-pulse" />
                </span>
              </>
            ) : (
              <>
                Menu{' '}
                <span className="relative">
                  Magic
                  <Sparkles className="absolute -top-2 -right-2 h-8 w-8 text-yellow-300 animate-pulse" />
                </span>
              </>
            )}
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
            {t.heroSubtitle}
          </p>
        </div>
      </section>

      {/* Upload Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-primary mb-4">
              {t.uploadTitle}
            </h2>
            <p className="text-muted-foreground text-lg">
              {t.uploadSubtitle}
            </p>
          </div>

          <MenuUpload
            onUpload={handleFileUpload}
            uploadedFile={uploadedFile}
            onClear={handleClearUpload}
            language={language}
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
                    {t.analyzing}
                  </>
                ) : isGeneratingImages ? (
                  <>
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                    {t.generatingImages}
                  </>
                ) : (
                  <>
                    <Wand2 className="h-5 w-5" />
                    {t.generateButton}
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
            placeholderText={t.uploadPlaceholder}
          />
        </div>
      </section>

      {/* Contact Footer */}
      <footer className="gradient-card py-16 mt-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-lg md:text-xl text-muted-foreground mb-8">
              {t.footerPhrase}
            </p>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground uppercase tracking-wider font-medium">
                {language === 'ru' ? 'Проект и Автор' : 'Project & Author'}
              </p>
              <div className="flex justify-center items-center space-x-8">
                <a 
                  href="https://github.com/vorobushekk?tab=repositories" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors duration-300"
                >
                  <svg className="h-6 w-6 group-hover:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0C5.374 0 0 5.373 0 12 0 17.302 3.438 21.8 8.207 23.387c.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                    </svg>
                    <span className="font-medium">GitHub</span>
                </a>
                <a 
                  href="https://www.linkedin.com/in/vorobeva2go/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors duration-300"
                >
                  <svg className="h-6 w-6 group-hover:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                  <span className="font-medium">LinkedIn</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;