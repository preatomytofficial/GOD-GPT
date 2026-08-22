export interface ChatMessage {
  id?: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
  model?: string;
}

export interface SavedChat {
  id: string;
  title: string;
  createdAt: string;
  updatedAt?: string;
  model: string;
  messages: ChatMessage[];
}

export interface GalleryItem {
  id: string;
  url: string;
  prompt: string;
  createdAt: string;
}

export interface ActivityLogItem {
  id: string;
  type: 'prompt' | 'chat_created' | 'image_generated' | 'chat_renamed' | 'ai_response';
  title: string;
  description: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface DailyActivityRecord {
  date: string; // YYYY-MM-DD
  dayLabel: string; // e.g. "Mon, Aug 22"
  shortDay: string; // e.g. "Mon"
  promptsCount: number;
  aiResponsesCount: number;
  imagesCount: number;
  wordsGenerated: number;
  estimatedReach: number;
  viralityScore: number;
  engagement: number;
}

export interface LifetimeStats {
  totalChats: number;
  totalPrompts: number;
  totalAiReplies: number;
  totalMessages: number;
  totalWordsGenerated: number;
  totalCharacters: number;
  totalImages: number;
  lifetimeReach: number;
  averageVirality: number;
  activeDaysCount: number;
  currentStreak: number;
  firstActiveDate: string;
  lastActiveDate: string;
}

export interface ThemeMetric {
  key: string;
  name: string;
  shortName: string;
  count: number;
  words: number;
  reach: number;
  virality: number;
  retention: number;
  percentage: number;
  color: string;
  glowColor: string;
}

export interface PillarScore {
  subject: string;
  score: number;
  fullMark: number;
  description: string;
}

export interface FullAnalyticsData {
  lifetime: LifetimeStats;
  dailyRecords: DailyActivityRecord[];
  themeMetrics: ThemeMetric[];
  pillarScores: PillarScore[];
  recentActivities: ActivityLogItem[];
  dominantTheme: string;
  todayStats: {
    prompts: number;
    words: number;
    images: number;
    reach: number;
    virality: number;
  };
}
