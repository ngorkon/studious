class TimerView {
    constructor() {
        this.timerDisplay = Utils.get('#timer');
        this.readerTimerDisplay = Utils.get('#reader-timer');
    }

    update(timeInSeconds) {
        const formattedTime = Utils.formatTime(timeInSeconds);
        if (this.timerDisplay) {
            this.timerDisplay.textContent = formattedTime;
        }
        if (this.readerTimerDisplay) {
            this.readerTimerDisplay.textContent = formattedTime;
        }
    }
}

