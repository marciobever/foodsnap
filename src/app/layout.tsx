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
  title: 'FoodSnap - Nutricionista e Personal Trainer com IA no WhatsApp',
  description: 'Fotografe seu prato pelo WhatsApp e receba na hora as calorias e macros do seu dia. Tem também o Coach IA: envie fotos do seu corpo e receba treino, dieta e acompanhamento de evolução personalizados. Por R$5 no primeiro mês, depois R$14,99/mês.',
  keywords: ['nutrição ia', 'contador de calorias foto', 'dieta whatsapp', 'nutricionista artificial', 'emagrecimento ia', 'food tracker', 'macro calculator', 'personal trainer ia', 'treino com ia', 'coach fitness whatsapp'],
  authors: [{ name: 'FoodSnap AI' }],
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    url: 'https://foodsnap.com.br/',
    siteName: 'FoodSnap',
    title: 'FoodSnap - Nutricionista e Personal Trainer com IA no WhatsApp',
    description: 'Conte calorias e macros tirando uma foto do prato. Receba treino, dieta e acompanhamento de evolução física com o Coach IA. Tudo pelo WhatsApp, a partir de R$5 no primeiro mês.',
    images: [
      {
        url: 'https://foodsnap.com.br/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'FoodSnap - Nutricionista e Personal Trainer com IA no WhatsApp',
      },
    ],
    locale: 'pt_BR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FoodSnap - Nutrição e Treino com IA no WhatsApp',
    description: 'Fotografe seu prato e seu corpo: a IA calcula calorias, monta sua dieta e treino, e acompanha sua evolução. Tudo pelo WhatsApp.',
    images: ['https://foodsnap.com.br/og-image.jpg'],
  },
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
      <head>
        <link rel="manifest" href="/manifest.json" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'SoftwareApplication',
              name: 'FoodSnap',
              url: 'https://foodsnap.com.br/',
              image: 'https://foodsnap.com.br/og-image.jpg',
              applicationCategory: 'HealthApplication',
              operatingSystem: 'Web, WhatsApp',
              description: 'FoodSnap é um nutricionista e personal trainer com inteligência artificial que funciona pelo WhatsApp. O usuário fotografa o prato e recebe na hora as calorias e macronutrientes. No Coach IA, o usuário envia fotos do próprio corpo e recebe um protocolo completo de treino e dieta personalizados, além de acompanhamento da evolução física ao longo do tempo com gráficos e comparativos antes/depois.',
              offers: {
                '@type': 'Offer',
                price: '14.99',
                priceCurrency: 'BRL',
                description: 'R$5 no primeiro mês, depois R$14,99/mês.',
              },
              featureList: [
                'Análise de calorias e macros por foto do prato via WhatsApp',
                'Coach IA: protocolo de treino e dieta personalizado por foto do corpo',
                'Acompanhamento de evolução física com fotos antes/depois',
                'Histórico e relatórios no painel web',
              ],
            }),
          }}
        />
      </head>
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

