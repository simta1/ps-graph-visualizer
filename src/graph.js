let timer = new Timer(false);
let animationTime = 30; // 나중에 스크롤바로 변경하는 기능 넣을 듯도 해서 일단 const안썼음
let animationUndoTime = 10;
let animationRedoTime = 10;
const UNDO_LIMIT = 500;

class Graph {
    constructor() {
        this.vertices = [];
        this.edges = [];
        this.undoStack = [];
        this.redoStack = [];
        this.visitValue = 1;
    }

    run() {
        this.update();
        this.display();
    }

    update() {
        if (timer.isOver()) {
            for (let v of this.vertices) v.moveToTargetPosition();
        }
        else {
            for (let v of this.vertices) v.update(timer.getElapsedTimeByRate());
        }
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