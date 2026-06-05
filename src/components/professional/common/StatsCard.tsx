import React from 'react';

export const StatsCard = ({ label, value, trend, alert }: any) => (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm transition-all hover:shadow-md">
        <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">{label}</p>
        <h3 className="text-3xl font-black text-gray-900 mb-2">{value}</h3>
        <p className={`text-xs font-bold ${alert ? 'text-red-500' : 'text-green-500'}`}>{trend}</p>
    </div>
);
