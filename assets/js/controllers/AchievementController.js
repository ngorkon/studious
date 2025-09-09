class AchievementController {
    constructor() {
        this.achievements = this.getAchievements();
        this.userProgress = this.getUserProgress();
        this.init();
    }

    init() {
        this.bindEvents();
        this.updateAchievements();
        this.generateSmartRecommendations();
    }

    bindEvents() {
        // Achievement button events
        const viewAllBtn = document.getElementById('view-all-achievements');
        const closeAchievementsBtn = document.getElementById('close-achievements');
        const smartScheduleBtn = document.getElementById('smart-schedule');
        const closeScheduleBtn = document.getElementById('close-schedule');
        const generateScheduleBtn = document.getElementById('generate-schedule');

        if (viewAllBtn) {
            viewAllBtn.addEventListener('click', () => this.showAllAchievements());
        }

        if (closeAchievementsBtn) {
            closeAchievementsBtn.addEventListener('click', () => this.hideAchievements());
        }

        if (smartScheduleBtn) {
            smartScheduleBtn.addEventListener('click', () => this.showSmartSchedule());
        }

        if (closeScheduleBtn) {
            closeScheduleBtn.addEventListener('click', () => this.hideSmartSchedule());
        }

        if (generateScheduleBtn) {
            generateScheduleBtn.addEventListener('click', () => this.generateSchedule());
        }

        // Category buttons for achievements modal
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('category-btn')) {
                this.filterAchievements(e.target.dataset.category);
                document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
            }
        });
    }

    getAchievements() {
        return [
            {
                id: 'study_streak_7',
                title: 'Study Streak',
                description: 'Studied for 7 days in a row',
                icon: 'fas fa-fire',
                category: 'streak',
                unlocked: true,
                progress: 7,
                required: 7
            },
            {
                id: 'time_master',
                title: 'Time Master',
                description: 'Completed 10 pomodoro sessions',
                icon: 'fas fa-clock',
                category: 'time',
                unlocked: true,
                progress: 10,
                required: 10
            },
            {
                id: 'knowledge_expert',
                title: 'Knowledge Expert',
                description: 'Study 100 documents',
                icon: 'fas fa-star',
                category: 'study',
                unlocked: false,
                progress: 12,
                required: 100
            },
            {
                id: 'flashcard_master',
                title: 'Flashcard Master',
                description: 'Create 50 flashcards',
                icon: 'fas fa-layer-group',
                category: 'study',
                unlocked: false,
                progress: 42,
                required: 50
            },
            {
                id: 'early_bird',
                title: 'Early Bird',
                description: 'Study before 8 AM for 5 days',
                icon: 'fas fa-sun',
                category: 'time',
                unlocked: false,
                progress: 2,
                required: 5
            },
            {
                id: 'night_owl',
                title: 'Night Owl',
                description: 'Study after 10 PM for 5 days',
                icon: 'fas fa-moon',
                category: 'time',
                unlocked: false,
                progress: 0,
                required: 5
            },
            {
                id: 'speed_reader',
                title: 'Speed Reader',
                description: 'Read 1000 pages',
                icon: 'fas fa-book-open',
                category: 'study',
                unlocked: false,
                progress: 456,
                required: 1000
            },
            {
                id: 'focus_master',
                title: 'Focus Master',
                description: 'Complete 25 focus sessions',
                icon: 'fas fa-eye',
                category: 'time',
                unlocked: false,
                progress: 8,
                required: 25
            },
            {
                id: 'achievement_hunter',
                title: 'Achievement Hunter',
                description: 'Unlock 10 achievements',
                icon: 'fas fa-trophy',
                category: 'special',
                unlocked: false,
                progress: 2,
                required: 10
            }
        ];
    }

    getUserProgress() {
        return JSON.parse(localStorage.getItem('userProgress')) || {
            studyDays: 7,
            pomodoroSessions: 10,
            documentsStudied: 12,
            flashcardsCreated: 42,
            pagesRead: 456,
            focusSessions: 8,
            achievementsUnlocked: 2
        };
    }

    updateAchievements() {
        this.achievements.forEach(achievement => {
            this.checkAchievementProgress(achievement);
        });

        this.renderAchievements();
    }

    checkAchievementProgress(achievement) {
        let currentProgress = 0;

        switch (achievement.id) {
            case 'study_streak_7':
                currentProgress = this.userProgress.studyDays;
                break;
            case 'time_master':
                currentProgress = this.userProgress.pomodoroSessions;
                break;
            case 'knowledge_expert':
                currentProgress = this.userProgress.documentsStudied;
                break;
            case 'flashcard_master':
                currentProgress = this.userProgress.flashcardsCreated;
                break;
            case 'speed_reader':
                currentProgress = this.userProgress.pagesRead;
                break;
            case 'focus_master':
                currentProgress = this.userProgress.focusSessions;
                break;
            case 'achievement_hunter':
                currentProgress = this.userProgress.achievementsUnlocked;
                break;
        }

        achievement.progress = currentProgress;
        achievement.unlocked = currentProgress >= achievement.required;
    }

    renderAchievements() {
        const achievementsGrid = document.getElementById('achievements-grid');
        if (!achievementsGrid) return;

        // Show only first 3 achievements in dashboard
        const recentAchievements = this.achievements.slice(0, 3);
        achievementsGrid.innerHTML = recentAchievements.map(achievement => 
            this.createAchievementHTML(achievement)
        ).join('');
    }

    createAchievementHTML(achievement) {
        const unlockedClass = achievement.unlocked ? 'unlocked' : 'locked';
        const progressText = achievement.unlocked ? '' : 
            `<small>Progress: ${achievement.progress}/${achievement.required}</small>`;

        return `
            <div class="achievement ${unlockedClass}">
                <div class="achievement-icon">
                    <i class="${achievement.icon}"></i>
                </div>
                <div class="achievement-info">
                    <h4>${achievement.title}</h4>
                    <p>${achievement.description}</p>
                    ${progressText}
                </div>
            </div>
        `;
    }

    showAllAchievements() {
        const achievementsModal = document.getElementById('achievements-modal-section');
        if (achievementsModal) {
            achievementsModal.classList.remove('hidden');
            this.renderAllAchievements();
        }
    }

    hideAchievements() {
        const achievementsModal = document.getElementById('achievements-modal-section');
        if (achievementsModal) {
            achievementsModal.classList.add('hidden');
        }
    }

    renderAllAchievements(category = 'all') {
        const achievementsFullGrid = document.getElementById('achievements-full-grid');
        if (!achievementsFullGrid) return;

        const filteredAchievements = category === 'all' ? 
            this.achievements : 
            this.achievements.filter(a => a.category === category);

        achievementsFullGrid.innerHTML = filteredAchievements.map(achievement => 
            this.createAchievementHTML(achievement)
        ).join('');
    }

    filterAchievements(category) {
        this.renderAllAchievements(category);
    }

    showSmartSchedule() {
        const smartScheduleSection = document.getElementById('smart-schedule-section');
        if (smartScheduleSection) {
            smartScheduleSection.classList.remove('hidden');
        }
    }

    hideSmartSchedule() {
        const smartScheduleSection = document.getElementById('smart-schedule-section');
        if (smartScheduleSection) {
            smartScheduleSection.classList.add('hidden');
        }
    }

    generateSchedule() {
        const duration = document.getElementById('study-duration').value;
        const preferredTimes = Array.from(document.querySelectorAll('.time-slot input:checked'))
            .map(input => input.value);

        const schedule = this.createOptimizedSchedule(duration, preferredTimes);
        this.renderSchedule(schedule);
    }

    createOptimizedSchedule(duration, preferredTimes) {
        const sessions = Math.floor(duration / 25); // 25-minute sessions
        const breaks = sessions - 1;
        
        let startTime = 9; // Default start time
        if (preferredTimes.includes('morning')) startTime = 9;
        else if (preferredTimes.includes('afternoon')) startTime = 14;
        else if (preferredTimes.includes('evening')) startTime = 19;

        const schedule = [];
        let currentTime = startTime;

        for (let i = 0; i < sessions; i++) {
            const subjects = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'History'];
            const subject = subjects[i % subjects.length];

            schedule.push({
                time: this.formatTime(currentTime, 0),
                activity: `Study Session ${i + 1} - ${subject}`,
                duration: '25 min',
                type: 'study'
            });

            currentTime += 0.5; // 25 minutes = 0.42 hours, rounded to 0.5

            if (i < sessions - 1) {
                schedule.push({
                    time: this.formatTime(currentTime, 0),
                    activity: 'Break',
                    duration: '5 min',
                    type: 'break'
                });

                currentTime += 0.1; // 5 minutes
            }
        }

        return schedule;
    }

    formatTime(hours, minutes) {
        const h = Math.floor(hours);
        const m = Math.floor((hours - h) * 60) + minutes;
        const period = h >= 12 ? 'PM' : 'AM';
        const displayHour = h > 12 ? h - 12 : h === 0 ? 12 : h;
        return `${displayHour}:${m.toString().padStart(2, '0')} ${period}`;
    }

    renderSchedule(schedule) {
        const generatedSchedule = document.getElementById('generated-schedule');
        if (!generatedSchedule) return;

        const scheduleHTML = `
            <h3>Your Optimized Schedule</h3>
            <div class="schedule-timeline">
                <div class="schedule-day">
                    <h4>Today</h4>
                    <div class="schedule-items">
                        ${schedule.map(item => `
                            <div class="schedule-item">
                                <span class="time">${item.time}</span>
                                <span class="activity">${item.activity}</span>
                                <span class="duration">${item.duration}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;

        generatedSchedule.innerHTML = scheduleHTML;
    }

    generateSmartRecommendations() {
        const recommendationCards = document.getElementById('recommendation-cards');
        if (!recommendationCards) return;

        const recommendations = [
            {
                icon: 'fas fa-clock',
                title: 'Perfect Study Time',
                description: 'Based on your habits, 2:00 PM is your most productive time'
            },
            {
                icon: 'fas fa-coffee',
                title: 'Break Reminder',
                description: "You've been studying for 45 minutes. Consider a 10-minute break"
            }
        ];

        recommendationCards.innerHTML = recommendations.map(rec => `
            <div class="recommendation-card">
                <div class="recommendation-icon">
                    <i class="${rec.icon}"></i>
                </div>
                <div class="recommendation-content">
                    <h4>${rec.title}</h4>
                    <p>${rec.description}</p>
                </div>
            </div>
        `).join('');
    }

    updateProgress(type, value) {
        this.userProgress[type] = value;
        localStorage.setItem('userProgress', JSON.stringify(this.userProgress));
        this.updateAchievements();
    }

    unlockAchievement(achievementId) {
        const achievement = this.achievements.find(a => a.id === achievementId);
        if (achievement && !achievement.unlocked) {
            achievement.unlocked = true;
            this.userProgress.achievementsUnlocked++;
            this.showAchievementNotification(achievement);
            this.updateAchievements();
        }
    }

    showAchievementNotification(achievement) {
        if (window.toastView) {
            window.toastView.show(`🏆 Achievement Unlocked: ${achievement.title}!`, 'success');
        }
    }
}

// Export for use in other modules
window.AchievementController = AchievementController;
