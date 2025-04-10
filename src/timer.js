class Timer {
    constructor(repeat = false) {
        this.elapsedTime = 0;
        this.endTime = 0;
        this.repeat = repeat;
        this.isRun = false;
    }

    start(endTime) {
        this.elapsedTime = 0;
        this.endTime = endTime;
        this.isRun = true;
    }
    
    end() {
        this.endTime = 0;
    }

    isRunning() {
        return this.isRun;
    }

    isOver() {
        if (++this.elapsedTime < this.endTime) return false;
        if (this.repeat) this.elapsedTime = 0;
        else this.isRun = false;
        return true;
    }

    getElapsedTimeRate() {
        return this.elapsedTime / this.endTime;
    }

    set(time) {
        this.endTime = time;
    }
}