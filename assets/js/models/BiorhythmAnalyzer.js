// Biorhythm Analyzer - Advanced circadian rhythm and energy pattern analysis
class BiorhythmAnalyzer {
    constructor() {
        this.circadianData = JSON.parse(localStorage.getItem('circadianData') || '{}');
        this.energyHistory = JSON.parse(localStorage.getItem('energyHistory') || '[]');
        this.performancePatterns = JSON.parse(localStorage.getItem('performancePatterns') || '{}');
        
        this.isInitialized = false;
        this.realTimeMonitoring = false;
        
        this.init();
    }

    async init() {
        console.log('🔄 Initializing Biorhythm Analyzer...');
        
        // Initialize circadian rhythm tracking if not exists
        if (Object.keys(this.circadianData).length === 0) {
            await this.initializeCircadianTracking();
        }
        
        // Start real-time monitoring if enabled
        if (this.shouldEnableRealTimeMonitoring()) {
            this.startRealTimeMonitoring();
        }
        
        this.isInitialized = true;
        console.log('✅ Biorhythm Analyzer ready');
    }

    async initializeCircadianTracking() {
        // Default circadian patterns based on research
        this.circadianData = {
            // Natural energy peaks throughout the day (0-1 scale)
            naturalEnergyPattern: [
                { hour: 6, energy: 0.3 },   // Dawn
                { hour: 7, energy: 0.5 },   // Wake up
                { hour: 8, energy: 0.7 },   // Morning rise
                { hour: 9, energy: 0.9 },   // Peak morning
                { hour: 10, energy: 0.95 }, // Optimal morning
                { hour: 11, energy: 0.8 },  // Late morning
                { hour: 12, energy: 0.7 },  // Lunch time
                { hour: 13, energy: 0.5 },  // Post-lunch dip
                { hour: 14, energy: 0.4 },  // Afternoon low
                { hour: 15, energy: 0.6 },  // Recovery
                { hour: 16, energy: 0.8 },  // Afternoon peak
                { hour: 17, energy: 0.75 }, // Late afternoon
                { hour: 18, energy: 0.7 },  // Early evening
                { hour: 19, energy: 0.6 },  // Evening
                { hour: 20, energy: 0.5 },  // Wind down
                { hour: 21, energy: 0.4 },  // Relaxation
                { hour: 22, energy: 0.3 },  // Pre-sleep
                { hour: 23, energy: 0.2 }   // Sleep prep
            ],
            
            // Cognitive performance patterns
            cognitivePattern: [
                { hour: 9, focus: 0.95, creativity: 0.7, memory: 0.9 },
                { hour: 11, focus: 0.9, creativity: 0.8, memory: 0.85 },
                { hour: 14, focus: 0.6, creativity: 0.9, memory: 0.7 },
                { hour: 16, focus: 0.8, creativity: 0.85, memory: 0.75 },
                { hour: 19, focus: 0.7, creativity: 0.75, memory: 0.7 }
            ],
            
            // Weekly patterns
            weeklyPattern: [
                { day: 'Monday', energy: 0.7, motivation: 0.8 },
                { day: 'Tuesday', energy: 0.85, motivation: 0.9 },
                { day: 'Wednesday', energy: 0.9, motivation: 0.85 },
                { day: 'Thursday', energy: 0.8, motivation: 0.8 },
                { day: 'Friday', energy: 0.7, motivation: 0.6 },
                { day: 'Saturday', energy: 0.6, motivation: 0.5 },
                { day: 'Sunday', energy: 0.65, motivation: 0.7 }
            ],
            
            personalAdjustments: {
                chronotype: 'neutral', // early, neutral, late
                sleepPattern: 'normal',
                caffeineUsage: 'moderate',
                exerciseImpact: 'positive'
            }
        };
        
        await this.saveCircadianData();
    }

    async getProductivityPeaks() {
        if (!this.isInitialized) await this.init();
        
        // Combine natural patterns with personal performance data
        const naturalPeaks = this.circadianData.naturalEnergyPattern
            .filter(hour => hour.energy > 0.7)
            .sort((a, b) => b.energy - a.energy);
        
        // Adjust based on personal performance history
        const personalizedPeaks = await this.personalizeEnergyPattern(naturalPeaks);
        
        return personalizedPeaks.slice(0, 5); // Top 5 peaks
    }

    async predictEnergyLevels(targetDate = new Date()) {
        const predictions = {};
        const dayOfWeek = targetDate.getDay();
        const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const dayName = weekdays[dayOfWeek];
        
        // Get base weekly energy multiplier
        const weeklyData = this.circadianData.weeklyPattern.find(d => d.day === dayName);
        const weeklyMultiplier = weeklyData ? weeklyData.energy : 0.8;
        
        // Generate hourly predictions
        for (let hour = 6; hour <= 23; hour++) {
            const baseEnergy = this.getBaseEnergyForHour(hour);
            const personalAdjustment = await this.getPersonalAdjustmentForHour(hour, dayOfWeek);
            const contextualFactors = await this.getContextualFactors(targetDate, hour);
            
            const predictedEnergy = Math.min(1.0, Math.max(0.1, 
                baseEnergy * weeklyMultiplier * personalAdjustment * contextualFactors
            ));
            
            predictions[hour] = {
                energy: predictedEnergy,
                confidence: this.calculatePredictionConfidence(hour, dayOfWeek),
                factors: {
                    base: baseEnergy,
                    weekly: weeklyMultiplier,
                    personal: personalAdjustment,
                    contextual: contextualFactors
                },
                recommendations: await this.generateHourlyRecommendations(predictedEnergy, hour)
            };
        }
        
        return predictions;
    }

    async personalizeEnergyPattern(basePeaks) {
        const personalizedPeaks = [];
        
        for (const peak of basePeaks) {
            // Get personal performance data for this hour
            const personalPerformance = await this.getPersonalPerformanceForHour(peak.hour);
            
            // Adjust energy based on personal data
            const adjustedEnergy = (peak.energy * 0.6) + (personalPerformance * 0.4);
            
            personalizedPeaks.push({
                hour: peak.hour,
                energy: adjustedEnergy,
                confidence: this.calculatePersonalizationConfidence(peak.hour),
                source: 'personalized'
            });
        }
        
        return personalizedPeaks.sort((a, b) => b.energy - a.energy);
    }

    async getPersonalPerformanceForHour(hour) {
        const relevantSessions = this.energyHistory.filter(session => {
            const sessionHour = new Date(session.timestamp).getHours();
            return sessionHour === hour;
        });
        
        if (relevantSessions.length === 0) {
            return this.getBaseEnergyForHour(hour); // Fallback to base pattern
        }
        
        const avgPerformance = relevantSessions.reduce((sum, session) => 
            sum + (session.performance || 0.7), 0
        ) / relevantSessions.length;
        
        return avgPerformance;
    }

    getBaseEnergyForHour(hour) {
        const energyData = this.circadianData.naturalEnergyPattern.find(h => h.hour === hour);
        return energyData ? energyData.energy : 0.5;
    }

    async getPersonalAdjustmentForHour(hour, dayOfWeek) {
        let adjustment = 1.0;
        
        // Chronotype adjustments
        const chronotype = this.circadianData.personalAdjustments.chronotype;
        if (chronotype === 'early') {
            if (hour <= 10) adjustment *= 1.2;
            if (hour >= 20) adjustment *= 0.7;
        } else if (chronotype === 'late') {
            if (hour <= 10) adjustment *= 0.8;
            if (hour >= 16) adjustment *= 1.2;
        }
        
        // Weekend adjustments
        if (dayOfWeek === 0 || dayOfWeek === 6) { // Weekend
            if (hour <= 9) adjustment *= 0.8; // Later start
            if (hour >= 11 && hour <= 16) adjustment *= 1.1; // Better afternoon
        }
        
        // Caffeine impact
        const caffeineUsage = this.circadianData.personalAdjustments.caffeineUsage;
        if (caffeineUsage === 'heavy' && hour >= 8 && hour <= 11) {
            adjustment *= 1.15;
        }
        
        return adjustment;
    }

    async getContextualFactors(date, hour) {
        let factor = 1.0;
        
        // Season adjustments
        const month = date.getMonth();
        if (month >= 11 || month <= 1) { // Winter
            if (hour <= 9) factor *= 0.9; // Harder mornings
            if (hour >= 15 && hour <= 17) factor *= 0.85; // Earlier darkness
        } else if (month >= 5 && month <= 7) { // Summer
            if (hour <= 9) factor *= 1.1; // Easier mornings
            if (hour >= 17) factor *= 1.05; // Extended daylight
        }
        
        // Weather impact (simplified - could integrate with weather API)
        const weatherImpact = await this.getWeatherImpact(date);
        factor *= weatherImpact;
        
        return factor;
    }

    async getWeatherImpact(date) {
        // Simplified weather impact - could be enhanced with real weather data
        const dayOfYear = this.getDayOfYear(date);
        const sunlightHours = this.calculateSunlightHours(dayOfYear);
        
        // More sunlight = better energy
        return 0.85 + (sunlightHours / 14) * 0.3; // Scale between 0.85-1.15
    }

    calculateSunlightHours(dayOfYear) {
        // Simplified sunlight calculation for temperate regions
        const maxSunlight = 14;
        const minSunlight = 10;
        const amplitude = (maxSunlight - minSunlight) / 2;
        const offset = (maxSunlight + minSunlight) / 2;
        
        // Peak sunlight around day 172 (summer solstice)
        return offset + amplitude * Math.cos(2 * Math.PI * (dayOfYear - 172) / 365);
    }

    getDayOfYear(date) {
        const start = new Date(date.getFullYear(), 0, 0);
        const diff = date - start;
        return Math.floor(diff / (1000 * 60 * 60 * 24));
    }

    async generateHourlyRecommendations(energyLevel, hour) {
        const recommendations = [];
        
        if (energyLevel > 0.8) {
            recommendations.push('Perfect time for challenging tasks');
            recommendations.push('Focus on complex problem-solving');
            recommendations.push('Tackle your most difficult subjects');
        } else if (energyLevel > 0.6) {
            recommendations.push('Good for moderate difficulty tasks');
            recommendations.push('Review and practice sessions');
            recommendations.push('Active learning techniques');
        } else if (energyLevel > 0.4) {
            recommendations.push('Light review and passive learning');
            recommendations.push('Watch educational videos');
            recommendations.push('Organize notes and materials');
        } else {
            recommendations.push('Take a break or do light activities');
            recommendations.push('Physical movement or meditation');
            recommendations.push('Avoid challenging mental tasks');
        }
        
        // Time-specific recommendations
        if (hour >= 13 && hour <= 15) { // Post-lunch dip
            recommendations.push('Consider a short power nap (10-20 minutes)');
            recommendations.push('Stay hydrated and avoid heavy meals');
        }
        
        return recommendations;
    }

    // Real-time monitoring functions
    startRealTimeMonitoring() {
        if (this.realTimeMonitoring) return;
        
        console.log('🔄 Starting real-time biorhythm monitoring...');
        this.realTimeMonitoring = true;
        
        // Monitor every 30 minutes
        this.monitoringInterval = setInterval(() => {
            this.recordCurrentState();
        }, 30 * 60 * 1000);
        
        // Monitor user interactions
        this.setupInteractionTracking();
    }

    stopRealTimeMonitoring() {
        if (!this.realTimeMonitoring) return;
        
        console.log('⏹️ Stopping real-time biorhythm monitoring...');
        this.realTimeMonitoring = false;
        
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
        }
    }

    setupInteractionTracking() {
        // Track typing speed and accuracy as energy indicators
        let keystrokes = 0;
        let keystrokeStartTime = Date.now();
        
        document.addEventListener('keydown', () => {
            keystrokes++;
            
            // Analyze every 100 keystrokes
            if (keystrokes % 100 === 0) {
                const duration = Date.now() - keystrokeStartTime;
                const wpm = (keystrokes / 5) / (duration / 60000); // Words per minute
                
                this.recordPerformanceMetric('typing_speed', wpm);
                keystrokeStartTime = Date.now();
                keystrokes = 0;
            }
        });
        
        // Track click patterns as focus indicators
        let clickTimes = [];
        document.addEventListener('click', () => {
            const now = Date.now();
            clickTimes.push(now);
            
            // Keep only last 10 clicks
            if (clickTimes.length > 10) {
                clickTimes = clickTimes.slice(-10);
            }
            
            // Analyze click pattern
            if (clickTimes.length >= 5) {
                const intervals = [];
                for (let i = 1; i < clickTimes.length; i++) {
                    intervals.push(clickTimes[i] - clickTimes[i-1]);
                }
                
                const avgInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
                const consistency = this.calculateClickConsistency(intervals);
                
                this.recordPerformanceMetric('focus_level', consistency);
            }
        });
    }

    recordCurrentState() {
        const now = new Date();
        const hour = now.getHours();
        
        // Get current performance indicators
        const currentState = {
            timestamp: now.toISOString(),
            hour: hour,
            dayOfWeek: now.getDay(),
            selfReportedEnergy: this.getCurrentSelfReportedEnergy(),
            performanceMetrics: this.getCurrentPerformanceMetrics(),
            contextualFactors: {
                activity: this.getCurrentActivity(),
                environment: this.getCurrentEnvironment()
            }
        };
        
        this.energyHistory.push(currentState);
        
        // Keep only last 1000 entries
        if (this.energyHistory.length > 1000) {
            this.energyHistory = this.energyHistory.slice(-1000);
        }
        
        this.saveEnergyHistory();
    }

    // Utility methods
    calculatePredictionConfidence(hour, dayOfWeek) {
        const historicalData = this.energyHistory.filter(entry => 
            entry.hour === hour && entry.dayOfWeek === dayOfWeek
        );
        
        // More data = higher confidence
        const dataPoints = historicalData.length;
        const maxConfidence = 0.95;
        const minConfidence = 0.3;
        
        return Math.min(maxConfidence, minConfidence + (dataPoints / 50) * (maxConfidence - minConfidence));
    }

    calculatePersonalizationConfidence(hour) {
        const personalData = this.energyHistory.filter(entry => entry.hour === hour);
        return Math.min(0.9, 0.2 + (personalData.length / 20) * 0.7);
    }

    calculateClickConsistency(intervals) {
        if (intervals.length < 2) return 0.5;
        
        const mean = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
        const variance = intervals.reduce((sum, interval) => sum + Math.pow(interval - mean, 2), 0) / intervals.length;
        const standardDeviation = Math.sqrt(variance);
        
        // Lower standard deviation = higher consistency = better focus
        const coefficientOfVariation = standardDeviation / mean;
        return Math.max(0, 1 - coefficientOfVariation);
    }

    shouldEnableRealTimeMonitoring() {
        // Enable if user has opted in and browser supports necessary APIs
        return localStorage.getItem('enableBiorhythmMonitoring') === 'true' &&
               'Notification' in window;
    }

    getCurrentSelfReportedEnergy() {
        // This could be connected to a simple widget asking user for current energy level
        const stored = sessionStorage.getItem('currentEnergyLevel');
        return stored ? parseFloat(stored) : null;
    }

    getCurrentPerformanceMetrics() {
        return {
            typingSpeed: this.getRecentMetric('typing_speed'),
            focusLevel: this.getRecentMetric('focus_level'),
            errorRate: this.getRecentMetric('error_rate')
        };
    }

    getRecentMetric(metricName) {
        const recent = this.performancePatterns[metricName]?.slice(-5) || [];
        if (recent.length === 0) return null;
        return recent.reduce((sum, val) => sum + val, 0) / recent.length;
    }

    recordPerformanceMetric(metricName, value) {
        if (!this.performancePatterns[metricName]) {
            this.performancePatterns[metricName] = [];
        }
        
        this.performancePatterns[metricName].push(value);
        
        // Keep only last 100 values per metric
        if (this.performancePatterns[metricName].length > 100) {
            this.performancePatterns[metricName] = this.performancePatterns[metricName].slice(-100);
        }
        
        this.savePerformancePatterns();
    }

    getCurrentActivity() {
        // Detect current activity based on page focus, visible elements, etc.
        if (document.querySelector('.flashcard-container:not([style*="display: none"])')) {
            return 'flashcards';
        } else if (document.querySelector('.reader-view:not([style*="display: none"])')) {
            return 'reading';
        } else if (document.querySelector('.timer-view:not([style*="display: none"])')) {
            return 'timed_study';
        }
        return 'general';
    }

    getCurrentEnvironment() {
        return {
            timeOfDay: this.getTimeOfDay(),
            browserFocus: document.hasFocus(),
            screenBrightness: this.estimateScreenBrightness(),
            ambientLight: this.estimateAmbientLight()
        };
    }

    getTimeOfDay() {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 12) return 'morning';
        if (hour >= 12 && hour < 17) return 'afternoon';
        if (hour >= 17 && hour < 21) return 'evening';
        return 'night';
    }

    estimateScreenBrightness() {
        // Rough estimation based on CSS variables or user settings
        const darkMode = document.body.classList.contains('dark-theme');
        return darkMode ? 'low' : 'medium';
    }

    estimateAmbientLight() {
        // Could be enhanced with light sensor API if available
        const hour = new Date().getHours();
        if (hour >= 7 && hour <= 19) return 'daylight';
        return 'artificial';
    }

    // Storage methods
    async saveCircadianData() {
        localStorage.setItem('circadianData', JSON.stringify(this.circadianData));
    }

    async saveEnergyHistory() {
        localStorage.setItem('energyHistory', JSON.stringify(this.energyHistory));
    }

    async savePerformancePatterns() {
        localStorage.setItem('performancePatterns', JSON.stringify(this.performancePatterns));
    }

    // Public API for manual energy reporting
    reportCurrentEnergy(level) {
        if (level >= 0 && level <= 1) {
            sessionStorage.setItem('currentEnergyLevel', level.toString());
            this.recordCurrentState();
        }
    }

    // Configuration methods
    setChronotype(type) {
        this.circadianData.personalAdjustments.chronotype = type;
        this.saveCircadianData();
    }

    setCaffeineUsage(level) {
        this.circadianData.personalAdjustments.caffeineUsage = level;
        this.saveCircadianData();
    }

    enableRealTimeMonitoring() {
        localStorage.setItem('enableBiorhythmMonitoring', 'true');
        this.startRealTimeMonitoring();
    }

    disableRealTimeMonitoring() {
        localStorage.setItem('enableBiorhythmMonitoring', 'false');
        this.stopRealTimeMonitoring();
    }
}

// Export for global access
window.BiorhythmAnalyzer = BiorhythmAnalyzer;
