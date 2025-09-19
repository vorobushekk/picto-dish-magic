import React from 'react';
import { Card } from '@/components/ui/card';
import { Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface GeneratedDish {
  name: string;
  description: string;
  price?: string;
  imageUrl?: string;
  isGeneratingImage?: boolean;
}

interface GeneratedDishesProps {
  dishes: GeneratedDish[];
  isLoading?: boolean;
  onGenerateImage?: (dishIndex: number) => void;
  placeholderText?: string;
}

export const GeneratedDishes: React.FC<GeneratedDishesProps> = ({ dishes, isLoading, onGenerateImage, placeholderText }) => {

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="gradient-card shadow-card">
            <div className="p-6 space-y-4">
              <div className="aspect-square bg-muted rounded-lg animate-pulse" />
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded animate-pulse" />
                <div className="h-3 bg-muted rounded w-2/3 animate-pulse" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (dishes.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="gradient-card rounded-xl p-8 shadow-card">
          <p className="text-muted-foreground text-lg">
            {placeholderText || 'Upload a menu and click "Add Pictures ✨" to see stunning dish visuals here!'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold gradient-primary bg-clip-text text-transparent">
          Extracted Menu Dishes
        </h2>
        <p className="text-muted-foreground mt-2">
          {dishes.length} {dishes.length === 1 ? 'dish' : 'dishes'} found on your menu
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dishes.map((dish, index) => (
          <Card 
            key={`${dish.name}-${index}`} 
            className={`gradient-card shadow-card hover:shadow-primary transition-all duration-300 hover:scale-105 group overflow-hidden ${
              dish.imageUrl ? 'animate-scale-in' : ''
            }`}
            style={{ 
              animationDelay: `${index * 0.1}s`,
              opacity: dish.imageUrl ? 1 : 0.7
            }}
          >
            <div className="p-6 space-y-4">
              {/* Image Section */}
              <div className="text-center">
                {dish.imageUrl ? (
                  <div className="relative animate-scale-in">
                    <img
                      src={dish.imageUrl}
                      alt={dish.name}
                      className="w-full aspect-square object-cover rounded-lg mb-4 shadow-lg"
                    />
                    <div className="absolute bottom-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full animate-fade-in">
                      ✨ Ready!
                    </div>
                  </div>
                ) : (
                  <div className="w-full aspect-square bg-muted rounded-lg mb-4 flex flex-col items-center justify-center relative">
                    {dish.isGeneratingImage ? (
                      <>
                        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mb-2" />
                        <span className="text-sm text-muted-foreground animate-pulse">Creating magic...</span>
                        <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
                          🎨 Generating
                        </div>
                      </>
                    ) : (
                      <>
                        <span className="text-4xl mb-2">🍽️</span>
                        {onGenerateImage && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onGenerateImage(index)}
                            className="mt-2 hover-scale"
                          >
                            <Camera className="h-4 w-4 mr-2" />
                            Generate Image
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                )}
                
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold text-xl text-primary">
                    {dish.name}
                  </h3>
                  {dish.price && (
                    <div className="text-lg font-bold text-accent">
                      {dish.price}
                    </div>
                  )}
                </div>
                <p className="text-muted-foreground text-sm">
                  {dish.description || "Delicious dish from your menu"}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};