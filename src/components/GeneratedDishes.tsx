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
          <Card key={i} className="border border-border/50 bg-card">
            <div className="p-4 space-y-4">
              <div className="aspect-square bg-muted rounded-md animate-pulse" />
              <div className="space-y-3">
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
        <div className="border border-border/30 rounded-xl p-8 bg-muted/20">
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
            className={`gradient-card border border-border/30 hover:border-border/50 transition-all duration-300 hover:shadow-lg group overflow-hidden ${
              dish.imageUrl ? 'animate-scale-in' : ''
            }`}
            style={{ 
              animationDelay: `${index * 0.1}s`,
              opacity: dish.imageUrl ? 1 : 0.85
            }}
          >
            <div className="p-4 space-y-4">
              {/* Image Section */}
              <div className="relative">
                {dish.imageUrl ? (
                  <div className="relative animate-scale-in">
                    <img
                      src={dish.imageUrl}
                      alt={dish.name}
                      className="w-full aspect-square object-cover rounded-md mb-6"
                    />
                    <div className="absolute top-2 right-2 bg-green-500/90 text-white text-xs px-2 py-0.5 rounded-full animate-fade-in">
                      ✨ Ready
                    </div>
                  </div>
                ) : (
                  <div className="w-full aspect-square bg-muted/50 rounded-md mb-6 flex flex-col items-center justify-center relative">
                    {dish.isGeneratingImage ? (
                      <>
                        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mb-2" />
                        <span className="text-sm text-muted-foreground animate-pulse">Creating magic...</span>
                        <div className="absolute top-2 right-2 bg-blue-500/90 text-white text-xs px-2 py-0.5 rounded-full animate-pulse">
                          🎨 Generating
                        </div>
                      </>
                    ) : (
                      <>
                        <span className="text-4xl mb-2 opacity-40">🍽️</span>
                        {onGenerateImage && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onGenerateImage(index)}
                            className="mt-2 text-xs"
                          >
                            <Camera className="h-3 w-3 mr-1" />
                            Generate
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
              
              <div>
                <div className="flex justify-between items-start gap-3 mb-3">
                  <h3 className="font-medium text-lg text-foreground leading-tight flex-1 min-w-0">
                    <span className="truncate block">{dish.name}</span>
                  </h3>
                  {dish.price && (
                    <div className="text-sm font-semibold text-accent-foreground whitespace-nowrap">
                      {dish.price}
                    </div>
                  )}
                </div>
                <div className="h-px bg-border/30 mb-3"></div>
                <p className="text-secondary-foreground text-sm leading-relaxed">
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