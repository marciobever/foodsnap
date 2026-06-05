import React from 'react';

export const KPI = ({ label, value }: any) => (
    <div className="bg-gray-50 border border-gray-100 p-4 rounded-2xl">
        <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-1">{label}</p>
        <p className="text-xl font-bold truncate text-gray-900">{value || '-'}</p>
    </div>
);

export const Tab = ({ active, onClick, icon, label }: any) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap
            ${active
                ? 'bg-gray-900 text-white shadow-md'
                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
            }
        `}
    >
        {icon}
        {label}
    </button>
);

export const Card = ({ title, icon, children, className = "" }: any) => (
    <div className={`bg-white p-6 md:p-8 rounded-[2.5rem] border border-gray-100 shadow-sm h-full ${className}`}>
        <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center">
                {icon}
            </div>
            <h3 className="text-xl font-bold text-gray-900">{title}</h3>
        </div>
        {children}
    </div>
);

export const Badge = ({ text, color }: any) => {
    const styles = color === 'green'
        ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
        : 'bg-orange-50 text-orange-700 border-orange-100';

    return (
        <span className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${styles}`}>
            {text}
        </span>
    );
};

export const MacroCard = ({ label, value, color }: any) => {
    const colors: any = {
        brand: 'bg-brand-50 text-brand-900 border-brand-100',
        blue: 'bg-blue-50 text-blue-900 border-blue-100',
        yellow: 'bg-yellow-50 text-yellow-900 border-yellow-100'
    };

    return (
        <div className={`p-6 rounded-3xl border ${colors[color]} flex flex-col items-center justify-center text-center shadow-sm`}>
            <span className="text-xs font-bold uppercase opacity-60 mb-1">{label}</span>
            <span className="text-3xl font-black">{value}</span>
        </div>
    );
};
