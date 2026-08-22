import {
  SavedChat,
  GalleryItem,
  ActivityLogItem,
  DailyActivityRecord,
  LifetimeStats,
  ThemeMetric,
  PillarScore,
  FullAnalyticsData,
} from '../types';

const THEME_DEFINITIONS = [
  {
    key: 'hooks',
    name: 'Viral Hooks & Scripts',
    shortName: 'Hooks',
    keywords: ['hook', 'script', 'reel', 'short', 'tiktok', 'intro', 'viral', 'retention', 'storyboard', '3-sec', '3s', 'youtube', 'video', 'capcut', 'caption'],
    baseVirality: 95,
    baseRetention: 91,
    reachMultiplier: 1950,
    color: '#ec4899', // Pink
    glowColor: 'rgba(236, 72, 153, 0.4)',
  },
  {
    key: 'algorithm',
    name: 'Algorithm & SEO',
    shortName: 'Algo/SEO',
    keywords: ['algo', 'algorithm', 'seo', 'tag', 'keyword', 'rank', 'reach', 'shadowban', 'explore', 'page', 'hashtag', 'trend', 'analytics', 'traffic', 'views'],
    baseVirality: 90,
    baseRetention: 86,
    reachMultiplier: 2300,
    color: '#8b5cf6', // Violet
    glowColor: 'rgba(139, 92, 246, 0.4)',
  },
  {
    key: 'audience',
    name: 'Audience & Monetization',
    shortName: 'Monetize',
    keywords: ['follower', 'subscriber', 'growth', 'monetiz', 'sponsor', 'brand', 'money', 'revenue', 'convert', 'lead', 'client', 'sales', 'business', 'affiliate', 'deal'],
    baseVirality: 92,
    baseRetention: 94,
    reachMultiplier: 1800,
    color: '#06b6d4', // Cyan
    glowColor: 'rgba(6, 182, 212, 0.4)',
  },
  {
    key: 'visuals',
    name: 'Visuals & Thumbnails',
    shortName: 'Visuals',
    keywords: ['thumbnail', 'cover', 'image', 'photo', 'art', 'design', 'font', 'color', 'banner', 'logo', 'visual', 'graphic', 'render', 'poster', 'wallpaper', 'midjourney', 'dalle'],
    baseVirality: 97,
    baseRetention: 89,
    reachMultiplier: 2500,
    color: '#3b82f6', // Blue
    glowColor: 'rgba(59, 130, 246, 0.4)',
  },
  {
    key: 'tech',
    name: 'Tech & Code Logic',
    shortName: 'Tech',
    keywords: ['code', 'bug', 'javascript', 'python', 'react', 'api', 'server', 'function', 'database', 'html', 'css', 'node', 'typescript', 'sql', 'backend', 'frontend'],
    baseVirality: 84,
    baseRetention: 96,
    reachMultiplier: 1200,
    color: '#10b981', // Emerald
    glowColor: 'rgba(16, 185, 129, 0.4)',
  },
  {
    key: 'general',
    name: 'AI Strategy & Ideas',
    shortName: 'Strategy',
    keywords: ['strategy', 'idea', 'plan', 'help', 'question', 'god', 'gpt', 'ultra', 'pro', 'prompt', 'write', 'preatom', 'master', 'learn', 'ai'],
    baseVirality: 88,
    baseRetention: 84,
    reachMultiplier: 1500,
    color: '#f59e0b', // Amber
    glowColor: 'rgba(245, 158, 11, 0.4)',
  },
];

// Helper: Count words in a string
function countWords(str: string): number {
  if (!str) return 0;
  return str.trim().split(/\s+/).filter(Boolean).length;
}

// Helper: Format Date string to YYYY-MM-DD in local time
function toLocalDateKey(dateObj: Date): string {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, '0');
  const d = String(dateObj.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function computeFullAnalytics(
  chats: SavedChat[],
  gallery: GalleryItem[] = []
): FullAnalyticsData {
  const now = new Date();
  const todayKey = toLocalDateKey(now);

  // 1. Calculate Lifetime Aggregates
  let totalPrompts = 0;
  let totalAiReplies = 0;
  let totalWordsGenerated = 0;
  let totalCharacters = 0;
  const datesSet = new Set<string>();

  // Map of daily counters: dateKey -> { prompts, aiReplies, words, images, reach }
  const dailyMap: Record<
    string,
    {
      prompts: number;
      aiReplies: number;
      words: number;
      images: number;
      reach: number;
    }
  > = {};

  const initDailyEntry = (dKey: string) => {
    if (!dailyMap[dKey]) {
      dailyMap[dKey] = { prompts: 0, aiReplies: 0, words: 0, images: 0, reach: 0 };
    }
  };

  // Track theme distributions
  const themeCounts: Record<string, { count: number; words: number }> = {
    hooks: { count: 0, words: 0 },
    algorithm: { count: 0, words: 0 },
    audience: { count: 0, words: 0 },
    visuals: { count: 0, words: 0 },
    tech: { count: 0, words: 0 },
    general: { count: 0, words: 0 },
  };

  // Recent generated activities
  const recentActivities: ActivityLogItem[] = [];

  // Iterate over chats & messages
  chats.forEach((chat) => {
    const chatDate = chat.createdAt ? new Date(chat.createdAt) : now;
    const chatDateKey = !isNaN(chatDate.getTime()) ? toLocalDateKey(chatDate) : todayKey;
    datesSet.add(chatDateKey);

    const chatTextForTheme = (
      (chat.title || '') +
      ' ' +
      (chat.messages || []).map((m) => m.content || '').join(' ')
    ).toLowerCase();

    // Find theme category
    let matchedThemeKey = 'general';
    for (const def of THEME_DEFINITIONS) {
      if (def.key === 'general') continue;
      if (def.keywords.some((kw) => chatTextForTheme.includes(kw))) {
        matchedThemeKey = def.key;
        break;
      }
    }

    let chatWordCount = 0;

    (chat.messages || []).forEach((msg) => {
      const msgWords = countWords(msg.content);
      const msgChars = msg.content ? msg.content.length : 0;
      chatWordCount += msgWords;
      totalWordsGenerated += msgWords;
      totalCharacters += msgChars;

      const msgDate = msg.timestamp ? new Date(msg.timestamp) : chatDate;
      const msgDateKey = !isNaN(msgDate.getTime()) ? toLocalDateKey(msgDate) : chatDateKey;
      datesSet.add(msgDateKey);
      initDailyEntry(msgDateKey);

      if (msg.role === 'user') {
        totalPrompts += 1;
        dailyMap[msgDateKey].prompts += 1;

        // Add to activities
        recentActivities.push({
          id: msg.id || `act_${Date.now()}_${Math.random()}`,
          type: 'prompt',
          title: `Prompt: ${msg.content.slice(0, 45)}${msg.content.length > 45 ? '...' : ''}`,
          description: `Chat: "${chat.title || 'Untitled'}" • ${msgWords} words`,
          timestamp: msg.timestamp || chat.createdAt || now.toISOString(),
        });
      } else {
        totalAiReplies += 1;
        dailyMap[msgDateKey].aiReplies += 1;
        dailyMap[msgDateKey].words += msgWords;
        // Reach multiplier based on AI response density
        dailyMap[msgDateKey].reach += Math.round(msgWords * 8.5 + 40);
      }
    });

    themeCounts[matchedThemeKey].count += 1;
    themeCounts[matchedThemeKey].words += chatWordCount;
  });

  // Iterate over gallery images
  gallery.forEach((img) => {
    const imgDate = img.createdAt ? new Date(img.createdAt) : now;
    const imgDateKey = !isNaN(imgDate.getTime()) ? toLocalDateKey(imgDate) : todayKey;
    datesSet.add(imgDateKey);
    initDailyEntry(imgDateKey);

    dailyMap[imgDateKey].images += 1;
    dailyMap[imgDateKey].reach += 1400; // Visuals yield high reach
    themeCounts.visuals.count += 1;

    recentActivities.push({
      id: img.id || `img_${Date.now()}_${Math.random()}`,
      type: 'image_generated',
      title: `Generated Visual: ${img.prompt.slice(0, 40)}${img.prompt.length > 40 ? '...' : ''}`,
      description: `Image Studio HD Render`,
      timestamp: img.createdAt || now.toISOString(),
    });
  });

  // Calculate Streak
  let currentStreak = 0;
  const checkDate = new Date();
  while (true) {
    const key = toLocalDateKey(checkDate);
    if (datesSet.has(key) || (currentStreak === 0 && (chats.length > 0 || gallery.length > 0))) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }
  if (currentStreak === 0 && (chats.length > 0 || gallery.length > 0)) {
    currentStreak = 1;
  }

  // Calculate Theme Metrics
  const totalAllThemeCounts = Object.values(themeCounts).reduce((acc, v) => acc + v.count, 0) || 1;
  const themeMetrics: ThemeMetric[] = THEME_DEFINITIONS.map((def) => {
    const count = themeCounts[def.key].count;
    const words = themeCounts[def.key].words;
    const reach = count > 0 ? count * def.reachMultiplier + Math.floor(words * 4.2) : 0;
    const virality = count > 0 ? Math.min(99, def.baseVirality + (count > 2 ? 3 : 0)) : def.baseVirality - 4;
    const retention = count > 0 ? Math.min(98, def.baseRetention + (count > 1 ? 2 : 0)) : def.baseRetention - 4;
    const percentage = Math.round((count / totalAllThemeCounts) * 100);

    return {
      key: def.key,
      name: def.name,
      shortName: def.shortName,
      count,
      words,
      reach,
      virality,
      retention,
      percentage,
      color: def.color,
      glowColor: def.glowColor,
    };
  }).filter((m) => m.count > 0 || chats.length === 0);

  // If brand new with no chats, provide standard default starter metrics
  if (themeMetrics.length === 0) {
    themeMetrics.push({
      key: 'general',
      name: 'AI Strategy & Ideas',
      shortName: 'Strategy',
      count: 1,
      words: 120,
      reach: 1850,
      virality: 92,
      retention: 88,
      percentage: 100,
      color: '#f59e0b',
      glowColor: 'rgba(245, 158, 11, 0.4)',
    });
  }

  // Lifetime Reach calculation
  const calculatedLifetimeReach = themeMetrics.reduce((acc, t) => acc + t.reach, 0) + (gallery.length * 1250);
  const weightedVirality = Math.round(
    themeMetrics.reduce((acc, t) => acc + t.virality * Math.max(1, t.count), 0) /
      themeMetrics.reduce((acc, t) => acc + Math.max(1, t.count), 0)
  );

  // Top theme
  const topThemeItem = [...themeMetrics].sort((a, b) => b.count - a.count || b.reach - a.reach)[0];
  const dominantTheme = topThemeItem ? topThemeItem.shortName : 'Viral Hooks';

  // Build Daily Records (Last 14 Days continuous timeline)
  const dailyRecords: DailyActivityRecord[] = [];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateKey = toLocalDateKey(d);
    const shortDay = dayNames[d.getDay()];
    const dayLabel = `${shortDay}, ${monthNames[d.getMonth()]} ${d.getDate()}`;

    const recorded = dailyMap[dateKey] || { prompts: 0, aiReplies: 0, words: 0, images: 0, reach: 0 };

    // Baseline natural projection if historical day is empty
    const isToday = i === 0;
    const baseCurve = Math.max(1, Math.floor(calculatedLifetimeReach / 14));
    const dayReach = recorded.reach > 0
      ? recorded.reach
      : (isToday ? Math.max(450, Math.round(baseCurve * 0.85)) : Math.round(baseCurve * (0.6 + (i % 4) * 0.12)));

    const dayEngagement = Math.round(dayReach * 0.088 + recorded.words * 0.25);
    const dayVirality = Math.min(99, Math.round(weightedVirality - (i % 3) * 2 + (recorded.prompts > 0 ? 3 : 0)));

    dailyRecords.push({
      date: dateKey,
      dayLabel,
      shortDay: `${shortDay} ${d.getDate()}`,
      promptsCount: recorded.prompts,
      aiResponsesCount: recorded.aiReplies,
      imagesCount: recorded.images,
      wordsGenerated: recorded.words,
      estimatedReach: dayReach,
      viralityScore: dayVirality,
      engagement: dayEngagement,
    });
  }

  // 5 Pillar Diagnostics Scores
  const hasHooks = themeCounts.hooks.count > 0;
  const hasAlgo = themeCounts.algorithm.count > 0;
  const hasAudience = themeCounts.audience.count > 0;
  const hasVisuals = themeCounts.visuals.count > 0 || gallery.length > 0;

  const pillarScores: PillarScore[] = [
    {
      subject: 'Viral Hook',
      score: hasHooks ? Math.min(99, 88 + themeCounts.hooks.count * 3) : 84,
      fullMark: 100,
      description: '3-second curiosity trigger & script structure',
    },
    {
      subject: 'Algorithm',
      score: hasAlgo ? Math.min(98, 86 + themeCounts.algorithm.count * 3) : 78,
      fullMark: 100,
      description: 'Keyword density, SEO tags, & search reach',
    },
    {
      subject: 'Audience',
      score: hasAudience ? Math.min(98, 85 + themeCounts.audience.count * 3) : 80,
      fullMark: 100,
      description: 'Conversion to followers, clients, & revenue',
    },
    {
      subject: 'Visuals',
      score: hasVisuals ? Math.min(99, 90 + (themeCounts.visuals.count + gallery.length) * 2) : 82,
      fullMark: 100,
      description: 'Thumbnail CTR, aspect ratio, and color pop',
    },
    {
      subject: 'Retention',
      score: weightedVirality > 90 ? 95 : 86,
      fullMark: 100,
      description: 'Watch-time pacing & audience re-watch rate',
    },
  ];

  // Sort recent activities by timestamp descending
  recentActivities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // Today specific stats
  const todayEntry = dailyMap[todayKey] || { prompts: 0, aiReplies: 0, words: 0, images: 0, reach: 0 };
  const todayRecord = dailyRecords[dailyRecords.length - 1];

  // Dates
  const sortedDates = Array.from(datesSet).sort();
  const firstActiveDate = sortedDates[0] || todayKey;
  const lastActiveDate = sortedDates[sortedDates.length - 1] || todayKey;

  const lifetime: LifetimeStats = {
    totalChats: chats.length,
    totalPrompts,
    totalAiReplies,
    totalMessages: totalPrompts + totalAiReplies,
    totalWordsGenerated,
    totalCharacters,
    totalImages: gallery.length,
    lifetimeReach: Math.max(calculatedLifetimeReach, 2400),
    averageVirality: weightedVirality,
    activeDaysCount: Math.max(1, datesSet.size),
    currentStreak,
    firstActiveDate,
    lastActiveDate,
  };

  return {
    lifetime,
    dailyRecords,
    themeMetrics,
    pillarScores,
    recentActivities: recentActivities.slice(0, 8),
    dominantTheme,
    todayStats: {
      prompts: todayEntry.prompts,
      words: todayEntry.words,
      images: todayEntry.images,
      reach: todayRecord ? todayRecord.estimatedReach : 1200,
      virality: todayRecord ? todayRecord.viralityScore : 92,
    },
  };
}

// Backward-compatible wrapper for legacy references
export function analyzeChatThemes(chats: SavedChat[]) {
  const data = computeFullAnalytics(chats, []);
  return {
    themeMetrics: data.themeMetrics,
    totalChats: data.lifetime.totalChats,
    totalMessages: data.lifetime.totalMessages,
    overallVirality: data.lifetime.averageVirality,
    projectedReach: data.lifetime.lifetimeReach,
    topTheme: data.dominantTheme,
    dailyProjections: data.dailyRecords.map((r) => ({
      day: r.shortDay,
      views: r.wordsGenerated + 300,
      engagement: r.engagement,
      reach: r.estimatedReach,
    })),
    pillarScores: data.pillarScores,
  };
}
