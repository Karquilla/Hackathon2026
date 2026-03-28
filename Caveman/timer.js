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