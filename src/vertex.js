const vertexRadius = 20;
let selectedVertex = null;

class Vertex {
    constructor(x, y, id) {
        this.x = this.sx = this.ex = x;
        this.y = this.sy = this.ey = y;
        this.id = id;
        this.r = vertexRadius;
    }

    display() {
        // 정점 출력
        fill(255);
        if (this.mouseIn()) stroke(colorManager.getCurrentColor(100));
        else stroke(0);
        strokeWeight(2);
        circle(this.x, this.y, 2 * this.r);
        
        // 정점 번호 출력
        textAlign(CENTER, CENTER);
        textSize(18);
        fill(0);
        noStroke();
        text(this.id, this.x, this.y);

        if (this === selectedVertex) this.highlight();
    }

    mouseIn() {
        return dist(this.x, this.y, mouseX, mouseY) <= this.r;
    }

    highlight() {
        stroke(127, 127, 255);
        fill(0, 0, 255, 100);
        circle(this.x, this.y, 2 * this.r);
    }

    setPosition(x, y) {
        this.x = this.sx = this.ex = x;
        this.y = this.sy = this.ey = y;
    }

    setTargetPosition(x, y) {
        this.sx = this.x;
        this.sy = this.y;
        this.ex = x;
        this.ey = y;
    }

    moveToTargetPosition() {
        this.x = this.ex;
        this.y = this.ey;
    }

    update(rate) {
        const { x, y } = animationMode === AnimationMode.LINE
            ? mapByLine(rate, this.sx, this.sy, this.ex, this.ey)
            : mapByEllipse(rate, this.sx, this.sy, this.ex, this.ey);
        this.x = x;
        this.y = y;
    }
}