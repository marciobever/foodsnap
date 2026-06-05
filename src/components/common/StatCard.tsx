import React, { ReactNode } from 'react';

interface StatCardProps {
    title: string;
    value: string;
    sub: string;
    icon: ReactNode;
    highlight?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, sub, icon, highlight }) => (
    <div className={`p-6 rounded-2xl ${highlight ? 'bg-gradient-to-br from-brand-50 to-white border border-brand-100' : 'bg-white border border-gray-100'} shadow-sm hover:shadow-premium transition-all duration-300 group`}>
        <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-2xl ${highlight ? 'bg-brand-100 text-brand-600' : 'bg-gray-50 text-gray-500'} group-hover:scale-110 transition-transform duration-300`}>
                {icon}
            </div>
            {highlight && <span className="flex h-2 w-2 rounded-full bg-brand-500"></span>}
        </div>
        <div>
            <h4 className="text-3xl font-extrabold text-gray-900 tracking-tight">{value}</h4>
            <p className="text-sm text-gray-500 font-medium mt-1">{title}</p>
            <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
        </div>
    </div>
);

export default StatCard;
