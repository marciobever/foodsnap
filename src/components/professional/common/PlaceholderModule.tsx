import React from 'react';

export const PlaceholderModule = ({ title, desc, icon }: any) => (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center max-w-md mx-auto animate-in zoom-in-95 duration-500">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-6">
            {icon}
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
        <p className="text-gray-500 mb-8 leading-relaxed">{desc}</p>
        <button className="bg-gray-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-black transition-transform hover:scale-105 active:scale-95">
            Em breve
        </button>
    </div>
);
