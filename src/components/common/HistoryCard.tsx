import React from 'react';
import MacroBadge from './MacroBadge';
import Image from 'next/image';

interface HistoryCardProps {
    item: {
        id: string;
        img: string;
        category: string;
        details?: string;
        cals: number;
        score: number;
        date: string;
        protein: string;
        carbs: string;
        fat: string;
    };
    fallback: string;
}

const HistoryCard: React.FC<HistoryCardProps> = ({ item, fallback }) => (
    <div className="bg-white rounded-[1.5rem] border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-2 hover:border-brand-100 transition-all duration-500 group cursor-pointer h-full flex flex-col relative">
        <div className="h-44 overflow-hidden relative bg-gray-50">
            <Image
                src={item.img}
                alt={item.category}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
                onError={(e: any) => {
                    const target = e.currentTarget;
                    if (target.src !== fallback) {
                        target.src = fallback;
                    }
                }}
                unoptimized
            />
            {/* Soft gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>
            
            <div className="absolute top-3 right-3 bg-white/20 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full border border-white/30 shadow-sm">
                {item.cals} kcal
            </div>
            {item.score > 0 && (
                <div className={`absolute bottom-3 left-3 text-xs font-bold px-3 py-1 rounded-full shadow-lg text-white border border-white/20 backdrop-blur-md ${item.score >= 80 ? 'bg-green-500/80' : 'bg-yellow-500/80'}`}>
                    Score {item.score}
                </div>
            )}
        </div>
        <div className="p-5 flex-1 flex flex-col bg-white">
            <h5 className="font-extrabold text-gray-900 text-lg mb-1 truncate group-hover:text-brand-600 transition-colors">{item.category}</h5>
            {item.details && <p className="text-sm text-gray-500 mb-4 line-clamp-2 leading-relaxed">{item.details}</p>}

            <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center text-xs font-medium text-gray-400">
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>{item.date}</span>
            </div>

            <div className="flex gap-2 mt-4">
                <div className="flex-1 bg-gray-50/50 border border-gray-100 rounded-xl px-2 py-2 text-center group-hover:bg-brand-50/50 group-hover:border-brand-100 transition-colors">
                    <span className="block text-[9px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Proteína</span>
                    <span className="text-sm font-black text-gray-800">{item.protein}</span>
                </div>
                <div className="flex-1 bg-gray-50/50 border border-gray-100 rounded-xl px-2 py-2 text-center group-hover:bg-blue-50/50 group-hover:border-blue-100 transition-colors">
                    <span className="block text-[9px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Carbo</span>
                    <span className="text-sm font-black text-gray-800">{item.carbs}</span>
                </div>
            </div>
        </div>
    </div>
);

export default HistoryCard;
