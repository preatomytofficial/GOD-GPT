import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Cell,
} from 'recharts';
import {
  TrendingUp,
  BarChart2,
  Flame,
  Zap,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Target,
  Sparkles,
  Layers,
} from 'lucide-react';
import { SavedChat } from '../types';
import { analyzeChatThemes } from '../utils/metricsCalculator';

// Custom Custom Tooltip for Recharts
interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number | string;
    name: string;
    color?: string;
    dataKey?: string;
  }>;
  label?: string;
}

const CustomChartTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div
        id="recharts-custom-tooltip"
        className="bg-neutral-900/95 backdrop-blur-md border border-purple-500/30 px-3 py-2 rounded-lg shadow-xl text-xs z-50 pointer-events-none"
        style={{ boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6), 0 0 12px rgba(139, 92, 246, 0.25)' }}
      >
        <p className="font-bold text-neutral-200 mb-1 flex items-center gap-1.5 border-b border-neutral-800 pb-1">
          <Sparkles className="w-3 h-3 text-purple-400" />
          <span>{label}</span>
        </p>
        {payload.map((entry, index) => (
          <div key={`item-${index}`} className="flex items-center justify-between gap-3 text-neutral-300 py-0.5">
            <span className="flex items-center gap-1.5">
              <span
                className="w-2 h-2 rounded-full inline-block"
                style={{ backgroundColor: entry.color || '#a855f7' }}
              />
              <span className="capitalize">{entry.name}:</span>
            </span>
            <span className="font-semibold text-purple-200">
              {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const GrowthMetrics: React.FC = () => {
  const [chats, setChats] = useState<SavedChat[]>([]);
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'reach' | 'themes' | 'radar'>('reach');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Read saved chats from localStorage
  const loadChats = useCallback(() => {
    try {
      const raw = localStorage.getItem('godgpt_chats');
      if (raw) {
        const parsed = JSON.parse(raw);
        setChats(Array.isArray(parsed) ? parsed : []);
      } else {
        setChats([]);
      }
    } catch (err) {
      console.error('Failed to parse chats from localStorage:', err);
      setChats([]);
    }
  }, []);

  useEffect(() => {
    loadChats();

    // Listen to local changes
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'godgpt_chats') {
        loadChats();
      }
    };

    const handleCustomUpdate = () => {
      loadChats();
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('godgpt:chats-updated', handleCustomUpdate);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('godgpt:chats-updated', handleCustomUpdate);
    };
  }, [loadChats]);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    loadChats();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // Compute calculated metrics
  const analytics = useMemo(() => {
    return analyzeChatThemes(chats);
  }, [chats]);

  const formatReachNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div
      id="growth-metrics-panel"
      className="mt-3 mx-1 mb-2 border border-purple-500/20 bg-neutral-950/80 rounded-xl overflow-hidden shadow-lg transition-all duration-300 backdrop-blur-sm"
      style={{
        boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
      }}
    >
      {/* Header Bar */}
      <div
        id="growth-metrics-header"
        className="flex items-center justify-between px-3 py-2.5 bg-gradient-to-r from-purple-950/40 via-neutral-900/60 to-neutral-950/80 border-b border-purple-500/15 cursor-pointer select-none"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <div
            id="growth-metrics-icon-badge"
            className="w-6 h-6 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-sm"
            style={{ boxShadow: '0 0 10px rgba(168, 85, 247, 0.4)' }}
          >
            <TrendingUp className="w-3.5 h-3.5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold tracking-wide text-neutral-100 uppercase">Growth Metrics</span>
              <span className="text-[10px] font-semibold bg-purple-500/20 text-purple-300 px-1.5 py-0.2 rounded border border-purple-500/30">
                Recharts AI
              </span>
            </div>
            <p className="text-[10px] text-neutral-400">
              {chats.length > 0
                ? `${chats.length} chat${chats.length > 1 ? 's' : ''} • Top: ${analytics.topTheme}`
                : 'Simulated strategy projections'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            id="growth-metrics-refresh-btn"
            type="button"
            className="p-1 rounded-md text-neutral-400 hover:text-purple-300 hover:bg-white/5 transition-colors"
            title="Refresh Growth Metrics"
            onClick={(e) => {
              e.stopPropagation();
              handleManualRefresh();
            }}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-purple-400' : ''}`} />
          </button>
          <button
            id="growth-metrics-collapse-btn"
            type="button"
            className="p-1 rounded-md text-neutral-400 hover:text-neutral-200 hover:bg-white/5 transition-colors"
            title={isExpanded ? 'Collapse panel' : 'Expand panel'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div id="growth-metrics-body" className="p-2.5 flex flex-col gap-2.5">
          {/* Top KPI Summary Chips */}
          <div id="growth-kpi-grid" className="grid grid-cols-3 gap-1.5">
            <div
              id="kpi-reach-card"
              className="bg-neutral-900/90 border border-purple-500/15 rounded-lg p-1.5 flex flex-col items-center justify-center text-center"
            >
              <div className="flex items-center gap-1 text-[10px] text-neutral-400 font-medium">
                <Zap className="w-2.5 h-2.5 text-cyan-400" />
                <span>Est. Reach</span>
              </div>
              <span className="text-xs font-bold text-cyan-300 mt-0.5">
                +{formatReachNumber(analytics.projectedReach)}
              </span>
            </div>

            <div
              id="kpi-virality-card"
              className="bg-neutral-900/90 border border-pink-500/15 rounded-lg p-1.5 flex flex-col items-center justify-center text-center"
            >
              <div className="flex items-center gap-1 text-[10px] text-neutral-400 font-medium">
                <Flame className="w-2.5 h-2.5 text-pink-400" />
                <span>Virality</span>
              </div>
              <span className="text-xs font-bold text-pink-300 mt-0.5">
                {analytics.overallVirality}%
              </span>
            </div>

            <div
              id="kpi-theme-card"
              className="bg-neutral-900/90 border border-purple-500/15 rounded-lg p-1.5 flex flex-col items-center justify-center text-center overflow-hidden"
            >
              <div className="flex items-center gap-1 text-[10px] text-neutral-400 font-medium">
                <Target className="w-2.5 h-2.5 text-purple-400" />
                <span>Focus</span>
              </div>
              <span className="text-[11px] font-bold text-purple-300 mt-0.5 truncate w-full px-0.5">
                {analytics.topTheme}
              </span>
            </div>
          </div>

          {/* Visualization Tab Switcher */}
          <div
            id="growth-chart-tabs"
            className="flex bg-neutral-900/80 p-0.5 rounded-lg border border-neutral-800 text-[11px] font-medium"
          >
            <button
              id="tab-btn-reach"
              type="button"
              className={`flex-1 py-1 px-1.5 rounded-md flex items-center justify-center gap-1 transition-all ${
                activeTab === 'reach'
                  ? 'bg-purple-600/30 text-purple-200 border border-purple-500/30 shadow-sm font-semibold'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
              onClick={() => setActiveTab('reach')}
            >
              <TrendingUp className="w-3 h-3" />
              <span>Reach (7D)</span>
            </button>

            <button
              id="tab-btn-themes"
              type="button"
              className={`flex-1 py-1 px-1.5 rounded-md flex items-center justify-center gap-1 transition-all ${
                activeTab === 'themes'
                  ? 'bg-purple-600/30 text-purple-200 border border-purple-500/30 shadow-sm font-semibold'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
              onClick={() => setActiveTab('themes')}
            >
              <BarChart2 className="w-3 h-3" />
              <span>Themes</span>
            </button>

            <button
              id="tab-btn-radar"
              type="button"
              className={`flex-1 py-1 px-1.5 rounded-md flex items-center justify-center gap-1 transition-all ${
                activeTab === 'radar'
                  ? 'bg-purple-600/30 text-purple-200 border border-purple-500/30 shadow-sm font-semibold'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
              onClick={() => setActiveTab('radar')}
            >
              <Layers className="w-3 h-3" />
              <span>Radar</span>
            </button>
          </div>

          {/* Recharts Canvas Area */}
          <div
            id="growth-recharts-container"
            className="w-full h-36 bg-neutral-900/60 rounded-lg border border-neutral-800/80 p-1 flex items-center justify-center relative overflow-hidden"
          >
            {activeTab === 'reach' && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={analytics.dailyProjections}
                  margin={{ top: 8, right: 8, left: -26, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="reachGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#c084fc" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.05} />
                    </linearGradient>
                    <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.7} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="day"
                    stroke="#71717a"
                    fontSize={9}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#71717a"
                    fontSize={9}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => (val >= 1000 ? `${Math.round(val / 1000)}k` : val)}
                  />
                  <Tooltip content={<CustomChartTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="reach"
                    name="Reach"
                    stroke="#c084fc"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#reachGradient)"
                  />
                  <Area
                    type="monotone"
                    dataKey="views"
                    name="Views"
                    stroke="#06b6d4"
                    strokeWidth={1.5}
                    fillOpacity={1}
                    fill="url(#viewsGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}

            {activeTab === 'themes' && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={analytics.themeMetrics}
                  margin={{ top: 8, right: 6, left: -24, bottom: 0 }}
                >
                  <XAxis
                    dataKey="shortName"
                    stroke="#71717a"
                    fontSize={9}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#71717a"
                    fontSize={9}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => `${val}`}
                  />
                  <Tooltip content={<CustomChartTooltip />} />
                  <Bar
                    dataKey="reach"
                    name="Projected Reach"
                    radius={[4, 4, 0, 0]}
                  >
                    {analytics.themeMetrics.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}

            {activeTab === 'radar' && (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart
                  data={analytics.pillarScores}
                  margin={{ top: 4, right: 12, left: 12, bottom: 4 }}
                >
                  <PolarGrid stroke="#27272a" />
                  <PolarAngleAxis
                    dataKey="subject"
                    stroke="#a1a1aa"
                    fontSize={8.5}
                    tickLine={false}
                  />
                  <PolarRadiusAxis
                    angle={30}
                    domain={[0, 100]}
                    stroke="#3f3f46"
                    fontSize={7}
                    tick={false}
                    axisLine={false}
                  />
                  <Tooltip content={<CustomChartTooltip />} />
                  <Radar
                    name="Pillar Score"
                    dataKey="score"
                    stroke="#ec4899"
                    fill="#ec4899"
                    fillOpacity={0.45}
                  />
                </RadarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Theme Badges List */}
          <div id="growth-themes-pill-list" className="flex flex-wrap gap-1 mt-0.5">
            {analytics.themeMetrics.map((theme, idx) => (
              <div
                key={`theme-tag-${idx}`}
                className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[9.5px] font-medium bg-neutral-900/90 border border-neutral-800 text-neutral-300"
              >
                <span
                  className="w-1.5 h-1.5 rounded-full inline-block"
                  style={{ backgroundColor: theme.color }}
                />
                <span>{theme.shortName}</span>
                <span className="text-neutral-500 font-mono">({theme.count})</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GrowthMetrics;
