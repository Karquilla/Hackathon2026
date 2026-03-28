class Timer {
    constructor(duration) {
        this.duration = duration;
        this.startTime = null;
    }

    start() {
        this.startTime = millis();
    }

    hasElapsed() {
        if (this.startTime === null) {
            return false;
        }
        return millis() - this.startTime >= this.duration;
    }

    getElapsedTime() {
        if (this.startTime === null) return 0;
        return millis() - this.startTime;
    }
    reset() {
        this.startTime = null;
    }
}

class CountdownTimer {
    constructor(durationMs) {
        this.duration = durationMs;
        this.startTime = null;
        this.remainingWhenPaused = durationMs;
        this.running = false;
    }

    start() {
        this.startTime = millis();
        this.remainingWhenPaused = this.duration;
        this.running = true;
    }

    pause() {
        if (!this.running || this.startTime === null) return;
        this.remainingWhenPaused = this.getRemainingTime();
        this.running = false;
        this.startTime = null;
    }

    resume() {
        if (this.running || this.remainingWhenPaused <= 0) return;
        this.startTime = millis() - (this.duration - this.remainingWhenPaused);
        this.running = true;
    }

    reset(newDurationMs = this.duration) {
        this.duration = newDurationMs;
        this.startTime = null;
        this.remainingWhenPaused = newDurationMs;
        this.running = false;
    }

    isFinished() {
        return this.getRemainingTime() <= 0;
    }

    getElapsedTime() {
        if (this.startTime === null) {
            return this.duration - this.remainingWhenPaused;
        }
        return constrain(millis() - this.startTime, 0, this.duration);
    }

    getRemainingTime() {
        if (!this.running) return max(0, this.remainingWhenPaused);
        return max(0, this.duration - (millis() - this.startTime));
    }

    getRemainingSeconds() {
        return ceil(this.getRemainingTime() / 1000);
    }
}
