
import React from 'react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'analytics', label: 'Predictions', icon: '🧠' },
    { id: 'buildings', label: 'Buildings', icon: '🏢' },
    { id: 'gamification', label: 'Gamification', icon: '🏆' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <div className="w-64 bg-slate-900 h-screen fixed left-0 top-0 text-white flex flex-col p-6 shadow-xl z-50">
      <div className="mb-10">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <span className="text-emerald-400 text-2xl">🍃</span>
          Eco<span className="text-emerald-400 font-black">Pulse</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-semibold">Energy Intelligence</p>
      </div>

      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
              activeTab === item.id 
              ? 'bg-emerald-500/10 text-emerald-400 border-l-4 border-emerald-400' 
              : 'hover:bg-slate-800 text-slate-300'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="mt-auto pt-6 border-t border-slate-800">
        <div className="bg-slate-800 rounded-2xl p-4">
          <p className="text-xs text-slate-400 mb-1">System Status</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">EcoPulse Online</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
