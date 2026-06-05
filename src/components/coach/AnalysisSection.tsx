import React from 'react';
import { Activity, Trophy, CheckCircle2, AlertCircle } from 'lucide-react';
import { Card, Badge } from './Shared';

interface AnalysisSectionProps {
    analysis: any;
}

const AnalysisSection: React.FC<AnalysisSectionProps> = ({ analysis }) => {
    const formatText = (text: string) => {
        if (!text) return null;
        const lines = text.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
        return (
            <div className="space-y-3">
                {lines.map((line, idx) => {
                    const isBullet = line.startsWith('-') || line.startsWith('•') || line.match(/^([a-zA-Z\d]+[\.\)-]|\*)\s/);
                    const cleanLine = line.replace(/^([-•\*]|\d+[\.\)-])\s*/, '');
                    if (isBullet) {
                        return (
                            <div key={idx} className="flex items-start gap-2.5 text-sm text-gray-600 leading-relaxed">
                                <span className="inline-block w-1.5 h-1.5 rounded-full bg-brand-500 mt-2 shrink-0"></span>
                                <span>{cleanLine}</span>
                            </div>
                        );
                    }
                    return (
                        <p key={idx} className="text-sm text-gray-600 leading-relaxed">
                            {line}
                        </p>
                    );
                })}
            </div>
        );
    };

    return (
        <section className="grid md:grid-cols-2 gap-8">
            <Card title="Análise Corporal" icon={<Activity className="text-brand-500" />}>
                <div className="grid grid-cols-2 gap-6 mb-6">
                    <div className="bg-gray-50 p-4 rounded-2xl">
                        <p className="text-gray-400 text-xs font-bold uppercase mb-1">Gordura Estimada</p>
                        <p className="text-3xl font-extrabold text-gray-900">{analysis?.body_fat_percentage}%</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-2xl">
                        <p className="text-gray-400 text-xs font-bold uppercase mb-1">Massa Muscular</p>
                        <p className="text-3xl font-extrabold text-gray-900">{analysis?.muscle_mass_level}</p>
                    </div>
                </div>
                <div className="mb-4">
                    <h4 className="font-bold text-gray-900 mb-2">Avaliação Postural</h4>
                    <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                        {formatText(analysis?.posture_analysis) || <p className="text-sm text-gray-500">Nenhum desvio postural relevante relatado.</p>}
                    </div>
                </div>
                {analysis?.evolution_notes && (
                    <div className="mt-6 border-t border-gray-100 pt-6">
                        <h4 className="font-bold text-brand-700 mb-2 flex items-center gap-2">
                            <Trophy size={18} className="text-brand-500" /> Comparativo de Evolução
                        </h4>
                        <div className="bg-brand-50 p-4 rounded-xl border border-brand-100">
                            {formatText(analysis.evolution_notes)}
                        </div>
                    </div>
                )}
            </Card>

            <Card title="Pontos Chave" icon={<Trophy className="text-yellow-500" />}>
                <div className="space-y-6">
                    <div>
                        <h4 className="text-sm font-bold text-green-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                            <CheckCircle2 size={16} /> Pontos Fortes
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {analysis?.strengths?.map((s: string, i: number) => (
                                <Badge key={i} text={s} color="green" />
                            ))}
                        </div>
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-orange-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                            <AlertCircle size={16} /> Foco Total
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {analysis?.weaknesses?.map((s: string, i: number) => (
                                <Badge key={i} text={s} color="orange" />
                            ))}
                        </div>
                    </div>
                </div>
            </Card>
        </section>
    );
};

export default AnalysisSection;
