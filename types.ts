
export interface EnergyData {
  timestamp: string;
  usageKw: number;
  cost: number;
  voltage: number;
  current: number;
}

export interface BuildingStats {
  id: string;
  name: string;
  currentLoad: number;
  status: 'normal' | 'high' | 'critical';
  efficiency: number;
  occupancy: number; // percentage
  temperature: number; // celsius
  lastUpdated: string;
  peakLoad: number;
}

export interface Insight {
  id: string;
  type: 'prediction' | 'anomaly' | 'action';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  score: number;
  change: number;
}
