class TimerModel {
    constructor(store) {
        this.store = store;
        this.timerId = null;
        this.onTick = null;
        this.onComplete = null;
        this.totalSeconds = 1500; // Default to 25 minutes
        this.remainingSeconds = this.totalSeconds;
    }

    start() {
        if (this.timerId) return;

        this.timerId = setInterval(() => {
            this.remainingSeconds--;
            if (this.onTick) {
                this.onTick(this.remainingSeconds);
            }

            if (this.remainingSeconds <= 0) {
                this.stop();
                if (this.onComplete) {
                    this.onComplete();
                }
            }
        }, 1000);
    }

    stop() {
        clearInterval(this.timerId);
        this.timerId = null;
    }

    reset() {
        this.stop();
        this.remainingSeconds = this.totalSeconds;
        if (this.onTick) {
            this.onTick(this.remainingSeconds);
        }
    }

    setDuration(minutes, seconds = 0) {
        this.totalSeconds = (minutes * 60) + seconds;
        this.reset();
    }
}

