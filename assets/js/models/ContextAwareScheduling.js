// Context Aware Scheduling - Environmental and situational intelligence
class ContextAwareScheduling {
    constructor() {
        this.contextFactors = {
            environmental: new EnvironmentalContext(),
            social: new SocialContext(),
            academic: new AcademicContext(),
            personal: new PersonalContext(),
            temporal: new TemporalContext()
        };
        
        this.adaptiveRules = new AdaptiveRules();
        this.contextHistory = JSON.parse(localStorage.getItem('contextHistory') || '[]');
        this.predictions = new ContextPredictor();
        
        this.isMonitoring = false;
        this.monitoringInterval = null;
    }

    async analyzeCurrentContext() {
        console.log('🔍 Analyzing current context...');
        
        const context = {};
        
        // Gather context from all sources
        for (const [factorName, factorInstance] of Object.entries(this.contextFactors)) {
            try {
                context[factorName] = await factorInstance.getCurrentContext();
            } catch (error) {
                console.warn(`Failed to get ${factorName} context:`, error);
                context[factorName] = {};
            }
        }
        
        // Add timestamp and session info
        context.timestamp = new Date().toISOString();
        context.sessionId = this.generateSessionId();
        
        // Store in history
        this.contextHistory.push(context);
        this.maintainHistorySize();
        
        return context;
    }

    async adaptScheduleToContext(schedule, currentContext) {
        console.log('🎯 Adapting schedule to current context...');
        
        const adaptedSchedule = JSON.parse(JSON.stringify(schedule));
        
        // Apply environmental adaptations
        this.applyEnvironmentalAdaptations(adaptedSchedule, currentContext.environmental);
        
        // Apply social adaptations
        this.applySocialAdaptations(adaptedSchedule, currentContext.social);
        
        // Apply academic adaptations
        this.applyAcademicAdaptations(adaptedSchedule, currentContext.academic);
        
        // Apply personal adaptations
        this.applyPersonalAdaptations(adaptedSchedule, currentContext.personal);
        
        // Apply temporal adaptations
        this.applyTemporalAdaptations(adaptedSchedule, currentContext.temporal);
        
        // Validate and optimize adapted schedule
        const validatedSchedule = await this.validateAdaptations(adaptedSchedule, currentContext);
        
        return validatedSchedule;
    }

    applyEnvironmentalAdaptations(schedule, envContext) {
        const { weather, lighting, noise, temperature } = envContext;
        
        for (const day of schedule.schedule) {
            for (const session of day.sessions) {
                // Weather-based adaptations
                if (weather?.condition === 'rainy' || weather?.condition === 'stormy') {
                    // Prefer indoor, cozy activities
                    if (session.type === 'Deep Focus') {
                        session.environment_preference = 'quiet_indoor';
                        session.recommended_techniques = ['meditation_focus', 'ambient_sounds'];
                    }
                }
                
                if (weather?.condition === 'sunny' && weather?.temperature > 25) {
                    // Hot sunny day - schedule earlier or later sessions
                    const hour = parseInt(session.time.split(':')[0]);
                    if (hour >= 12 && hour <= 16) {
                        session.heat_warning = true;
                        session.hydration_reminder = true;
                    }
                }
                
                // Lighting adaptations
                if (lighting?.level === 'low') {
                    session.lighting_adjustment = 'increase_brightness';
                    if (session.type === 'Review') {
                        session.technique = 'Audio Review'; // Less visually demanding
                    }
                }
                
                // Noise adaptations
                if (noise?.level === 'high') {
                    session.noise_cancellation = true;
                    session.recommended_location = 'quiet_space';
                    if (session.type === 'Deep Focus') {
                        session.technique = 'Noise-Tolerant Focus';
                    }
                }
                
                // Temperature adaptations
                if (temperature?.value) {
                    if (temperature.value < 18) {
                        session.temperature_warning = 'cold_environment';
                        session.comfort_tips = ['warm_clothing', 'hot_beverage'];
                    } else if (temperature.value > 26) {
                        session.temperature_warning = 'warm_environment';
                        session.comfort_tips = ['stay_hydrated', 'fan_cooling'];
                    }
                }
            }
        }
    }

    applySocialAdaptations(schedule, socialContext) {
        const { family_presence, social_commitments, study_partners, interruption_likelihood } = socialContext;
        
        for (const day of schedule.schedule) {
            for (const session of day.sessions) {
                // Family presence adaptations
                if (family_presence?.level === 'high') {
                    session.interruption_management = 'family_coordination';
                    session.communication_strategy = 'set_boundaries';
                    
                    if (session.type === 'Deep Focus') {
                        session.timing_note = 'coordinate_with_family';
                    }
                }
                
                // Social commitments
                if (social_commitments?.upcoming) {
                    const commitmentTime = new Date(social_commitments.upcoming.time);
                    const sessionTime = new Date(`${day.day} ${session.time}`);
                    
                    const timeDiff = commitmentTime - sessionTime;
                    if (timeDiff > 0 && timeDiff < 3600000) { // Within 1 hour
                        session.pre_commitment_session = true;
                        session.duration = Math.min(session.duration, 45); // Shorter session
                        session.intensity = 'moderate'; // Don't exhaust before commitment
                    }
                }
                
                // Study partners
                if (study_partners?.available) {
                    if (session.subject === study_partners.subject) {
                        session.collaborative_opportunity = true;
                        session.partner_coordination = study_partners.contact;
                    }
                }
                
                // Interruption likelihood
                if (interruption_likelihood?.level === 'high') {
                    session.interruption_resilience = 'high';
                    session.technique = 'Micro-Learning'; // Shorter, resumable chunks
                }
            }
        }
    }

    applyAcademicAdaptations(schedule, academicContext) {
        const { upcoming_exams, assignment_deadlines, course_load, semester_phase } = academicContext;
        
        for (const day of schedule.schedule) {
            for (const session of day.sessions) {
                // Upcoming exams
                if (upcoming_exams?.length > 0) {
                    const relevantExam = upcoming_exams.find(exam => 
                        exam.subject === session.subject
                    );
                    
                    if (relevantExam) {
                        const daysUntilExam = this.calculateDaysUntil(relevantExam.date);
                        
                        if (daysUntilExam <= 7) { // Within a week
                            session.exam_preparation = true;
                            session.priority = 'high';
                            session.technique = 'Intensive Review';
                            
                            if (daysUntilExam <= 3) {
                                session.stress_management = 'required';
                                session.confidence_building = true;
                            }
                        }
                    }
                }
                
                // Assignment deadlines
                if (assignment_deadlines?.length > 0) {
                    const relevantAssignment = assignment_deadlines.find(assignment => 
                        assignment.subject === session.subject
                    );
                    
                    if (relevantAssignment) {
                        const hoursUntilDeadline = this.calculateHoursUntil(relevantAssignment.deadline);
                        
                        if (hoursUntilDeadline <= 48) { // Within 48 hours
                            session.deadline_pressure = 'high';
                            session.type = 'Assignment Focus';
                            session.productivity_boost = true;
                        }
                    }
                }
                
                // Course load adaptation
                if (course_load?.level === 'heavy') {
                    session.efficiency_mode = true;
                    session.technique = 'High-Efficiency Learning';
                    session.break_frequency = 'increased';
                }
                
                // Semester phase
                if (semester_phase === 'finals') {
                    session.finals_mode = true;
                    session.stress_monitoring = 'active';
                    session.recovery_emphasis = 'high';
                } else if (semester_phase === 'midterms') {
                    session.midterm_focus = true;
                    session.review_emphasis = 'increased';
                }
            }
        }
    }

    applyPersonalAdaptations(schedule, personalContext) {
        const { energy_level, mood, stress_level, motivation, health_status } = personalContext;
        
        for (const day of schedule.schedule) {
            for (const session of day.sessions) {
                // Energy level adaptations
                if (energy_level?.current < 0.5) {
                    session.energy_boost = 'required';
                    session.type = 'Light Study';
                    session.duration = Math.min(session.duration, 30);
                    session.encouragement = 'low_energy_support';
                }
                
                // Mood adaptations
                if (mood?.state === 'stressed' || mood?.state === 'anxious') {
                    session.stress_relief = 'prioritize';
                    session.technique = 'Mindful Learning';
                    session.relaxation_breaks = 'frequent';
                }
                
                if (mood?.state === 'motivated' || mood?.state === 'energetic') {
                    session.motivation_leverage = true;
                    session.challenge_level = 'increased';
                    session.achievement_tracking = 'active';
                }
                
                // Stress level adaptations
                if (stress_level?.value > 7) { // High stress (1-10 scale)
                    session.stress_management = 'critical';
                    session.duration = Math.min(session.duration, 25);
                    session.technique = 'Stress-Reducing Focus';
                    session.mindfulness_integration = true;
                }
                
                // Motivation adaptations
                if (motivation?.level < 0.4) {
                    session.motivation_boost = 'required';
                    session.gamification = 'increased';
                    session.reward_system = 'active';
                    session.progress_visualization = true;
                }
                
                // Health status adaptations
                if (health_status?.fatigue) {
                    session.fatigue_management = true;
                    session.break_frequency = 'increased';
                    session.hydration_reminders = true;
                }
                
                if (health_status?.headache) {
                    session.screen_time = 'reduced';
                    session.audio_preference = true;
                    session.lighting = 'dim';
                }
            }
        }
    }

    applyTemporalAdaptations(schedule, temporalContext) {
        const { time_of_day, day_of_week, season, holidays, special_events } = temporalContext;
        
        for (const day of schedule.schedule) {
            for (const session of day.sessions) {
                // Time of day adaptations
                const hour = parseInt(session.time.split(':')[0]);
                
                if (hour < 9) { // Early morning
                    session.morning_routine = 'gentle_start';
                    session.wake_up_support = true;
                }
                
                if (hour >= 22) { // Late evening
                    session.evening_wind_down = true;
                    session.blue_light_reduction = true;
                    session.relaxation_focus = true;
                }
                
                // Day of week adaptations
                if (day_of_week === 'Monday') {
                    session.week_start_motivation = true;
                    session.goal_setting = 'weekly_planning';
                }
                
                if (day_of_week === 'Friday') {
                    session.week_end_review = true;
                    session.accomplishment_celebration = true;
                }
                
                if (day_of_week === 'Saturday' || day_of_week === 'Sunday') {
                    session.weekend_mode = true;
                    session.flexibility = 'increased';
                    session.leisure_integration = true;
                }
                
                // Season adaptations
                if (season === 'winter') {
                    session.vitamin_d_awareness = true;
                    session.indoor_lighting = 'bright';
                    session.mood_support = 'seasonal';
                }
                
                if (season === 'summer') {
                    session.hydration_emphasis = true;
                    session.heat_awareness = true;
                }
                
                // Holiday adaptations
                if (holidays?.upcoming) {
                    session.holiday_preparation = true;
                    session.schedule_flexibility = 'high';
                }
                
                // Special events
                if (special_events?.today) {
                    session.special_event_consideration = special_events.today;
                    session.emotional_awareness = true;
                }
            }
        }
    }

    async validateAdaptations(schedule, context) {
        // Ensure adaptations don't conflict with core requirements
        const validated = JSON.parse(JSON.stringify(schedule));
        
        for (const day of validated.schedule) {
            for (const session of day.sessions) {
                // Ensure minimum session duration
                if (session.duration < 15) {
                    session.duration = 15;
                    session.micro_session = true;
                }
                
                // Ensure maximum session duration
                if (session.duration > 120) {
                    session.duration = 120;
                    session.extended_session = true;
                    session.break_planning = 'mandatory';
                }
                
                // Validate technique compatibility
                if (session.technique && session.energy_boost === 'required') {
                    session.technique = this.selectEnergyCompatibleTechnique(session.technique);
                }
                
                // Ensure stress management doesn't override critical deadlines
                if (session.deadline_pressure === 'high' && session.stress_management === 'critical') {
                    session.balanced_approach = true;
                    session.support_needed = 'high';
                }
            }
        }
        
        return validated;
    }

    selectEnergyCompatibleTechnique(originalTechnique) {
        const lowEnergyTechniques = [
            'Passive Review',
            'Audio Learning',
            'Visual Scanning',
            'Gentle Practice'
        ];
        
        const techniqueMap = {
            'Deep Focus': 'Passive Review',
            'Active Recall': 'Visual Scanning',
            'Pomodoro': 'Gentle Practice',
            'Intensive Review': 'Audio Learning'
        };
        
        return techniqueMap[originalTechnique] || 'Passive Review';
    }

    startContextMonitoring() {
        if (this.isMonitoring) return;
        
        console.log('📡 Starting context monitoring...');
        this.isMonitoring = true;
        
        // Monitor context every 5 minutes
        this.monitoringInterval = setInterval(async () => {
            await this.updateCurrentContext();
        }, 5 * 60 * 1000);
        
        // Also monitor on significant events
        this.setupEventListeners();
    }

    stopContextMonitoring() {
        if (!this.isMonitoring) return;
        
        console.log('⏹️ Stopping context monitoring...');
        this.isMonitoring = false;
        
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
        }
    }

    setupEventListeners() {
        // Monitor page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.updateCurrentContext();
            }
        });
        
        // Monitor window focus changes
        window.addEventListener('focus', () => {
            this.updateCurrentContext();
        });
        
        // Monitor significant time changes (e.g., user returns after break)
        let lastActivity = Date.now();
        document.addEventListener('click', () => {
            const now = Date.now();
            if (now - lastActivity > 10 * 60 * 1000) { // 10 minutes
                this.updateCurrentContext();
            }
            lastActivity = now;
        });
    }

    async updateCurrentContext() {
        try {
            const context = await this.analyzeCurrentContext();
            
            // Check if significant context changes require schedule adaptation
            if (this.hasSignificantContextChange(context)) {
                console.log('📊 Significant context change detected');
                this.notifyContextChange(context);
            }
            
        } catch (error) {
            console.error('Failed to update context:', error);
        }
    }

    hasSignificantContextChange(newContext) {
        if (this.contextHistory.length < 2) return false;
        
        const previousContext = this.contextHistory[this.contextHistory.length - 2];
        
        // Check for significant changes in key factors
        const changes = {
            environmental: this.compareEnvironmentalContext(previousContext.environmental, newContext.environmental),
            social: this.compareSocialContext(previousContext.social, newContext.social),
            personal: this.comparePersonalContext(previousContext.personal, newContext.personal)
        };
        
        // Determine if any changes are significant enough to warrant adaptation
        return Object.values(changes).some(change => change > 0.3); // Threshold for significance
    }

    compareEnvironmentalContext(prev, current) {
        let changeScore = 0;
        
        if (prev.weather?.condition !== current.weather?.condition) changeScore += 0.3;
        if (Math.abs((prev.noise?.level || 0) - (current.noise?.level || 0)) > 2) changeScore += 0.2;
        if (Math.abs((prev.temperature?.value || 20) - (current.temperature?.value || 20)) > 5) changeScore += 0.2;
        
        return Math.min(1, changeScore);
    }

    compareSocialContext(prev, current) {
        let changeScore = 0;
        
        if (prev.family_presence?.level !== current.family_presence?.level) changeScore += 0.4;
        if (prev.interruption_likelihood?.level !== current.interruption_likelihood?.level) changeScore += 0.3;
        
        return Math.min(1, changeScore);
    }

    comparePersonalContext(prev, current) {
        let changeScore = 0;
        
        if (Math.abs((prev.energy_level?.current || 0.7) - (current.energy_level?.current || 0.7)) > 0.3) changeScore += 0.4;
        if (prev.mood?.state !== current.mood?.state) changeScore += 0.3;
        if (Math.abs((prev.stress_level?.value || 5) - (current.stress_level?.value || 5)) > 2) changeScore += 0.3;
        
        return Math.min(1, changeScore);
    }

    notifyContextChange(context) {
        // Dispatch custom event for other parts of the app to respond
        const event = new CustomEvent('contextChange', {
            detail: {
                context: context,
                timestamp: new Date().toISOString(),
                adaptationSuggested: true
            }
        });
        
        document.dispatchEvent(event);
    }

    // Utility methods
    generateSessionId() {
        return `ctx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    calculateDaysUntil(dateString) {
        const target = new Date(dateString);
        const now = new Date();
        const diffTime = target - now;
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    calculateHoursUntil(dateString) {
        const target = new Date(dateString);
        const now = new Date();
        const diffTime = target - now;
        return Math.ceil(diffTime / (1000 * 60 * 60));
    }

    maintainHistorySize() {
        if (this.contextHistory.length > 1000) {
            this.contextHistory = this.contextHistory.slice(-1000);
        }
        
        // Save to localStorage
        localStorage.setItem('contextHistory', JSON.stringify(this.contextHistory));
    }
}

// Environmental Context Analysis
class EnvironmentalContext {
    async getCurrentContext() {
        return {
            weather: await this.getWeatherContext(),
            lighting: await this.getLightingContext(),
            noise: await this.getNoiseContext(),
            temperature: await this.getTemperatureContext(),
            air_quality: await this.getAirQualityContext()
        };
    }

    async getWeatherContext() {
        // This could integrate with weather APIs
        // For now, return estimated context based on time and season
        const now = new Date();
        const hour = now.getHours();
        const month = now.getMonth();
        
        let condition = 'clear';
        let temperature = 20;
        
        // Seasonal temperature estimation
        if (month >= 11 || month <= 1) { // Winter
            temperature = 5 + Math.random() * 10;
            condition = Math.random() < 0.4 ? 'cloudy' : 'clear';
        } else if (month >= 5 && month <= 7) { // Summer
            temperature = 25 + Math.random() * 10;
            condition = Math.random() < 0.2 ? 'sunny' : 'clear';
        }
        
        return {
            condition: condition,
            temperature: Math.round(temperature),
            humidity: 40 + Math.random() * 40,
            timestamp: now.toISOString()
        };
    }

    async getLightingContext() {
        const now = new Date();
        const hour = now.getHours();
        
        let level = 'medium';
        let natural = false;
        
        if (hour >= 7 && hour <= 18) {
            level = 'bright';
            natural = true;
        } else if (hour >= 19 && hour <= 21) {
            level = 'medium';
            natural = false;
        } else {
            level = 'low';
            natural = false;
        }
        
        return {
            level: level,
            natural_light: natural,
            screen_brightness: this.estimateScreenBrightness(),
            eye_strain_risk: hour > 20 ? 'high' : 'low'
        };
    }

    async getNoiseContext() {
        // Estimate based on time of day and day of week
        const now = new Date();
        const hour = now.getHours();
        const dayOfWeek = now.getDay();
        
        let level = 2; // 1-5 scale
        
        // Weekday vs weekend
        if (dayOfWeek >= 1 && dayOfWeek <= 5) { // Weekday
            if (hour >= 8 && hour <= 17) {
                level = 3; // Moderate noise during work hours
            }
        } else { // Weekend
            if (hour >= 10 && hour <= 22) {
                level = 4; // Higher noise on weekends
            }
        }
        
        // Quiet hours
        if (hour >= 22 || hour <= 7) {
            level = 1;
        }
        
        return {
            level: level,
            sources: this.estimateNoiseSources(hour, dayOfWeek),
            interruption_probability: level / 5
        };
    }

    async getTemperatureContext() {
        // This could integrate with smart home sensors
        const weather = await this.getWeatherContext();
        
        return {
            value: weather.temperature + Math.random() * 5 - 2.5, // Indoor variation
            comfort_level: this.calculateComfortLevel(weather.temperature),
            hvac_recommendation: this.getHVACRecommendation(weather.temperature)
        };
    }

    async getAirQualityContext() {
        // Simplified air quality estimation
        return {
            index: 50 + Math.random() * 50, // AQI
            quality: 'moderate',
            recommendations: ['ensure_ventilation']
        };
    }

    estimateScreenBrightness() {
        const darkMode = document.body.classList.contains('dark-theme');
        return darkMode ? 30 : 70; // Percentage
    }

    estimateNoiseSources(hour, dayOfWeek) {
        const sources = [];
        
        if (hour >= 8 && hour <= 17 && dayOfWeek >= 1 && dayOfWeek <= 5) {
            sources.push('traffic', 'construction');
        }
        
        if (hour >= 18 && hour <= 22) {
            sources.push('family_activity', 'neighbors');
        }
        
        return sources;
    }

    calculateComfortLevel(temperature) {
        if (temperature >= 20 && temperature <= 24) return 'optimal';
        if (temperature >= 18 && temperature <= 26) return 'comfortable';
        if (temperature < 15 || temperature > 30) return 'uncomfortable';
        return 'tolerable';
    }

    getHVACRecommendation(temperature) {
        if (temperature < 18) return 'heating';
        if (temperature > 26) return 'cooling';
        return 'maintain';
    }
}

// Social Context Analysis
class SocialContext {
    async getCurrentContext() {
        return {
            family_presence: await this.getFamilyPresence(),
            social_commitments: await this.getSocialCommitments(),
            study_partners: await this.getStudyPartners(),
            interruption_likelihood: await this.getInterruptionLikelihood(),
            communication_preferences: await this.getCommunicationPreferences()
        };
    }

    async getFamilyPresence() {
        const now = new Date();
        const hour = now.getHours();
        const dayOfWeek = now.getDay();
        
        let level = 'low';
        
        // Estimate based on typical family schedules
        if (dayOfWeek >= 1 && dayOfWeek <= 5) { // Weekday
            if (hour >= 17 && hour <= 22) level = 'high';
            else if (hour >= 7 && hour <= 9) level = 'medium';
        } else { // Weekend
            if (hour >= 9 && hour <= 21) level = 'high';
        }
        
        return {
            level: level,
            activity_type: this.estimateFamilyActivity(hour, dayOfWeek),
            coordination_needed: level === 'high'
        };
    }

    async getSocialCommitments() {
        // This could integrate with calendar APIs
        const stored = localStorage.getItem('socialCommitments');
        if (stored) {
            return JSON.parse(stored);
        }
        
        return {
            upcoming: null,
            today: [],
            this_week: []
        };
    }

    async getStudyPartners() {
        const stored = localStorage.getItem('studyPartners');
        if (stored) {
            return JSON.parse(stored);
        }
        
        return {
            available: false,
            contacts: [],
            preferred_subjects: []
        };
    }

    async getInterruptionLikelihood() {
        const familyPresence = await this.getFamilyPresence();
        const now = new Date();
        const hour = now.getHours();
        
        let level = 'low';
        
        if (familyPresence.level === 'high') {
            level = 'high';
        } else if (hour >= 9 && hour <= 17) {
            level = 'medium'; // Business hours
        }
        
        return {
            level: level,
            sources: this.identifyInterruptionSources(familyPresence),
            mitigation_strategies: this.suggestMitigationStrategies(level)
        };
    }

    async getCommunicationPreferences() {
        return {
            do_not_disturb: this.isDoNotDisturbTime(),
            preferred_channels: ['text', 'app_notification'],
            urgency_only: false
        };
    }

    estimateFamilyActivity(hour, dayOfWeek) {
        if (hour >= 17 && hour <= 19) return 'dinner_preparation';
        if (hour >= 19 && hour <= 21) return 'family_time';
        if (hour >= 7 && hour <= 9) return 'morning_routine';
        return 'general_activity';
    }

    identifyInterruptionSources(familyPresence) {
        const sources = [];
        
        if (familyPresence.level === 'high') {
            sources.push('family_members', 'household_activities');
        }
        
        sources.push('phone_notifications', 'unexpected_visitors');
        
        return sources;
    }

    suggestMitigationStrategies(level) {
        const strategies = [];
        
        if (level === 'high') {
            strategies.push('communicate_study_time', 'use_do_not_disturb', 'find_quiet_space');
        } else if (level === 'medium') {
            strategies.push('set_phone_to_silent', 'inform_household');
        }
        
        return strategies;
    }

    isDoNotDisturbTime() {
        const now = new Date();
        const hour = now.getHours();
        
        // Typical quiet hours
        return hour >= 22 || hour <= 7;
    }
}

// Additional context classes (Academic, Personal, Temporal) would follow similar patterns...

// Export for global access
window.ContextAwareScheduling = ContextAwareScheduling;
window.EnvironmentalContext = EnvironmentalContext;
window.SocialContext = SocialContext;
