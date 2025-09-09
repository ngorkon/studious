// User Learning Profile - Advanced behavioral and performance analytics
class UserLearningProfile {
    constructor() {
        this.profile = {
            // Core Learning Characteristics
            learningStyle: null, // Visual, Auditory, Kinesthetic, Reading/Writing
            cognitiveProfile: {},
            personalityType: null,
            
            // Performance Patterns
            productivityPeaks: [],
            energyPatterns: {},
            focusSpans: {},
            retentionRates: {},
            
            // Preferences and Behavior
            sessionPreferences: {},
            difficultyPreferences: {},
            breakPreferences: {},
            motivationalTriggers: [],
            
            // Goals and Progress
            shortTermGoals: [],
            longTermGoals: [],
            learningObjectives: {},
            skillDevelopment: {},
            
            // Contextual Factors
            environmentalPreferences: {},
            socialLearningStyle: {},
            stressResponses: {},
            adaptationRate: 1.0
        };
        
        this.analytics = new LearningAnalytics();
        this.isProfileLoaded = false;
    }

    async loadProfile() {
        console.log('👤 Loading user learning profile...');
        
        try {
            // Load from localStorage first
            const stored = localStorage.getItem('userLearningProfile');
            if (stored) {
                this.profile = { ...this.profile, ...JSON.parse(stored) };
            }
            
            // Enhance with analytics data
            await this.enhanceWithAnalytics();
            
            // Auto-detect learning patterns if not set
            if (!this.profile.learningStyle) {
                await this.detectLearningStyle();
            }
            
            this.isProfileLoaded = true;
            console.log('✅ User profile loaded and enhanced');
            
        } catch (error) {
            console.error('Failed to load user profile:', error);
            await this.createDefaultProfile();
        }
    }

    async detectLearningStyle() {
        // Analyze user behavior to detect learning style
        const behaviorData = await this.analytics.getUserBehaviorData();
        
        const scores = {
            visual: 0,
            auditory: 0,
            kinesthetic: 0,
            reading: 0
        };
        
        // Visual indicators
        if (behaviorData.imageInteractions > behaviorData.textInteractions) scores.visual += 2;
        if (behaviorData.diagramUsage > 0.3) scores.visual += 2;
        if (behaviorData.colorCoding) scores.visual += 1;
        
        // Auditory indicators
        if (behaviorData.audioContent > 0.2) scores.auditory += 2;
        if (behaviorData.verbalRepetition) scores.auditory += 1;
        if (behaviorData.musicWhileStudying) scores.auditory += 1;
        
        // Kinesthetic indicators
        if (behaviorData.handwrittenNotes > behaviorData.typedNotes) scores.kinesthetic += 2;
        if (behaviorData.movementBreaks > 0.4) scores.kinesthetic += 1;
        if (behaviorData.physicalManipulation) scores.kinesthetic += 2;
        
        // Reading/Writing indicators
        if (behaviorData.textHeavyContent > 0.6) scores.reading += 2;
        if (behaviorData.noteVolume > 1000) scores.reading += 1;
        if (behaviorData.listMaking) scores.reading += 1;
        
        // Determine primary learning style
        const primaryStyle = Object.keys(scores).reduce((a, b) => 
            scores[a] > scores[b] ? a : b
        );
        
        this.profile.learningStyle = primaryStyle;
        this.profile.cognitiveProfile = scores;
        
        console.log(`🧠 Detected learning style: ${primaryStyle}`);
        return primaryStyle;
    }

    async enhanceWithAnalytics() {
        const analytics = await this.analytics.getComprehensiveAnalytics();
        
        // Update productivity peaks
        this.profile.productivityPeaks = analytics.productivityPeaks || [];
        
        // Update energy patterns
        this.profile.energyPatterns = {
            morningEnergy: analytics.morningPerformance || 0.7,
            afternoonEnergy: analytics.afternoonPerformance || 0.5,
            eveningEnergy: analytics.eveningPerformance || 0.6,
            weekdayEnergy: analytics.weekdayPerformance || 0.8,
            weekendEnergy: analytics.weekendPerformance || 0.6
        };
        
        // Update focus spans
        this.profile.focusSpans = {
            shortBurst: analytics.averageShortSession || 25,
            mediumSession: analytics.averageMediumSession || 45,
            longSession: analytics.averageLongSession || 90,
            maxFocus: analytics.maxFocusTime || 120
        };
        
        // Update retention rates
        this.profile.retentionRates = analytics.retentionBySubject || {};
    }

    async createDefaultProfile() {
        console.log('🎯 Creating default learning profile...');
        
        this.profile = {
            learningStyle: 'visual', // Default assumption
            cognitiveProfile: { visual: 3, auditory: 2, kinesthetic: 2, reading: 3 },
            personalityType: 'balanced',
            
            productivityPeaks: [
                { hour: 9, score: 0.9 },
                { hour: 14, score: 0.7 },
                { hour: 19, score: 0.6 }
            ],
            
            energyPatterns: {
                morningEnergy: 0.8,
                afternoonEnergy: 0.6,
                eveningEnergy: 0.5,
                weekdayEnergy: 0.7,
                weekendEnergy: 0.6
            },
            
            focusSpans: {
                shortBurst: 25,
                mediumSession: 45,
                longSession: 90,
                maxFocus: 120
            },
            
            sessionPreferences: {
                preferredDuration: 45,
                breakFrequency: 25,
                maxDailyHours: 6,
                preferredStartTime: '09:00'
            },
            
            motivationalTriggers: [
                'progress_visualization',
                'achievement_unlocking',
                'streak_maintaining',
                'challenge_completion'
            ]
        };
        
        this.isProfileLoaded = true;
    }

    // Getters for various profile aspects
    async getProfile() {
        if (!this.isProfileLoaded) await this.loadProfile();
        return this.profile;
    }

    async getLearningStyle() {
        if (!this.isProfileLoaded) await this.loadProfile();
        return this.profile.learningStyle;
    }

    async getProductivityPeaks() {
        if (!this.isProfileLoaded) await this.loadProfile();
        return this.profile.productivityPeaks;
    }

    async getEnergyPatterns() {
        if (!this.isProfileLoaded) await this.loadProfile();
        return this.profile.energyPatterns;
    }

    async getFocusSpans() {
        if (!this.isProfileLoaded) await this.loadProfile();
        return this.profile.focusSpans;
    }

    // Profile updating methods
    async updateLearningStyle(style) {
        this.profile.learningStyle = style;
        await this.saveProfile();
    }

    async updatePreferences(preferences) {
        this.profile.sessionPreferences = { ...this.profile.sessionPreferences, ...preferences };
        await this.saveProfile();
    }

    async recordPerformance(sessionData) {
        // Update performance patterns based on session results
        const hour = new Date(sessionData.startTime).getHours();
        const performance = sessionData.performance || 0.7;
        
        // Update productivity peaks
        const existingPeak = this.profile.productivityPeaks.find(p => p.hour === hour);
        if (existingPeak) {
            existingPeak.score = (existingPeak.score * 0.8) + (performance * 0.2);
        } else {
            this.profile.productivityPeaks.push({ hour, score: performance });
        }
        
        // Update retention rates by subject
        if (sessionData.subject) {
            this.profile.retentionRates[sessionData.subject] = 
                (this.profile.retentionRates[sessionData.subject] || 0.7) * 0.8 + 
                (sessionData.retention || 0.7) * 0.2;
        }
        
        await this.saveProfile();
    }

    async saveProfile() {
        try {
            localStorage.setItem('userLearningProfile', JSON.stringify(this.profile));
            console.log('💾 User profile saved');
        } catch (error) {
            console.error('Failed to save user profile:', error);
        }
    }

    // Advanced analysis methods
    async getPersonalizedRecommendations() {
        const recommendations = [];
        
        // Learning style recommendations
        switch (this.profile.learningStyle) {
            case 'visual':
                recommendations.push('Use mind maps and diagrams for complex topics');
                recommendations.push('Color-code different subjects and concepts');
                recommendations.push('Take advantage of video content and visual aids');
                break;
            case 'auditory':
                recommendations.push('Read study materials aloud or use text-to-speech');
                recommendations.push('Join study groups for discussion-based learning');
                recommendations.push('Use rhymes and mnemonics for memorization');
                break;
            case 'kinesthetic':
                recommendations.push('Take frequent movement breaks during study sessions');
                recommendations.push('Use physical objects or hands-on activities when possible');
                recommendations.push('Walk while reviewing flashcards or listening to content');
                break;
            case 'reading':
                recommendations.push('Take detailed written notes and summaries');
                recommendations.push('Create lists and outlines for organizing information');
                recommendations.push('Use written flashcards and text-based materials');
                break;
        }
        
        // Energy pattern recommendations
        const bestHours = this.profile.productivityPeaks
            .sort((a, b) => b.score - a.score)
            .slice(0, 3)
            .map(p => `${p.hour}:00`);
        
        recommendations.push(`Schedule your most challenging subjects during your peak hours: ${bestHours.join(', ')}`);
        
        // Focus span recommendations
        const optimalSession = this.profile.focusSpans.mediumSession;
        recommendations.push(`Your optimal study session length is ${optimalSession} minutes`);
        
        return recommendations;
    }

    // Gamification elements
    async getAchievements() {
        const achievements = [];
        
        // Consistency achievements
        if (this.profile.studyStreak >= 7) {
            achievements.push({ 
                name: 'Week Warrior', 
                description: '7 days of consistent studying',
                icon: '🔥'
            });
        }
        
        // Learning style mastery
        if (this.profile.learningStyle && this.profile.cognitiveProfile[this.profile.learningStyle] >= 4) {
            achievements.push({
                name: 'Style Master',
                description: `Mastered ${this.profile.learningStyle} learning techniques`,
                icon: '🎯'
            });
        }
        
        // Productivity optimization
        const avgProductivity = this.profile.productivityPeaks.reduce((sum, p) => sum + p.score, 0) / this.profile.productivityPeaks.length;
        if (avgProductivity > 0.8) {
            achievements.push({
                name: 'Productivity Pro',
                description: 'Optimized your daily productivity patterns',
                icon: '⚡'
            });
        }
        
        return achievements;
    }
}

// Learning Analytics Engine
class LearningAnalytics {
    constructor() {
        this.sessionHistory = JSON.parse(localStorage.getItem('sessionHistory') || '[]');
        this.performanceMetrics = JSON.parse(localStorage.getItem('performanceMetrics') || '{}');
    }

    async getUserBehaviorData() {
        // Analyze user interaction patterns
        return {
            imageInteractions: this.sessionHistory.filter(s => s.hadImages).length,
            textInteractions: this.sessionHistory.filter(s => s.hadText).length,
            diagramUsage: this.calculateDiagramUsage(),
            colorCoding: this.detectColorCoding(),
            audioContent: this.calculateAudioContentRatio(),
            verbalRepetition: this.detectVerbalRepetition(),
            musicWhileStudying: this.detectMusicUsage(),
            handwrittenNotes: this.calculateHandwrittenRatio(),
            typedNotes: this.calculateTypedRatio(),
            movementBreaks: this.calculateMovementBreakRatio(),
            physicalManipulation: this.detectPhysicalManipulation(),
            textHeavyContent: this.calculateTextHeavyRatio(),
            noteVolume: this.calculateAverageNoteVolume(),
            listMaking: this.detectListMaking()
        };
    }

    async getComprehensiveAnalytics() {
        const sessions = this.sessionHistory;
        
        return {
            productivityPeaks: this.calculateProductivityPeaks(sessions),
            morningPerformance: this.calculateTimeSlotPerformance(sessions, 6, 12),
            afternoonPerformance: this.calculateTimeSlotPerformance(sessions, 12, 18),
            eveningPerformance: this.calculateTimeSlotPerformance(sessions, 18, 24),
            weekdayPerformance: this.calculateWeekdayPerformance(sessions),
            weekendPerformance: this.calculateWeekendPerformance(sessions),
            averageShortSession: this.calculateAverageSessionLength(sessions, 'short'),
            averageMediumSession: this.calculateAverageSessionLength(sessions, 'medium'),
            averageLongSession: this.calculateAverageSessionLength(sessions, 'long'),
            maxFocusTime: this.calculateMaxFocusTime(sessions),
            retentionBySubject: this.calculateRetentionBySubject(sessions)
        };
    }

    // Helper methods for behavior analysis
    calculateDiagramUsage() {
        const diagramSessions = this.sessionHistory.filter(s => s.contentType === 'diagram' || s.hasVisualAids);
        return diagramSessions.length / Math.max(this.sessionHistory.length, 1);
    }

    detectColorCoding() {
        return this.sessionHistory.some(s => s.usedColorCoding);
    }

    calculateAudioContentRatio() {
        const audioSessions = this.sessionHistory.filter(s => s.contentType === 'audio' || s.hadAudio);
        return audioSessions.length / Math.max(this.sessionHistory.length, 1);
    }

    calculateProductivityPeaks(sessions) {
        const hourlyPerformance = {};
        
        sessions.forEach(session => {
            const hour = new Date(session.startTime).getHours();
            if (!hourlyPerformance[hour]) {
                hourlyPerformance[hour] = { total: 0, count: 0 };
            }
            hourlyPerformance[hour].total += session.performance || 0.7;
            hourlyPerformance[hour].count++;
        });
        
        return Object.entries(hourlyPerformance)
            .map(([hour, data]) => ({
                hour: parseInt(hour),
                score: data.total / data.count
            }))
            .filter(peak => peak.score > 0.6)
            .sort((a, b) => b.score - a.score);
    }

    calculateTimeSlotPerformance(sessions, startHour, endHour) {
        const timeSlotSessions = sessions.filter(session => {
            const hour = new Date(session.startTime).getHours();
            return hour >= startHour && hour < endHour;
        });
        
        if (timeSlotSessions.length === 0) return 0.7; // Default
        
        return timeSlotSessions.reduce((sum, session) => sum + (session.performance || 0.7), 0) / timeSlotSessions.length;
    }

    // Additional utility methods...
    calculateRetentionBySubject(sessions) {
        const subjectRetention = {};
        
        sessions.forEach(session => {
            if (session.subject && session.retention !== undefined) {
                if (!subjectRetention[session.subject]) {
                    subjectRetention[session.subject] = { total: 0, count: 0 };
                }
                subjectRetention[session.subject].total += session.retention;
                subjectRetention[session.subject].count++;
            }
        });
        
        const result = {};
        Object.entries(subjectRetention).forEach(([subject, data]) => {
            result[subject] = data.total / data.count;
        });
        
        return result;
    }
}

// Export for use
window.UserLearningProfile = UserLearningProfile;
window.LearningAnalytics = LearningAnalytics;
