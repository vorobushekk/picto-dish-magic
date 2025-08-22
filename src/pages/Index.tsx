import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MenuUpload } from '@/components/MenuUpload';
import { GeneratedDishes } from '@/components/GeneratedDishes';
import { Sparkles, Wand2, ChefHat, Camera } from 'lucide-react';
import { toast } from 'sonner';
import heroImage from '@/assets/hero-food.jpg';
import truffleRisotto from '@/assets/truffle-risotto.jpg';
import searedSalmon from '@/assets/seared-salmon.jpg';
import beefWellington from '@/assets/beef-wellington.jpg';

interface GeneratedDish {
  id: string;
  name: string;
  imageUrl: string;
  description: string;
  price: string;
}

const Index = () => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [generatedDishes, setGeneratedDishes] = useState<GeneratedDish[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Mock dishes for demo - in real app this would come from AI processing
  const mockDishes: GeneratedDish[] = [
    {
      id: '1',
      name: 'Truffle Risotto',
      imageUrl: truffleRisotto,
      description: 'Creamy arborio rice with black truffle shavings and parmesan',
      price: '$28'
    },
    {
      id: '2',
      name: 'Seared Salmon',
      imageUrl: searedSalmon,
      description: 'Pan-seared Atlantic salmon with lemon herb butter',
      price: '$32'
    },
    {
      id: '3',
      name: 'Beef Wellington',
      imageUrl: beefWellington,
      description: 'Classic beef tenderloin wrapped in puff pastry',
      price: '$45'
    }
  ];

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

    // Simulate AI processing time
    setTimeout(() => {
      setGeneratedDishes(mockDishes);
      setIsGenerating(false);
      toast.success('🎉 Magic complete! Your dishes are ready!');
    }, 3000);
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
          <div className="flex gap-4 justify-center flex-wrap">
            <Button variant="secondary" size="xl" className="shadow-glow">
              <Camera className="h-5 w-5" />
              See Examples
            </Button>
            <Button variant="hero" size="xl" className="shadow-glow">
              <Wand2 className="h-5 w-5" />
              Start Creating
            </Button>
          </div>
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
                disabled={isGenerating}
                className="shadow-glow"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                    Generating Magic...
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
          <GeneratedDishes dishes={generatedDishes} isLoading={isGenerating} />
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