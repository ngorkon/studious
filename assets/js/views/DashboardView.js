class DashboardView {
    constructor() {
        this.dateElement = Utils.get('#current-date');
        this.studyTimeElement = Utils.get('.stat-card:nth-child(1) .stat-value');
        this.goalProgressElement = Utils.get('.stat-card:nth-child(2) .stat-value');
        this.docsStudiedElement = Utils.get('.stat-card:nth-child(3) .stat-value');
        this.flashcardsCreatedElement = Utils.get('.stat-card:nth-child(4) .stat-value');
        this.sessionProgressFill = Utils.get('.progress-fill');
        this.sessionProgressText = Utils.get('.progress-percentage');
        this.exportButton = Utils.get('#export-progress');

        this.updateDate();
    }

    updateDate() {
        const today = new Date();
        this.dateElement.textContent = today.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    updateStats(stats) {
        this.studyTimeElement.textContent = this.formatStudyTime(stats.studyTimeToday);
        this.goalProgressElement.textContent = `${stats.weeklyGoalProgress}%`;
        this.docsStudiedElement.textContent = stats.docsStudied;
        this.flashcardsCreatedElement.textContent = stats.flashcardsCreated;
    }

    updateSessionProgress(percentage) {
        this.sessionProgressFill.style.width = `${percentage}%`;
        this.sessionProgressText.textContent = `${percentage}%`;
    }

    formatStudyTime(totalMinutes) {
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        return `${hours}h ${minutes}m`;
    }
}

