import React from 'react';

export function safeStr(v: any, fallback = '-'): string {
    if (v === null || v === undefined) return fallback;
    if (typeof v === 'string') return v.trim() || fallback;
    if (typeof v === 'number') return Number.isFinite(v) ? String(v) : fallback;
    return fallback;
}

export function asArray(x: any): any[] {
    return Array.isArray(x) ? x : [];
}

export const PdfHeaderRow: React.FC<{
    index: string;
    title: string;
    subtitle: string;
    icon: React.ReactNode;
}> = ({ index, title, subtitle, icon }) => {
    return (
        <div className="flex items-end justify-between border-b border-gray-200 pb-3 mb-3">
            <div>
                <div className="text-[10px] uppercase tracking-[0.22em] text-gray-400 font-semibold">
                    Protocolo Titan • FoodSnap Coach
                </div>
                <h2 className="text-2xl font-black text-gray-900 leading-tight">
                    {index}. {title}
                </h2>
                <p className="text-[12px] text-gray-500">{subtitle}</p>
            </div>
            <div className="text-gray-300">{icon}</div>
        </div>
    );
};
