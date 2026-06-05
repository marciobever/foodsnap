'use client';
import React, { useState } from 'react';
import { Dumbbell, Utensils, Activity, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

import { KPI, Tab } from './Shared';
import AnalysisSection from './AnalysisSection';
import DietSection from './DietSection';
import WorkoutSection from './WorkoutSection';

// PDF pages
import { PdfAnalysisCompact } from './pdf/PdfAnalysisCompact';
import { PdfDietCompact } from './pdf/PdfDietCompact';
import { PdfWorkoutCompact } from './pdf/PdfWorkoutCompact';

// @ts-ignore
import { renderToStaticMarkup } from 'react-dom/server';

interface CoachResultProps {
  data: any;
  onReset: () => void;
}

const N8N_WEBHOOK_URL = 'https://n8n.seureview.com.br/webhook/pdf-coach';

const CoachResult: React.FC<CoachResultProps> = ({ data, onReset }) => {
  const [activeTab, setActiveTab] = useState<'analysis' | 'diet' | 'workout'>('analysis');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  if (!data) return null;

  const { analysis, diet, workout, motivation_quote } = data;

  const handleSavePDF = async () => {
    setIsGeneratingPdf(true);

    try {
      // 1) Render 2 pages (Diet & Workout only - requested by user)
      const pdfPages = (
        <div className="pdf-root">
          {/* REMOVED ANALYSIS PAGE AS REQUESTED */}

          <div className="pdf-page">
            <PdfDietCompact diet={data.diet} />
          </div>

          <div className="pdf-page">
            <PdfWorkoutCompact workout={data.workout} quote={data.motivation_quote} />
          </div>
        </div>
      );

      const pagesHtml = renderToStaticMarkup(pdfPages);

      // 2) Full HTML + print-lock CSS (Optimized for Gotenberg)
      const fullHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />

  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            brand: {
              50: '#f0fdfa', 100: '#ccfbf1', 200: '#99f6e4', 300: '#5eead4',
              400: '#2dd4bf', 500: '#14b8a6', 600: '#0d9488', 700: '#0f766e',
              800: '#115e59', 900: '#134e4a', 950: '#042f2e',
            }
          }
        }
      }
    }
  </script>

  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;900&display=swap');

    /* ----- PRINT LOCK (A4) ----- */
    @page { size: A4; margin: 0; }
    html, body { margin: 0; padding: 0; }
    body {
      font-family: 'Inter', sans-serif;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      background: #ffffff;
    }
    * { box-sizing: border-box; }

    /* One A4 per page - STRICT dimensions */
    .pdf-page {
      width: 210mm;
      height: 297mm;
      padding: 12mm;
      overflow: hidden;
      page-break-after: always;
      break-after: page;
      background: #fff;
      display: flex;
      flex-direction: column;
      position: relative;
    }
    
    .pdf-page:last-child {
      page-break-after: auto;
      break-after: auto;
    }

    /* Safety for weird blocks */
    .avoid-break {
      break-inside: avoid;
      page-break-inside: avoid;
    }
  </style>
</head>

<body>
  ${pagesHtml}
</body>
</html>`;

      // 3) Send to n8n
      const fileName = `FoodSnap_Titan_${new Date().toISOString().split('T')[0]}`;

      const response = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ html: fullHtml, file_name: fileName }),
      });

      if (!response.ok) throw new Error(`Erro n8n: ${response.status} ${response.statusText}`);

      // 4) Download PDF
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${fileName}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('PDF Generation Server Error:', err);
      alert('Erro ao gerar PDF no servidor. Verifique se o Webhook do n8n está configurado.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700 pb-12">
      {/* Premium Header */}
      <div className="bg-white rounded-[2rem] p-6 md:p-8 mb-8 shadow-xl relative overflow-hidden text-gray-900 border border-gray-100">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-50 rounded-full blur-[100px] opacity-60 -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-50 rounded-full blur-[80px] opacity-60 translate-y-1/3 -translate-x-1/3"></div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="px-2.5 py-0.5 bg-brand-50 border border-brand-100 rounded-full text-[10px] font-bold uppercase tracking-widest text-brand-700">
                Protocolo Titan
              </span>
              <span className="text-gray-400 text-xs font-mono">{new Date().toLocaleDateString()}</span>
            </div>

            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3 leading-tight">
              Seu Blueprint <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-emerald-600">
                De Transformação
              </span>
            </h1>

            <p className="text-gray-500 text-base max-w-xl italic font-light border-l-2 border-brand-200 pl-4">
              "{motivation_quote || 'Disciplina é a ponte entre metas e conquistas.'}"
            </p>
          </div>

          <div className="flex flex-col gap-2 min-w-[180px]">
            <button
              onClick={onReset}
              className="px-5 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 transition-all hover:scale-105 active:scale-95 text-center"
            >
              Gerar Novo
            </button>

            <button
              onClick={handleSavePDF}
              disabled={isGeneratingPdf}
              className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-brand-500/30 transition-all hover:scale-105 active:scale-95 text-center flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isGeneratingPdf ? <Loader2 size={16} className="animate-spin" /> : 'Baixar PDF (3 páginas)'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10">
          <KPI label="Biótipo" value={analysis?.somatotype} />
          <KPI label="Objetivo" value={workout?.focus} />
          <KPI label="Calorias" value={`${Math.round(diet?.total_calories || 0)} kcal`} />
          <KPI label="Estrutura" value={workout?.split} />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex justify-center mb-10 sticky top-4 z-40">
        <div className="bg-white/80 backdrop-blur-md p-1.5 rounded-2xl shadow-lg border border-gray-100 flex gap-1 overflow-x-auto max-w-full">
          <Tab
            active={activeTab === 'analysis'}
            onClick={() => setActiveTab('analysis')}
            icon={<Activity size={18} />}
            label="Diagnóstico"
          />
          <Tab
            active={activeTab === 'diet'}
            onClick={() => setActiveTab('diet')}
            icon={<Utensils size={18} />}
            label="Nutrição"
          />
          <Tab
            active={activeTab === 'workout'}
            onClick={() => setActiveTab('workout')}
            icon={<Dumbbell size={18} />}
            label="Treinamento"
          />
        </div>
      </div>

      {/* Rich UI */}
      <div className="min-h-[600px]">
        {activeTab === 'analysis' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <AnalysisSection analysis={analysis} />
          </motion.div>
        )}

        {activeTab === 'diet' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <DietSection diet={diet} />
          </motion.div>
        )}

        {activeTab === 'workout' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <WorkoutSection workout={workout} />
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default CoachResult;
