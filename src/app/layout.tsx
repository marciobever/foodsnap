import type { Metadata, Viewport } from 'next';
import { Outfit, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { Providers } from './Providers';
import { Toaster } from 'sonner';
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { PWARegister } from './pwa-register';

const outfit = Outfit({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-outfit',
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});


export const metadata: Metadata = {
  title: 'FoodSnap.ai - Nutricionista de Bolso com Inteligência Artificial',
  description: 'Transforme sua dieta com o FoodSnap.ai. Fotografe seu prato e receba análise nutricional completa via WhatsApp em segundos.',
  keywords: ['nutrição ia', 'contador de calorias foto', 'dieta whatsapp', 'nutricionista artificial', 'emagrecimento ia', 'food tracker', 'macro calculator'],
  authors: [{ name: 'FoodSnap AI' }],
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    url: 'https://foodsnap.com.br/',
    title: 'FoodSnap - Seu Nutricionista IA no WhatsApp',
    description: 'Analise calorias e macros apenas tirando uma foto. Sem digitação, sem apps pesados. Tudo pelo WhatsApp.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FoodSnap - Nutrição Inteligente',
    description: 'Chega de contar calorias manualmente. Deixe a IA fazer isso por você.',
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/icon-192x192.png',
    apple: '/apple-touch-icon.png',
  },
  appleWebApp: {
    capable: true,
    title: 'FoodSnap',
    statusBarStyle: 'default',
  },
};

export const viewport: Viewport = {
  themeColor: '#14b8a6', // brand-500
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`scroll-smooth ${outfit.variable} ${plusJakartaSans.variable}`}>
      <body className="font-sans bg-[#f8fafc] text-gray-900 selection:bg-brand-100 selection:text-brand-900">
        <Providers>
          {children}
          <Toaster position="bottom-center" richColors theme="light" />
          <Analytics />
          <SpeedInsights />
          <PWARegister />
        </Providers>
      </body>
    </html>
  );
}

