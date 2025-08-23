# ✨ [Picto Dish Magic](https://24b169c5-466f-4a1b-9723-fd0ed884a615.lovableproject.com/)

> Transform any text menu into a visual feast with AI-generated food photography.

[![Status: Live](https://img.shields.io/badge/Status-Live-brightgreen)](https://24b169c5-466f-4a1b-9723-fd0ed884a615.lovableproject.com/)
[![Backend: Supabase](https://img.shields.io/badge/Backend-Supabase-green)](https://supabase.com)
[![AI Powered](https://img.shields.io/badge/AI-OpenAI%20GPT%20%26%20Replicate-blue)](https://openai.com)

## 🌟 Overview

Picto Dish Magic is a modern web application that transforms text-only restaurant menus into visual experiences with AI-generated food photography. Upload any menu without pictures and get it back with stunning, realistic images of every dish to help you decide what to order.

## ✨ Features

- **🔍 AI Menu Analysis**: Automatically extracts dish names and descriptions from uploaded menu images using GPT-4 Vision
- **🎨 AI Image Generation**: Creates stunning, realistic food photography for every dish using advanced FLUX models
- **🌐 Multilingual Support**: Fully supports English and Russian languages with automatic detection
- **📱 Responsive Design**: Beautiful, mobile-first interface that works seamlessly across all devices
- **⚡ Fast Processing**: Parallel image generation for quick results
- **🎯 Smart OCR**: Advanced optical character recognition to read even complex menu layouts

## 🔒 Security & Architecture

### Why Supabase?

This application leverages **Supabase** as its backend-as-a-service platform for enhanced security and performance:

- **🔐 Secure API Management**: OpenAI and Replicate API keys are stored as encrypted secrets, never exposed in client-side code
- **🛡️ Edge Functions**: Menu analysis and image generation happen server-side via Supabase Edge Functions
- **🚀 Serverless Architecture**: No server maintenance required, with automatic scaling and global CDN
- **🔒 Environment Isolation**: Production and development environments are completely separated
- **📊 Built-in Analytics**: Monitor API usage and performance through Supabase dashboard
- **⚡ Edge Computing**: Fast response times with globally distributed edge functions

## 🛠️ Tech Stack

### Frontend (Lovable)
- **React 18** - Modern React with hooks and concurrent features
- **TypeScript** - Type-safe development for better code quality
- **Tailwind CSS** - Utility-first CSS framework with custom design system
- **Vite** - Lightning-fast build tool and development server
- **Lucide React** - Beautiful, customizable icon library

### Backend & Infrastructure (Supabase)
- **Supabase** - Backend-as-a-Service platform
- **Supabase Edge Functions** - Serverless functions for API integration
- **OpenAI GPT-4 Vision** - Advanced AI model for menu text extraction and analysis
- **Replicate AI** - High-quality food image generation using FLUX models

### UI/UX Libraries (Lovable)
- **Radix UI** - Accessible, unstyled UI primitives for robust components
- **Class Variance Authority** - Type-safe component variants system
- **Sonner** - Beautiful toast notifications for user feedback
- **React Hook Form** - Performant forms with built-in validation

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Lovable** for writing, debugging, assembling, and deploying the web app for me :)
- **OpenAI** for providing GPT-4 Vision API for menu analysis
- **Replicate** for high-quality AI image generation models
- **Supabase** for the secure, scalable backend platform