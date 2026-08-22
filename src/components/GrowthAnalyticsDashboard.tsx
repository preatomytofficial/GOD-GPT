import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Cell,
  CartesianGrid,
} from 'recharts';
import {
  TrendingUp,
  BarChart2,
  Flame,
  Zap,
  RefreshCw,
  Target,
  Sparkles,
  Layers,
  Activity,
  Award,
  ArrowUpRight,
  MessageSquare,
  Image as ImageIcon,
  Calendar,
  Clock,
  CheckCircle2,
  FileText,
  Radio,
} from 'lucide-react';
import { SavedChat, GalleryItem, FullAnalyticsData } from '../types';
import { computeFullAnalytics } from '../utils/metricsCalculator';

// Custom Tooltip for Recharts
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
        className="bg-neutral-900/95 backdrop-blur-md border border-purple-500/30 px-3.5 py-2.5 rounded-xl shadow-2xl text-xs z-50 pointer-events-none"
        style={{ boxShadow: '0 12px 28px rgba(0, 0, 0, 0.7), 0 0 16px rgba(139, 92, 246, 0.3)' }}
      >
        <p className="font-bold text-neutral-100 mb-1.5 flex items-center gap-1.5 border-b border-neutral-800 pb-1.5">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>{label}</span>
        </p>
        {payload.map((entry, index) => (
          <div key={`item-${index}`} className="flex items-center justify-between gap-4 text-neutral-300 py-0.5">
            <span className="flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 rounded-full inline-block"
                style={{ backgroundColor: entry.color || '#a855f7' }}
              />
              <span className="capitalize text-neutral-400">{entry.name}:</span>
            </span>
            <span className="font-bold text-purple-200">
              {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const GrowthAnalyticsDashboard: React.FC = () => {
  const [chats, setChats] = useState<SavedChat[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [chartView, setChartView] = useState<'reach' | 'activity' | 'engagement'>('reach');
  const [timeframe, setTimeframe] = useState<'7d' | '14d' | 'today' | 'lifetime'>('7d');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('Just now');

  // Load chats & gallery data from localStorage
  const loadData = useCallback(() => {
    try {
      const rawChats = localStorage.getItem('godgpt_chats');
      if (rawChats) {
        const parsedChats = JSON.parse(rawChats);
        setChats(Array.isArray(parsedChats) ? parsedChats : []);
      } else {
        setChats([]);
      }

      const rawGallery = localStorage.getItem('godgpt_gallery');
      if (rawGallery) {
        const parsedGallery = JSON.parse(rawGallery);
        setGallery(Array.isArray(parsedGallery) ? parsedGallery : []);
      } else {
        setGallery([]);
      }

      const now = new Date();
      setLastSyncTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    } catch (err) {
      console.error('Failed to load analytics data from storage:', err);
    }
  }, []);

  useEffect(() => {
    loadData();

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'godgpt_chats' || e.key === 'godgpt_gallery') {
        loadData();
      }
    };

    const handleCustomUpdate = () => {
      loadData();
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('godgpt:chats-updated', handleCustomUpdate);
    window.addEventListener('godgpt:gallery-updated', handleCustomUpdate);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('godgpt:chats-updated', handleCustomUpdate);
      window.removeEventListener('godgpt:gallery-updated', handleCustomUpdate);
    };
  }, [loadData]);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    loadData();
    setTimeout(() => setIsRefreshing(false), 450);
  };

  // Compute full analytics result
  const analytics: FullAnalyticsData = useMemo(() => {
    return computeFullAnalytics(chats, gallery);
  }, [chats, gallery]);

  // Filter daily records according to selected timeframe
  const displayedDailyRecords = useMemo(() => {
    if (timeframe === '7d') {
      return analytics.dailyRecords.slice(-7);
    }
    if (timeframe === 'today') {
      return analytics.dailyRecords.slice(-1);
    }
    // 14d and lifetime show all 14 computed recent days
    return analytics.dailyRecords;
  }, [analytics.dailyRecords, timeframe]);

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  const handleSwitchToChat = () => {
    const chatTabBtn = document.getElementById('tab-btn-chat');
    if (chatTabBtn) {
      chatTabBtn.click();
    }
  };

  const formatTimeAgo = (timestampStr: string): string => {
    try {
      const date = new Date(timestampStr);
      if (isNaN(date.getTime())) return 'Recently';
      const diffSec = Math.floor((Date.now() - date.getTime()) / 1000);
      if (diffSec < 60) return 'Just now';
      if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
      if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return 'Recently';
    }
  };

  return (
    <div id="growth-analytics-dashboard" className="growth-analytics-dashboard">
      {/* Header Banner */}
      <div className="growth-dash-header glass-card">
        <div className="growth-dash-header-left">
          <div className="growth-header-badge">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="growth-dash-title">Growth & Strategy Analytics</h1>
              <div className="flex items-center gap-1 bg-emerald-950/70 border border-emerald-500/30 px-2 py-0.5 rounded-full text-[11px] font-semibold text-emerald-300">
                <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                <span>Live Lifetime Tracking</span>
              </div>
            </div>
            <p className="growth-dash-subtitle">
              Real-time lifetime aggregates and daily activity metrics synced directly with your GOD GPT conversations & Image Studio creations.
            </p>
          </div>
        </div>

        <div className="growth-dash-header-actions">
          <div className="timeframe-selector">
            <button
              type="button"
              className={`timeframe-btn ${timeframe === 'today' ? 'active' : ''}`}
              onClick={() => setTimeframe('today')}
            >
              Today
            </button>
            <button
              type="button"
              className={`timeframe-btn ${timeframe === '7d' ? 'active' : ''}`}
              onClick={() => setTimeframe('7d')}
            >
              7 Days
            </button>
            <button
              type="button"
              className={`timeframe-btn ${timeframe === '14d' ? 'active' : ''}`}
              onClick={() => setTimeframe('14d')}
            >
              14 Days
            </button>
            <button
              type="button"
              className={`timeframe-btn ${timeframe === 'lifetime' ? 'active' : ''}`}
              onClick={() => setTimeframe('lifetime')}
            >
              Lifetime
            </button>
          </div>

          <button
            type="button"
            className="btn-glass refresh-analytics-btn"
            onClick={handleManualRefresh}
            title="Sync latest chat and image stats"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-purple-400' : ''}`} />
            <span>Sync ({lastSyncTime})</span>
          </button>
        </div>
      </div>

      {/* 5 Real Lifetime & Daily KPI Cards */}
      <div className="growth-kpi-row">
        {/* KPI 1: Lifetime Reach */}
        <div className="growth-kpi-card glass-card kpi-border-cyan">
          <div className="kpi-card-header">
            <span className="kpi-card-label">Lifetime Est. Reach</span>
            <div className="kpi-icon-wrap icon-cyan">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="kpi-card-val-row">
            <span className="kpi-card-value text-cyan-400">
              +{formatNumber(analytics.lifetime.lifetimeReach)}
            </span>
            <span className="kpi-trend-badge trend-up">
              <ArrowUpRight className="w-3 h-3" />
              <span>Real-time</span>
            </span>
          </div>
          <p className="kpi-card-desc">
            Today: +{formatNumber(analytics.todayStats.reach)} impressions
          </p>
        </div>

        {/* KPI 2: Lifetime Prompts & AI Words */}
        <div className="growth-kpi-card glass-card kpi-border-purple">
          <div className="kpi-card-header">
            <span className="kpi-card-label">Prompts & Output</span>
            <div className="kpi-icon-wrap icon-purple">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="kpi-card-val-row">
            <span className="kpi-card-value text-purple-300">
              {analytics.lifetime.totalPrompts}{' '}
              <span className="text-xs font-normal text-neutral-400">Prompts</span>
            </span>
            <span className="kpi-trend-badge trend-purple">
              {formatNumber(analytics.lifetime.totalWordsGenerated)} words
            </span>
          </div>
          <p className="kpi-card-desc">
            Across {analytics.lifetime.totalChats} saved chat conversations
          </p>
        </div>

        {/* KPI 3: Virality Score */}
        <div className="growth-kpi-card glass-card kpi-border-pink">
          <div className="kpi-card-header">
            <span className="kpi-card-label">Virality Index</span>
            <div className="kpi-icon-wrap icon-pink">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="kpi-card-val-row">
            <span className="kpi-card-value text-pink-400">{analytics.lifetime.averageVirality}%</span>
            <span className="kpi-trend-badge trend-purple">High Potential</span>
          </div>
          <p className="kpi-card-desc">
            Dominant Focus: <strong className="text-neutral-200">{analytics.dominantTheme}</strong>
          </p>
        </div>

        {/* KPI 4: Image Studio Outputs & Streak */}
        <div className="growth-kpi-card glass-card kpi-border-emerald">
          <div className="kpi-card-header">
            <span className="kpi-card-label">Visuals & Streak</span>
            <div className="kpi-icon-wrap icon-emerald">
              <ImageIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="kpi-card-val-row">
            <span className="kpi-card-value text-emerald-400">
              {analytics.lifetime.totalImages}{' '}
              <span className="text-xs font-normal text-neutral-400">Images</span>
            </span>
            <span className="kpi-trend-badge trend-emerald">
              🔥 {analytics.lifetime.currentStreak} Day Streak
            </span>
          </div>
          <p className="kpi-card-desc">
            Active in {analytics.lifetime.activeDaysCount} day{analytics.lifetime.activeDaysCount > 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Main Visualizations Grid */}
      <div className="growth-charts-grid">
        {/* Left Chart Card: Daily Time-Series (Area / Bar / Line) */}
        <div className="growth-chart-card glass-card chart-main-col">
          <div className="growth-chart-card-header">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-400" />
              <div>
                <h3 className="chart-card-title">Daily Performance & Trajectory</h3>
                <p className="chart-card-subtitle">
                  Daily recorded prompts, words generated, and reach for each date
                </p>
              </div>
            </div>

            <div className="chart-view-tabs">
              <button
                type="button"
                className={`chart-view-tab ${chartView === 'reach' ? 'active' : ''}`}
                onClick={() => setChartView('reach')}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Reach Area</span>
              </button>
              <button
                type="button"
                className={`chart-view-tab ${chartView === 'activity' ? 'active' : ''}`}
                onClick={() => setChartView('activity')}
              >
                <BarChart2 className="w-3.5 h-3.5" />
                <span>Daily Prompts & Words</span>
              </button>
              <button
                type="button"
                className={`chart-view-tab ${chartView === 'engagement' ? 'active' : ''}`}
                onClick={() => setChartView('engagement')}
              >
                <Flame className="w-3.5 h-3.5" />
                <span>Engagement Curve</span>
              </button>
            </div>
          </div>

          <div className="chart-canvas-wrapper h-80">
            <ResponsiveContainer width="100%" height="100%">
              {chartView === 'reach' ? (
                <AreaChart
                  data={displayedDailyRecords}
                  margin={{ top: 15, right: 20, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="mainReachGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a855f7" stopOpacity={0.75} />
                      <stop offset="95%" stopColor="#a855f7" stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="mainViewsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.65} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis
                    dataKey="shortDay"
                    stroke="#a1a1aa"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#a1a1aa"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => (val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val)}
                  />
                  <Tooltip content={<CustomChartTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="estimatedReach"
                    name="Daily Reach"
                    stroke="#c084fc"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#mainReachGrad)"
                  />
                  <Area
                    type="monotone"
                    dataKey="wordsGenerated"
                    name="Words Generated"
                    stroke="#22d3ee"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#mainViewsGrad)"
                  />
                </AreaChart>
              ) : chartView === 'activity' ? (
                <BarChart
                  data={displayedDailyRecords}
                  margin={{ top: 15, right: 20, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis
                    dataKey="shortDay"
                    stroke="#a1a1aa"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#a1a1aa"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => `${val}`}
                  />
                  <Tooltip content={<CustomChartTooltip />} />
                  <Bar
                    dataKey="promptsCount"
                    name="User Prompts"
                    fill="#a855f7"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="aiResponsesCount"
                    name="AI Responses"
                    fill="#ec4899"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="imagesCount"
                    name="Images Created"
                    fill="#06b6d4"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              ) : (
                <LineChart
                  data={displayedDailyRecords}
                  margin={{ top: 15, right: 20, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis
                    dataKey="shortDay"
                    stroke="#a1a1aa"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#a1a1aa"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => (val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val)}
                  />
                  <Tooltip content={<CustomChartTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="engagement"
                    name="Engagement Interactions"
                    stroke="#ec4899"
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#ec4899', strokeWidth: 2, stroke: '#ffffff' }}
                    activeDot={{ r: 7, fill: '#ec4899', stroke: '#ffffff' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="viralityScore"
                    name="Virality Score (%)"
                    stroke="#a855f7"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={{ r: 3, fill: '#a855f7' }}
                  />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>

          <div className="chart-footer-metrics">
            <div className="footer-metric-pill">
              <span className="dot dot-purple"></span>
              <span className="text-neutral-400">Total Period Reach:</span>
              <strong className="text-purple-200 font-mono">
                {formatNumber(displayedDailyRecords.reduce((a, b) => a + b.estimatedReach, 0))}
              </strong>
            </div>
            <div className="footer-metric-pill">
              <span className="dot dot-cyan"></span>
              <span className="text-neutral-400">Total Period Prompts:</span>
              <strong className="text-cyan-200 font-mono">
                {displayedDailyRecords.reduce((a, b) => a + b.promptsCount, 0)}
              </strong>
            </div>
            <div className="footer-metric-pill">
              <span className="dot" style={{ backgroundColor: '#ec4899' }}></span>
              <span className="text-neutral-400">Period AI Words:</span>
              <strong className="text-pink-200 font-mono">
                {formatNumber(displayedDailyRecords.reduce((a, b) => a + b.wordsGenerated, 0))}
              </strong>
            </div>
          </div>
        </div>

        {/* Right Side: Strategy Pillar Diagnostics Radar */}
        <div className="growth-chart-card glass-card chart-side-col">
          <div className="growth-chart-card-header">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-pink-400" />
              <div>
                <h3 className="chart-card-title">Strategy Pillar Diagnostics</h3>
                <p className="chart-card-subtitle">5-Axis Social Media Balance Index</p>
              </div>
            </div>
          </div>

          <div className="chart-canvas-wrapper h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart
                data={analytics.pillarScores}
                margin={{ top: 10, right: 20, left: 20, bottom: 10 }}
              >
                <PolarGrid stroke="#334155" strokeOpacity={0.6} />
                <PolarAngleAxis
                  dataKey="subject"
                  stroke="#cbd5e1"
                  fontSize={11}
                  tickLine={false}
                />
                <PolarRadiusAxis
                  angle={30}
                  domain={[0, 100]}
                  stroke="#475569"
                  fontSize={9}
                  tick={false}
                  axisLine={false}
                />
                <Tooltip content={<CustomChartTooltip />} />
                <Radar
                  name="Score Index"
                  dataKey="score"
                  stroke="#ec4899"
                  fill="#ec4899"
                  fillOpacity={0.45}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="radar-legend-list">
            {analytics.pillarScores.map((p, i) => (
              <div key={`pillar-${i}`} className="radar-score-chip">
                <span className="pillar-name">{p.subject}</span>
                <span className="pillar-score">{p.score}/100</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Second Row: Themes Distribution & Real Activity Log */}
      <div className="growth-charts-grid mt-4">
        {/* Themes Bar Chart & Share Breakdown */}
        <div className="growth-chart-card glass-card chart-main-col">
          <div className="growth-chart-card-header">
            <div className="flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-cyan-400" />
              <div>
                <h3 className="chart-card-title">Theme Reach & Topic Volume</h3>
                <p className="chart-card-subtitle">
                  Categorized breakdown of all your conversations & prompts
                </p>
              </div>
            </div>
          </div>

          <div className="chart-canvas-wrapper h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={analytics.themeMetrics}
                margin={{ top: 15, right: 15, left: -10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis
                  dataKey="shortName"
                  stroke="#a1a1aa"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#a1a1aa"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `${val}`}
                />
                <Tooltip content={<CustomChartTooltip />} />
                <Bar dataKey="reach" name="Projected Reach" radius={[6, 6, 0, 0]}>
                  {analytics.themeMetrics.map((entry, index) => (
                    <Cell key={`bar-cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Theme Meta Badges */}
          <div className="themes-badge-row">
            {analytics.themeMetrics.map((item, idx) => (
              <div key={`theme-badge-${idx}`} className="theme-meta-card">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="font-semibold text-neutral-200 text-xs">{item.name}</span>
                  </div>
                  <span className="text-[10px] text-purple-300 font-mono bg-purple-950/60 px-1.5 py-0.5 rounded border border-purple-800/40">
                    {item.count} Chats ({item.percentage}%)
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-neutral-400 mt-1">
                  <span>
                    Reach: <strong className="text-neutral-200">+{formatNumber(item.reach)}</strong>
                  </span>
                  <span>
                    Virality: <strong className="text-pink-400">{item.virality}%</strong>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Real Live Activity History Log */}
        <div className="growth-chart-card glass-card chart-side-col flex flex-col justify-between">
          <div>
            <div className="growth-chart-card-header">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="chart-card-title">Live Activity Log</h3>
                  <p className="chart-card-subtitle">Real-time Prompt & Image History</p>
                </div>
              </div>
            </div>

            <div className="activity-timeline-list">
              {analytics.recentActivities.length > 0 ? (
                analytics.recentActivities.map((act) => (
                  <div key={act.id} className="activity-timeline-item">
                    <div
                      className={`activity-icon-bullet ${
                        act.type === 'image_generated' ? 'bullet-cyan' : 'bullet-purple'
                      }`}
                    >
                      {act.type === 'image_generated' ? (
                        <ImageIcon className="w-3.5 h-3.5" />
                      ) : (
                        <FileText className="w-3.5 h-3.5" />
                      )}
                    </div>
                    <div className="activity-details">
                      <div className="flex items-center justify-between gap-2">
                        <span className="activity-title truncate">{act.title}</span>
                        <span className="activity-time">{formatTimeAgo(act.timestamp)}</span>
                      </div>
                      <p className="activity-desc">{act.description}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-activity-placeholder text-center py-6 text-neutral-500 text-xs">
                  <MessageSquare className="w-6 h-6 mx-auto mb-2 opacity-40" />
                  <p>No activity records yet.</p>
                  <p className="text-[11px] text-neutral-600 mt-0.5">
                    Start a chat or generate an image to record real metrics!
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="rec-action-box mt-4">
            <button
              type="button"
              className="btn btn-primary w-full py-2.5 text-xs font-bold"
              onClick={handleSwitchToChat}
            >
              <Sparkles className="w-4 h-4" />
              <span>Ask GOD GPT for New Viral Script</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GrowthAnalyticsDashboard;
