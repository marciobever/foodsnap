'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/landing/Header';
import Hero from '@/components/landing/Hero';
import CoachHighlight from '@/components/landing/CoachHighlight';
import HowItWorks from '@/components/landing/HowItWorks';
import Features from '@/components/landing/Features';
import Testimonials from '@/components/landing/Testimonials';
import Pricing from '@/components/landing/Pricing';
import FAQ from '@/components/landing/FAQ';
import Footer from '@/components/landing/Footer';
import LoginModal from '@/components/modals/RegistrationModal';
import CalculatorsModal from '@/components/modals/CalculatorsModal';
import { useUser } from '@/contexts/UserContext';

export default function Home() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const router = useRouter();
  const { refreshProfile } = useUser();

  // Todos os CTAs de "Assinar" vão direto para /checkout
  const handleRegister = () => {
    router.push('/checkout');
  };

  // Botão "Entrar" no header abre o modal de login
  const handleOpenLogin = () => {
    setIsLoginOpen(true);
  };

  const handleLoginSuccess = async () => {
    setIsLoginOpen(false);
    await refreshProfile();
    router.push('/dashboard');
  };

  return (
    <>
      <Header
        onRegister={handleRegister}
        onLogin={handleOpenLogin}
        onOpenTools={() => setIsToolsOpen(true)}
      />
      <main>
        <Hero onRegister={handleRegister} />
        <CoachHighlight onRegister={handleRegister} />
        <HowItWorks />
        <Features />
        <Testimonials />
        <Pricing onRegister={handleRegister} />
        <FAQ />
      </main>
      <Footer onRegister={handleRegister} />

      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onSuccess={handleLoginSuccess}
      />
      <CalculatorsModal
        isOpen={isToolsOpen}
        onClose={() => setIsToolsOpen(false)}
      />
    </>
  );
}
