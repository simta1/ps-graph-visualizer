const vertexRadius = 20;
let selectedVertex = null;

class Vertex {
    constructor(x, y, id) {
        this.x = this.sx = this.ex = x;
        this.y = this.sy = this.ey = y;
        this.id = id;
        this.r = vertexRadius;
        
        this.adj = []; // 유향 그래프
        this.udj = []; // 무향 그래프 // undirected adj 줄인거임
        this.visited = 0;

        this.vel = createVector(0, 0);
        this.acc = createVector(0, 0);
    }

    applyForce(force) {
        this.acc.add(force);
    }
    
    applyPhysics() {
        let friction = this.vel.copy().mult(0.25);
        this.acc.sub(friction);
        this.vel.add(this.acc);
        this.x += this.vel.x;
        this.y += this.vel.y;
        this.acc.mult(0);
    }

    display(visitValue) {
        // 정점 출력
        fill(255);
        if (componentSelectMode && !selectedComponent) {
            stroke(255, 0, 0);
        }
        else {
            if (this.mouseIn()) stroke(colorManager.getCurrentColor(100));
            else stroke(0);
        }
        strokeWeight(2);
        circle(this.x, this.y, 2 * this.r);
        
        // 정점 번호 출력
        textAlign(CENTER, CENTER);
        textSize(18);
        fill(0);
        noStroke();
        text(this.id, this.x, this.y);

        if (this === selectedVertex || (componentSelectMode && this.visited == visitValue)) this.highlight();
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

    getDiff(x, y) {
        return { dx: x - this.x, dy: y - this.y  };
    }
    
    translate(dx, dy) {
        this.setPosition(this.x + dx, this.y + dy);
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