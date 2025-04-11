let timer = new Timer(false);
let animationTime = 30; // 나중에 스크롤바로 변경하는 기능 넣을 듯도 해서 일단 const안썼음
let animationUndoTime = 10;
let animationRedoTime = 10;
const UNDO_LIMIT = 500;

class Graph {
    constructor(n = 0, edges = []) {
        this.vertices = [];
        this.edges = [];
        this.undoStack = [];
        this.redoStack = [];
        this.visitValue = 1;

        for (let i = 0; i < n; i++) {
            const x = random(vertexRadius, width - vertexRadius);
            const y = random(vertexRadius, height - vertexRadius);
            this.addVertex(x, y);
        }

        for (let i = 0; i < edges.length; i++) {
            const [u, v, w] = edges[i];
            this.addEdge(this.vertices[u - 1], this.vertices[v - 1], w);
        }
        
        this.undoStack = [];
        this.redoStack = [];
    }

    run() {
        this.update();
        this.display();
    }

    update() {
        if (timer.isRunning()) {
            if (timer.isOver()) {
                for (let v of this.vertices) v.moveToTargetPosition();
            }
            else {
                for (let v of this.vertices) v.update(timer.getElapsedTimeRate());
            }
        }

        if (physicsOn) this.applyPhysics();
    }

    applyPhysics() {
        // 정점간 척력, 거리제곱에 반비례하게
        const repulsionStrength = 3000;
        for (let i = 0; i < this.vertices.length; i++) {
            for (let j = i + 1; j < this.vertices.length; j++) {
                const a = this.vertices[i];
                const b = this.vertices[j];
                let dir = createVector(a.x - b.x, a.y - b.y);
                if (a.x == b.x && a.y == b.y) dir = createVector(random(-1e-3, 1e-3), random(-1e-3, 1e-3));
                let dist = max(dir.mag(), 10);
                let force = dir.normalize().mult(repulsionStrength / (dist * dist));
                a.applyForce(force);
                b.applyForce(force.mult(-1));
            }
        }
        
        // 화면 중앙 방향 중력
        const gravity = 0.05;
        if (this.vertices.length > 1) { // 한개일 땐 애초에 아무힘도 없는 상황이라 그냥 중력 안 넣는 게 더 자연스러움
            for (let vertex of this.vertices) {
                let dir = createVector(width / 2 - vertex.x, height / 2 - vertex.y);
                let dist = dir.mag();
                let force = dir.normalize().mult(gravity * Math.pow(dist, 0.4));
                if (dist > vertexRadius) vertex.applyForce(force); // 화면 중앙에서 진동운동 방지 // TODO 아직 진동 좀 있어서 대안 필요함
            }
        }

        // 화면 바깥으로 벗어난 경우 경계 안쪽으로 강한 인력
        for (let vertex of this.vertices) {
            let dir = createVector(width / 2 - vertex.x, height / 2 - vertex.y);
            let force = dir.normalize().mult(5);
            // if (vertex.x < vertexRadius || vertex.x > width - vertexRadius || vertex.y < vertexRadius || vertex.y > height - vertexRadius) vertex.applyForce(force);
            if (!between(vertex.x, vertexRadius, width - vertexRadius) || !between(vertex.y, vertexRadius, height - vertexRadius)) vertex.applyForce(force);
        }

        // 간선은 스프링처럼 취급해서 복원력
        const springLength = 7 * vertexRadius;
        const springStrength = 0.1;
        for (let edge of this.edges) {
            const a = edge.from;
            const b = edge.to;
            let dir = createVector(b.x - a.x, b.y - a.y);
            let dist = dir.mag();
            let force = dir.normalize().mult(springStrength * (dist - springLength));
            a.applyForce(force);
            b.applyForce(force.mult(-1));
        }

        for (let v of this.vertices) v.applyPhysics();
    }

    display() {
        for (let edge of this.edges) edge.display();
        for (let vertex of this.vertices) vertex.display(this.visitValue);
    }

    getVertexUnderMouse() {
        for (let i = this.vertices.length - 1; i >= 0; i--) {
            let v = this.vertices[i];
            if (v.mouseIn()) return v;
        }
        return null;
    }

    deselect() {
        ++this.visitValue;
    }

    selectConnectedComponent(vertex) {
        ++this.visitValue;
        const component = [];

        const dfs = (cur) => {
            cur.visited = this.visitValue;
            component.push(cur);
            for (const { next } of cur.udj) if (next.visited !== this.visitValue) dfs(next);
        };
        dfs(vertex);
        
        return component;
    }

    undo() {
        if (this.undoStack.length === 0) return;
        const action = this.undoStack.pop();
        // console.log("undo", this.undoStack.length, action);
        action();
    }

    redo() {
        if (this.redoStack.length === 0) return;
        const action = this.redoStack.pop();
        // console.log("redo", this.redoStack.length, action);
        action();
    }    
    
    addVertex(x, y) {
        const vertex = new Vertex(x, y, this.vertices.length + 1);
        this._addVertex(vertex);
    }
    
    _addVertex(vertex, isRedo = false) {
        this.vertices.push(vertex);

        this.undoStack.push(() => {
            const popped = this.vertices.pop();
            this.redoStack.push(() => this._addVertex(popped, true));
        });
        if (this.undoStack.length > UNDO_LIMIT) this.undoStack.shift();
        if (!isRedo) this.redoStack = [];
    }

    addEdge(u, v, w = 0) {
        const edge = new Edge(u, v, w);
        this._addEdge(edge);
    }

    _addEdge(edge, isRedo = false) {
        this.edges.push(edge);
        edge.from.adj.push({ next: edge.to, edge: edge });
        edge.from.udj.push({ next: edge.to, edge: edge });
        edge.to.udj.push({ next: edge.from, edge: edge });

        this.undoStack.push(() => { 
            const popped = this.edges.pop();
            popped.from.adj.pop();
            popped.from.udj.pop();
            popped.to.udj.pop();
            this.redoStack.push(() => this._addEdge(popped, true));
        });
        if (this.undoStack.length > UNDO_LIMIT) this.undoStack.shift();
        if (!isRedo) this.redoStack = [];
    }

    arrangeVertices(radius = 150) {
        let sorted = true;
        for (let i = 0; i < this.vertices.length; i++) {
            let theta = 1.5 * PI - 2 * PI * i / (this.vertices.length);
            let ex = width / 2 + radius * cos(theta);
            let ey = height / 2 + radius * sin(theta);
            if (this.vertices[i].x != ex || this.vertices[i].y != ey) sorted = false;
        }
        if (sorted) return;

        this.backupVertexPositions();
        for (let i = 0; i < this.vertices.length; i++) {
            let theta = 1.5 * PI - 2 * PI * i / (this.vertices.length);
            let ex = width / 2 + radius * cos(theta);
            let ey = height / 2 + radius * sin(theta);
            this.vertices[i].setTargetPosition(ex, ey);
        }
        timer.start(animationTime);
    }
    
    backupVertexPositions(isRedo = false) {
        const snapshot = this.vertices.map(v => ({ v: v, x: v.x, y: v.y }));
        this.undoStack.push(() => {
            const redoSnap = this.vertices.map(v => ({ v, x: v.x, y: v.y }));
            for (const {v, x, y} of snapshot) v.setTargetPosition(x, y);
            timer.start(animationUndoTime);
            this.redoStack.push(() => {
                this.backupVertexPositions(true);
                for (const {v, x, y} of redoSnap) v.setTargetPosition(x, y);
                timer.start(animationRedoTime);
            });
        });
        if (this.undoStack.length > UNDO_LIMIT) this.undoStack.shift();
        if (!isRedo) this.redoStack = [];
    }
}