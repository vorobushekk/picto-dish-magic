import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.24b169c5466f4a1b9723fd0ed884a615',
  appName: 'picto-dish-magic',
  webDir: 'dist',
  server: {
    url: 'https://24b169c5-466f-4a1b-9723-fd0ed884a615.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    Camera: {
      permissions: {
        camera: 'granted',
        photos: 'granted'
      }
    }
  }
};

export default config;