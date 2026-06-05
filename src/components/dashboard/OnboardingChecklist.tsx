'use client';

import React, { useState } from 'react';
import { MessageSquare, Camera, Sparkles, CheckCircle2, Smartphone, ArrowRight } from 'lucide-react';
import Image from 'next/image';

interface OnboardingChecklistProps {
    whatsappUrl: string;
    qrCodeUrl: string;
    userName?: string;
}

export default function OnboardingChecklist({ whatsappUrl, qrCodeUrl, userName }: OnboardingChecklistProps) {
    const [qrExpanded, setQrExpanded] = useState(false);

    const firstName = userName ? userName.split(' ')[0] : 'por aqui';

    return (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm mb-6 overflow-hidden">
            {/* Header */}
            <div className="px-8 pt-8 pb-6 border-b border-gray-50">
                <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
                    <span className="text-xs font-semibold text-brand-600 uppercase tracking-widest">Primeiros Passos</span>
                </div>
                <h2 className="text-xl font-bold text-gray-900">Bem-vindo(a), {firstName}!</h2>
                <p className="text-gray-500 text-sm mt-1">
                    Complete os passos abaixo para registrar sua primeira refeição e ver a IA em ação.
                </p>
            </div>

            {/* Steps */}
            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-50">

                {/* Step 1 - WhatsApp + QR */}
                <div className="p-6 flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full border-2 border-brand-500 flex items-center justify-center shrink-0">
                            <div className="w-2 h-2 rounded-full bg-brand-500" />
                        </div>
                        <span className="text-sm font-bold text-gray-900">Conectar ao WhatsApp</span>
                    </div>

                    <p className="text-xs text-gray-500 leading-relaxed pl-10">
                        Abra o WhatsApp e inicie uma conversa com nossa IA. Use o botão abaixo ou escaneie o QR Code com o celular.
                    </p>

                    <div className="pl-10 flex flex-col gap-3">
                        <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-lg transition-colors shadow-sm w-full"
                        >
                            <MessageSquare size={14} />
                            Abrir no WhatsApp
                        </a>

                        <button
                            onClick={() => setQrExpanded(!qrExpanded)}
                            className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 hover:border-gray-300 text-gray-600 text-xs font-medium rounded-lg transition-colors w-full"
                        >
                            <Smartphone size={14} />
                            {qrExpanded ? 'Ocultar QR Code' : 'Escanear com o celular'}
                        </button>

                        {qrExpanded && (
                            <div className="flex flex-col items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                <div className="p-3 bg-white border border-gray-200 rounded-xl shadow-sm w-36 h-36 flex items-center justify-center relative">
                                    <Image
                                        src={qrCodeUrl}
                                        alt="QR Code WhatsApp"
                                        fill
                                        className="object-contain p-2"
                                        unoptimized
                                    />
                                </div>
                                <p className="text-[10px] text-gray-400 text-center">Aponte a câmera do celular para o QR Code</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Step 2 - Send photo */}
                <div className="p-6 flex flex-col gap-4 opacity-60">
                    <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full border-2 border-gray-200 flex items-center justify-center shrink-0">
                            <div className="w-2 h-2 rounded-full bg-gray-300" />
                        </div>
                        <span className="text-sm font-bold text-gray-400">Enviar Primeira Refeição</span>
                    </div>

                    <p className="text-xs text-gray-400 leading-relaxed pl-10">
                        Tire uma foto do seu prato e envie diretamente no chat. Funciona com qualquer refeição — café da manhã, almoço ou jantar.
                    </p>

                    <div className="pl-10">
                        <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border border-gray-100 text-gray-400 text-xs font-medium rounded-lg w-full">
                            <Camera size={14} />
                            Aguardando conexão...
                        </div>
                    </div>
                </div>

                {/* Step 3 - Receive analysis */}
                <div className="p-6 flex flex-col gap-4 opacity-60">
                    <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full border-2 border-gray-200 flex items-center justify-center shrink-0">
                            <div className="w-2 h-2 rounded-full bg-gray-300" />
                        </div>
                        <span className="text-sm font-bold text-gray-400">Receber Análise Nutricional</span>
                    </div>

                    <p className="text-xs text-gray-400 leading-relaxed pl-10">
                        A IA identifica automaticamente calorias, macronutrientes, score de qualidade e sugestões personalizadas pelo seu Coach.
                    </p>

                    <div className="pl-10">
                        <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border border-gray-100 text-gray-400 text-xs font-medium rounded-lg w-full">
                            <Sparkles size={14} />
                            Disponível após o envio...
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
