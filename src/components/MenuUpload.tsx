import React, { useState, useCallback } from 'react';
import { Upload, CloudUpload, X, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Camera as CapacitorCamera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';

interface MenuUploadProps {
  onUpload: (file: File) => void;
  uploadedFile?: File | null;
  onClear?: () => void;
  language?: 'ru' | 'en';
}

export const MenuUpload: React.FC<MenuUploadProps> = ({ onUpload, uploadedFile, onClear, language = 'en' }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));
    
    if (imageFile) {
      if (imageFile.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }
      onUpload(imageFile);
      toast.success('Menu uploaded successfully!');
    } else {
      toast.error('Please upload an image file');
    }
  }, [onUpload]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }
      onUpload(file);
      toast.success('Menu uploaded successfully!');
    }
  }, [onUpload]);

  const handleCameraCapture = useCallback(async () => {
    try {
      if (!Capacitor.isNativePlatform()) {
        // Fallback to file input on web
        document.getElementById('menu-upload')?.click();
        return;
      }

      const image = await CapacitorCamera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera,
      });

      if (image.webPath) {
        // Convert the image to a File object
        const response = await fetch(image.webPath);
        const blob = await response.blob();
        const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
        
        onUpload(file);
        toast.success('Photo captured successfully!');
      }
    } catch (error) {
      console.error('Camera capture error:', error);
      toast.error('Failed to capture photo. Please try uploading a file instead.');
    }
  }, [onUpload]);

  const handleClear = useCallback(() => {
    if (onClear) {
      onClear();
      toast.success('Menu cleared');
    }
  }, [onClear]);

  if (uploadedFile) {
    return (
      <div className="relative gradient-card rounded-xl p-6 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-primary">
            {language === 'ru' ? 'Загруженное меню' : 'Uploaded Menu'}
          </h3>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleClear}
            className="text-muted-foreground hover:text-destructive"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="relative rounded-lg overflow-hidden shadow-lg">
          <img
            src={URL.createObjectURL(uploadedFile)}
            alt="Uploaded menu"
            className="w-full h-auto max-h-96 object-contain bg-white"
          />
        </div>
        
        <div className="mt-4 text-sm text-muted-foreground">
          <p className="font-medium">{uploadedFile.name}</p>
          <p>{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative gradient-card rounded-xl p-8 border-2 border-dashed transition-all duration-300 shadow-card hover:shadow-primary",
        isDragging ? "border-primary bg-primary/5 scale-105" : "border-muted"
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <div className={cn(
            "p-6 rounded-full transition-all duration-300",
            isDragging ? "gradient-primary shadow-glow scale-110" : "bg-muted"
          )}>
            <CloudUpload className={cn(
              "h-12 w-12 transition-colors duration-300",
              isDragging ? "text-white" : "text-muted-foreground"
            )} />
          </div>
        </div>
        
        <div className="space-y-2">
          <p className="text-xl font-semibold text-primary">
            {language === 'ru' ? 'Сделайте фото, загрузите или перетащите файл' : 'Take a photo, upload or drag and drop'}
          </p>
          <p className="text-muted-foreground">
            PNG, JPG, GIF {language === 'ru' ? 'до 10МБ' : 'up to 10MB'}
          </p>
        </div>

        <div className="space-y-4">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            id="menu-upload"
          />
          
          <div className="flex gap-3 justify-center flex-wrap">
            <Button 
              variant="hero" 
              size="lg" 
              onClick={handleCameraCapture}
              className="shadow-card hover:shadow-primary hover-scale"
            >
              <Camera className="h-5 w-5" />
              {language === 'ru' ? 'Сделать фото' : 'Take Photo'}
            </Button>
            
            <label htmlFor="menu-upload">
              <Button variant="secondary" size="lg" className="cursor-pointer hover-scale" asChild>
                <span>
                  <Upload className="h-5 w-5" />
                  {language === 'ru' ? 'Выбрать файл' : 'Choose File'}
                </span>
              </Button>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};