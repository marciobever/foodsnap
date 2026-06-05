'use client';

import { LanguageProvider } from '@/contexts/LanguageContext';
import { UserProvider } from '@/contexts/UserContext';
import React from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <LanguageProvider>
        {children}
      </LanguageProvider>
    </UserProvider>
  );
}
