class TimerController {
    constructor(timerModel, timerView, toastView) {
        this.model = timerModel;
        this.view = timerView;
        this.toast = toastView;

        this.pomodoroBtn = Utils.get('#pomodoro-btn');
        this.shortBreakBtn = Utils.get('#short-break-btn');
        this.longBreakBtn = Utils.get('#long-break-btn');
        this.customMinutesInput = Utils.get('#custom-minutes');
        this.customSecondsInput = Utils.get('#custom-seconds');
        this.setCustomTimerBtn = Utils.get('#set-custom-timer');

        this.model.onTick = (time) => this.view.update(time);
        this.model.onComplete = () => this.handleTimerComplete();

        this.bindEvents();
        this.model.reset(); // Initialize view
    }

    bindEvents() {
        this.pomodoroBtn.addEventListener('click', () => this.setPresetTimer(25, 'Pomodoro'));
        this.shortBreakBtn.addEventListener('click', () => this.setPresetTimer(5, 'Short Break'));
        this.longBreakBtn.addEventListener('click', () => this.setPresetTimer(15, 'Long Break'));
        this.setCustomTimerBtn.addEventListener('click', () => this.setCustomTimer());
    }

    setPresetTimer(minutes, name) {
        this.model.setDuration(minutes);
        this.toast.show(`Timer set for ${name} (${minutes} minutes).`);
        this.setActivePreset(name);
    }

    setCustomTimer() {
        const minutes = parseInt(this.customMinutesInput.value, 10) || 0;
        const seconds = parseInt(this.customSecondsInput.value, 10) || 0;

        if (minutes > 0 || seconds > 0) {
            this.model.setDuration(minutes, seconds);
            this.toast.show(`Custom timer set for ${minutes}m ${seconds}s.`);
            this.setActivePreset(null);
        } else {
            this.toast.show('Please enter a valid duration.', 'warning');
        }
    }

    setActivePreset(name) {
        [this.pomodoroBtn, this.shortBreakBtn, this.longBreakBtn].forEach(btn => {
            btn.classList.remove('active');
        });

        if (name === 'Pomodoro') this.pomodoroBtn.classList.add('active');
        else if (name === 'Short Break') this.shortBreakBtn.classList.add('active');
        else if (name === 'Long Break') this.longBreakBtn.classList.add('active');
    }

    handleTimerComplete() {
        this.toast.show("Time's up! Great work! 🎉", 'success');
        
        // Update achievements progress
        if (window.app && window.app.achievementController) {
            const currentSessions = window.app.achievementController.userProgress.pomodoroSessions + 1;
            window.app.achievementController.updateProgress('pomodoroSessions', currentSessions);
            
            // Check for pomodoro-related achievements
            if (currentSessions === 10) {
                window.app.achievementController.unlockAchievement('time_master');
            }
        }
        
        // Optionally, play a sound
    }
}

