/**
 * Studious - Ultimate Study Companion (Enhanced JS)
 * Real-time features, analytics tracking, and dynamic content generation
 * Core Features: PDF + Video + Text chunking, Timer (Pomodoro), Flashcards, Themes, Persistence, Export
 * Dependencies: pdf.js (globally available as pdfjsLib from CDN)
 */

/* ==========================================================================
   UTILITIES & HELPERS
   ========================================================================== */
const Utils = (() => {
  const pad = (n) => (n < 10 ? '0' + n : '' + n);
  const formatClock = (totalSeconds) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${pad(m)}:${pad(s)}`;
  };
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  const debounce = (fn, delay = 200) => {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), delay);
    };
  };
  const createEl = (tag, cls, html) => {
    const el = document.createElement(tag);
    if (cls) el.className = cls;
    if (html !== undefined) el.innerHTML = html;
    return el;
  };
  const downloadJSON = (data, filename = 'studious-export.json') => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  const humanFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const thresh = 1024;
    if (Math.abs(bytes) < thresh) return bytes + ' B';
    const units = ['KB', 'MB', 'GB'];
    let u = -1;
    do {
      bytes /= thresh;
      ++u;
    } while (Math.abs(bytes) >= thresh && u < units.length - 1);
    return bytes.toFixed(1) + ' ' + units[u];
  };
  
  // Enhanced time management utilities
  const getWeekNumber = (date = new Date()) => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };
  
  const getDateString = (date = new Date()) => date.toISOString().split('T')[0];
  const getTimeString = (date = new Date()) => date.toTimeString().slice(0, 5);
  
  const isWithinTimeRange = (time, start, end) => {
    return time >= start && time <= end;
  };
  
  const calculateOptimalStudyTime = (userData) => {
    const performanceByHour = userData.performanceByHour || {};
    const consistencyScore = userData.consistencyScore || 0.5;
    
    // Find peak performance hours
    const peakHours = Object.entries(performanceByHour)
      .sort(([,a], [,b]) => (b.completionRate || 0) - (a.completionRate || 0))
      .slice(0, 3)
      .map(([hour]) => parseInt(hour));
      
    return {
      peakHours,
      suggestedDuration: Math.max(25, Math.min(60, 25 + (consistencyScore * 35))),
      breakDuration: Math.max(5, Math.min(15, 5 + (consistencyScore * 10)))
    };
  };
  
  const getStudyStreak = (studyDates) => {
    if (!studyDates || studyDates.length === 0) return 0;
    
    const sortedDates = [...studyDates].sort().reverse();
    let streak = 0;
    let expectedDate = new Date();
    
    for (const dateStr of sortedDates) {
      const studyDate = new Date(dateStr);
      const expectedDateStr = getDateString(expectedDate);
      
      if (dateStr === expectedDateStr) {
        streak++;
        expectedDate.setDate(expectedDate.getDate() - 1);
      } else {
        break;
      }
    }
    
    return streak;
  };
  
  return { 
    pad, formatClock, formatTime, debounce, createEl, downloadJSON, humanFileSize,
    getWeekNumber, getDateString, getTimeString, isWithinTimeRange, 
    calculateOptimalStudyTime, getStudyStreak
  };
})();

/* ==========================================================================
   PERSISTENCE LAYER WITH REAL-TIME SYNC
   ========================================================================== */
const Store = (() => {
  const KEY = 'studious_v3_state';
  const listeners = {};
  
  const load = () => {
    try {
      return JSON.parse(localStorage.getItem(KEY)) || {};
    } catch {
      return {};
    }
  };
  
  let state = load();
  
  const save = () => localStorage.setItem(KEY, JSON.stringify(state));
  
  const emit = (path, value) => {
    if (listeners[path]) {
      listeners[path].forEach(cb => cb(value));
    }
  };
  
  const set = (path, value) => {
    const parts = path.split('.');
    let cur = state;
    while (parts.length > 1) {
      const p = parts.shift();
      if (!cur[p]) cur[p] = {};
      cur = cur[p];
    }
    cur[parts[0]] = value;
    save();
    emit(path, value);
  };
  
  const get = (path, def = undefined) => {
    const parts = path.split('.');
    let cur = state;
    for (const p of parts) {
      if (cur && Object.prototype.hasOwnProperty.call(cur, p)) cur = cur[p];
      else return def;
    }
    return cur;
  };
  
  const watch = (path, callback) => {
    if (!listeners[path]) listeners[path] = [];
    listeners[path].push(callback);
    callback(get(path));
  };
  
  const merge = (path, obj) => {
    const existing = get(path, {});
    set(path, { ...existing, ...obj });
  };
  
  return { get, set, merge, watch, raw: () => state };
})();

/* ==========================================================================
   ANALYTICS & REAL-TIME TRACKING
   ========================================================================== */
const Analytics = (() => {
  let sessionStart = Date.now();
  let currentSessionTime = 0;
  let totalStudyTime = Store.get('stats.totalStudyTime', 0);
  let documentsStudied = Store.get('stats.documentsStudied', 0);
  let flashcardsCreated = Store.get('stats.flashcardsCreated', 0);
  let sessionsCompleted = Store.get('stats.sessionsCompleted', 0);
  
  const trackingInterval = setInterval(() => {
    currentSessionTime = Math.floor((Date.now() - sessionStart) / 1000);
    updateDashboard();
  }, 1000);
  
  const addStudyTime = (seconds) => {
    totalStudyTime += seconds;
    Store.set('stats.totalStudyTime', totalStudyTime);
    updateDashboard();
  };
  
  const incrementDocuments = () => {
    documentsStudied++;
    Store.set('stats.documentsStudied', documentsStudied);
    updateDashboard();
  };
  
  const incrementFlashcards = (count = 1) => {
    flashcardsCreated += count;
    Store.set('stats.flashcardsCreated', flashcardsCreated);
    updateDashboard();
  };
  
  const completeSession = () => {
    sessionsCompleted++;
    addStudyTime(currentSessionTime);
    Store.set('stats.sessionsCompleted', sessionsCompleted);
    sessionStart = Date.now();
    currentSessionTime = 0;
    updateDashboard();
  };
  
  const updateDashboard = () => {
    const formatStudyTime = (seconds) => {
      const h = Math.floor(seconds / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      return h > 0 ? `${h}h ${m}m` : `${m}m`;
    };
    
    const todayTime = formatStudyTime(totalStudyTime + currentSessionTime);
    const weeklyGoal = Store.get('goals.weeklyMinutes', 300);
    const weeklyProgress = Math.min(100, Math.round(((totalStudyTime + currentSessionTime) / 60 / weeklyGoal) * 100));
    
    // Update dashboard stat cards
    const statCards = document.querySelectorAll('.stat-card');
    statCards.forEach(card => {
      const value = card.querySelector('.stat-value');
      const label = card.querySelector('.stat-label');
      
      if (!value || !label) return;
      
      const labelText = label.textContent.toLowerCase();
      
      if (labelText.includes('study time')) {
        value.textContent = todayTime;
      } else if (labelText.includes('weekly goal')) {
        value.textContent = `${weeklyProgress}%`;
      } else if (labelText.includes('documents')) {
        value.textContent = documentsStudied;
      } else if (labelText.includes('flashcards')) {
        value.textContent = flashcardsCreated;
      }
    });
    
    // Update progress bars
    const progressBars = document.querySelectorAll('.progress-fill');
    progressBars.forEach(bar => {
      if (bar.closest('.stats-container')) {
        // This is likely the weekly progress bar
        bar.style.width = `${weeklyProgress}%`;
      }
    });
    
    // Update any progress percentage displays
    const progressTexts = document.querySelectorAll('.progress-percentage');
    progressTexts.forEach(text => {
      if (text.closest('.stats-container')) {
        text.textContent = `${weeklyProgress}%`;
      }
    });
  };
  
  const getStats = () => ({
    currentSessionTime,
    totalStudyTime,
    documentsStudied,
    flashcardsCreated,
    sessionsCompleted
  });
  
  return { 
    addStudyTime, 
    incrementDocuments, 
    incrementFlashcards, 
    completeSession, 
    updateDashboard, 
    getStats 
  };
})();

/* ==========================================================================
   ADVANCED ANALYTICS & TIME MANAGEMENT
   ========================================================================== */
const TimeManagement = (() => {
  // Initialize comprehensive analytics
  const initializeAnalytics = () => {
    const today = Utils.getDateString();
    if (!Store.get('analytics.initialized')) {
      Store.set('analytics', {
        initialized: true,
        dailyStats: {},
        weeklyGoals: {
          studyTimeMinutes: 840, // 14 hours per week
          sessionsTarget: 10,
          consistencyTarget: 5 // days per week
        },
        performanceByHour: {}, // Track performance by time of day
        studyHabits: {
          preferredTimes: [],
          avgSessionLength: 25,
          completionRate: 0.8,
          consistencyScore: 0.5
        },
        streaks: {
          current: 0,
          longest: 0,
          weeklyStreaks: 0,
          perfectDays: 0
        },
        rewards: {
          totalXP: 0,
          level: 1,
          achievements: [],
          milestones: []
        }
      });
    }
    
    // Ensure today's stats exist
    if (!Store.get(`analytics.dailyStats.${today}`)) {
      Store.set(`analytics.dailyStats.${today}`, {
        studyTime: 0,
        sessions: [],
        pagesRead: 0,
        flashcardsCreated: 0,
        focusScore: 0,
        timeSlots: {},
        goalsMet: [],
        breaks: []
      });
    }
  };

  const recordStudySession = (data) => {
    const today = Utils.getDateString();
    const hour = new Date().getHours();
    
    initializeAnalytics();
    
    // Record session details
    const sessionData = {
      start: data.sessionStart || new Date().toISOString(),
      end: data.sessionEnd || new Date().toISOString(),
      duration: data.duration || 1500,
      type: data.type || 'focus',
      completionRate: (data.duration / (data.plannedDuration || data.duration)),
      interruptions: data.interruptions || 0,
      hour: hour
    };
    
    // Update daily stats
    const sessions = Store.get(`analytics.dailyStats.${today}.sessions`, []);
    sessions.push(sessionData);
    Store.set(`analytics.dailyStats.${today}.sessions`, sessions);
    
    // Update time tracking
    Store.increment(`analytics.dailyStats.${today}.studyTime`, sessionData.duration);
    
    // Update performance by hour
    const hourKey = `analytics.performanceByHour.${hour}`;
    const hourData = Store.get(hourKey, { sessions: 0, totalTime: 0, completionRate: 0 });
    hourData.sessions += 1;
    hourData.totalTime += sessionData.duration;
    hourData.completionRate = (hourData.completionRate * (hourData.sessions - 1) + sessionData.completionRate) / hourData.sessions;
    Store.set(hourKey, hourData);
    
    // Calculate focus score
    const focusScore = calculateFocusScore(sessionData);
    Store.set(`analytics.dailyStats.${today}.focusScore`, 
      (Store.get(`analytics.dailyStats.${today}.focusScore`, 0) + focusScore) / sessions.length
    );
    
    updateHabits();
    checkDailyGoals();
    updateStreaks();
  };

  const calculateFocusScore = (sessionData) => {
    let score = 0.5; // Base score
    
    // Completion bonus
    score += Math.min(0.3, sessionData.completionRate * 0.3);
    
    // Duration bonus (sweet spot around 25-45 minutes)
    const minutes = sessionData.duration / 60;
    if (minutes >= 20 && minutes <= 50) {
      score += 0.2;
    }
    
    // Interruption penalty
    score -= Math.min(0.3, sessionData.interruptions * 0.1);
    
    // Time of day bonus (peak performance hours)
    const userData = Store.get('analytics.studyHabits', {});
    const peakHours = Utils.calculateOptimalStudyTime(userData).peakHours;
    if (peakHours.includes(sessionData.hour)) {
      score += 0.1;
    }
    
    return Math.max(0, Math.min(1, score));
  };

  const updateHabits = () => {
    const sessions = getAllRecentSessions(7); // Last 7 days
    if (sessions.length === 0) return;
    
    // Calculate average session length
    const avgLength = sessions.reduce((sum, s) => sum + s.duration, 0) / sessions.length / 60;
    
    // Calculate completion rate
    const completionRate = sessions.reduce((sum, s) => sum + s.completionRate, 0) / sessions.length;
    
    // Find preferred times
    const timeFrequency = {};
    sessions.forEach(s => {
      const hour = new Date(s.start).getHours();
      timeFrequency[hour] = (timeFrequency[hour] || 0) + 1;
    });
    
    const preferredTimes = Object.entries(timeFrequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([hour]) => parseInt(hour));
    
    // Calculate consistency score
    const uniqueDays = new Set(sessions.map(s => Utils.getDateString(new Date(s.start)))).size;
    const consistencyScore = Math.min(1, uniqueDays / 7);
    
    Store.set('analytics.studyHabits', {
      avgSessionLength: avgLength,
      completionRate,
      preferredTimes,
      consistencyScore
    });
  };

  const getAllRecentSessions = (days = 7) => {
    const sessions = [];
    const today = new Date();
    
    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = Utils.getDateString(date);
      
      const daySessions = Store.get(`analytics.dailyStats.${dateStr}.sessions`, []);
      sessions.push(...daySessions);
    }
    
    return sessions;
  };

  const checkDailyGoals = () => {
    const today = Utils.getDateString();
    const todayStats = Store.get(`analytics.dailyStats.${today}`, {});
    const goals = Store.get('analytics.weeklyGoals', {});
    
    const dailyTimeGoal = (goals.studyTimeMinutes || 840) / 7 * 60; // Convert to seconds per day
    const timeProgress = (todayStats.studyTime || 0) / dailyTimeGoal;
    
    const goalsMet = Store.get(`analytics.dailyStats.${today}.goalsMet`, []);
    
    // Check time goal
    if (timeProgress >= 1 && !goalsMet.includes('time')) {
      goalsMet.push('time');
      RewardSystem.addXP(50, 'daily time goal');
      Toasts.show('🎯 Daily time goal achieved!', 'success');
    }
    
    // Check session goal
    const sessionsToday = (todayStats.sessions || []).length;
    const dailySessionGoal = Math.ceil((goals.sessionsTarget || 10) / 7);
    if (sessionsToday >= dailySessionGoal && !goalsMet.includes('sessions')) {
      goalsMet.push('sessions');
      RewardSystem.addXP(30, 'session goal');
      Toasts.show('🎯 Daily session goal achieved!', 'success');
    }
    
    Store.set(`analytics.dailyStats.${today}.goalsMet`, goalsMet);
    
    // Check for perfect day
    if (goalsMet.length >= 2 && !goalsMet.includes('perfect')) {
      goalsMet.push('perfect');
      Store.increment('analytics.streaks.perfectDays');
      RewardSystem.addXP(100, 'perfect study day');
      Toasts.show('⭐ Perfect study day! All goals achieved!', 'success', 5000);
    }
  };

  const updateStreaks = () => {
    const today = Utils.getDateString();
    const yesterday = Utils.getDateString(new Date(Date.now() - 86400000));
    
    const todayStudied = (Store.get(`analytics.dailyStats.${today}.studyTime`, 0) > 0);
    const yesterdayStudied = (Store.get(`analytics.dailyStats.${yesterday}.studyTime`, 0) > 0);
    
    let currentStreak = Store.get('analytics.streaks.current', 0);
    const longestStreak = Store.get('analytics.streaks.longest', 0);
    
    if (todayStudied) {
      if (yesterdayStudied || currentStreak === 0) {
        currentStreak = yesterdayStudied ? currentStreak + 1 : 1;
        Store.set('analytics.streaks.current', currentStreak);
        
        if (currentStreak > longestStreak) {
          Store.set('analytics.streaks.longest', currentStreak);
        }
        
        // Streak milestone rewards
        if (currentStreak > 1 && currentStreak % 7 === 0) {
          RewardSystem.addXP(100, `${currentStreak}-day streak milestone`);
          Toasts.show(`🔥 Amazing! ${currentStreak}-day study streak!`, 'success', 4000);
        }
      }
    }
  };

  const getOptimalStudySchedule = () => {
    const habits = Store.get('analytics.studyHabits', {});
    const performanceData = Store.get('analytics.performanceByHour', {});
    
    return Utils.calculateOptimalStudyTime({
      performanceByHour: performanceData,
      consistencyScore: habits.consistencyScore || 0.5
    });
  };

  const getDashboardData = () => {
    const today = Utils.getDateString();
    const todayStats = Store.get(`analytics.dailyStats.${today}`, {});
    const habits = Store.get('analytics.studyHabits', {});
    const streaks = Store.get('analytics.streaks', {});
    const goals = Store.get('analytics.weeklyGoals', {});
    
    const sessionsToday = (todayStats.sessions || []).length;
    const studyTimeToday = todayStats.studyTime || 0;
    const dailyTimeGoal = (goals.studyTimeMinutes || 840) / 7 * 60;
    
    return {
      todayProgress: {
        timeProgress: Math.min(100, (studyTimeToday / dailyTimeGoal) * 100),
        sessionCount: sessionsToday,
        focusScore: Math.round((todayStats.focusScore || 0) * 100),
        goalsMet: (todayStats.goalsMet || []).length
      },
      streaks: {
        current: streaks.current || 0,
        longest: streaks.longest || 0,
        perfectDays: streaks.perfectDays || 0
      },
      habits: {
        avgSession: Math.round(habits.avgSessionLength || 25),
        completionRate: Math.round((habits.completionRate || 0.8) * 100),
        consistencyScore: Math.round((habits.consistencyScore || 0.5) * 100),
        preferredTimes: habits.preferredTimes || []
      },
      recommendations: getOptimalStudySchedule()
    };
  };

  const generateInsights = () => {
    const data = getDashboardData();
    const insights = [];
    
    // Performance insights
    if (data.habits.completionRate < 70) {
      insights.push({
        type: 'warning',
        title: 'Focus Improvement',
        message: 'Consider shorter sessions to improve completion rate',
        action: 'Try 20-minute focus sessions'
      });
    }
    
    if (data.streaks.current === 0) {
      insights.push({
        type: 'info',
        title: 'Start Your Streak',
        message: 'Begin a study streak today for bonus rewards',
        action: 'Start a 25-minute session'
      });
    }
    
    // Consistency insights
    if (data.habits.consistencyScore < 50) {
      insights.push({
        type: 'tip',
        title: 'Build Consistency',
        message: 'Study at the same time daily to build habits',
        action: `Try studying at ${data.recommendations.peakHours[0] || 9}:00`
      });
    }
    
    return insights;
  };

  return {
    initializeAnalytics,
    recordStudySession,
    updateHabits,
    checkDailyGoals,
    updateStreaks,
    getDashboardData,
    generateInsights,
    getOptimalStudySchedule
  };
})();

/* ==========================================================================
   NOTIFICATION SYSTEM WITH REAL-TIME UPDATES
   ========================================================================== */
const Toasts = (() => {
  let container;
  const ensure = () => {
    if (!container) {
      container = Utils.createEl('div', 'toast-container');
      Object.assign(container.style, {
        position: 'fixed', top: '20px', right: '20px', zIndex: 9999,
        display: 'flex', flexDirection: 'column', gap: '10px'
      });
      document.body.appendChild(container);
    }
  };
  
  const show = (msg, type = 'info', timeout = 3000) => {
    ensure();
    const toast = Utils.createEl('div', `toast toast-${type}`, msg);
    Object.assign(toast.style, {
      background: '#fff', padding: '12px 18px', borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '0.9rem',
      borderLeft: '4px solid', borderColor: {
        info: '#4a6fa5', success: '#5cb85c', warning: '#f0ad4e', danger: '#d9534f'
      }[type] || '#4a6fa5',
      transform: 'translateX(100%)', opacity: '0',
      transition: 'all 0.3s ease'
    });
    
    container.appendChild(toast);
    
    setTimeout(() => {
      toast.style.transform = 'translateX(0)';
      toast.style.opacity = '1';
    }, 10);
    
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(20px)';
      setTimeout(() => toast.remove(), 300);
    }, timeout);
  };
  
  return { show };
})();

/* ==========================================================================
   REWARD SYSTEM - GAMIFICATION ENGINE
   ========================================================================== */
const RewardSystem = (() => {
  // Enhanced XP Configuration with time management bonuses
  const XP_RATES = {
    PAGE_READ: 10,
    MINUTE_STUDIED: 5,
    FLASHCARD_CREATED: 15,
    FLASHCARD_CORRECT: 8,
    SESSION_COMPLETED: 50,
    STREAK_BONUS: 25,
    PERFECT_DAY: 100,
    WEEKLY_GOAL: 150,
    EARLY_BIRD: 20,      // Studying before 9 AM
    NIGHT_OWL: 15,       // Studying after 9 PM
    CONSISTENCY: 30,     // Multiple sessions in a day
    FOCUS_MASTER: 40,    // Long focused sessions (45+ min)
    HABIT_BUILDER: 50,   // Studying at consistent times
    PEAK_PERFORMER: 35,  // Studying during peak hours
    MARATHON: 75,        // 3+ hour study day
    PRECISION: 25        // High completion rate
  };

  // Level progression (XP required for each level) - Enhanced for consistency rewards
  const LEVEL_THRESHOLDS = [
    0, 100, 250, 500, 1000, 1750, 2750, 4000, 5500, 7500, 10000,
    13000, 16500, 20500, 25000, 30000, 36000, 43000, 51000, 60000,
    75000, 95000, 120000, 150000, 185000, 225000, 270000, 320000, 375000, 435000
  ];

  // Enhanced achievements system with categories, rarities, and creative milestones
  const ACHIEVEMENT_CATEGORIES = {
    STARTER: { color: '#28a745', label: 'Starter' },
    HABIT: { color: '#007bff', label: 'Habit Builder' },
    FOCUS: { color: '#6f42c1', label: 'Focus Master' },
    MILESTONE: { color: '#fd7e14', label: 'Milestone' },
    CREATIVE: { color: '#e83e8c', label: 'Creative' },
    SEASONAL: { color: '#20c997', label: 'Seasonal' },
    LEGENDARY: { color: '#ffc107', label: 'Legendary' },
    SECRET: { color: '#6c757d', label: 'Secret' }
  };

  // Enhanced achievements focused on time management and consistency
  const ACHIEVEMENTS = {
    FIRST_STEPS: { id: 'first_steps', name: 'First Steps', desc: 'Complete your first study session', icon: '👶', xp: 25 },
    EARLY_BIRD: { id: 'early_bird', name: 'Early Bird', desc: 'Study before 9 AM for 7 days', icon: '🌅', xp: 150 },
    NIGHT_OWL: { id: 'night_owl', name: 'Night Owl', desc: 'Study after 9 PM for 7 days', icon: '🦉', xp: 150 },
    CONSISTENCY_MASTER: { id: 'consistency_master', name: 'Consistency Master', desc: 'Study at the same time for 14 days', icon: '⏰', xp: 300 },
    FOCUS_MASTER: { id: 'focus_master', name: 'Focus Master', desc: 'Complete 20 sessions of 45+ minutes', icon: '�', xp: 400 },
    PERFECT_WEEK: { id: 'perfect_week', name: 'Perfect Week', desc: 'Meet daily goals for 7 consecutive days', icon: '⭐', xp: 500 },
    STREAK_WARRIOR: { id: 'streak_warrior', name: 'Streak Warrior', desc: 'Maintain a 30-day streak', icon: '🔥', xp: 750 },
    TIME_MASTER: { id: 'time_master', name: 'Time Master', desc: 'Study for 100 hours total', icon: '👑', xp: 1000 },
    HABIT_ARCHITECT: { id: 'habit_architect', name: 'Habit Architect', desc: 'Study consistently for 90 days', icon: '🏗️', xp: 1200 },
    FLOW_STATE: { id: 'flow_state', name: 'Flow State', desc: 'Achieve 95%+ completion rate for 10 sessions', icon: '�', xp: 350 },
    MARATHON_RUNNER: { id: 'marathon_runner', name: 'Marathon Runner', desc: 'Study for 5+ hours in a single day', icon: '🏃', xp: 200 },
    PRECISION_EXPERT: { id: 'precision_expert', name: 'Precision Expert', desc: 'Maintain 90%+ weekly completion rate', icon: '🎯', xp: 400 },
    BOOKWORM: { id: 'bookworm', name: 'Bookworm', desc: 'Read 100 pages', icon: '📚', xp: 100 },
    FLASH_MASTER: { id: 'flash_master', name: 'Flash Master', desc: 'Create 50 flashcards', icon: '🃏', xp: 150 },
    SCHOLAR: { id: 'scholar', name: 'Scholar', desc: 'Reach level 15', icon: '🎓', xp: 750 }
  };

  let currentXP = Store.get('rewards.xp', 0);
  let currentLevel = Store.get('rewards.level', 1);
  let unlockedAchievements = Store.get('rewards.achievements', []);
  let studyStreak = Store.get('rewards.streak', 0);
  let lastStudyDate = Store.get('rewards.lastStudyDate', null);
  let dailyGoals = Store.get('rewards.dailyGoals', { pages: 0, time: 0, flashcards: 0 });

  const calculateLevel = (xp) => {
    for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
      if (xp >= LEVEL_THRESHOLDS[i]) return i + 1;
    }
    return 1;
  };

  const getXPForNextLevel = (level) => {
    return LEVEL_THRESHOLDS[level] || LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
  };

  const addXP = (amount, source = '') => {
    const oldLevel = currentLevel;
    currentXP += amount;
    currentLevel = calculateLevel(currentXP);
    
    Store.set('rewards.xp', currentXP);
    Store.set('rewards.level', currentLevel);
    
    updateDashboard();
    
    // Level up notification
    if (currentLevel > oldLevel) {
      Toasts.show(`🎉 Level Up! You reached Level ${currentLevel}!`, 'success', 5000);
      showAchievementNotification(`Level ${currentLevel} Unlocked!`, '🌟');
    }
    
    // XP notification
    if (amount > 0) {
      Toasts.show(`+${amount} XP ${source ? `for ${source}` : ''}`, 'info', 2000);
    }
    
    checkAchievements();
  };

  const checkAchievements = () => {
    const dashboardData = TimeManagement.getDashboardData();
    const newAchievements = [];

    // Check each achievement with enhanced tracking logic
    Object.values(ACHIEVEMENTS).forEach(achievement => {
      if (unlockedAchievements.includes(achievement.id)) return;
      
      let unlocked = false;
      const now = new Date();
      const currentHour = now.getHours();
      const currentMonth = now.getMonth() + 1; // 1-12
      const sessionsCompleted = Store.get('analytics.totalStats.sessionsCompleted', 0);
      const totalTime = Store.get('analytics.totalStats.studyTime', 0);
      
      switch (achievement.id) {
        // === STARTER ACHIEVEMENTS ===
        case 'first_steps':
          unlocked = dashboardData.streaks.current > 0 || sessionsCompleted > 0;
          break;
        case 'quick_learner':
          unlocked = sessionsCompleted >= 5;
          break;
        case 'getting_serious':
          unlocked = dashboardData.streaks.current >= 3;
          break;

        // === HABIT BUILDING ACHIEVEMENTS ===
        case 'early_bird':
          unlocked = Store.get('rewards.earlyBirdSessions', 0) >= 7;
          break;
        case 'night_owl':
          unlocked = Store.get('rewards.nightOwlSessions', 0) >= 7;
          break;
        case 'consistency_master':
          unlocked = Store.get('rewards.habitBuilderStreak', 0) >= 14;
          break;
        case 'weekend_warrior':
          unlocked = Store.get('rewards.weekendSessions', 0) >= 8;
          break;
        case 'habit_architect':
          unlocked = dashboardData.streaks.current >= 90;
          break;

        // === FOCUS ACHIEVEMENTS ===
        case 'focus_rookie':
          unlocked = Store.get('rewards.mediumFocusSessions', 0) >= 5;
          break;
        case 'focus_master':
          unlocked = Store.get('rewards.focusSessions', 0) >= 20;
          break;
        case 'flow_state':
          unlocked = Store.get('rewards.precisionSessions', 0) >= 10;
          break;
        case 'deep_dive':
          unlocked = Store.get('rewards.deepDiveSessions', 0) >= 1;
          break;
        case 'laser_focus':
          unlocked = Store.get('rewards.perfectSessions', 0) >= 50;
          break;

        // === MILESTONE ACHIEVEMENTS ===
        case 'perfect_week':
          const perfectDaysInWeek = Store.get('analytics.streaks.perfectDays', 0);
          unlocked = perfectDaysInWeek >= 7;
          break;
        case 'streak_warrior':
          unlocked = dashboardData.streaks.current >= 30;
          break;
        case 'centurion':
          unlocked = sessionsCompleted >= 100;
          break;
        case 'time_master':
          unlocked = totalTime >= 360000; // 100 hours in seconds
          break;
        case 'marathon_runner':
          const marathonDays = Object.keys(Store.get('rewards.marathonDay', {})).length;
          unlocked = marathonDays >= 1;
          break;
        case 'scholar':
          unlocked = currentLevel >= 15;
          break;

        // === CREATIVE ACHIEVEMENTS ===
        case 'bookworm':
          unlocked = Store.get('stats.pagesRead', 0) >= 100;
          break;
        case 'flash_master':
          unlocked = Store.get('analytics.totalStats.flashcardsCreated', 0) >= 50;
          break;
        case 'content_creator':
          unlocked = Store.get('rewards.uploadsCount', 0) >= 10;
          break;
        case 'knowledge_synthesizer':
          unlocked = Store.get('rewards.diverseFlashcards', 0) >= 5;
          break;
        case 'precision_expert':
          unlocked = dashboardData.habits.completionRate >= 90;
          break;

        // === SEASONAL ACHIEVEMENTS ===
        case 'new_year_resolution':
          unlocked = currentMonth === 1 && Store.get('rewards.januaryStreak', 0) >= 7;
          break;
        case 'spring_renewal':
          unlocked = [3, 4, 5].includes(currentMonth) && Store.get('rewards.springStreak', 0) >= 14;
          break;
        case 'summer_scholar':
          unlocked = [6, 7, 8].includes(currentMonth) && Store.get('rewards.summerTime', 0) >= 108000; // 30 hours
          break;
        case 'autumn_wisdom':
          unlocked = [9, 10, 11].includes(currentMonth) && Store.get('rewards.autumnLevel', 0) >= 10;
          break;
        case 'winter_perseverance':
          unlocked = [12, 1, 2].includes(currentMonth) && Store.get('rewards.winterSolstice', false);
          break;

        // === LEGENDARY ACHIEVEMENTS ===
        case 'dedication_incarnate':
          unlocked = dashboardData.streaks.current >= 365;
          break;
        case 'knowledge_titan':
          unlocked = currentXP >= 10000;
          break;
        case 'time_lord':
          unlocked = totalTime >= 3600000; // 1000 hours in seconds
          break;

        // === SECRET ACHIEVEMENTS ===
        case 'midnight_scholar':
          unlocked = Store.get('rewards.midnightSession', false);
          break;
        case 'speed_demon':
          unlocked = Store.get('rewards.speedSessions', 0) >= 5;
          break;
        case 'perfectionist':
          unlocked = Store.get('rewards.perfectPomodoros', 0) >= 25;
          break;
        case 'phoenix_rising':
          unlocked = Store.get('rewards.phoenixReturn', false);
          break;
        case 'lucky_seven':
          unlocked = Store.get('rewards.luckySevenSession', false);
          break;
      }
      
      if (unlocked) {
        newAchievements.push(achievement);
        unlockedAchievements.push(achievement.id);
      }
    });

    if (newAchievements.length > 0) {
      Store.set('rewards.achievements', unlockedAchievements);
      newAchievements.forEach(achievement => {
        showEnhancedAchievementNotification(achievement);
        addXP(achievement.xp, `Achievement: ${achievement.name}`);
      });
    }
  };

  const showEnhancedAchievementNotification = (achievement) => {
    const categoryInfo = ACHIEVEMENT_CATEGORIES[achievement.category] || {};
    const categoryColor = categoryInfo.color || '#007bff';
    const categoryLabel = categoryInfo.label || 'Achievement';
    
    // Create enhanced modal
    const modalHTML = `
      <div class="achievement-modal" id="achievement-modal-${achievement.id}">
        <div class="achievement-content enhanced">
          <div class="achievement-rarity ${achievement.rarity?.toLowerCase()}">${achievement.rarity || 'Common'}</div>
          <div class="achievement-icon-large">${achievement.icon}</div>
          <div class="achievement-title">${achievement.name}</div>
          <div class="achievement-category" style="color: ${categoryColor}">
            ${categoryLabel}
          </div>
          <div class="achievement-description">${achievement.desc}</div>
          <div class="achievement-xp">+${achievement.xp} XP</div>
          <div class="achievement-effects">
            <div class="sparkles">✨</div>
            <div class="confetti">🎉</div>
          </div>
          <button class="achievement-close" onclick="this.closest('.achievement-modal').remove()">
            Continue Studying
          </button>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Auto-remove after 8 seconds
    setTimeout(() => {
      const modal = document.getElementById(`achievement-modal-${achievement.id}`);
      if (modal) modal.remove();
    }, 8000);
    
    // Also update the showcase
    const showcase = document.getElementById('recent-achievement');
    if (showcase) {
      showcase.innerHTML = `
        <div class="achievement-content">
          <div class="achievement-icon">${achievement.icon}</div>
          <div class="achievement-text">
            <strong>Achievement Unlocked!</strong>
            <span>${achievement.name}</span>
            <small style="color: ${categoryColor}">${categoryLabel}</small>
          </div>
        </div>
      `;
      showcase.classList.remove('hidden');
      showcase.classList.add('show');
      
      setTimeout(() => {
        showcase.classList.remove('show');
        setTimeout(() => showcase.classList.add('hidden'), 500);
      }, 6000);
    }
  };

  const showAchievementNotification = (title, icon) => {
    const showcase = document.getElementById('recent-achievement');
    if (showcase) {
      showcase.innerHTML = `
        <div class="achievement-content">
          <div class="achievement-icon">${icon}</div>
          <div class="achievement-text">
            <strong>Achievement Unlocked!</strong>
            <span>${title}</span>
          </div>
        </div>
      `;
      showcase.classList.remove('hidden');
      showcase.classList.add('show');
      
      setTimeout(() => {
        showcase.classList.remove('show');
        setTimeout(() => showcase.classList.add('hidden'), 500);
      }, 5000);
    }
  };

  const updateStreak = () => {
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    
    if (lastStudyDate === today) {
      // Already studied today
      return;
    } else if (lastStudyDate === yesterday) {
      // Continuing streak
      studyStreak++;
    } else if (lastStudyDate !== null) {
      // Streak broken
      studyStreak = 1;
    } else {
      // First day
      studyStreak = 1;
    }
    
    lastStudyDate = today;
    Store.set('rewards.streak', studyStreak);
    Store.set('rewards.lastStudyDate', lastStudyDate);
    
    // Streak bonus XP
    if (studyStreak > 1) {
      addXP(XP_RATES.STREAK_BONUS, `${studyStreak}-day streak bonus`);
    }
  };

  const updateDashboard = () => {
    // Update XP and level display
    const userLevel = document.getElementById('user-level');
    const currentXPEl = document.getElementById('current-xp');
    const nextLevelXPEl = document.getElementById('next-level-xp');
    const xpFill = document.getElementById('xp-fill');
    const streakEl = document.getElementById('study-streak');
    
    // Update stat displays
    const pagesTotalEl = document.getElementById('pages-total');
    const studyTimeEl = document.getElementById('study-time');
    const flashcardsTotalEl = document.getElementById('flashcards-total');
    
    if (userLevel) userLevel.textContent = `Level ${currentLevel}`;
    if (currentXPEl) currentXPEl.textContent = currentXP;
    
    const nextLevelXP = getXPForNextLevel(currentLevel);
    const prevLevelXP = getXPForNextLevel(currentLevel - 1);
    
    if (nextLevelXPEl) nextLevelXPEl.textContent = nextLevelXP;
    
    if (xpFill) {
      const progress = ((currentXP - prevLevelXP) / (nextLevelXP - prevLevelXP)) * 100;
      xpFill.style.width = `${Math.min(100, Math.max(0, progress))}%`;
    }
    
    if (streakEl) streakEl.textContent = studyStreak;
    
    // Update stats from Store
    if (pagesTotalEl) {
      pagesTotalEl.textContent = Store.get('stats.pagesRead', 0);
    }
    
    if (studyTimeEl) {
      const totalSeconds = Store.get('stats.totalStudyTime', 0);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      if (hours > 0) {
        studyTimeEl.textContent = `${hours}h ${minutes}m`;
      } else {
        studyTimeEl.textContent = `${minutes}m`;
      }
    }
    
    if (flashcardsTotalEl) {
      flashcardsTotalEl.textContent = Store.get('stats.flashcardsCreated', 0);
    }
    
    // Update achievement notification badge
    const notificationDot = document.getElementById('achievement-notification');
    if (notificationDot) {
      const hasNewAchievements = Object.keys(ACHIEVEMENTS).length > unlockedAchievements.length;
      notificationDot.style.display = hasNewAchievements ? 'block' : 'none';
    }
  };

  const recordActivity = (type, data = {}) => {
    updateStreak();
    
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();
    const timeStr = Utils.getTimeString(now);
    const dayOfWeek = now.getDay(); // 0 = Sunday, 6 = Saturday
    const month = now.getMonth() + 1; // 1-12
    
    switch (type) {
      case 'page_read':
        addXP(XP_RATES.PAGE_READ * (data.amount || 1), 'reading pages');
        Store.increment('stats.pagesRead', data.amount || 1);
        break;
        
      case 'study_minute':
        addXP(XP_RATES.MINUTE_STUDIED * (data.amount || 1), 'studying');
        break;
        
      case 'flashcard_created':
        addXP(XP_RATES.FLASHCARD_CREATED * (data.amount || 1), 'creating flashcards');
        // Track diverse flashcard sources
        if (data.source) {
          const sources = Store.get('rewards.flashcardSources', new Set());
          sources.add(data.source);
          Store.set('rewards.flashcardSources', sources);
          Store.set('rewards.diverseFlashcards', sources.size);
        }
        break;
        
      case 'flashcard_correct':
        addXP(XP_RATES.FLASHCARD_CORRECT, 'correct answer');
        break;
        
      case 'upload_content':
        Store.increment('rewards.uploadsCount', 1);
        addXP(50, 'uploading study material');
        break;
        
      case 'session_completed':
        // Enhanced session tracking with comprehensive achievement metrics
        const sessionData = {
          duration: data.duration || 1500,
          plannedDuration: data.plannedDuration || data.duration || 1500,
          sessionStart: data.sessionStart || new Date().toISOString(),
          sessionEnd: data.sessionEnd || new Date().toISOString(),
          type: data.type || 'focus',
          interruptions: data.interruptions || 0
        };
        
        // Base XP for session completion
        addXP(XP_RATES.SESSION_COMPLETED, 'completing session');
        
        // Comprehensive achievement tracking
        trackSessionAchievements(sessionData, hour, minute, dayOfWeek, month);
        
        // Record in analytics
        TimeManagement.recordStudySession(sessionData);
        break;
    }
    
    updateDashboard();
  };

  const trackSessionAchievements = (sessionData, hour, minute, dayOfWeek, month) => {
    const duration = sessionData.duration;
    const completionRate = duration / sessionData.plannedDuration;
    const durationMinutes = Math.floor(duration / 60);
    
    // === TIME-BASED ACHIEVEMENTS ===
    
    // Early bird bonus (before 9 AM)
    if (hour < 9) {
      addXP(XP_RATES.EARLY_BIRD, 'early bird studying');
      Store.increment('rewards.earlyBirdSessions', 1);
    }
    
    // Night owl bonus (after 9 PM)
    if (hour >= 21) {
      addXP(XP_RATES.NIGHT_OWL, 'night owl studying');
      Store.increment('rewards.nightOwlSessions', 1);
    }
    
    // Weekend warrior (Saturday or Sunday)
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      Store.increment('rewards.weekendSessions', 1);
    }
    
    // Midnight scholar (exactly midnight)
    if (hour === 0 && minute >= 0 && minute <= 5) {
      Store.set('rewards.midnightSession', true);
    }
    
    // === FOCUS ACHIEVEMENTS ===
    
    // Focus sessions by duration
    if (durationMinutes >= 25) {
      Store.increment('rewards.mediumFocusSessions', 1);
    }
    if (durationMinutes >= 45) {
      Store.increment('rewards.focusSessions', 1);
    }
    if (durationMinutes >= 180) { // 3+ hours
      Store.increment('rewards.deepDiveSessions', 1);
    }
    
    // Perfect sessions (100% completion)
    if (completionRate >= 1.0) {
      Store.increment('rewards.perfectSessions', 1);
    }
    
    // Precision sessions (95%+ completion)
    if (completionRate >= 0.95) {
      Store.increment('rewards.precisionSessions', 1);
    }
    
    // Speed demon (under 10 minutes)
    if (durationMinutes < 10) {
      Store.increment('rewards.speedSessions', 1);
    }
    
    // Lucky seven (exactly 77 minutes)
    if (durationMinutes === 77) {
      Store.set('rewards.luckySevenSession', true);
    }
    
    // Perfectionist (exactly 25 minutes)
    if (durationMinutes === 25) {
      Store.increment('rewards.perfectPomodoros', 1);
    }
    
    // === SEASONAL ACHIEVEMENTS ===
    
    // January streak for New Year Resolution
    if (month === 1) {
      Store.increment('rewards.januaryStreak', 1);
    }
    
    // Spring streak (March, April, May)
    if ([3, 4, 5].includes(month)) {
      Store.increment('rewards.springStreak', 1);
    }
    
    // Summer time tracking (June, July, August)
    if ([6, 7, 8].includes(month)) {
      Store.increment('rewards.summerTime', duration);
    }
    
    // Autumn level tracking (September, October, November)
    if ([9, 10, 11].includes(month)) {
      Store.set('rewards.autumnLevel', currentLevel);
    }
    
    // Winter solstice check (December 21st)
    const today = new Date();
    if (month === 12 && today.getDate() === 21) {
      Store.set('rewards.winterSolstice', true);
    }
    
    // === MARATHON TRACKING ===
    
    // Track daily study time for marathon achievement
    const dateKey = today.toISOString().split('T')[0];
    const dailyTime = Store.get(`rewards.dailyTime.${dateKey}`, 0);
    Store.set(`rewards.dailyTime.${dateKey}`, dailyTime + duration);
    
    // Marathon runner (5+ hours in a day)
    if (dailyTime + duration >= 18000) { // 5 hours in seconds
      const marathonDays = Store.get('rewards.marathonDay', {});
      marathonDays[dateKey] = true;
      Store.set('rewards.marathonDay', marathonDays);
    }
    
    // === CONSISTENCY TRACKING ===
    
    // Check for same-time studying (consistency master)
    const lastStudyHour = Store.get('rewards.lastStudyHour', -1);
    if (lastStudyHour === hour) {
      Store.increment('rewards.consistentTimeSessions', 1);
      if (Store.get('rewards.consistentTimeSessions', 0) >= 14) {
        Store.set('rewards.habitBuilderStreak', 14);
      }
    } else {
      Store.set('rewards.consistentTimeSessions', 1);
    }
    Store.set('rewards.lastStudyHour', hour);
    
    // === COMEBACK TRACKING ===
    
    // Phoenix rising (return after 30+ day break)
    const lastActivity = Store.get('rewards.lastActivityDate', null);
    if (lastActivity) {
      const daysSinceLastActivity = Math.floor((today - new Date(lastActivity)) / (1000 * 60 * 60 * 24));
      if (daysSinceLastActivity >= 30) {
        Store.set('rewards.phoenixReturn', true);
      }
    }
    Store.set('rewards.lastActivityDate', today.toISOString());
  };
    
    // Night owl bonus (after 9 PM)
    if (hour >= 21) {
      addXP(XP_RATES.NIGHT_OWL, 'night owl studying');
      Store.increment('rewards.nightOwlSessions', 1);
    }
    
    // Focus master bonus (45+ minute sessions)
    if (duration >= 2700) { // 45 minutes
      addXP(XP_RATES.FOCUS_MASTER, 'focused long session');
      Store.increment('rewards.focusSessions', 1);
    }
    
    // Precision bonus (high completion rate)
    if (completionRate >= 0.95) {
      addXP(XP_RATES.PRECISION, 'high precision');
      Store.increment('rewards.precisionSessions', 1);
    }
    
    // Peak performer bonus (studying during optimal hours)
    const habits = Store.get('analytics.studyHabits', {});
    if (habits.preferredTimes && habits.preferredTimes.includes(hour)) {
      addXP(XP_RATES.PEAK_PERFORMER, 'peak performance time');
    }
    
    // Marathon bonus (check daily total)
    const today = Utils.getDateString();
    const todayTime = Store.get(`analytics.dailyStats.${today}.studyTime`, 0);


  const initEventHandlers = () => {
    // Achievement modal
    const achievementBtn = document.getElementById('view-achievements');
    if (achievementBtn) {
      achievementBtn.addEventListener('click', showAchievementsModal);
    }
    
    // Daily challenges
    const dailyChallengesBtn = document.getElementById('daily-challenges');
    if (dailyChallengesBtn) {
      dailyChallengesBtn.addEventListener('click', showDailyChallenges);
    }
  };

  const showAchievementsModal = () => {
    const modalHTML = `
      <div class="modal-overlay" id="achievements-modal">
        <div class="modal-content">
          <div class="modal-header">
            <h3>🏆 Achievements</h3>
            <button class="modal-close">&times;</button>
          </div>
          <div class="modal-body">
            <div class="achievements-grid">
              ${Object.values(ACHIEVEMENTS).map(achievement => `
                <div class="achievement-item ${unlockedAchievements.includes(achievement.id) ? 'unlocked' : 'locked'}">
                  <div class="achievement-icon">${achievement.icon}</div>
                  <div class="achievement-info">
                    <h4>${achievement.name}</h4>
                    <p>${achievement.desc}</p>
                    <span class="achievement-xp">+${achievement.xp} XP</span>
                  </div>
                  ${unlockedAchievements.includes(achievement.id) ? '<div class="achievement-badge">✓</div>' : ''}
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    const modal = document.getElementById('achievements-modal');
    const closeBtn = modal.querySelector('.modal-close');
    
    closeBtn.addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });
  };

  const showDailyChallenges = () => {
    Toasts.show('Daily challenges coming soon! 🎯', 'info');
  };

  const init = () => {
    updateDashboard();
    initEventHandlers();
    checkAchievements();
  };

  return {
    addXP,
    recordActivity,
    updateDashboard,
    checkAchievements,
    init,
    getCurrentLevel: () => currentLevel,
    getCurrentXP: () => currentXP,
    getStreak: () => studyStreak
  };
})();

/* ==========================================================================
   SMART QUOTES WITH CONTEXT
   ========================================================================== */
const Quotes = (() => {
  const motivational = [
    { text: 'The secret of getting ahead is getting started.', author: 'Mark Twain', context: 'general' },
    { text: "Don't let yesterday take up too much of today.", author: 'Will Rogers', context: 'focus' },
    { text: 'Learning is not attained by chance, it must be sought for with ardor and diligence.', author: 'Abigail Adams', context: 'study' },
    { text: "The harder you work for something, the greater you'll feel when you achieve it.", author: 'Unknown', context: 'motivation' },
    { text: 'Education is the most powerful weapon which you can use to change the world.', author: 'Nelson Mandela', context: 'study' },
    { text: 'The beautiful thing about learning is that no one can take it away from you.', author: 'B.B. King', context: 'learning' },
    { text: "Your time is limited, so don't waste it living someone else's life.", author: 'Steve Jobs', context: 'focus' },
    { text: 'Believe you can and you\'re halfway there.', author: 'Theodore Roosevelt', context: 'motivation' },
    { text: 'Start where you are. Use what you have. Do what you can.', author: 'Arthur Ashe', context: 'general' },
    { text: 'Quality is not an act, it is a habit.', author: 'Aristotle', context: 'study' }
  ];
  
  const breakTime = [
    { text: 'Rest when you\'re weary. Refresh and renew yourself.', author: 'Ralph Marston', context: 'break' },
    { text: 'Take time to make your soul happy.', author: 'Unknown', context: 'break' },
    { text: 'Sometimes the most productive thing you can do is relax.', author: 'Mark Black', context: 'break' }
  ];
  
  const getByContext = (context = 'general') => {
    const contextQuotes = motivational.filter(q => q.context === context);
    const allQuotes = contextQuotes.length > 0 ? contextQuotes : motivational;
    return allQuotes[Math.floor(Math.random() * allQuotes.length)];
  };
  
  const getBreakQuote = () => {
    return breakTime[Math.floor(Math.random() * breakTime.length)];
  };
  
  return { getByContext, getBreakQuote };
})();

/* ==========================================================================
   ENHANCED TIMER WITH REAL-TIME SYNC AND ANALYTICS
   ========================================================================== */
class Timer {
  constructor(displayEl, mirrorEls = []) {
    this.displayEl = displayEl;
    this.mirrorEls = mirrorEls;
    this.totalSeconds = 25 * 60;
    this.remaining = this.totalSeconds;
    this.interval = null;
    this.listeners = {};
    this.running = false;
    this.startTime = null;
    this.type = 'study';
    this.render();
    this.loadState();
  }
  
  on(evt, cb) { 
    (this.listeners[evt] || (this.listeners[evt] = [])).push(cb); 
  }
  
  emit(evt, payload) { 
    (this.listeners[evt] || []).forEach(cb => cb(payload)); 
  }
  
  set(minutes, seconds = 0, type = 'study') {
    this.totalSeconds = minutes * 60 + seconds;
    this.remaining = this.totalSeconds;
    this.type = type;
    this.saveState();
    this.render();
    this.emit('set', { remaining: this.remaining, type: this.type });
  }
  
  start() {
    if (this.running) return;
    this.running = true;
    this.startTime = Date.now() - ((this.totalSeconds - this.remaining) * 1000);
    this.saveState();
    this.emit('start', { type: this.type });
    
    this.interval = setInterval(() => {
      this.remaining--;
      this.saveState();
      this.render();
      this.emit('tick', { remaining: this.remaining, type: this.type });
      
      if (this.remaining === 300 && this.type === 'study') {
        Toasts.show('5 minutes remaining in study session', 'warning');
      }
      if (this.remaining === 60 && this.type === 'study') {
        Toasts.show('1 minute remaining!', 'warning');
      }
      
      if (this.remaining <= 0) {
        this.complete();
      }
    }, 1000);
  }
  
  pause() {
    if (!this.running) return;
    clearInterval(this.interval);
    this.running = false;
    this.saveState();
    this.emit('pause', { type: this.type });
  }
  
  stop() {
    clearInterval(this.interval);
    this.interval = null;
    this.running = false;
    this.saveState();
    this.emit('stop', { type: this.type });
  }
  
  complete() {
    const elapsedSeconds = this.totalSeconds - this.remaining;
    
    this.stop();
    this.emit('complete', { 
      type: this.type, 
      elapsed: elapsedSeconds,
      wasFullSession: this.remaining <= 0 
    });
    
    if (this.type === 'study' && this.remaining <= 0) {
      Analytics.addStudyTime(elapsedSeconds);
      Analytics.completeSession();
      Toasts.show('Study session complete! Take a break.', 'success', 5000);
      
      setTimeout(() => {
        this.set(5, 0, 'break');
        this.start();
        Toasts.show('Break time started (5 minutes)', 'info');
      }, 2000);
    } else if (this.type === 'break' && this.remaining <= 0) {
      const quote = Quotes.getByContext('motivation');
      Toasts.show(`Break over! ${quote.text}`, 'info', 4000);
    }
  }
  
  reset() { 
    this.remaining = this.totalSeconds; 
    this.saveState();
    this.render(); 
    this.emit('reset', { type: this.type }); 
  }
  
  render() {
    const txt = Utils.formatClock(this.remaining);
    const isBreak = this.type === 'break';
    
    if (this.displayEl) {
      this.displayEl.textContent = txt;
      this.displayEl.className = `timer-display ${isBreak ? 'timer-break' : 'timer-study'}`;
    }
    
    this.mirrorEls.forEach(el => {
      if (el) {
        el.textContent = txt;
        el.className = `timer-display ${isBreak ? 'timer-break' : 'timer-study'}`;
      }
    });
    
    if (this.running) {
      document.title = `${txt} - ${isBreak ? 'Break' : 'Study'} - Studious`;
    } else {
      document.title = 'Studious - Ultimate Study Companion';
    }
  }
  
  saveState() {
    Store.set('timer.state', {
      totalSeconds: this.totalSeconds,
      remaining: this.remaining,
      running: this.running,
      type: this.type,
      startTime: this.startTime
    });
  }
  
  loadState() {
    const state = Store.get('timer.state');
    if (state) {
      this.totalSeconds = state.totalSeconds || this.totalSeconds;
      this.remaining = state.remaining || this.remaining;
      this.type = state.type || 'study';
      
      if (state.running && state.startTime) {
        const elapsed = Math.floor((Date.now() - state.startTime) / 1000);
        const shouldBeRemaining = state.totalSeconds - elapsed;
        
        if (shouldBeRemaining > 0) {
          this.remaining = shouldBeRemaining;
          this.start();
        } else {
          this.remaining = 0;
          this.complete();
        }
      }
    }
    this.render();
  }
}

/* ==========================================================================
   ENHANCED FLASHCARDS WITH AUTO-GENERATION
   ========================================================================== */
class Flashcards {
  constructor() {
    this.cards = Store.get('flashcards.cards', []);
    this.index = 0;
    this.known = new Set(Store.get('flashcards.known', []));
    this.practice = new Set(Store.get('flashcards.practice', []));
    this.partial = new Set(Store.get('flashcards.partial', []));
    this.ui = {};
    this.currentContent = '';
  }
  
  generateFromContent(content, type = 'text') {
    if (!content || content.length < 50) {
      Toasts.show('Not enough content to generate flashcards', 'warning');
      return;
    }
    
    this.currentContent = content;
    let newCards = [];
    
    if (type === 'text') {
      newCards = this.extractFromText(content);
    } else if (type === 'pdf') {
      newCards = this.extractFromPDFContent(content);
    }
    
    if (newCards.length === 0) {
      Toasts.show('Could not generate flashcards from this content', 'warning');
      return;
    }
    
    const existingFronts = new Set(this.cards.map(c => c.front));
    const uniqueCards = newCards.filter(card => !existingFronts.has(card.front));
    
    this.cards = [...this.cards, ...uniqueCards];
    Store.set('flashcards.cards', this.cards);
    
    if (uniqueCards.length > 0) {
      Analytics.incrementFlashcards(uniqueCards.length);
      RewardSystem.recordActivity('flashcard_created', { 
        amount: uniqueCards.length, 
        source: type 
      });
      RewardSystem.recordActivity('flashcard_created', uniqueCards.length);
      Toasts.show(`Generated ${uniqueCards.length} new flashcards!`, 'success');
      this.render();
    } else {
      Toasts.show('No new flashcards generated (duplicates avoided)', 'info');
    }
  }
  
  extractFromText(text) {
    const cards = [];
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
    
    sentences.forEach(sentence => {
      sentence = sentence.trim();
      if (sentence.length < 20 || sentence.length > 200) return;
      
      const definitionMatch = sentence.match(/(.+?)\s+(is|are|was|were)\s+(.+)/i);
      if (definitionMatch) {
        const [, subject, verb, definition] = definitionMatch;
        cards.push({
          front: `What ${verb.toLowerCase()} ${subject.trim()}?`,
          back: definition.trim(),
          source: 'auto-generated',
          timestamp: Date.now(),
          difficulty: 'medium'
        });
      }
      
      const yearMatch = sentence.match(/(\d{4})/);
      if (yearMatch) {
        const year = yearMatch[1];
        const context = sentence.replace(year, '____');
        cards.push({
          front: `Fill in the year: ${context}`,
          back: year,
          source: 'auto-generated',
          timestamp: Date.now(),
          difficulty: 'easy'
        });
      }
      
      const numberMatch = sentence.match(/(\d+(?:\.\d+)?)\s*(percent|%|million|billion|thousand)/i);
      if (numberMatch) {
        const [fullMatch, number, unit] = numberMatch;
        const context = sentence.replace(fullMatch, '____');
        cards.push({
          front: `What number belongs here: ${context}`,
          back: fullMatch,
          source: 'auto-generated',
          timestamp: Date.now(),
          difficulty: 'medium'
        });
      }
      
      const nameMatches = sentence.match(/[A-Z][a-z]+ [A-Z][a-z]+/g);
      if (nameMatches && nameMatches.length < 3) {
        nameMatches.forEach(name => {
          if (name.length > 6) {
            const context = sentence.replace(name, '____');
            cards.push({
              front: `Who is referenced here: ${context}`,
              back: name,
              source: 'auto-generated',
              timestamp: Date.now(),
              difficulty: 'hard'
            });
          }
        });
      }
    });
    
    const sortedCards = cards.sort((a, b) => {
      const order = { easy: 1, medium: 2, hard: 3 };
      return order[a.difficulty] - order[b.difficulty];
    });
    
    return sortedCards.slice(0, 15);
  }
  
  extractFromPDFContent(content) {
    return this.extractFromText(content);
  }
  
  mount(ui) { 
    this.ui = ui; 
    this.render(); 
  }
  
  current() { 
    return this.cards[this.index] || null; 
  }
  
  next() { 
    if (this.index < this.cards.length - 1) { 
      this.index++; 
      this.render(true); 
      return true;
    } 
    return false;
  }
  
  prev() { 
    if (this.index > 0) { 
      this.index--; 
      this.render(true); 
      return true;
    } 
    return false;
  }
  
  shuffle() { 
    this.cards = this.cards.sort(() => Math.random() - 0.5); 
    this.index = 0; 
    this.render(true); 
    Toasts.show('Flashcards shuffled!', 'info');
  }
  
  mark(type) {
    const id = this.index;
    ['known', 'practice', 'partial'].forEach(t => this[t].delete(id));
    this[type].add(id);
    
    Store.set('flashcards.known', [...this.known]);
    Store.set('flashcards.practice', [...this.practice]);
    Store.set('flashcards.partial', [...this.partial]);
    
    // Award XP for correct answers
    if (type === 'known') {
      RewardSystem.recordActivity('flashcard_correct');
    }
    
    const feedback = {
      known: 'Great! This card is marked as known.',
      practice: 'This card will come up again for practice.',
      partial: 'Marked for review - you partially know this.'
    };
    
    Toasts.show(feedback[type], type === 'known' ? 'success' : 'info', 2000);
    
    this.next();
  }
  
  clearAll() {
    this.cards = [];
    this.known.clear();
    this.practice.clear();
    this.partial.clear();
    this.index = 0;
    
    Store.set('flashcards.cards', []);
    Store.set('flashcards.known', []);
    Store.set('flashcards.practice', []);
    Store.set('flashcards.partial', []);
    
    this.render();
    Toasts.show('All flashcards cleared', 'info');
  }
  
  render(animate = false) {
    if (!this.ui.front || !this.ui.back) return;
    
    const card = this.current();
    if (!card) {
      this.ui.front.textContent = 'No flashcards available';
      this.ui.back.textContent = 'Generate some flashcards from your study content!';
      if (this.ui.progress) this.ui.progress.textContent = '0/0';
      return;
    }
    
    this.ui.front.textContent = card.front;
    this.ui.back.textContent = card.back;
    
    if (this.ui.progress) {
      this.ui.progress.textContent = `${this.index + 1}/${this.cards.length}`;
    }
    
    if (this.ui.stats) {
      this.ui.stats.known.textContent = this.known.size;
      this.ui.stats.practice.textContent = this.practice.size;
      this.ui.stats.remaining.textContent = Math.max(0, this.cards.length - (this.known.size + this.practice.size + this.partial.size));
    }
    
    if (animate && this.ui.container) {
      this.ui.container.style.transform = 'scale(0.95)';
      this.ui.container.style.opacity = '0.7';
      setTimeout(() => {
        this.ui.container.style.transform = 'scale(1)';
        this.ui.container.style.opacity = '1';
      }, 150);
    }
  }
}

/* ==========================================================================
   ENHANCED PDF MODULE WITH TEXT EXTRACTION
   ========================================================================== */
class PDFModule {
  constructor(viewerEl) {
    this.viewerEl = viewerEl;
    this.doc = null;
    this.totalPages = 0;
    this.currentPage = 1;
    this.chunks = [];
    this.currentChunkIndex = 0;
    this.zoom = 1.0;
    this.rendering = false;
    this.extractedText = '';
    this.singlePageMode = false;
  }
  
  async load(file) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      this.doc = await pdfjsLib.getDocument(new Uint8Array(arrayBuffer)).promise;
      this.totalPages = this.doc.numPages;
      this.currentPage = 1; // Initialize current page
      
      await this.extractText();
      
      Analytics.incrementDocuments();
      return this.totalPages;
    } catch (error) {
      console.error('PDF loading error:', error);
      throw error;
    }
  }
  
  async extractText() {
    let fullText = '';
    const maxPages = Math.min(this.totalPages, 10);
    
    try {
      for (let i = 1; i <= maxPages; i++) {
        const page = await this.doc.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        fullText += pageText + ' ';
      }
      this.extractedText = fullText.trim();
    } catch (error) {
      console.error('Text extraction error:', error);
      this.extractedText = '';
    }
  }
  
  getExtractedText() {
    return this.extractedText;
  }
  
  buildChunks(start, end, count) {
    this.chunks = [];
    const pageCount = end - start + 1;
    const base = Math.floor(pageCount / count);
    let remainder = pageCount % count;
    let cursor = start;
    
    for (let i = 0; i < count; i++) {
      let size = base + (remainder > 0 ? 1 : 0);
      if (remainder > 0) remainder--;
      const chunkEnd = Math.min(cursor + size - 1, end);
      this.chunks.push({ 
        start: cursor, 
        end: chunkEnd,
        id: i,
        completed: false
      });
      cursor = chunkEnd + 1;
    }
    this.currentChunkIndex = 0;
  }
  
  currentChunk() { 
    return this.chunks[this.currentChunkIndex]; 
  }
  
  chunkProgressPercent() { 
    return this.chunks.length ? Math.round((this.currentChunkIndex) / this.chunks.length * 100) : 0; 
  }
  
  markChunkCompleted() {
    if (this.chunks[this.currentChunkIndex]) {
      this.chunks[this.currentChunkIndex].completed = true;
      Store.set('pdf.chunks', this.chunks);
    }
  }
  
  async renderChunk() {
    if (!this.doc || !this.viewerEl || this.rendering) return;
    
    const chunk = this.currentChunk();
    if (!chunk) return;
    
    this.rendering = true;
    this.viewerEl.innerHTML = '<div class="loading">Rendering pages...</div>';
    
    try {
      this.viewerEl.innerHTML = '';
      for (let p = chunk.start; p <= chunk.end; p++) {
        await this.renderPage(p);
      }
    } catch (error) {
      console.error('Rendering error:', error);
      this.viewerEl.innerHTML = '<div class="error">Failed to render pages</div>';
    } finally {
      this.rendering = false;
    }
  }
  
  async renderPage(pageNumber, target = this.viewerEl) {
    const page = await this.doc.getPage(pageNumber);
    const viewport = page.getViewport({ scale: this.zoom * 1.5 });
    const canvas = document.createElement('canvas');
    canvas.className = 'page-canvas';
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d');
    
    const pageContainer = document.createElement('div');
    pageContainer.className = 'page-container';
    pageContainer.style.position = 'relative';
    pageContainer.style.marginBottom = '20px';
    
    const pageLabel = document.createElement('div');
    pageLabel.className = 'page-label';
    pageLabel.textContent = `Page ${pageNumber}`;
    pageLabel.style.cssText = `
      position: absolute; top: 10px; right: 10px; z-index: 1;
      background: rgba(0,0,0,0.7); color: white; padding: 4px 8px;
      border-radius: 4px; font-size: 12px;
    `;
    
    pageContainer.appendChild(pageLabel);
    pageContainer.appendChild(canvas);
    target.appendChild(pageContainer);
    
    await page.render({ canvasContext: ctx, viewport }).promise;
  }
  
  zoomIn() { 
    this.zoom = Math.min(this.zoom + 0.1, 2.0); 
    return this.zoom; 
  }
  
  zoomOut() { 
    this.zoom = Math.max(this.zoom - 0.1, 0.5); 
    return this.zoom; 
  }
  
  prevChunk() { 
    if (this.currentChunkIndex > 0) { 
      this.currentChunkIndex--; 
      return true; 
    } 
    return false; 
  }
  
  nextChunk() { 
    if (this.currentChunkIndex < this.chunks.length - 1) { 
      this.markChunkCompleted();
      this.currentChunkIndex++; 
      return true; 
    } 
    return false; 
  }
  
  // Individual page navigation methods
  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      // Award XP for reading a page
      RewardSystem.recordActivity('page_read');
      return true;
    }
    return false;
  }
  
  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      return true;
    }
    return false;
  }
  
  goToPage(pageNumber) {
    if (pageNumber >= 1 && pageNumber <= this.totalPages) {
      this.currentPage = pageNumber;
      return true;
    }
    return false;
  }
  
  // Single page rendering mode
  async renderSinglePage() {
    if (!this.doc || !this.viewerEl || this.rendering) return;
    
    this.rendering = true;
    this.singlePageMode = true;
    this.viewerEl.innerHTML = '<div class="loading">Rendering page...</div>';
    
    try {
      this.viewerEl.innerHTML = '';
      await this.renderPage(this.currentPage);
      this.updatePageInfo();
    } catch (error) {
      console.error('Single page rendering error:', error);
      this.viewerEl.innerHTML = '<div class="error">Failed to render page</div>';
    } finally {
      this.rendering = false;
    }
  }
  
  updatePageInfo() {
    const pageInfo = document.getElementById('page-info');
    if (pageInfo) {
      pageInfo.textContent = `Page ${this.currentPage} of ${this.totalPages}`;
    }
  }
}

/* ==========================================================================
   VIDEO MODULE WITH CHUNKING & SPEED CONTROL
   ========================================================================== */
class VideoModule {
  constructor(videoEl) {
    this.videoEl = videoEl;
    this.chunks = [];
    this.currentChunkIndex = 0;
    this.playing = false;
  }
  
  load(file) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      this.videoEl.src = url;
      this.videoEl.addEventListener('loadedmetadata', () => {
        Analytics.incrementDocuments();
        resolve(this.videoEl.duration);
      }, { once: true });
      this.videoEl.addEventListener('error', reject, { once: true });
    });
  }
  
  buildChunks(count) {
    this.chunks = [];
    const duration = this.videoEl.duration;
    const chunkDuration = duration / count;
    
    for (let i = 0; i < count; i++) {
      const start = i * chunkDuration;
      const end = Math.min((i + 1) * chunkDuration, duration);
      this.chunks.push({ 
        start, 
        end, 
        id: i,
        completed: false
      });
    }
    this.currentChunkIndex = 0;
  }
  
  currentChunk() { 
    return this.chunks[this.currentChunkIndex]; 
  }
  
  chunkProgressPercent() { 
    return this.chunks.length ? Math.round((this.currentChunkIndex) / this.chunks.length * 100) : 0; 
  }
  
  playChunk() {
    const chunk = this.currentChunk();
    if (!chunk) return;
    
    this.videoEl.currentTime = chunk.start;
    this.videoEl.play();
    this.playing = true;
    
    const checkProgress = () => {
      if (this.videoEl.currentTime >= chunk.end || this.videoEl.ended) {
        this.videoEl.pause();
        this.playing = false;
        chunk.completed = true;
        Store.set('video.chunks', this.chunks);
      } else if (this.playing) {
        requestAnimationFrame(checkProgress);
      }
    };
    checkProgress();
  }
  
  pauseChunk() {
    this.videoEl.pause();
    this.playing = false;
  }
  
  setSpeed(speed) {
    this.videoEl.playbackRate = speed;
  }
  
  prevChunk() { 
    if (this.currentChunkIndex > 0) { 
      this.currentChunkIndex--; 
      return true; 
    } 
    return false; 
  }
  
  nextChunk() { 
    if (this.currentChunkIndex < this.chunks.length - 1) { 
      this.currentChunkIndex++; 
      return true; 
    } 
    return false; 
  }
}

/* ==========================================================================
   TEXT MODULE WITH SMART CHUNKING
   ========================================================================== */
class TextModule {
  constructor(containerEl) {
    this.containerEl = containerEl;
    this.content = '';
    this.chunks = [];
    this.currentChunkIndex = 0;
  }
  
  load(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.content = e.target.result;
        Analytics.incrementDocuments();
        resolve(this.content.length);
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }
  
  buildChunks(count) {
    this.chunks = [];
    const paragraphs = this.content.split(/\n\s*\n/);
    const chunksSize = Math.ceil(paragraphs.length / count);
    
    for (let i = 0; i < count; i++) {
      const start = i * chunksSize;
      const end = Math.min((i + 1) * chunksSize, paragraphs.length);
      const chunkText = paragraphs.slice(start, end).join('\n\n');
      
      this.chunks.push({ 
        text: chunkText, 
        id: i,
        completed: false,
        wordCount: chunkText.split(/\s+/).length
      });
    }
    this.currentChunkIndex = 0;
  }
  
  currentChunk() { 
    return this.chunks[this.currentChunkIndex]; 
  }
  
  chunkProgressPercent() { 
    return this.chunks.length ? Math.round((this.currentChunkIndex) / this.chunks.length * 100) : 0; 
  }
  
  renderChunk() {
    const chunk = this.currentChunk();
    if (!chunk || !this.containerEl) return;
    
    this.containerEl.innerHTML = `
      <div class="text-chunk">
        <div class="chunk-meta">
          <span>Chunk ${this.currentChunkIndex + 1} of ${this.chunks.length}</span>
          <span>${chunk.wordCount} words</span>
        </div>
        <div class="chunk-content">${chunk.text.replace(/\n/g, '<br>')}</div>
      </div>
    `;
  }
  
  markChunkCompleted() {
    if (this.chunks[this.currentChunkIndex]) {
      this.chunks[this.currentChunkIndex].completed = true;
      Store.set('text.chunks', this.chunks);
    }
  }
  
  getFullText() {
    return this.content;
  }
  
  prevChunk() { 
    if (this.currentChunkIndex > 0) { 
      this.currentChunkIndex--; 
      return true; 
    } 
    return false; 
  }
  
  nextChunk() { 
    if (this.currentChunkIndex < this.chunks.length - 1) { 
      this.markChunkCompleted();
      this.currentChunkIndex++; 
      return true; 
    } 
    return false; 
  }
}

/* ==========================================================================
   THEME SYSTEM WITH PREFERENCES
   ========================================================================== */
const Theme = (() => {
  const themes = {
    light: { name: 'Light', icon: '☀️' },
    dark: { name: 'Dark', icon: '🌙' },
    focus: { name: 'Focus', icon: '🎯' },
    nature: { name: 'Nature', icon: '🌿' }
  };
  
  let current = Store.get('theme.current', 'light');
  
  const apply = (themeId) => {
    document.documentElement.setAttribute('data-theme', themeId);
    current = themeId;
    Store.set('theme.current', themeId);
  };
  
  const init = () => {
    apply(current);
  };
  
  const toggle = () => {
    const keys = Object.keys(themes);
    const idx = keys.indexOf(current);
    const nextTheme = keys[(idx + 1) % keys.length];
    apply(nextTheme);
    Toasts.show(`Switched to ${themes[nextTheme].name} theme`, 'info');
  };
  
  return { themes, apply, init, toggle, current: () => current };
})();

/* ==========================================================================
   MAIN APPLICATION CONTROLLER
   ========================================================================== */
class App {
  constructor() {
    this.timer = null;
    this.flashcards = new Flashcards();
    this.pdfModule = null;
    this.videoModule = null;
    this.textModule = null;
    this.currentFileType = null;
    this.currentFile = null;
    this.selectedTimerMinutes = 25;
    this.studyTimer = null;
    
    this.init();
  }
  
  init() {
    Theme.init();
    TimeManagement.initializeAnalytics();
    RewardSystem.init();
    this.bindUI();
    this.setupTimerSync();
    this.updateDashboardWithInsights();
    
    // Ensure dashboard and content selection are visible on startup
    document.getElementById('dashboard-section')?.classList.remove('hidden');
    document.getElementById('content-selection')?.classList.remove('hidden');
    
    // Hide all upload/study sections initially
    this.hideAllSections();
    
    // Show welcome message with personalized insights
    this.showWelcomeInsights();
  }

  updateDashboardWithInsights() {
    const dashboardData = TimeManagement.getDashboardData();
    RewardSystem.updateDashboard();
    
    // Update progress percentage with comprehensive data
    const progressEl = document.querySelector('.progress-percentage');
    if (progressEl) {
      progressEl.textContent = `${Math.round(dashboardData.todayProgress.timeProgress)}%`;
    }
    
    // Update progress bar
    const progressFill = document.querySelector('.progress-fill');
    if (progressFill) {
      progressFill.style.width = `${dashboardData.todayProgress.timeProgress}%`;
    }
  }

  showWelcomeInsights() {
    const insights = TimeManagement.generateInsights();
    const recommendations = TimeManagement.getOptimalStudySchedule();
    
    let welcomeMessage = 'Welcome back to Studious!';
    
    if (recommendations.peakHours.length > 0) {
      const bestHour = recommendations.peakHours[0];
      const timeStr = `${bestHour}:00`;
      welcomeMessage += ` Your peak performance time is around ${timeStr}.`;
    }
    
    if (insights.length > 0) {
      const mainInsight = insights[0];
      welcomeMessage += ` Tip: ${mainInsight.message}`;
    }
    
    Toasts.show(welcomeMessage, 'info', 6000);
  }
  
  bindUI() {
    // Set current date
    const currentDate = document.getElementById('current-date');
    if (currentDate) {
      currentDate.textContent = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }

    // Timer controls and display
    const timerDisplay = document.getElementById('timer');
    const readerTimer = document.getElementById('reader-timer');
    const mirrorTimers = [];
    
    if (timerDisplay) {
      this.timer = new Timer(timerDisplay, mirrorTimers);
      
      // Timer preset buttons
      document.getElementById('pomodoro-btn')?.addEventListener('click', () => {
        this.timer.set(25, 0, 'study');
        this.updateTimerPresets('pomodoro-btn');
      });
      
      document.getElementById('short-break-btn')?.addEventListener('click', () => {
        this.timer.set(5, 0, 'break');
        this.updateTimerPresets('short-break-btn');
      });
      
      document.getElementById('long-break-btn')?.addEventListener('click', () => {
        this.timer.set(15, 0, 'break');
        this.updateTimerPresets('long-break-btn');
      });
      
      // Custom timer
      document.getElementById('set-custom-timer')?.addEventListener('click', () => {
        const minutes = parseInt(document.getElementById('custom-minutes').value) || 0;
        const seconds = parseInt(document.getElementById('custom-seconds').value) || 0;
        if (minutes > 0 || seconds > 0) {
          this.timer.set(minutes, seconds, 'study');
          this.updateTimerPresets(null);
        }
      });
    }
    
    // Content selection
    this.bindContentSelection();
    
    // File upload
    this.bindFileUpload();
    
    // Configuration panels
    this.bindConfiguration();
    
    // PDF controls
    this.bindPDFControls();
    
    // Video controls  
    this.bindVideoControls();
    
    // Text controls
    this.bindTextControls();
    
    // Flashcards
    this.bindFlashcards();
    
    // Theme controls
    this.bindThemeControls();
    
    // Enhanced dashboard functionality
    document.getElementById('view-schedule')?.addEventListener('click', () => {
      this.showSmartScheduleModal();
    });
    
    document.getElementById('view-insights')?.addEventListener('click', () => {
      this.showStudyInsightsModal();
    });
    
    // Export functionality
    document.getElementById('export-progress')?.addEventListener('click', () => {
      const data = {
        flashcards: this.flashcards.cards,
        analytics: Store.get('analytics', {}),
        rewards: Store.get('rewards', {}),
        settings: Store.get('settings', {}),
        timestamp: new Date().toISOString()
      };
      Utils.downloadJSON(data, `studious-export-${new Date().toISOString().split('T')[0]}.json`);
      Toasts.show('Complete study data exported successfully!', 'success');
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      
      switch (e.key) {
        case ' ':
          e.preventDefault();
          if (this.timer && document.getElementById('timer-config')?.closest('.config-panel')?.classList.contains('active')) {
            this.timer.running ? this.timer.pause() : this.timer.start();
          }
          break;
        case 'ArrowLeft':
          if (document.getElementById('flashcards-section')?.classList.contains('active')) {
            this.flashcards.prev();
          } else if (document.getElementById('viewer-section')?.classList.contains('active') && this.pdfModule) {
            if (this.pdfModule.singlePageMode) {
              if (this.pdfModule.prevPage()) {
                this.pdfModule.renderSinglePage();
              }
            } else {
              if (this.pdfModule.prevChunk()) {
                this.pdfModule.renderChunk();
                this.updateChunkProgress();
              }
            }
          }
          break;
        case 'ArrowRight':
          if (document.getElementById('flashcards-section')?.classList.contains('active')) {
            this.flashcards.next();
          } else if (document.getElementById('viewer-section')?.classList.contains('active') && this.pdfModule) {
            if (this.pdfModule.singlePageMode) {
              if (this.pdfModule.nextPage()) {
                this.pdfModule.renderSinglePage();
              }
            } else {
              if (this.pdfModule.nextChunk()) {
                this.pdfModule.renderChunk();
                this.updateChunkProgress();
              }
            }
          }
          break;
        case 'f':
          if (document.getElementById('flashcards-section')?.classList.contains('active')) {
            document.getElementById('flashcard')?.classList.toggle('flipped');
          }
          break;
        case 't':
          Theme.toggle();
          break;
      }
    });
  }

  bindContentSelection() {
    // Content type selection
    document.getElementById('select-pdf')?.addEventListener('click', () => {
      this.selectContentType('pdf');
    });
    
    document.getElementById('select-video')?.addEventListener('click', () => {
      this.selectContentType('video');
    });
    
    document.getElementById('select-text')?.addEventListener('click', () => {
      this.selectContentType('text');
    });
    
    // Back to main buttons
    document.getElementById('back-to-main-pdf')?.addEventListener('click', () => {
      this.returnToMain();
    });
    
    document.getElementById('back-to-main-video')?.addEventListener('click', () => {
      this.returnToMain();
    });
    
    document.getElementById('back-to-main-text')?.addEventListener('click', () => {
      this.returnToMain();
    });

    // New workflow buttons
    document.getElementById('proceed-to-config')?.addEventListener('click', () => {
      this.proceedToConfiguration();
    });

    document.getElementById('back-to-upload')?.addEventListener('click', () => {
      this.backToUpload();
    });

    document.getElementById('start-study')?.addEventListener('click', () => {
      this.startStudySession();
    });

    // Configuration interactions
    document.getElementById('chunk-count')?.addEventListener('input', (e) => {
      this.updateChunkDisplay(e.target.value);
    });

    // Timer presets
    document.querySelectorAll('.preset-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
        e.target.closest('.preset-btn').classList.add('active');
        this.selectedTimerMinutes = parseInt(e.target.closest('.preset-btn').dataset.minutes);
      });
    });

    // Theme selection
    document.querySelectorAll('.theme-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
        e.target.closest('.theme-btn').classList.add('active');
        this.setTheme(e.target.closest('.theme-btn').dataset.theme);
      });
    });
  }
  
  selectContentType(type) {
    // Update selected content option
    document.querySelectorAll('.content-option-card').forEach(card => {
      card.classList.remove('selected');
    });
    document.getElementById(`select-${type}`)?.classList.add('selected');
    
    // Hide dashboard and content selection when a type is selected
    document.getElementById('dashboard-section')?.classList.add('hidden');
    document.getElementById('content-selection')?.classList.add('hidden');
    
    // Hide all other sections first
    this.hideAllSections();
    
    // Show only the relevant upload section for the selected type
    if (type === 'pdf') {
      this.showSection('upload-section');
    } else if (type === 'video') {
      this.showSection('video-upload-section');
    } else if (type === 'text') {
      this.showSection('text-upload-section');
    }
    
    this.currentContentType = type;
    
    // Show success message
    Toasts.show(`${type.toUpperCase()} mode selected. Upload your ${type} content to get started.`, 'info');
  }
  
  bindFileUpload() {
    const fileInput = document.getElementById('file-input');
    const browseBtn = document.getElementById('browse-btn');
    const dropArea = document.getElementById('drop-area');
    
    // Browse button
    browseBtn?.addEventListener('click', () => fileInput?.click());
    
    // File input change
    fileInput?.addEventListener('change', (e) => this.handleFileUpload(e));
    
    // Drag and drop
    dropArea?.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropArea.classList.add('drag-over');
    });
    
    dropArea?.addEventListener('dragleave', () => {
      dropArea.classList.remove('drag-over');
    });
    
    dropArea?.addEventListener('drop', (e) => {
      e.preventDefault();
      dropArea.classList.remove('drag-over');
      this.handleFileUpload({ target: { files: e.dataTransfer.files } });
    });
    
    // Remove file
    document.getElementById('remove-file')?.addEventListener('click', () => {
      this.removeFile();
    });
    
    // Video processing
    document.getElementById('process-video')?.addEventListener('click', () => {
      this.processVideoInput();
    });
    
    // Text processing
    document.getElementById('process-text')?.addEventListener('click', () => {
      this.processTextInput();
    });
    
    // Text stats update
    const textContent = document.getElementById('text-content');
    textContent?.addEventListener('input', () => {
      this.updateTextStats();
    });
  }
  
  bindConfiguration() {
    // Configuration navigation
    document.querySelectorAll('.config-nav-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const configType = btn.dataset.config;
        this.showConfigPanel(configType);
      });
    });
    
    // Chunk count slider
    const chunkSlider = document.getElementById('chunk-count');
    chunkSlider?.addEventListener('input', () => {
      document.getElementById('chunk-value').textContent = `${chunkSlider.value} chunks`;
      this.updateChunkPreview();
    });
    
    // Generate chunks button
    document.getElementById('generate-chunks')?.addEventListener('click', () => {
      this.generateStudyChunks();
    });
    
    // Page range inputs
    document.getElementById('start-page')?.addEventListener('input', () => this.updateChunkPreview());
    document.getElementById('end-page')?.addEventListener('input', () => this.updateChunkPreview());
  }
  
  
  updateTimerPresets(activeId) {
    document.querySelectorAll('.timer-preset').forEach(btn => {
      btn.classList.remove('active');
    });
    if (activeId) {
      document.getElementById(activeId)?.classList.add('active');
    }
  }
  
  hideAllSections() {
    const sections = [
      'upload-section', 'video-upload-section', 'text-upload-section', 
      'config-section', 'viewer-section', 'video-viewer-section', 
      'text-viewer-section', 'flashcards-section', 'reader-section'
    ];
    
    sections.forEach(sectionId => {
      const section = document.getElementById(sectionId);
      if (section) {
        section.classList.add('hidden');
      }
    });
  }
  
  showSection(sectionId) {
    // Don't hide all sections here, just show the target
    const section = document.getElementById(sectionId);
    if (section) {
      section.classList.remove('hidden');
    }
  }
  
  // Add method to go back to main dashboard
  returnToMain() {
    // Show dashboard and content selection
    document.getElementById('dashboard-section')?.classList.remove('hidden');
    document.getElementById('content-selection')?.classList.remove('hidden');
    
    // Hide all other sections
    this.hideAllSections();
    
    // Clear any selected content type
    document.querySelectorAll('.content-option-card').forEach(card => {
      card.classList.remove('selected');
    });
    
    this.currentContentType = null;
    this.currentFile = null;
    
    // Reset workflow
    this.resetWorkflow();
  }

  // New workflow methods
  resetWorkflow() {
    // Reset all steps
    document.querySelectorAll('.step').forEach(step => {
      step.classList.remove('active', 'completed');
    });
    document.getElementById('step-upload')?.classList.add('active');
    
    // Show upload content, hide config content
    document.getElementById('upload-step-content')?.classList.remove('hidden');
    document.getElementById('config-step-content')?.classList.add('hidden');
    
    // Reset buttons
    document.getElementById('proceed-to-config')?.setAttribute('disabled', 'true');
  }

  proceedToConfiguration() {
    if (!this.currentFile) {
      Toasts.show('Please upload a file first', 'error');
      return;
    }

    // Hide upload step, show config step
    document.getElementById('upload-step-content')?.classList.add('hidden');
    document.getElementById('config-step-content')?.classList.remove('hidden');
    
    // Update workflow steps
    document.getElementById('step-upload')?.classList.remove('active');
    document.getElementById('step-upload')?.classList.add('completed');
    document.getElementById('step-configure')?.classList.add('active');
    
    // Set default end page if PDF is loaded
    if (this.pdfModule && this.pdfModule.totalPages) {
      document.getElementById('end-page').value = this.pdfModule.totalPages;
    }
  }

  backToUpload() {
    // Show upload step, hide config step
    document.getElementById('config-step-content')?.classList.add('hidden');
    document.getElementById('upload-step-content')?.classList.remove('hidden');
    
    // Update workflow steps
    document.getElementById('step-configure')?.classList.remove('active');
    document.getElementById('step-upload')?.classList.remove('completed');
    document.getElementById('step-upload')?.classList.add('active');
  }

  async startStudySession() {
    try {
      const startPage = parseInt(document.getElementById('start-page').value) || 1;
      const endPage = parseInt(document.getElementById('end-page').value) || this.pdfModule.totalPages;
      const chunkCount = parseInt(document.getElementById('chunk-count').value) || 4;

      // Validate inputs
      if (startPage > endPage) {
        Toasts.show('Start page cannot be greater than end page', 'error');
        return;
      }

      // Initialize PDF module if not already done
      if (!this.pdfModule) {
        const pdfViewer = document.getElementById('pdf-viewer');
        this.pdfModule = new PDFModule(pdfViewer);
        await this.pdfModule.load(this.currentFile);
      }

      // Build chunks
      this.pdfModule.buildChunks(startPage, Math.min(endPage, this.pdfModule.totalPages), chunkCount);
      
      // Initialize page info
      this.pdfModule.updatePageInfo();
      
      // Hide upload section, show viewer
      document.getElementById('upload-section')?.classList.add('hidden');
      document.getElementById('viewer-section')?.classList.remove('hidden');
      
      // Render first chunk
      await this.pdfModule.renderChunk();
      this.updateChunkProgress();
      
      // Bind controls
      this.bindPDFControls();
      
      // Initialize timer
      this.initializeTimer();
      
      // Bind timer controls
      document.getElementById('timer-toggle')?.addEventListener('click', () => {
        this.startTimer();
      });
      
      // Update session stats
      this.updateSessionStats();
      
      // Update workflow steps
      document.getElementById('step-configure')?.classList.remove('active');
      document.getElementById('step-configure')?.classList.add('completed');
      document.getElementById('step-study')?.classList.add('active');
      
      Toasts.show('Study session started!', 'success');
      
    } catch (error) {
      console.error('Error starting study session:', error);
      Toasts.show('Failed to start study session', 'error');
    }
  }

  updateChunkDisplay(chunkCount) {
    document.getElementById('chunk-value').textContent = `${chunkCount} chunks`;
    
    if (this.pdfModule && this.pdfModule.totalPages) {
      const startPage = parseInt(document.getElementById('start-page').value) || 1;
      const endPage = parseInt(document.getElementById('end-page').value) || this.pdfModule.totalPages;
      const totalPages = endPage - startPage + 1;
      const pagesPerChunk = Math.ceil(totalPages / chunkCount);
      document.getElementById('pages-per-chunk').textContent = pagesPerChunk;
    }
  }

  setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }

  initializeTimer() {
    this.studyTimer = {
      minutes: this.selectedTimerMinutes || 25,
      seconds: 0,
      isRunning: false,
      interval: null
    };
    this.updateTimerDisplay();
  }

  updateTimerDisplay() {
    if (this.studyTimer) {
      const display = `${this.studyTimer.minutes.toString().padStart(2, '0')}:${this.studyTimer.seconds.toString().padStart(2, '0')}`;
      document.querySelector('.timer-display').textContent = display;
    }
  }

  startTimer() {
    if (!this.studyTimer.isRunning) {
      this.studyTimer.isRunning = true;
      document.querySelector('#timer-toggle i').className = 'fas fa-pause';
      
      this.studyTimer.interval = setInterval(() => {
        if (this.studyTimer.seconds > 0) {
          this.studyTimer.seconds--;
        } else if (this.studyTimer.minutes > 0) {
          this.studyTimer.minutes--;
          this.studyTimer.seconds = 59;
        } else {
          this.timerComplete();
          return;
        }
        this.updateTimerDisplay();
      }, 1000);
    } else {
      this.pauseTimer();
    }
  }

  pauseTimer() {
    this.studyTimer.isRunning = false;
    document.querySelector('#timer-toggle i').className = 'fas fa-play';
    if (this.studyTimer.interval) {
      clearInterval(this.studyTimer.interval);
    }
  }

  timerComplete() {
    this.pauseTimer();
    // Award XP for completing a study session
    RewardSystem.recordActivity('session_completed');
    Toasts.show('Study session complete! Time for a break.', 'success');
    // Play notification sound if available
    this.playNotificationSound();
  }

  playNotificationSound() {
    // Simple beep sound using Web Audio API
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.log('Audio notification not available');
    }
  }

  updateSessionStats() {
    // Update pages read
    if (this.pdfModule) {
      const currentChunk = this.pdfModule.currentChunk();
      if (currentChunk) {
        document.getElementById('pages-read').textContent = currentChunk.end;
      }
    }
    
    // Update time spent (this would be tracked during actual study)
    // document.getElementById('time-spent').textContent = this.getTimeSpent();
    
    // Update flashcard count
    if (this.flashcards) {
      document.getElementById('flashcard-count').textContent = this.flashcards.cards.length;
    }
  }

  addBookmark() {
    if (this.pdfModule) {
      const currentPage = this.pdfModule.currentPage;
      const bookmarks = JSON.parse(localStorage.getItem('pdf-bookmarks') || '[]');
      const bookmark = {
        page: currentPage,
        timestamp: new Date().toISOString(),
        fileName: this.currentFile?.name || 'Unknown'
      };
      bookmarks.push(bookmark);
      localStorage.setItem('pdf-bookmarks', JSON.stringify(bookmarks));
      Toasts.show(`Bookmark added for page ${currentPage}`, 'success');
    }
  }

  takeBreak() {
    this.pauseTimer();
    Toasts.show('Break time! The timer has been paused.', 'info');
    
    // Could add break timer functionality here
    const breakTime = 5; // 5 minutes
    const breakTimer = {
      minutes: breakTime,
      seconds: 0
    };
    
    // Show break notification
    setTimeout(() => {
      Toasts.show('Break time is over! Ready to continue studying?', 'info');
    }, breakTime * 60 * 1000);
  }

  toggleFocusMode() {
    const viewer = document.getElementById('viewer-section');
    if (viewer.classList.contains('focus-mode')) {
      viewer.classList.remove('focus-mode');
      document.getElementById('focus-mode').innerHTML = '<i class="fas fa-eye"></i> Focus';
      Toasts.show('Focus mode disabled', 'info');
    } else {
      viewer.classList.add('focus-mode');
      document.getElementById('focus-mode').innerHTML = '<i class="fas fa-eye-slash"></i> Exit Focus';
      Toasts.show('Focus mode enabled - minimal distractions', 'success');
    }
  }
  
  showConfigPanel(configType) {
    // Update navigation
    document.querySelectorAll('.config-nav-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    document.querySelector(`[data-config="${configType}"]`)?.classList.add('active');
    
    // Show panel
    document.querySelectorAll('.config-panel').forEach(panel => {
      panel.classList.remove('active');
    });
    document.getElementById(`${configType}-config`)?.classList.add('active');
  }
  
  updateChunkPreview() {
    const startPage = parseInt(document.getElementById('start-page')?.value) || 1;
    const endPage = parseInt(document.getElementById('end-page')?.value) || startPage;
    const chunkCount = parseInt(document.getElementById('chunk-count')?.value) || 1;
    
    const totalPages = Math.max(endPage - startPage + 1, 1);
    const pagesPerChunk = Math.ceil(totalPages / chunkCount);
    
    const previewEl = document.getElementById('pages-per-chunk');
    if (previewEl) {
      previewEl.textContent = pagesPerChunk;
    }
  }
  
  updateTextStats() {
    const textContent = document.getElementById('text-content')?.value || '';
    const words = textContent.trim() ? textContent.trim().split(/\s+/).length : 0;
    const characters = textContent.length;
    const readingTime = Math.ceil(words / 250); // 250 WPM average
    
    document.getElementById('word-count').textContent = `${words} words`;
    document.getElementById('char-count').textContent = `${characters} characters`;
    document.getElementById('reading-time').textContent = `~${readingTime} min read`;
  }
  
  removeFile() {
    document.getElementById('file-input').value = '';
    document.getElementById('file-info')?.classList.add('hidden');
    this.currentFile = null;
    
    // Disable proceed button
    document.getElementById('proceed-to-config')?.setAttribute('disabled', 'true');
    
    // Reset PDF module
    this.pdfModule = null;
  }
  
  processVideoInput() {
    const url = document.getElementById('video-url')?.value;
    const title = document.getElementById('video-title')?.value;
    const minutes = parseInt(document.getElementById('video-minutes')?.value) || 0;
    const seconds = parseInt(document.getElementById('video-seconds')?.value) || 0;
    
    if (!url || !title) {
      Toasts.show('Please provide both video URL and title', 'warning');
      return;
    }
    
    this.currentVideoData = {
      url, title, duration: minutes * 60 + seconds
    };
    
    this.showSection('config-section');
    this.showConfigPanel('chunks');
    
    // Update end page field for video duration
    const endPageField = document.getElementById('end-page');
    if (endPageField) {
      endPageField.value = Math.ceil((minutes * 60 + seconds) / 60); // Convert to "pages" as minutes
    }
    
    Toasts.show('Video information captured! Configure your study settings.', 'success');
  }
  
  processTextInput() {
    const title = document.getElementById('text-title')?.value;
    const content = document.getElementById('text-content')?.value;
    
    if (!title || !content) {
      Toasts.show('Please provide both title and content', 'warning');
      return;
    }
    
    this.currentTextData = { title, content };
    
    this.showSection('config-section');
    this.showConfigPanel('chunks');
    
    Toasts.show('Text content captured! Configure your study settings.', 'success');
  }
  
  generateStudyChunks() {
    const studyGoal = document.getElementById('study-goal')?.value;
    const studyMode = document.getElementById('study-mode')?.value;
    
    if (!studyGoal) {
      Toasts.show('Please set a study goal first', 'warning');
      return;
    }
    
    if (this.currentContentType === 'pdf' && this.currentFile) {
      this.generatePDFChunks();
    } else if (this.currentContentType === 'video' && this.currentVideoData) {
      this.generateVideoChunks();
    } else if (this.currentContentType === 'text' && this.currentTextData) {
      this.generateTextChunks();
    } else {
      Toasts.show('Please upload content first', 'warning');
    }
  }
  
  async generatePDFChunks() {
    try {
      const startPage = parseInt(document.getElementById('start-page')?.value) || 1;
      const endPage = parseInt(document.getElementById('end-page')?.value) || 1;
      const chunkCount = parseInt(document.getElementById('chunk-count')?.value) || 1;
      
      // Initialize PDF module
      const pdfViewer = document.getElementById('pdf-viewer');
      this.pdfModule = new PDFModule(pdfViewer);
      
      // Load PDF
      const totalPages = await this.pdfModule.load(this.currentFile);
      
      // Set end page if not set
      if (!document.getElementById('end-page')?.value) {
        document.getElementById('end-page').value = totalPages;
      }
      
      // Build chunks
      this.pdfModule.buildChunks(startPage, Math.min(endPage, totalPages), chunkCount);
      
      // Initialize page info
      this.pdfModule.updatePageInfo();
      
      // Show viewer
      this.showSection('viewer-section');
      await this.pdfModule.renderChunk();
      
      this.bindPDFControls();
      this.updateChunkProgress();
      
      Toasts.show('PDF loaded and chunked successfully!', 'success');
      
    } catch (error) {
      console.error('PDF chunking error:', error);
      Toasts.show('Failed to process PDF: ' + error.message, 'danger');
    }
  }
  
  generateVideoChunks() {
    const chunkCount = parseInt(document.getElementById('video-chunk-count')?.value) || 5;
    
    // Show video viewer
    this.showSection('video-viewer-section');
    
    // Set video title
    document.getElementById('video-viewer-title').textContent = `Video Study: ${this.currentVideoData.title}`;
    document.getElementById('embedded-video-title').textContent = this.currentVideoData.title;
    document.getElementById('embedded-video-duration').textContent = `Duration: ${Utils.formatTime(this.currentVideoData.duration)}`;
    
    // Create video chunks
    this.videoChunks = [];
    const chunkDuration = this.currentVideoData.duration / chunkCount;
    
    for (let i = 0; i < chunkCount; i++) {
      const start = i * chunkDuration;
      const end = Math.min((i + 1) * chunkDuration, this.currentVideoData.duration);
      this.videoChunks.push({
        id: i,
        start: start,
        end: end,
        completed: false
      });
    }
    
    this.currentVideoChunk = 0;
    this.updateVideoChunkInfo();
    
    Toasts.show('Video chunks generated successfully!', 'success');
  }
  
  generateTextChunks() {
    const chunkCount = parseInt(document.getElementById('chunk-count')?.value) || 5;
    
    // Initialize text module
    this.textModule = new TextModule(document.getElementById('text-content-display'));
    this.textModule.content = this.currentTextData.content;
    this.textModule.buildChunks(chunkCount);
    
    // Show text viewer
    this.showSection('text-viewer-section');
    document.getElementById('text-viewer-title').textContent = `Text Study: ${this.currentTextData.title}`;
    
    this.textModule.renderChunk();
    this.updateTextProgress();
    
    Toasts.show('Text chunks generated successfully!', 'success');
  }
  
  
  bindPDFControls() {
    // Zoom controls
    document.getElementById('zoom-in')?.addEventListener('click', () => {
      if (this.pdfModule) {
        const newZoom = this.pdfModule.zoomIn();
        document.getElementById('zoom-level').textContent = Math.round(newZoom * 100) + '%';
        this.pdfModule.renderChunk();
      }
    });
    
    document.getElementById('zoom-out')?.addEventListener('click', () => {
      if (this.pdfModule) {
        const newZoom = this.pdfModule.zoomOut();
        document.getElementById('zoom-level').textContent = Math.round(newZoom * 100) + '%';
        this.pdfModule.renderChunk();
      }
    });
    
    // Chunk navigation
    document.getElementById('prev-chunk')?.addEventListener('click', () => {
      if (this.pdfModule && this.pdfModule.prevChunk()) {
        this.pdfModule.renderChunk();
        this.updateChunkProgress();
      }
    });
    
    document.getElementById('next-chunk')?.addEventListener('click', () => {
      if (this.pdfModule && this.pdfModule.nextChunk()) {
        this.pdfModule.renderChunk();
        this.updateChunkProgress();
      }
    });
    
    // Study actions
    document.getElementById('create-flashcards')?.addEventListener('click', () => {
      this.generateFlashcardsFromContent();
    });
    
    document.getElementById('start-reading')?.addEventListener('click', () => {
      this.startFocusMode();
    });
    
    // Page navigation
    document.getElementById('prev-page')?.addEventListener('click', () => {
      if (this.pdfModule && this.pdfModule.prevPage()) {
        this.pdfModule.renderSinglePage();
      }
    });
    
    document.getElementById('next-page')?.addEventListener('click', () => {
      if (this.pdfModule && this.pdfModule.nextPage()) {
        this.pdfModule.renderSinglePage();
      }
    });
    
    // View mode toggle
    document.getElementById('toggle-view-mode')?.addEventListener('click', () => {
      if (this.pdfModule) {
        if (this.pdfModule.singlePageMode) {
          // Switch to chunk mode
          this.pdfModule.singlePageMode = false;
          this.pdfModule.renderChunk();
          this.updateChunkProgress();
          document.getElementById('toggle-view-mode').innerHTML = '<i class="fas fa-th-large"></i> Chunks';
          document.getElementById('toggle-view-mode').title = 'Switch to single page view';
        } else {
          // Switch to single page mode
          this.pdfModule.singlePageMode = true;
          this.pdfModule.renderSinglePage();
          document.getElementById('toggle-view-mode').innerHTML = '<i class="fas fa-file"></i> Pages';
          document.getElementById('toggle-view-mode').title = 'Switch to chunk view';
        }
      }
    });

    // Additional PDF controls
    document.getElementById('add-bookmark')?.addEventListener('click', () => {
      this.addBookmark();
    });

    document.getElementById('take-break')?.addEventListener('click', () => {
      this.takeBreak();
    });

    document.getElementById('focus-mode')?.addEventListener('click', () => {
      this.toggleFocusMode();
    });
  }
  
  bindVideoControls() {
    document.getElementById('prev-video-chunk')?.addEventListener('click', () => {
      if (this.currentVideoChunk > 0) {
        this.currentVideoChunk--;
        this.updateVideoChunkInfo();
      }
    });
    
    document.getElementById('next-video-chunk')?.addEventListener('click', () => {
      if (this.currentVideoChunk < this.videoChunks.length - 1) {
        this.currentVideoChunk++;
        this.updateVideoChunkInfo();
      }
    });
    
    document.getElementById('create-video-flashcards')?.addEventListener('click', () => {
      // Generate flashcards from video transcript if available
      Toasts.show('Video flashcard generation coming soon!', 'info');
    });
  }
  
  bindTextControls() {
    document.getElementById('prev-text-chunk')?.addEventListener('click', () => {
      if (this.textModule && this.textModule.prevChunk()) {
        this.textModule.renderChunk();
        this.updateTextProgress();
      }
    });
    
    document.getElementById('next-text-chunk')?.addEventListener('click', () => {
      if (this.textModule && this.textModule.nextChunk()) {
        this.textModule.renderChunk();
        this.updateTextProgress();
      }
    });
    
    document.getElementById('create-text-flashcards')?.addEventListener('click', () => {
      this.generateFlashcardsFromContent();
    });
    
    // Text display settings
    document.getElementById('text-settings')?.addEventListener('click', () => {
      const settings = document.getElementById('text-display-settings');
      settings?.classList.toggle('hidden');
    });
  }
  
  bindFlashcards() {
    // Mount flashcards UI
    this.flashcards.mount({
      front: document.querySelector('.flashcard-front h3'),
      back: document.querySelector('.flashcard-back h3'),
      progress: document.getElementById('flashcard-progress'),
      container: document.getElementById('flashcard'),
      stats: {
        known: document.getElementById('known-count'),
        practice: document.getElementById('practice-count'),
        remaining: document.getElementById('remaining-count')
      }
    });
    
    // Flashcard controls
    document.getElementById('flashcard-prev')?.addEventListener('click', () => {
      this.flashcards.prev();
    });
    
    document.getElementById('flashcard-next')?.addEventListener('click', () => {
      this.flashcards.next();
    });
    
    document.getElementById('shuffle-cards')?.addEventListener('click', () => {
      this.flashcards.shuffle();
    });
    
    document.getElementById('flashcard-flip')?.addEventListener('click', () => {
      document.getElementById('flashcard')?.classList.toggle('flipped');
    });
    
    // Click to flip
    document.getElementById('flashcard')?.addEventListener('click', () => {
      document.getElementById('flashcard')?.classList.toggle('flipped');
    });
    
    // Difficulty feedback
    document.getElementById('dont-know-card')?.addEventListener('click', () => {
      this.flashcards.mark('practice');
    });
    
    document.getElementById('partial-know-card')?.addEventListener('click', () => {
      this.flashcards.mark('partial');
    });
    
    document.getElementById('know-card')?.addEventListener('click', () => {
      this.flashcards.mark('known');
    });
    
    document.getElementById('exit-flashcards')?.addEventListener('click', () => {
      this.exitFlashcards();
    });
  }
  
  bindThemeControls() {
    document.querySelectorAll('.theme-option').forEach(btn => {
      btn.addEventListener('click', () => {
        const theme = btn.dataset.theme;
        Theme.apply(theme);
        
        // Update active theme button
        document.querySelectorAll('.theme-option').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        Toasts.show(`Switched to ${theme} theme`, 'info');
      });
    });
  }
  
  updateChunkProgress() {
    if (!this.pdfModule) return;
    
    const progress = this.pdfModule.chunkProgressPercent();
    const progressEl = document.getElementById('chunk-progress');
    const progressText = document.getElementById('chunk-progress-text');
    
    if (progressEl) progressEl.style.width = progress + '%';
    if (progressText) progressText.textContent = progress + '%';
    
    // Update chunk info
    const chunk = this.pdfModule.currentChunk();
    const chunkInfo = document.getElementById('chunk-info');
    if (chunk && chunkInfo) {
      chunkInfo.textContent = `Chunk ${this.pdfModule.currentChunkIndex + 1} of ${this.pdfModule.chunks.length}`;
    }
    
    // Update session stats
    this.updateSessionStats();
  }
  
  updateVideoChunkInfo() {
    if (!this.videoChunks) return;
    
    const chunk = this.videoChunks[this.currentVideoChunk];
    const chunkInfo = document.getElementById('video-chunk-info');
    
    if (chunk && chunkInfo) {
      const startTime = Utils.formatTime(chunk.start);
      const endTime = Utils.formatTime(chunk.end);
      chunkInfo.textContent = `Chunk ${this.currentVideoChunk + 1} of ${this.videoChunks.length} - ${startTime}-${endTime}`;
    }
    
    // Update progress
    const progress = Math.round((this.currentVideoChunk / this.videoChunks.length) * 100);
    document.getElementById('video-chunk-progress').style.width = progress + '%';
    document.getElementById('video-progress-text').textContent = progress + '%';
  }
  
  updateTextProgress() {
    if (!this.textModule) return;
    
    const progress = this.textModule.chunkProgressPercent();
    document.getElementById('text-progress').style.width = progress + '%';
    document.getElementById('text-progress-text').textContent = progress + '%';
    
    const chunkInfo = document.getElementById('text-chunk-info');
    if (chunkInfo) {
      chunkInfo.textContent = `Section ${this.textModule.currentChunkIndex + 1} of ${this.textModule.chunks.length}`;
    }
  }
  
  startFocusMode() {
    this.showSection('reader-section');
    
    // Set up reader view based on content type
    if (this.currentContentType === 'pdf' && this.pdfModule) {
      document.getElementById('reader-pdf-container')?.classList.remove('hidden');
      document.getElementById('reader-text-container')?.classList.add('hidden');
      
      // Render current chunk in reader
      const readerPdfEl = document.getElementById('reader-pdf');
      if (readerPdfEl) {
        this.pdfModule.renderChunk(); // This will render to the main viewer
        // You might want to create a separate render method for reader mode
      }
    } else if (this.currentContentType === 'text' && this.textModule) {
      document.getElementById('reader-text-container')?.classList.remove('hidden');
      document.getElementById('reader-pdf-container')?.classList.add('hidden');
      
      const readerTextEl = document.getElementById('reader-text');
      if (readerTextEl) {
        const chunk = this.textModule.currentChunk();
        if (chunk) {
          readerTextEl.innerHTML = chunk.text.replace(/\n/g, '<br>');
        }
      }
    }
    
    // Show motivational quote
    const quote = Quotes.getByContext('focus');
    document.getElementById('motivational-quote').textContent = quote.text;
    document.getElementById('quote-author').textContent = `- ${quote.author}`;
    
    // Set up reader timer
    if (this.timer) {
      const readerTimer = document.getElementById('reader-timer');
      this.timer.mirrorEls.push(readerTimer);
      this.timer.render();
    }
    
    Toasts.show('Focus mode activated! Minimize distractions and study effectively.', 'success');
  }
  
  exitFlashcards() {
    // Return to previous section based on content type
    if (this.currentContentType === 'pdf') {
      this.showSection('viewer-section');
    } else if (this.currentContentType === 'video') {
      this.showSection('video-viewer-section');
    } else if (this.currentContentType === 'text') {
      this.showSection('text-viewer-section');
    } else {
      this.showSection('content-selection');
    }
  }
  
  setupTimerSync() {
    if (this.timer) {
      this.timer.on('tick', () => {
        Analytics.updateDashboard();
      });
      
      this.timer.on('complete', (data) => {
        if (data.type === 'study') {
          const quote = Quotes.getByContext('motivation');
          Toasts.show(`Session complete! "${quote.text}" - ${quote.author}`, 'success', 6000);
        }
      });
    }
  }
  
  async handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    this.currentFile = file;
    
    try {
      // Show file info
      this.showFileInfo(file);
      
      // Track upload for achievements
      RewardSystem.recordActivity('upload_content', { 
        type: file.type, 
        name: file.name,
        source: file.type.includes('pdf') ? 'pdf' : file.type.includes('video') ? 'video' : 'text'
      });
      
      if (file.type.includes('pdf')) {
        // Pre-load PDF to get total pages
        const pdfViewer = document.getElementById('pdf-viewer');
        this.pdfModule = new PDFModule(pdfViewer);
        await this.pdfModule.load(file);
        
        // Set default end page
        document.getElementById('end-page').value = this.pdfModule.totalPages;
      }
      
      // Enable proceed button
      document.getElementById('proceed-to-config')?.removeAttribute('disabled');
      
      Toasts.show(`${file.name} uploaded successfully!`, 'success');
      
    } catch (error) {
      console.error('File loading error:', error);
      Toasts.show(`Failed to load ${file.name}: ${error.message}`, 'danger');
    }
  }
  
  showFileInfo(file) {
    const fileInfo = document.getElementById('file-info');
    const fileName = fileInfo?.querySelector('.file-name');
    const fileSize = fileInfo?.querySelector('.file-size');
    
    if (fileName) fileName.textContent = file.name;
    if (fileSize) fileSize.textContent = Utils.humanFileSize(file.size);
    if (fileInfo) fileInfo.classList.remove('hidden');
  }
  
  async updatePDFInfo(file) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const doc = await pdfjsLib.getDocument(new Uint8Array(arrayBuffer)).promise;
      const totalPages = doc.numPages;
      
      // Update page range fields
      document.getElementById('start-page').value = 1;
      document.getElementById('end-page').value = totalPages;
      
      this.updateChunkPreview();
      
    } catch (error) {
      console.error('PDF info error:', error);
    }
  }
  
  generateFlashcardsFromContent() {
    let content = '';
    let type = 'text';
    
    if (this.currentContentType === 'pdf' && this.pdfModule) {
      content = this.pdfModule.getExtractedText();
      type = 'pdf';
    } else if (this.currentContentType === 'text' && this.textModule) {
      content = this.textModule.getFullText();
      type = 'text';
    } else {
      Toasts.show('No content available for flashcard generation', 'warning');
      return;
    }
    
    if (content) {
      this.flashcards.generateFromContent(content, type);
      this.showSection('flashcards-section');
    }
  }

  showSmartScheduleModal() {
    const recommendations = TimeManagement.getOptimalStudySchedule();
    const dashboardData = TimeManagement.getDashboardData();
    
    const modalHTML = `
      <div class="modal-overlay" id="schedule-modal">
        <div class="modal-content">
          <div class="modal-header">
            <h3>📅 Smart Study Schedule</h3>
            <button class="modal-close">&times;</button>
          </div>
          <div class="modal-body">
            <div class="schedule-section">
              <h4>🎯 Your Peak Performance Times</h4>
              <div class="peak-times">
                ${recommendations.peakHours.map(hour => `
                  <div class="time-slot peak">
                    <span class="time">${hour}:00 - ${hour + 1}:00</span>
                    <span class="label">Peak Focus</span>
                  </div>
                `).join('')}
              </div>
            </div>
            
            <div class="schedule-section">
              <h4>⚡ Recommended Session Length</h4>
              <div class="recommendation-card">
                <div class="rec-value">${recommendations.suggestedDuration} minutes</div>
                <div class="rec-label">Focus sessions</div>
              </div>
              <div class="recommendation-card">
                <div class="rec-value">${recommendations.breakDuration} minutes</div>
                <div class="rec-label">Break time</div>
              </div>
            </div>
            
            <div class="schedule-section">
              <h4>📊 Your Study Patterns</h4>
              <div class="pattern-stats">
                <div class="pattern-item">
                  <span class="pattern-label">Consistency Score:</span>
                  <span class="pattern-value">${dashboardData.habits.consistencyScore}%</span>
                </div>
                <div class="pattern-item">
                  <span class="pattern-label">Avg Session:</span>
                  <span class="pattern-value">${dashboardData.habits.avgSession} min</span>
                </div>
                <div class="pattern-item">
                  <span class="pattern-label">Completion Rate:</span>
                  <span class="pattern-value">${dashboardData.habits.completionRate}%</span>
                </div>
              </div>
            </div>
            
            <div class="schedule-actions">
              <button class="btn btn-primary" onclick="this.closest('.modal-overlay').remove()">
                Apply Schedule
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    const modal = document.getElementById('schedule-modal');
    const closeBtn = modal.querySelector('.modal-close');
    
    closeBtn.addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });
  }

  showStudyInsightsModal() {
    const insights = TimeManagement.generateInsights();
    const dashboardData = TimeManagement.getDashboardData();
    
    const modalHTML = `
      <div class="modal-overlay" id="insights-modal">
        <div class="modal-content">
          <div class="modal-header">
            <h3>📈 Study Insights & Tips</h3>
            <button class="modal-close">&times;</button>
          </div>
          <div class="modal-body">
            <div class="insights-section">
              <h4>🎯 Today's Progress</h4>
              <div class="progress-grid">
                <div class="progress-item">
                  <div class="progress-circle" style="--progress: ${dashboardData.todayProgress.timeProgress}%">
                    <span>${Math.round(dashboardData.todayProgress.timeProgress)}%</span>
                  </div>
                  <div class="progress-label">Time Goal</div>
                </div>
                <div class="progress-item">
                  <div class="progress-value">${dashboardData.todayProgress.sessionCount}</div>
                  <div class="progress-label">Sessions Today</div>
                </div>
                <div class="progress-item">
                  <div class="progress-value">${dashboardData.todayProgress.focusScore}%</div>
                  <div class="progress-label">Focus Score</div>
                </div>
              </div>
            </div>
            
            <div class="insights-section">
              <h4>💡 Personalized Insights</h4>
              <div class="insights-list">
                ${insights.map(insight => `
                  <div class="insight-item ${insight.type}">
                    <div class="insight-icon">
                      ${insight.type === 'warning' ? '⚠️' : insight.type === 'tip' ? '💡' : 'ℹ️'}
                    </div>
                    <div class="insight-content">
                      <h5>${insight.title}</h5>
                      <p>${insight.message}</p>
                      <div class="insight-action">${insight.action}</div>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
            
            <div class="insights-section">
              <h4>🏆 Streak Information</h4>
              <div class="streak-info">
                <div class="streak-item">
                  <span class="streak-number">${dashboardData.streaks.current}</span>
                  <span class="streak-label">Current Streak</span>
                </div>
                <div class="streak-item">
                  <span class="streak-number">${dashboardData.streaks.longest}</span>
                  <span class="streak-label">Longest Streak</span>
                </div>
                <div class="streak-item">
                  <span class="streak-number">${dashboardData.streaks.perfectDays}</span>
                  <span class="streak-label">Perfect Days</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    const modal = document.getElementById('insights-modal');
    const closeBtn = modal.querySelector('.modal-close');
    
    closeBtn.addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });
  }
}

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new App();
});

