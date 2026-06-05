import React from 'react';

interface MacroBadgeProps {
    label: string;
    value: string | number;
    color: string;
}

const MacroBadge: React.FC<MacroBadgeProps> = ({ label, value, color }) => (
    <div className={`px-3 py-1 rounded-lg text-xs font-medium ${color}`}>
        <span className="opacity-70 mr-1">{label}:</span>
        <span className="font-bold">{value}</span>
    </div>
);

export default MacroBadge;
