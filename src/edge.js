let directed = true;

class Edge {
    constructor(u, v, w) {
        this.from = u;
        this.to = v;
        this.weight = w;
    }

    display() {
        stroke(0, this.mouseIn() ? 255 : 120);
        strokeWeight(1);
        push();
        translate(this.from.x, this.from.y);
        rotate(atan2(this.to.x - this.from.x, - this.to.y + this.from.y) - PI / 2);
            const edgeLength = dist(this.from.x, this.from.y, this.to.x, this.to.y) - 2 * vertexRadius;
            line(vertexRadius, 0, vertexRadius + edgeLength, 0);
            if (directed) {
                line(vertexRadius + edgeLength - 10, -10, vertexRadius + edgeLength, 0);
                line(vertexRadius + edgeLength - 10, +10, vertexRadius + edgeLength, 0);
            }
        pop();

        textAlign(CENTER, CENTER);
        textSize(20);
        fill(0, this.mouseIn() ? 255 : 50);
        noStroke();
        text(this.weight, (this.from.x + this.to.x) / 2, (this.from.y + this.to.y) / 2);
    }

    mouseIn() {
        const x1 = this.from.x;
        const x2 = this.to.x;
        const y1 = this.from.y;
        const y2 = this.to.y;
        const mx = mouseX;
        const my = mouseY;
                
        const a = y2 - y1;
        const b = x1 - x2;
        const c = a * my - b * mx;
        const d = a * x1 + b * y1;
        
        // 마우스 위치에서 간선에 내린 수선의 발 좌표
        const hx = (-b * c + a * d) / (a * a + b * b)
        const hy = (a * c + b * d) / (a * a + b * b)

        if (between(hx, x1, x2) && between(hy, y1, y2)) return abs(a * mx + b * my - d) / sqrt(a * a + b * b) <= 10;
        return Math.min(dist(x1, y1, mx, my), dist(x2, y2, mx, my)) <= 10;
    }

    // update() {

    // }
}