let timer = new Timer(false);
let animationTime = 30;
let animationUndoTime = 10;

class Graph {
    constructor() {
        this.vertices = [];
        this.edges = [];
        this.undoStack = [];
    }

    run() {
        this.update();
        this.display();
    }
    
    display() {
        for (let edge of this.edges) edge.display();
        for (let vertex of this.vertices) vertex.display();
    }

    getVertexUnderMouse() {
        for (let i = this.vertices.length - 1; i >= 0; i--) {
            let v = this.vertices[i];
            if (v.mouseIn()) return v;
        }
        return null;
    }

    undo() {
        if (this.undoStack.length === 0) return;
        const action = this.undoStack.pop();
        action();
    }
    
    addVertex(x, y) {
        const vertex = new Vertex(x, y, this.vertices.length + 1);
        this.vertices.push(vertex);
        this.undoStack.push(() => { this.vertices.pop(); });
        if (this.undoStack.length > 200) this.undoStack.shift();
    }

    addEdge(u, v) {
        if (u == v) return;
        const edge = new Edge(u, v);
        this.edges.push(edge);
        this.undoStack.push(() => { this.edges.pop(); });
        if (this.undoStack.length > 200) this.undoStack.shift();
    }

    arrangeVertices(radius=150) {
        this.backupVertexPositions();
        for (let i = 0; i < this.vertices.length; i++) {
            let theta = 1.5 * PI - 2 * PI * i / (this.vertices.length);
            
            let ex = width / 2 + radius * cos(theta);
            let ey = height / 2 + radius * sin(theta);
            this.vertices[i].setTargetPosition(ex, ey);
        }
        timer.start(animationTime);
    }
    
    backupVertexPositions() {
        const snapshot = this.vertices.map(v => ({ v: v, x: v.x, y: v.y }));
        this.undoStack.push(() => {
            for (const {v, x, y} of snapshot) v.setTargetPosition(x, y);
            timer.start(animationUndoTime);
        });
        if (this.undoStack.length > 200) this.undoStack.shift();
    }

    update() {
        if (timer.isOver()) {
            for (let v of this.vertices) v.moveToTargetPosition();
        }
        else {
            for (let v of this.vertices) v.update(timer.getElapsedTimeByRate());
        }
    }
}