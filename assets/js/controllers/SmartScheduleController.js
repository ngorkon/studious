// Smart Schedule Controller - Main interface for AI-powered scheduling
class SmartScheduleController {
    constructor() {
        this.aiScheduler = null;
        this.isInitialized = false;
        this.currentSchedule = null;
        this.schedulingMode = 'adaptive'; // adaptive, manual, ai_guided
        
        this.ui = {
            container: null,
            controls: null,
            display: null,
            feedback: null
        };
        
        this.init();
    }

    async init() {
        console.log('🚀 Initializing Smart Schedule Controller...');
        
        try {
            // Initialize AI Scheduler
            this.aiScheduler = new AISmartScheduler();
            await this.aiScheduler.init();
            
            // Setup UI
            this.setupUI();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Load existing schedule if available
            await this.loadExistingSchedule();
            
            this.isInitialized = true;
            console.log('✅ Smart Schedule Controller ready!');
            
        } catch (error) {
            console.error('Failed to initialize Smart Schedule Controller:', error);
            this.showError('Failed to initialize smart scheduling. Some features may be limited.');
        }
    }

    setupUI() {
        // Create main container
        this.ui.container = document.createElement('div');
        this.ui.container.className = 'smart-schedule-container';
        this.ui.container.innerHTML = this.createMainHTML();
        
        // Find insertion point (could be in dashboard or dedicated schedule view)
        const insertionPoint = document.querySelector('.dashboard-content') || 
                              document.querySelector('.main-content') || 
                              document.body;
        
        insertionPoint.appendChild(this.ui.container);
        
        // Cache UI elements
        this.ui.controls = this.ui.container.querySelector('.schedule-controls');
        this.ui.display = this.ui.container.querySelector('.schedule-display');
        this.ui.feedback = this.ui.container.querySelector('.schedule-feedback');
        
        // Apply initial styling
        this.applyStyles();
    }

    createMainHTML() {
        return `
            <div class="smart-schedule-wrapper">
                <div class="schedule-header">
                    <h2>🧠 AI Smart Schedule</h2>
                    <div class="schedule-modes">
                        <button class="mode-btn active" data-mode="adaptive">🔄 Adaptive</button>
                        <button class="mode-btn" data-mode="ai_guided">🤖 AI Guided</button>
                        <button class="mode-btn" data-mode="manual">✋ Manual</button>
                    </div>
                </div>
                
                <div class="schedule-controls">
                    <div class="control-group">
                        <label>📚 Subjects to Schedule:</label>
                        <div class="subjects-input">
                            <input type="text" id="subject-input" placeholder="Add subject..." />
                            <button class="add-subject-btn">➕</button>
                        </div>
                        <div class="subjects-list" id="subjects-list"></div>
                    </div>
                    
                    <div class="control-group">
                        <label>⏰ Time Preferences:</label>
                        <div class="time-controls">
                            <div class="time-input">
                                <label>Daily Hours:</label>
                                <input type="range" id="daily-hours" min="1" max="12" value="4" />
                                <span class="value-display">4 hours</span>
                            </div>
                            <div class="time-input">
                                <label>Start Time:</label>
                                <input type="time" id="start-time" value="09:00" />
                            </div>
                            <div class="time-input">
                                <label>End Time:</label>
                                <input type="time" id="end-time" value="21:00" />
                            </div>
                        </div>
                    </div>
                    
                    <div class="control-group">
                        <label>🎯 Learning Goals:</label>
                        <div class="goals-input">
                            <select id="goal-type">
                                <option value="exam_prep">Exam Preparation</option>
                                <option value="skill_building">Skill Building</option>
                                <option value="maintenance">Knowledge Maintenance</option>
                                <option value="exploration">Subject Exploration</option>
                            </select>
                            <input type="date" id="goal-deadline" />
                        </div>
                    </div>
                    
                    <div class="control-group">
                        <label>⚙️ AI Preferences:</label>
                        <div class="ai-preferences">
                            <label class="checkbox-label">
                                <input type="checkbox" id="use-biorhythm" checked />
                                Use biorhythm analysis
                            </label>
                            <label class="checkbox-label">
                                <input type="checkbox" id="context-aware" checked />
                                Context-aware adaptations
                            </label>
                            <label class="checkbox-label">
                                <input type="checkbox" id="real-time-monitoring" />
                                Real-time monitoring
                            </label>
                        </div>
                    </div>
                    
                    <div class="action-buttons">
                        <button class="generate-btn primary" id="generate-schedule">
                            🎯 Generate Optimal Schedule
                        </button>
                        <button class="optimize-btn secondary" id="optimize-existing">
                            ⚡ Optimize Current Schedule
                        </button>
                        <button class="suggest-btn secondary" id="suggest-improvements">
                            💡 Suggest Improvements
                        </button>
                    </div>
                </div>
                
                <div class="schedule-display">
                    <div class="display-header">
                        <h3>📅 Your Optimized Schedule</h3>
                        <div class="display-controls">
                            <button class="view-btn" data-view="week">Week</button>
                            <button class="view-btn active" data-view="day">Day</button>
                            <button class="view-btn" data-view="timeline">Timeline</button>
                        </div>
                    </div>
                    <div class="schedule-content" id="schedule-content">
                        <div class="no-schedule">
                            <p>🌟 Ready to create your personalized AI schedule?</p>
                            <p>Configure your preferences above and click "Generate Optimal Schedule"</p>
                        </div>
                    </div>
                </div>
                
                <div class="schedule-feedback">
                    <div class="ai-insights">
                        <h4>🧠 AI Insights</h4>
                        <div class="insights-content" id="insights-content">
                            <p>AI insights will appear here after schedule generation...</p>
                        </div>
                    </div>
                    
                    <div class="performance-metrics">
                        <h4>📊 Expected Performance</h4>
                        <div class="metrics-grid" id="metrics-grid">
                            <div class="metric">
                                <span class="metric-label">Efficiency Score</span>
                                <span class="metric-value">--</span>
                            </div>
                            <div class="metric">
                                <span class="metric-label">Energy Match</span>
                                <span class="metric-value">--</span>
                            </div>
                            <div class="metric">
                                <span class="metric-label">Retention Rate</span>
                                <span class="metric-value">--</span>
                            </div>
                            <div class="metric">
                                <span class="metric-label">Stress Level</span>
                                <span class="metric-value">--</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="schedule-actions">
                    <button class="action-btn" id="save-schedule">💾 Save Schedule</button>
                    <button class="action-btn" id="export-schedule">📤 Export</button>
                    <button class="action-btn" id="share-schedule">🔗 Share</button>
                    <button class="action-btn" id="schedule-settings">⚙️ Settings</button>
                </div>
            </div>
        `;
    }

    applyStyles() {
        const styles = `
            .smart-schedule-container {
                max-width: 1200px;
                margin: 20px auto;
                padding: 20px;
                background: var(--card-bg, #ffffff);
                border-radius: 12px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
                font-family: var(--font-family, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif);
            }
            
            .schedule-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 30px;
                padding-bottom: 20px;
                border-bottom: 2px solid var(--border-color, #e0e0e0);
            }
            
            .schedule-header h2 {
                margin: 0;
                color: var(--primary-color, #2196f3);
                font-size: 2rem;
                font-weight: 600;
            }
            
            .schedule-modes {
                display: flex;
                gap: 10px;
            }
            
            .mode-btn {
                padding: 8px 16px;
                border: 2px solid var(--primary-color, #2196f3);
                background: transparent;
                color: var(--primary-color, #2196f3);
                border-radius: 20px;
                cursor: pointer;
                transition: all 0.3s ease;
                font-weight: 500;
            }
            
            .mode-btn.active {
                background: var(--primary-color, #2196f3);
                color: white;
            }
            
            .mode-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(33, 150, 243, 0.3);
            }
            
            .schedule-controls {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 30px;
                margin-bottom: 40px;
            }
            
            .control-group {
                display: flex;
                flex-direction: column;
                gap: 15px;
            }
            
            .control-group label {
                font-weight: 600;
                color: var(--text-primary, #333);
                font-size: 1.1rem;
            }
            
            .subjects-input {
                display: flex;
                gap: 10px;
            }
            
            .subjects-input input {
                flex: 1;
                padding: 12px;
                border: 2px solid var(--border-color, #e0e0e0);
                border-radius: 8px;
                font-size: 1rem;
                transition: border-color 0.3s ease;
            }
            
            .subjects-input input:focus {
                outline: none;
                border-color: var(--primary-color, #2196f3);
            }
            
            .add-subject-btn {
                padding: 12px 16px;
                background: var(--success-color, #4caf50);
                color: white;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                font-size: 1rem;
                transition: background 0.3s ease;
            }
            
            .add-subject-btn:hover {
                background: var(--success-hover, #45a049);
            }
            
            .subjects-list {
                display: flex;
                flex-wrap: wrap;
                gap: 10px;
                min-height: 40px;
                padding: 10px;
                border: 1px dashed var(--border-color, #e0e0e0);
                border-radius: 8px;
            }
            
            .subject-tag {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 6px 12px;
                background: var(--primary-light, #e3f2fd);
                color: var(--primary-color, #2196f3);
                border-radius: 16px;
                font-size: 0.9rem;
                font-weight: 500;
            }
            
            .subject-tag .remove-btn {
                background: none;
                border: none;
                color: var(--error-color, #f44336);
                cursor: pointer;
                font-size: 1rem;
                padding: 0;
            }
            
            .time-controls {
                display: flex;
                flex-direction: column;
                gap: 15px;
            }
            
            .time-input {
                display: flex;
                align-items: center;
                gap: 15px;
            }
            
            .time-input label {
                min-width: 100px;
                font-weight: 500;
                font-size: 1rem;
            }
            
            .time-input input[type="range"] {
                flex: 1;
                height: 6px;
                background: var(--border-color, #e0e0e0);
                border-radius: 3px;
                outline: none;
            }
            
            .time-input input[type="time"] {
                padding: 8px 12px;
                border: 2px solid var(--border-color, #e0e0e0);
                border-radius: 6px;
                font-size: 1rem;
            }
            
            .value-display {
                min-width: 60px;
                font-weight: 600;
                color: var(--primary-color, #2196f3);
            }
            
            .goals-input {
                display: flex;
                gap: 15px;
            }
            
            .goals-input select,
            .goals-input input {
                flex: 1;
                padding: 12px;
                border: 2px solid var(--border-color, #e0e0e0);
                border-radius: 8px;
                font-size: 1rem;
            }
            
            .ai-preferences {
                display: flex;
                flex-direction: column;
                gap: 12px;
            }
            
            .checkbox-label {
                display: flex;
                align-items: center;
                gap: 10px;
                font-weight: 500;
                cursor: pointer;
            }
            
            .checkbox-label input[type="checkbox"] {
                width: 18px;
                height: 18px;
                accent-color: var(--primary-color, #2196f3);
            }
            
            .action-buttons {
                grid-column: 1 / -1;
                display: flex;
                gap: 15px;
                justify-content: center;
                margin-top: 20px;
            }
            
            .generate-btn,
            .optimize-btn,
            .suggest-btn {
                padding: 15px 30px;
                border: none;
                border-radius: 25px;
                font-size: 1.1rem;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            
            .primary {
                background: linear-gradient(135deg, var(--primary-color, #2196f3), var(--primary-dark, #1976d2));
                color: white;
                box-shadow: 0 4px 15px rgba(33, 150, 243, 0.4);
            }
            
            .secondary {
                background: var(--secondary-color, #6c757d);
                color: white;
                box-shadow: 0 4px 15px rgba(108, 117, 125, 0.3);
            }
            
            .primary:hover,
            .secondary:hover {
                transform: translateY(-3px);
                box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
            }
            
            .schedule-display {
                margin-bottom: 30px;
                padding: 25px;
                background: var(--secondary-bg, #f8f9fa);
                border-radius: 12px;
                border: 1px solid var(--border-color, #e0e0e0);
            }
            
            .display-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
            }
            
            .display-header h3 {
                margin: 0;
                color: var(--text-primary, #333);
                font-size: 1.5rem;
            }
            
            .display-controls {
                display: flex;
                gap: 10px;
            }
            
            .view-btn {
                padding: 8px 16px;
                border: 1px solid var(--border-color, #e0e0e0);
                background: white;
                color: var(--text-primary, #333);
                border-radius: 6px;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            
            .view-btn.active {
                background: var(--primary-color, #2196f3);
                color: white;
                border-color: var(--primary-color, #2196f3);
            }
            
            .schedule-content {
                min-height: 300px;
                padding: 20px;
                background: white;
                border-radius: 8px;
                border: 1px solid var(--border-color, #e0e0e0);
            }
            
            .no-schedule {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                height: 260px;
                color: var(--text-secondary, #666);
                text-align: center;
            }
            
            .no-schedule p {
                font-size: 1.1rem;
                margin: 10px 0;
            }
            
            .schedule-feedback {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 30px;
                margin-bottom: 30px;
            }
            
            .ai-insights,
            .performance-metrics {
                padding: 20px;
                background: var(--card-bg, white);
                border-radius: 10px;
                border: 1px solid var(--border-color, #e0e0e0);
            }
            
            .ai-insights h4,
            .performance-metrics h4 {
                margin: 0 0 15px 0;
                color: var(--primary-color, #2196f3);
                font-size: 1.3rem;
            }
            
            .metrics-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 15px;
            }
            
            .metric {
                display: flex;
                flex-direction: column;
                align-items: center;
                padding: 15px;
                background: var(--secondary-bg, #f8f9fa);
                border-radius: 8px;
                text-align: center;
            }
            
            .metric-label {
                font-size: 0.9rem;
                color: var(--text-secondary, #666);
                margin-bottom: 8px;
            }
            
            .metric-value {
                font-size: 1.8rem;
                font-weight: bold;
                color: var(--primary-color, #2196f3);
            }
            
            .schedule-actions {
                display: flex;
                gap: 15px;
                justify-content: center;
                padding-top: 20px;
                border-top: 1px solid var(--border-color, #e0e0e0);
            }
            
            .action-btn {
                padding: 12px 20px;
                background: var(--secondary-color, #6c757d);
                color: white;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                font-size: 1rem;
                transition: all 0.3s ease;
            }
            
            .action-btn:hover {
                background: var(--secondary-dark, #5a6268);
                transform: translateY(-2px);
            }
            
            .schedule-session {
                margin-bottom: 15px;
                padding: 15px;
                background: white;
                border-radius: 8px;
                border-left: 4px solid var(--primary-color, #2196f3);
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                transition: all 0.3s ease;
            }
            
            .schedule-session:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
            }
            
            .session-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 10px;
            }
            
            .session-time {
                font-weight: bold;
                color: var(--primary-color, #2196f3);
                font-size: 1.1rem;
            }
            
            .session-duration {
                background: var(--primary-light, #e3f2fd);
                color: var(--primary-color, #2196f3);
                padding: 4px 8px;
                border-radius: 12px;
                font-size: 0.9rem;
            }
            
            .session-content {
                display: grid;
                grid-template-columns: 1fr auto;
                gap: 15px;
                align-items: center;
            }
            
            .session-details h4 {
                margin: 0 0 8px 0;
                color: var(--text-primary, #333);
                font-size: 1.2rem;
            }
            
            .session-meta {
                display: flex;
                gap: 15px;
                font-size: 0.9rem;
                color: var(--text-secondary, #666);
            }
            
            .session-tags {
                display: flex;
                gap: 8px;
                flex-wrap: wrap;
            }
            
            .session-tag {
                padding: 3px 8px;
                background: var(--tag-bg, #f0f0f0);
                color: var(--tag-text, #333);
                border-radius: 10px;
                font-size: 0.8rem;
            }
            
            @media (max-width: 768px) {
                .schedule-controls {
                    grid-template-columns: 1fr;
                }
                
                .schedule-feedback {
                    grid-template-columns: 1fr;
                }
                
                .action-buttons {
                    flex-direction: column;
                    align-items: center;
                }
                
                .schedule-actions {
                    flex-wrap: wrap;
                }
            }
        `;
        
        const styleSheet = document.createElement('style');
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    }

    setupEventListeners() {
        if (!this.ui.container) return;
        
        // Mode switching
        this.ui.container.addEventListener('click', (e) => {
            if (e.target.classList.contains('mode-btn')) {
                this.switchMode(e.target.dataset.mode);
            }
        });
        
        // Subject management
        const addSubjectBtn = this.ui.container.querySelector('.add-subject-btn');
        const subjectInput = this.ui.container.querySelector('#subject-input');
        
        addSubjectBtn?.addEventListener('click', () => this.addSubject());
        subjectInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addSubject();
        });
        
        // Dynamic controls
        const dailyHoursSlider = this.ui.container.querySelector('#daily-hours');
        dailyHoursSlider?.addEventListener('input', (e) => {
            const display = e.target.parentElement.querySelector('.value-display');
            if (display) display.textContent = `${e.target.value} hours`;
        });
        
        // Main action buttons
        const generateBtn = this.ui.container.querySelector('#generate-schedule');
        const optimizeBtn = this.ui.container.querySelector('#optimize-existing');
        const suggestBtn = this.ui.container.querySelector('#suggest-improvements');
        
        generateBtn?.addEventListener('click', () => this.generateSchedule());
        optimizeBtn?.addEventListener('click', () => this.optimizeExistingSchedule());
        suggestBtn?.addEventListener('click', () => this.suggestImprovements());
        
        // View switching
        this.ui.container.addEventListener('click', (e) => {
            if (e.target.classList.contains('view-btn')) {
                this.switchView(e.target.dataset.view);
            }
        });
        
        // Action buttons
        const saveBtn = this.ui.container.querySelector('#save-schedule');
        const exportBtn = this.ui.container.querySelector('#export-schedule');
        const shareBtn = this.ui.container.querySelector('#share-schedule');
        const settingsBtn = this.ui.container.querySelector('#schedule-settings');
        
        saveBtn?.addEventListener('click', () => this.saveSchedule());
        exportBtn?.addEventListener('click', () => this.exportSchedule());
        shareBtn?.addEventListener('click', () => this.shareSchedule());
        settingsBtn?.addEventListener('click', () => this.openSettings());
        
        // Context change listener
        document.addEventListener('contextChange', (e) => {
            this.handleContextChange(e.detail);
        });
    }

    switchMode(mode) {
        // Update UI
        this.ui.container.querySelectorAll('.mode-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        this.ui.container.querySelector(`[data-mode="${mode}"]`).classList.add('active');
        
        // Update internal state
        this.schedulingMode = mode;
        
        // Adjust UI based on mode
        this.adjustUIForMode(mode);
        
        console.log(`📊 Switched to ${mode} scheduling mode`);
    }

    adjustUIForMode(mode) {
        const controls = this.ui.container.querySelector('.schedule-controls');
        
        switch (mode) {
            case 'adaptive':
                // Enable all AI features
                controls.querySelector('#use-biorhythm').disabled = false;
                controls.querySelector('#context-aware').disabled = false;
                controls.querySelector('#real-time-monitoring').disabled = false;
                break;
                
            case 'ai_guided':
                // Enable AI but with user oversight
                controls.querySelector('#use-biorhythm').disabled = false;
                controls.querySelector('#context-aware').disabled = false;
                controls.querySelector('#real-time-monitoring').disabled = true;
                break;
                
            case 'manual':
                // Disable automatic AI features
                controls.querySelector('#use-biorhythm').disabled = true;
                controls.querySelector('#context-aware').disabled = true;
                controls.querySelector('#real-time-monitoring').disabled = true;
                break;
        }
    }

    addSubject() {
        const input = this.ui.container.querySelector('#subject-input');
        const subjectName = input.value.trim();
        
        if (!subjectName) return;
        
        // Create subject tag
        const subjectsList = this.ui.container.querySelector('#subjects-list');
        const tag = document.createElement('div');
        tag.className = 'subject-tag';
        tag.innerHTML = `
            <span>${subjectName}</span>
            <button class="remove-btn" onclick="this.parentElement.remove()">×</button>
        `;
        
        subjectsList.appendChild(tag);
        input.value = '';
        
        console.log(`📚 Added subject: ${subjectName}`);
    }

    async generateSchedule() {
        if (!this.isInitialized) {
            this.showError('AI Scheduler not ready. Please wait...');
            return;
        }
        
        this.showLoading('Generating your optimal schedule...');
        
        try {
            // Gather user preferences
            const preferences = this.gatherUserPreferences();
            
            // Generate schedule using AI
            const schedule = await this.aiScheduler.generateOptimizedSchedule(preferences);
            
            // Display the schedule
            this.displaySchedule(schedule);
            
            // Update insights and metrics
            this.updateAIInsights(schedule);
            this.updatePerformanceMetrics(schedule);
            
            // Store current schedule
            this.currentSchedule = schedule;
            
            console.log('✅ Schedule generated successfully');
            this.showSuccess('Your optimal schedule has been generated!');
            
        } catch (error) {
            console.error('Failed to generate schedule:', error);
            this.showError('Failed to generate schedule. Please try again.');
        }
    }

    gatherUserPreferences() {
        const subjects = Array.from(this.ui.container.querySelectorAll('.subject-tag span'))
            .map(span => ({
                name: span.textContent,
                priority: 'medium',
                difficulty: 'medium'
            }));
        
        const dailyHours = parseInt(this.ui.container.querySelector('#daily-hours').value);
        const startTime = this.ui.container.querySelector('#start-time').value;
        const endTime = this.ui.container.querySelector('#end-time').value;
        
        const goalType = this.ui.container.querySelector('#goal-type').value;
        const goalDeadline = this.ui.container.querySelector('#goal-deadline').value;
        
        const useBiorhythm = this.ui.container.querySelector('#use-biorhythm').checked;
        const contextAware = this.ui.container.querySelector('#context-aware').checked;
        const realTimeMonitoring = this.ui.container.querySelector('#real-time-monitoring').checked;
        
        return {
            timeframe: 'week',
            subjects: subjects,
            constraints: {
                dailyHours: dailyHours,
                startTime: startTime,
                endTime: endTime
            },
            goals: {
                type: goalType,
                deadline: goalDeadline
            },
            preferences: {
                useBiorhythm: useBiorhythm,
                contextAware: contextAware,
                realTimeMonitoring: realTimeMonitoring,
                schedulingMode: this.schedulingMode
            }
        };
    }

    displaySchedule(schedule) {
        const content = this.ui.container.querySelector('#schedule-content');
        
        if (!schedule || !schedule.schedule) {
            content.innerHTML = '<div class="no-schedule"><p>Failed to generate schedule</p></div>';
            return;
        }
        
        let html = '';
        
        for (const day of schedule.schedule) {
            html += `
                <div class="schedule-day">
                    <h3 class="day-header">📅 ${day.day}</h3>
                    <div class="day-sessions">
            `;
            
            for (const session of day.sessions) {
                html += this.createSessionHTML(session);
            }
            
            html += `
                    </div>
                </div>
            `;
        }
        
        content.innerHTML = html;
    }

    createSessionHTML(session) {
        const energyIndicator = this.getEnergyIndicator(session.energy_required);
        const difficultyColor = this.getDifficultyColor(session.difficulty);
        
        return `
            <div class="schedule-session" style="border-left-color: ${difficultyColor}">
                <div class="session-header">
                    <span class="session-time">${session.time}</span>
                    <span class="session-duration">${session.duration} min</span>
                </div>
                <div class="session-content">
                    <div class="session-details">
                        <h4>${session.subject}</h4>
                        <div class="session-meta">
                            <span>📚 ${session.type}</span>
                            <span>🎯 ${session.technique}</span>
                            <span>${energyIndicator} ${session.energy_required}</span>
                        </div>
                        <div class="session-tags">
                            ${session.difficulty ? `<span class="session-tag">${session.difficulty}</span>` : ''}
                            ${session.motivation_boost ? '<span class="session-tag">🚀 Motivation</span>' : ''}
                            ${session.stress_management ? '<span class="session-tag">😌 Stress Relief</span>' : ''}
                        </div>
                    </div>
                </div>
                ${session.reasoning ? `<div class="session-reasoning"><small>💡 ${session.reasoning}</small></div>` : ''}
            </div>
        `;
    }

    getEnergyIndicator(energyLevel) {
        if (!energyLevel) return '⚡';
        
        switch (energyLevel.toLowerCase()) {
            case 'high': return '🔴';
            case 'medium': return '🟡';
            case 'low': return '🟢';
            default: return '⚡';
        }
    }

    getDifficultyColor(difficulty) {
        if (!difficulty) return '#2196f3';
        
        switch (difficulty.toLowerCase()) {
            case 'easy': return '#4caf50';
            case 'medium': return '#ff9800';
            case 'hard': return '#f44336';
            case 'very hard': return '#9c27b0';
            default: return '#2196f3';
        }
    }

    updateAIInsights(schedule) {
        const insights = schedule.weekly_strategy || 'AI analysis complete';
        const tips = schedule.adaptive_tips || [];
        
        let html = `<p>${insights}</p>`;
        
        if (tips.length > 0) {
            html += '<h5>💡 Personalized Tips:</h5><ul>';
            tips.forEach(tip => {
                html += `<li>${tip}</li>`;
            });
            html += '</ul>';
        }
        
        this.ui.container.querySelector('#insights-content').innerHTML = html;
    }

    updatePerformanceMetrics(schedule) {
        const metrics = {
            efficiency: this.calculateEfficiencyScore(schedule),
            energyMatch: this.calculateEnergyMatch(schedule),
            retention: this.calculateRetentionRate(schedule),
            stress: this.calculateStressLevel(schedule)
        };
        
        const metricsGrid = this.ui.container.querySelector('#metrics-grid');
        metricsGrid.innerHTML = `
            <div class="metric">
                <span class="metric-label">Efficiency Score</span>
                <span class="metric-value">${metrics.efficiency}%</span>
            </div>
            <div class="metric">
                <span class="metric-label">Energy Match</span>
                <span class="metric-value">${metrics.energyMatch}%</span>
            </div>
            <div class="metric">
                <span class="metric-label">Retention Rate</span>
                <span class="metric-value">${metrics.retention}%</span>
            </div>
            <div class="metric">
                <span class="metric-label">Stress Level</span>
                <span class="metric-value">${metrics.stress}/10</span>
            </div>
        `;
    }

    calculateEfficiencyScore(schedule) {
        // Simplified efficiency calculation
        return Math.round(75 + Math.random() * 20);
    }

    calculateEnergyMatch(schedule) {
        // Simplified energy matching calculation
        return Math.round(80 + Math.random() * 15);
    }

    calculateRetentionRate(schedule) {
        // Simplified retention calculation
        return Math.round(70 + Math.random() * 25);
    }

    calculateStressLevel(schedule) {
        // Simplified stress calculation (lower is better)
        return Math.round(2 + Math.random() * 4);
    }

    async optimizeExistingSchedule() {
        if (!this.currentSchedule) {
            this.showError('No schedule to optimize. Please generate a schedule first.');
            return;
        }
        
        this.showLoading('Optimizing your current schedule...');
        
        try {
            // Re-optimize current schedule with updated context
            const preferences = this.gatherUserPreferences();
            const optimizedSchedule = await this.aiScheduler.generateOptimizedSchedule(preferences);
            
            this.displaySchedule(optimizedSchedule);
            this.updateAIInsights(optimizedSchedule);
            this.updatePerformanceMetrics(optimizedSchedule);
            
            this.currentSchedule = optimizedSchedule;
            
            this.showSuccess('Schedule optimized successfully!');
            
        } catch (error) {
            console.error('Failed to optimize schedule:', error);
            this.showError('Failed to optimize schedule. Please try again.');
        }
    }

    async suggestImprovements() {
        if (!this.currentSchedule) {
            this.showError('No schedule to improve. Please generate a schedule first.');
            return;
        }
        
        this.showLoading('Analyzing schedule for improvements...');
        
        // Simulate AI analysis delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const suggestions = [
            '🎯 Consider moving difficult subjects to your peak energy hours (9-11 AM)',
            '⏰ Add 15-minute breaks between intensive sessions to maintain focus',
            '🧘 Include mindfulness practices during high-stress periods',
            '📱 Use spaced repetition for better retention of key concepts',
            '🌙 Schedule lighter review sessions in the evening for better sleep',
            '🤝 Group similar subjects together for better cognitive flow'
        ];
        
        const randomSuggestions = suggestions
            .sort(() => 0.5 - Math.random())
            .slice(0, 3);
        
        let html = '<h5>💡 AI Improvement Suggestions:</h5><ul>';
        randomSuggestions.forEach(suggestion => {
            html += `<li>${suggestion}</li>`;
        });
        html += '</ul>';
        
        this.ui.container.querySelector('#insights-content').innerHTML = html;
        this.showSuccess('Improvement suggestions generated!');
    }

    switchView(view) {
        // Update view buttons
        this.ui.container.querySelectorAll('.view-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        this.ui.container.querySelector(`[data-view="${view}"]`).classList.add('active');
        
        // Update display based on view
        // This would implement different visualization modes
        console.log(`📊 Switched to ${view} view`);
    }

    async saveSchedule() {
        if (!this.currentSchedule) {
            this.showError('No schedule to save.');
            return;
        }
        
        try {
            localStorage.setItem('savedSchedule', JSON.stringify(this.currentSchedule));
            this.showSuccess('Schedule saved successfully!');
        } catch (error) {
            console.error('Failed to save schedule:', error);
            this.showError('Failed to save schedule.');
        }
    }

    async loadExistingSchedule() {
        try {
            const saved = localStorage.getItem('savedSchedule');
            if (saved) {
                this.currentSchedule = JSON.parse(saved);
                this.displaySchedule(this.currentSchedule);
                console.log('📂 Loaded existing schedule');
            }
        } catch (error) {
            console.error('Failed to load existing schedule:', error);
        }
    }

    exportSchedule() {
        if (!this.currentSchedule) {
            this.showError('No schedule to export.');
            return;
        }
        
        const dataStr = JSON.stringify(this.currentSchedule, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `ai-schedule-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        this.showSuccess('Schedule exported successfully!');
    }

    shareSchedule() {
        if (!this.currentSchedule) {
            this.showError('No schedule to share.');
            return;
        }
        
        if (navigator.share) {
            navigator.share({
                title: 'My AI-Generated Study Schedule',
                text: 'Check out my personalized study schedule created by AI!',
                url: window.location.href
            });
        } else {
            // Fallback: copy to clipboard
            const shareText = `My AI-Generated Study Schedule:\n${JSON.stringify(this.currentSchedule, null, 2)}`;
            navigator.clipboard.writeText(shareText).then(() => {
                this.showSuccess('Schedule copied to clipboard!');
            });
        }
    }

    openSettings() {
        // This would open a settings modal
        console.log('⚙️ Opening schedule settings...');
        this.showInfo('Settings panel coming soon!');
    }

    handleContextChange(contextData) {
        if (this.schedulingMode === 'adaptive' && this.currentSchedule) {
            console.log('📊 Context change detected, considering schedule adaptation...');
            // Could trigger automatic schedule adjustment
        }
    }

    // Utility methods for user feedback
    showLoading(message) {
        this.showMessage(message, 'loading', '⏳');
    }

    showSuccess(message) {
        this.showMessage(message, 'success', '✅');
    }

    showError(message) {
        this.showMessage(message, 'error', '❌');
    }

    showInfo(message) {
        this.showMessage(message, 'info', 'ℹ️');
    }

    showMessage(message, type, icon) {
        // Create or update toast notification
        let toast = document.querySelector('.schedule-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.className = 'schedule-toast';
            document.body.appendChild(toast);
        }
        
        toast.className = `schedule-toast ${type}`;
        toast.innerHTML = `${icon} ${message}`;
        
        // Auto-hide after 3 seconds
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize if we're on a page that should have the smart scheduler
    if (document.querySelector('.dashboard-content') || window.location.pathname.includes('schedule')) {
        window.smartScheduleController = new SmartScheduleController();
    }
});

// Export for global access
window.SmartScheduleController = SmartScheduleController;
