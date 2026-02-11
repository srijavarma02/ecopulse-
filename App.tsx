
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Sidebar from './components/Sidebar';
import StatCard from './components/StatCard';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, LineChart, Line, Legend
} from 'recharts';
import { getEnergyInsights, getSmartOptimizationPlan } from './services/geminiService';
import { EnergyData, BuildingStats, Insight, LeaderboardEntry } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [energyHistory, setEnergyHistory] = useState<EnergyData[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [optPlan, setOptPlan] = useState<string>('');
  const [apiError, setApiError] = useState<string | null>(null);

  // Use a ref to access the latest energyHistory without triggering re-renders or re-memos
  const energyHistoryRef = useRef<EnergyData[]>([]);

  // Simulated live data generation
  useEffect(() => {
    const generateInitialData = () => {
      const data: EnergyData[] = [];
      const now = new Date();
      for (let i = 24; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 3600000);
        data.push({
          timestamp: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          usageKw: Math.floor(400 + Math.random() * 200),
          cost: Math.floor(50 + Math.random() * 25),
          voltage: 230 + (Math.random() * 5),
          current: 1.8 + (Math.random() * 0.4)
        });
      }
      setEnergyHistory(data);
      energyHistoryRef.current = data;
    };

    generateInitialData();

    const interval = setInterval(() => {
      setEnergyHistory(prev => {
        const now = new Date();
        const next = {
          timestamp: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          usageKw: Math.floor(400 + Math.random() * 200),
          cost: Math.floor(50 + Math.random() * 25),
          voltage: 230 + (Math.random() * 5),
          current: 1.8 + (Math.random() * 0.4)
        };
        const newData = [...prev.slice(1), next];
        energyHistoryRef.current = newData;
        return newData;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Stable fetch function that doesn't trigger automatically on every data tick
  const fetchInsights = useCallback(async () => {
    const dataToAnalyze = energyHistoryRef.current;
    if (dataToAnalyze.length === 0) return;
    
    setLoadingInsights(true);
    setApiError(null);
    try {
      const result = await getEnergyInsights(dataToAnalyze);
      if (result && result.length > 0) {
        setInsights(result);
      } else {
        // If empty result but no caught error, maybe it was a soft failure
        setInsights([]);
      }
    } catch (err: any) {
      setApiError(err.message || "Failed to fetch insights");
    } finally {
      setLoadingInsights(false);
    }
  }, []);

  // Only fetch insights on initial load, not every 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchInsights();
    }, 1000); // Slight delay to ensure data is populated
    return () => clearTimeout(timer);
  }, [fetchInsights]);

  const handleOptimizationTrigger = async () => {
    setLoadingInsights(true);
    setApiError(null);
    try {
      const plan = await getSmartOptimizationPlan("Peak usage detected in Library and Tech Center. Demand response event expected at 4 PM.");
      setOptPlan(plan);
    } catch (err: any) {
      setApiError("Optimization plan failed: " + err.message);
    } finally {
      setLoadingInsights(false);
    }
  };

  const buildings: BuildingStats[] = [
    { id: '1', name: 'Main Academic Block', currentLoad: 145.2, status: 'normal', efficiency: 92, occupancy: 65, temperature: 22.4, lastUpdated: 'Just now', peakLoad: 180 },
    { id: '2', name: 'Tech Innovation Hub', currentLoad: 212.8, status: 'high', efficiency: 78, occupancy: 88, temperature: 24.1, lastUpdated: '2 mins ago', peakLoad: 220 },
    { id: '3', name: 'Student Dorms (A)', currentLoad: 85.5, status: 'normal', efficiency: 88, occupancy: 42, temperature: 21.8, lastUpdated: '1 min ago', peakLoad: 110 },
    { id: '4', name: 'Campus Library', currentLoad: 55.4, status: 'normal', efficiency: 95, occupancy: 30, temperature: 22.0, lastUpdated: 'Just now', peakLoad: 95 },
    { id: '5', name: 'Science Research Center', currentLoad: 310.2, status: 'high', efficiency: 82, occupancy: 70, temperature: 19.5, lastUpdated: '4 mins ago', peakLoad: 350 },
    { id: '6', name: 'Administrative Wing', currentLoad: 42.1, status: 'normal', efficiency: 91, occupancy: 15, temperature: 23.2, lastUpdated: '10 mins ago', peakLoad: 60 },
    { id: '7', name: 'Sports Complex', currentLoad: 12.5, status: 'normal', efficiency: 98, occupancy: 5, temperature: 25.5, lastUpdated: '5 mins ago', peakLoad: 150 },
    { id: '8', name: 'Medical Center', currentLoad: 88.9, status: 'normal', efficiency: 89, occupancy: 55, temperature: 21.0, lastUpdated: 'Just now', peakLoad: 120 },
  ];

  const leaderboard: LeaderboardEntry[] = [
    { rank: 1, name: 'Main Academic Block', score: 980, change: 5 },
    { rank: 2, name: 'Campus Library', score: 945, change: 2 },
    { rank: 3, name: 'Science Labs', score: 890, change: -1 },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-8 animate-in fade-in duration-700">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard label="Live Power Usage" value="542.8 kW" subValue="Campus wide" trend="down" icon="⚡" color="bg-emerald-50" />
              <StatCard label="Estimated Cost" value="$1,240" subValue="Month to date" trend="up" icon="💰" color="bg-blue-50" />
              <StatCard label="Carbon Footprint" value="12.4 Tons" subValue="CO2 equivalent" trend="down" icon="🌱" color="bg-emerald-50" />
              <StatCard label="Active Faults" value="2" subValue="Minor anomalies detected" icon="⚠️" color="bg-amber-50" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-slate-800">Energy Consumption Flow</h2>
                    <p className="text-sm text-slate-400">Real-time demand tracking (kW)</p>
                  </div>
                </div>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={energyHistory}>
                      <defs>
                        <linearGradient id="colorUsage" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="timestamp" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                      <Tooltip 
                        contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                        itemStyle={{fontWeight: 'bold', color: '#10b981'}}
                      />
                      <Area type="monotone" dataKey="usageKw" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorUsage)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-xl flex flex-col relative overflow-hidden">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <span>AI Analyst</span>
                  {loadingInsights && <span className="w-2 h-2 bg-emerald-400 rounded-full animate-ping"></span>}
                </h2>
                <div className="space-y-4 flex-1">
                  {apiError ? (
                    <div className="bg-rose-500/20 p-4 rounded-2xl border border-rose-500/50">
                      <p className="text-sm font-bold text-rose-300">Service Alert</p>
                      <p className="text-xs text-rose-200 mt-1">
                        {apiError.includes('quota') || apiError.includes('429') 
                          ? "Rate limit exceeded. Please try again in a minute." 
                          : "AI Insights currently unavailable."}
                      </p>
                    </div>
                  ) : insights.length > 0 ? (
                    insights.map((insight, idx) => (
                      <div key={idx} className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700">
                        <div className="flex items-start gap-3">
                          <span className={`text-xl ${insight.severity === 'high' ? 'text-rose-400' : 'text-emerald-400'}`}>
                            {insight.type === 'prediction' ? '📈' : insight.type === 'anomaly' ? '🔍' : '💡'}
                          </span>
                          <div>
                            <p className="text-sm font-bold">{insight.title}</p>
                            <p className="text-xs text-slate-400 mt-1">{insight.description}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-10 opacity-50 italic">
                      {loadingInsights ? "Crunching numbers..." : "No insights available."}
                    </div>
                  )}
                </div>
                <button 
                  onClick={fetchInsights} 
                  disabled={loadingInsights}
                  className={`mt-6 w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold transition shadow-lg ${loadingInsights ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {loadingInsights ? 'Refreshing...' : 'Refresh Insights'}
                </button>
              </div>
            </div>
          </div>
        );

      case 'analytics':
        const predictionData = energyHistory.map(d => ({
          ...d,
          predictedKw: d.usageKw + (Math.random() * 40 - 20)
        }));

        return (
          <div className="space-y-8 animate-in slide-in-from-bottom-5 duration-700">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 relative overflow-hidden">
              <div className="relative z-10 flex flex-col lg:flex-row gap-8 items-center">
                <div className="flex-1">
                  <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold mb-4">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    AI ENGINE ACTIVE
                  </div>
                  <h2 className="text-4xl font-black text-slate-800 mb-4 leading-tight">Advanced Load Forecasting</h2>
                  <p className="text-slate-500 text-lg max-w-xl">
                    Our neural networks analyze 256 variables including weather, occupancy schedules, and historical anomalies to predict your next 48 hours of energy demand.
                  </p>
                </div>
                <div className="lg:w-1/3 flex gap-4">
                  <div className="bg-emerald-50 p-6 rounded-3xl flex-1 text-center border border-emerald-100">
                    <p className="text-xs text-emerald-600 font-bold uppercase mb-1">Forecast Accuracy</p>
                    <p className="text-3xl font-black text-emerald-700">98.4%</p>
                  </div>
                  <div className="bg-blue-50 p-6 rounded-3xl flex-1 text-center border border-blue-100">
                    <p className="text-xs text-blue-600 font-bold uppercase mb-1">Peak Avoidance</p>
                    <p className="text-3xl font-black text-blue-700">$450</p>
                    <p className="text-[10px] text-blue-400 mt-1">EST. SAVINGS TODAY</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl">
                <div className="flex justify-between items-start mb-8">
                   <div>
                      <h3 className="text-xl font-bold">24-Hour Predictive Model</h3>
                      <p className="text-slate-400 text-sm">Actual Usage vs. AI Synthetic Forecast</p>
                   </div>
                   <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                        <span className="text-xs font-medium text-slate-300">Actual</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-white/20 border border-white/50 rounded-full"></div>
                        <span className="text-xs font-medium text-slate-300">Predicted</span>
                      </div>
                   </div>
                </div>
                <div className="h-[350px]">
                   <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={predictionData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                        <XAxis dataKey="timestamp" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} />
                        <Tooltip 
                          contentStyle={{backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff'}}
                        />
                        <Line type="monotone" dataKey="usageKw" stroke="#10b981" strokeWidth={4} dot={false} />
                        <Line type="monotone" dataKey="predictedKw" stroke="#ffffff" strokeWidth={2} strokeDasharray="5 5" dot={false} opacity={0.4} />
                      </LineChart>
                   </ResponsiveContainer>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col h-full">
                  <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <span className="text-xl">🛠️</span> Smart Mitigation
                  </h3>
                  <div className="space-y-6 flex-1">
                     <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
                        <p className="text-xs font-black text-amber-700 mb-1">UPCOMING EVENT</p>
                        <p className="text-sm text-amber-900 font-bold italic">Peak Surge at 4:30 PM</p>
                        <p className="text-xs text-amber-700/70 mt-1">AI recommends preemptive cooling in Block C.</p>
                     </div>
                     <div className="space-y-4">
                        <label className="block">
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Aggression Level</span>
                          <input type="range" className="w-full mt-2 accent-emerald-500 h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer" />
                          <div className="flex justify-between text-[10px] font-bold text-slate-400 mt-1">
                             <span>CONSERVATIVE</span>
                             <span>BALANCED</span>
                             <span>AGRESSIVE</span>
                          </div>
                        </label>
                        <button 
                          onClick={handleOptimizationTrigger}
                          disabled={loadingInsights}
                          className={`w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition shadow-xl ${loadingInsights ? 'opacity-50' : ''}`}
                        >
                          {loadingInsights ? 'Analyzing...' : 'Simulate Strategy'}
                        </button>
                        {apiError && <p className="text-[10px] text-rose-500 text-center font-bold">{apiError}</p>}
                     </div>
                  </div>
                </div>
              </div>
            </div>

            {optPlan && (
              <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-100 animate-in slide-in-from-top-4 duration-500">
                <div className="flex items-center gap-4 mb-8">
                   <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg shadow-emerald-500/30">✨</div>
                   <div>
                      <h3 className="text-2xl font-black text-slate-800">Optimization Roadmap</h3>
                      <p className="text-slate-400 text-sm">Generated by Gemini-3 AI for Current Campus State</p>
                   </div>
                </div>
                <div className="whitespace-pre-line text-slate-600 font-medium leading-relaxed bg-slate-50 p-8 rounded-3xl border border-slate-100">
                  {optPlan}
                </div>
              </div>
            )}
          </div>
        );

      case 'buildings':
        return (
          <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
               <div>
                  <h2 className="text-2xl font-black text-slate-800">Granular Infrastructure View</h2>
                  <p className="text-slate-500">Monitoring 8 active zones across the northern campus perimeter.</p>
               </div>
               <div className="flex gap-2 bg-white p-1 rounded-2xl border border-slate-200">
                  <button className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold">GRID VIEW</button>
                  <button className="px-4 py-2 text-slate-500 rounded-xl text-xs font-bold hover:bg-slate-50">LIST VIEW</button>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              {buildings.map((b) => (
                <div key={b.id} className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:translate-y-[-4px] transition-all duration-300 group">
                  <div className="flex justify-between items-start mb-6">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-inner ${
                      b.status === 'normal' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                    }`}>
                      {b.name.includes('Academic') ? '🎓' : b.name.includes('Tech') ? '🔬' : b.name.includes('Dorm') ? '🏠' : b.name.includes('Library') ? '📚' : '🏢'}
                    </div>
                    <div className="text-right">
                       <span className={`text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-widest ${
                         b.status === 'normal' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                       }`}>
                         {b.status}
                       </span>
                       <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold">{b.lastUpdated}</p>
                    </div>
                  </div>
                  
                  <h4 className="text-lg font-black text-slate-800 mb-1 group-hover:text-emerald-600 transition-colors">{b.name}</h4>
                  <p className="text-3xl font-black text-slate-900 mb-6">{b.currentLoad} <span className="text-sm font-normal text-slate-400">kW</span></p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                     <div className="bg-slate-50 p-3 rounded-2xl">
                        <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Occupancy</p>
                        <p className="text-sm font-black text-slate-700">{b.occupancy}%</p>
                     </div>
                     <div className="bg-slate-50 p-3 rounded-2xl">
                        <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Temp</p>
                        <p className="text-sm font-black text-slate-700">{b.temperature}°C</p>
                     </div>
                  </div>

                  <div className="space-y-2">
                     <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <span>Efficiency</span>
                        <span>{b.efficiency}%</span>
                     </div>
                     <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-1000 ${b.efficiency > 90 ? 'bg-emerald-500' : b.efficiency > 80 ? 'bg-blue-500' : 'bg-amber-500'}`} 
                          style={{ width: `${b.efficiency}%` }}
                        ></div>
                     </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-slate-50 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                     <p className="text-[10px] font-bold text-slate-400 uppercase">Peak: {b.peakLoad} kW</p>
                     <button className="text-emerald-600 text-xs font-black hover:underline">DETAILS →</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'gamification':
        return (
          <div className="space-y-8 animate-in zoom-in duration-500">
             <div className="text-center py-10">
                <h2 className="text-4xl font-black text-slate-800 tracking-tighter">Campus Green Warrior</h2>
                <p className="text-slate-500 mt-2 text-lg">Gamifying conservation to build a zero-waste generation.</p>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-fuchsia-600 p-10 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-4 opacity-10">
                      <span className="text-9xl">🏆</span>
                   </div>
                   <p className="text-xs uppercase font-black tracking-widest opacity-80 mb-2">Your Personal Rank</p>
                   <h3 className="text-3xl font-black mb-8">Carbon Hero <span className="text-fuchsia-300">Grade A</span></h3>
                   <div className="flex items-center gap-6">
                      <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center text-4xl shadow-xl">🏅</div>
                      <div>
                         <p className="text-2xl font-black">1,240 XP</p>
                         <p className="text-xs text-indigo-200 font-bold">Top 2% of contributors</p>
                      </div>
                   </div>
                   <button className="w-full mt-10 py-4 bg-white text-indigo-600 rounded-2xl font-black text-sm shadow-xl hover:bg-indigo-50 transition">VIEW REWARDS</button>
                </div>

                <div className="md:col-span-2 bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100">
                   <h3 className="text-2xl font-black text-slate-800 mb-8 flex items-center gap-3">
                     <span className="text-indigo-500">🎯</span> Active Challenges
                   </h3>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 hover:border-indigo-200 transition-colors group cursor-pointer">
                         <div className="flex justify-between items-start mb-4">
                            <span className="text-3xl">💡</span>
                            <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black px-2 py-1 rounded-lg uppercase">ACTIVE</span>
                         </div>
                         <h4 className="font-black text-slate-800 mb-1">The Switch-Off Hour</h4>
                         <p className="text-xs text-slate-500 mb-4 leading-relaxed">Kill non-essential power in labs between 6 PM - 7 PM today.</p>
                         <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-indigo-600">500 XP</span>
                            <span className="text-xs font-black text-slate-400 group-hover:text-indigo-500 transition-colors">JOIN CHALLENGE →</span>
                         </div>
                      </div>
                      <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 hover:border-indigo-200 transition-colors group cursor-pointer">
                         <div className="flex justify-between items-start mb-4">
                            <span className="text-3xl">❄️</span>
                            <span className="bg-slate-200 text-slate-600 text-[10px] font-black px-2 py-1 rounded-lg uppercase">UPCOMING</span>
                         </div>
                         <h4 className="font-black text-slate-800 mb-1">Thermostat Master</h4>
                         <p className="text-xs text-slate-500 mb-4 leading-relaxed">Maintain 24°C average temperature for 5 consecutive days.</p>
                         <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-indigo-600">250 XP</span>
                            <span className="text-xs font-black text-slate-400 group-hover:text-indigo-500 transition-colors">SET REMINDER →</span>
                         </div>
                      </div>
                   </div>
                </div>
             </div>

             <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100">
                <div className="flex justify-between items-center mb-8">
                   <h3 className="text-2xl font-black text-slate-800">Inter-Departmental Leaderboard</h3>
                   <button className="text-xs font-black text-indigo-600 hover:underline">HISTORY</button>
                </div>
                <div className="space-y-4">
                   {[
                     { name: 'Engineering Hall', index: 98.2, co2: 450, status: 'Winning', color: 'bg-emerald-500' },
                     { name: 'Humanities Wing', index: 84.5, co2: 120, status: 'Stable', color: 'bg-blue-500' },
                     { name: 'MBA Tower', index: 62.1, co2: -45, status: 'Underperforming', color: 'bg-rose-500' },
                   ].map((row, i) => (
                     <div key={i} className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100 gap-6">
                        <div className="flex items-center gap-4 min-w-[200px]">
                           <span className="text-lg font-black text-slate-400">#0{i+1}</span>
                           <p className="font-black text-slate-800">{row.name}</p>
                        </div>
                        <div className="flex-1 max-w-md">
                           <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                              <span>Efficiency Index</span>
                              <span>{row.index}%</span>
                           </div>
                           <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                              <div className={`${row.color} h-full transition-all duration-1000`} style={{width: `${row.index}%`}}></div>
                           </div>
                        </div>
                        <div className="flex items-center gap-8">
                           <div className="text-center">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">CO2 Saved</p>
                              <p className={`text-lg font-black ${row.co2 >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{row.co2}kg</p>
                           </div>
                           <div className="min-w-[120px] text-right">
                              <span className={`text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-tighter ${
                                row.status === 'Winning' ? 'bg-emerald-100 text-emerald-700' :
                                row.status === 'Stable' ? 'bg-blue-100 text-blue-700' : 'bg-rose-100 text-rose-700'
                              }`}>
                                 {row.status}
                              </span>
                           </div>
                        </div>
                     </div>
                   ))}
                </div>
             </div>
          </div>
        );

      default:
        return (
          <div className="flex items-center justify-center h-[60vh] text-slate-400 flex-col">
            <span className="text-6xl mb-4">🚧</span>
            <p className="text-lg font-bold">Settings & Configuration</p>
            <p className="text-sm">User preferences and hardware API keys are managed here.</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 ml-64 p-8 lg:p-12">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-black text-slate-800 tracking-tight">
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
            </h1>
            <p className="text-slate-500 text-sm font-medium mt-1 uppercase tracking-widest">Energy Nexus Control Center</p>
          </div>
          <div className="flex items-center gap-6">
             <div className="hidden md:flex flex-col text-right">
                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">LIVE GRID DEMAND</span>
                <span className="text-2xl font-black text-slate-800">
                  {energyHistory.length > 0 ? energyHistory[energyHistory.length-1].usageKw.toFixed(1) : '0.0'} kW
                </span>
             </div>
             <div className="flex items-center gap-3">
               <div className="w-12 h-12 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center justify-center relative cursor-pointer hover:bg-slate-50 transition">
                  <span className="text-xl">🔔</span>
                  <div className="absolute top-2 right-2 w-3 h-3 bg-rose-500 rounded-full border-2 border-white"></div>
               </div>
               <div className="w-14 h-14 bg-slate-900 rounded-[1.25rem] border-4 border-white shadow-xl overflow-hidden flex items-center justify-center text-white font-black text-lg">
                  AD
               </div>
             </div>
          </div>
        </header>

        {renderContent()}

        <div className="fixed bottom-10 right-10 z-50">
           <button 
            onClick={fetchInsights}
            disabled={loadingInsights}
            className={`group flex items-center gap-3 bg-emerald-500 text-white px-8 py-5 rounded-full shadow-[0_20px_50px_rgba(16,185,129,0.4)] hover:bg-emerald-600 transition-all hover:scale-105 active:scale-95 ${loadingInsights ? 'opacity-80' : ''}`}
           >
             <span className={`text-2xl ${loadingInsights ? 'animate-spin' : 'animate-pulse'}`}>🧠</span>
             <div className="text-left">
                <p className="font-black text-sm leading-none">{loadingInsights ? 'AI ANALYZING...' : 'AI INSIGHT'}</p>
                <p className="text-[10px] font-bold opacity-80 leading-none mt-1 uppercase tracking-tighter">Ask Gemini Anything</p>
             </div>
           </button>
        </div>
      </main>
    </div>
  );
};

export default App;
