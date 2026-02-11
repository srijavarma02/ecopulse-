
import React from 'react';

interface StatCardProps {
  label: string;
  value: string;
  subValue?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon: string;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, subValue, trend, icon, color }) => {
  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-2xl ${color}`}>
          <span className="text-2xl">{icon}</span>
        </div>
        {trend && (
          <span className={`text-xs font-bold px-2 py-1 rounded-full ${
            trend === 'down' ? 'bg-emerald-100 text-emerald-700' : 
            trend === 'up' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-700'
          }`}>
            {trend === 'down' ? '↓ 12%' : trend === 'up' ? '↑ 8%' : '• Stable'}
          </span>
        )}
      </div>
      <div>
        <h3 className="text-slate-500 text-sm font-medium">{label}</h3>
        <p className="text-2xl font-bold mt-1 text-slate-800">{value}</p>
        {subValue && <p className="text-xs text-slate-400 mt-1">{subValue}</p>}
      </div>
    </div>
  );
};

export default StatCard;
