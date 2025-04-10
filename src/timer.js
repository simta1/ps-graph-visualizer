class Timer {
    constructor(repeat = false) {
        this.elapsedTime = 0;
        this.endTime = 0;
        this.repeat = repeat;
    }

    start(endTime) {
        this.elapsedTime = 0;
        this.endTime = endTime;
    }
    
    end() {
        this.endTime = 0;
    }

    isOver() {
        if (++this.elapsedTime < this.endTime) return false;
        if (this.repeat) this.elapsedTime = 0;
        return true;
    }

    getElapsedTimeRate() {
        return this.elapsedTime / this.endTime;
    }

    set(time) {
        this.endTime = time;
    }
}