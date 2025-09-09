class AnalyticsModel {
    constructor(store) {
        this.store = store;
        this.stats = this.store.get('analytics') || {
            studyTimeToday: 0,
            weeklyGoalProgress: 0,
            docsStudied: 0,
            flashcardsCreated: 0,
            sessionProgress: 0
        };
    }

    getStats() {
        return this.stats;
    }

    updateStudyTime(minutes) {
        this.stats.studyTimeToday += minutes;
        this.save();
    }

    incrementDocsStudied() {
        this.stats.docsStudied++;
        this.save();
    }

    addFlashcards(count) {
        this.stats.flashcardsCreated += count;
        this.save();
    }

    updateSessionProgress(progress) {
        this.stats.sessionProgress = progress;
        this.save();
    }

    save() {
        this.store.set('analytics', this.stats);
    }
}

