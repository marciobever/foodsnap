'use client';

import { useEffect } from 'react';

/**
 * Registra o Service Worker (necessário para o app ser instalável no Android/Chrome).
 * No iOS o "Adicionar à Tela de Início" funciona apenas com o manifest + apple-touch-icon.
 */
export function PWARegister() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator)) return;
    const onLoad = () => {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.error('Falha ao registrar o Service Worker:', err);
      });
    };
    window.addEventListener('load', onLoad);
    return () => window.removeEventListener('load', onLoad);
  }, []);

  return null;
}
