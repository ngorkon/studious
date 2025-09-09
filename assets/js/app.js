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
  return { pad, formatClock, formatTime, debounce, createEl, downloadJSON, humanFileSize };
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
    this.chunks = [];
    this.currentChunkIndex = 0;
    this.zoom = 1.0;
    this.rendering = false;
    this.extractedText = '';
  }
  
  async load(file) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      this.doc = await pdfjsLib.getDocument(new Uint8Array(arrayBuffer)).promise;
      this.totalPages = this.doc.numPages;
      
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
    
    this.init();
  }
  
  init() {
    Theme.init();
    this.bindUI();
    this.setupTimerSync();
    Analytics.updateDashboard();
    Toasts.show('Welcome back to Studious!', 'info');
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
    
    // Export functionality
    document.getElementById('export-progress')?.addEventListener('click', () => {
      const data = {
        flashcards: this.flashcards.cards,
        stats: Analytics.getStats(),
        theme: Theme.current(),
        timestamp: new Date().toISOString()
      };
      Utils.downloadJSON(data, `studious-export-${new Date().toISOString().split('T')[0]}.json`);
      Toasts.show('Data exported successfully!', 'success');
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
          }
          break;
        case 'ArrowRight':
          if (document.getElementById('flashcards-section')?.classList.contains('active')) {
            this.flashcards.next();
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
  }
  
  selectContentType(type) {
    // Update selected content option
    document.querySelectorAll('.content-option-card').forEach(card => {
      card.classList.remove('selected');
    });
    document.getElementById(`select-${type}`)?.classList.add('selected');
    
    // Show appropriate upload section
    this.hideAllSections();
    
    if (type === 'pdf') {
      this.showSection('upload-section');
    } else if (type === 'video') {
      this.showSection('video-upload-section');
    } else if (type === 'text') {
      this.showSection('text-upload-section');
    }
    
    this.currentContentType = type;
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
    this.hideAllSections();
    const section = document.getElementById(sectionId);
    if (section) {
      section.classList.remove('hidden');
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
      // Implementation for individual page navigation if needed
    });
    
    document.getElementById('next-page')?.addEventListener('click', () => {
      // Implementation for individual page navigation if needed
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
      
      if (file.type.includes('pdf')) {
        // Update end page field based on PDF
        this.updatePDFInfo(file);
      }
      
      // Show configuration section
      this.showSection('config-section');
      this.showConfigPanel('chunks');
      
      Toasts.show(`${file.name} ready for configuration!`, 'success');
      
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
}

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new App();
});

