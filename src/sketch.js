let graph;
let addVertexBtn, edgeModeToggle;
let arrangeBtn, undoBtn, redoBtn, animationToggle;
let edgeStartVertex = null;

function setup() {
    createCanvas(0, 0);
    graph = new Graph();

    const controls = createDiv()
        .style('display', 'flex')
        .style('justify-content', 'space-between')
        .style('width', '100%')
        .style('border-bottom', '2px solid black')
        .style('margin-top', '4px')
        .style('margin-bottom', '4px');

    const leftControls = createDiv().parent(controls); // 좌측
    addVertexBtn = createButton("정점 추가(v)").parent(leftControls);
    arrangeBtn = createButton("정점 정렬(s)").parent(leftControls);
    createElement('br').parent(leftControls);
    undoBtn = createButton("실행 취소(z)").parent(leftControls);
    redoBtn = createButton("다시 실행(y)").parent(leftControls);

    const rightControls = createDiv().parent(controls); // 우측
    edgeModeToggle = createCheckbox("간선 추가 모드(e)", false).parent(rightControls);
    const animationContainer = createDiv().style('display', 'inline-flex').style('align-items', 'center').parent(rightControls);
    animationToggle = createCheckbox('', false).parent(animationContainer);
    animationLabel = createSpan(`애니메이션 : ${animationMode === AnimationMode.LINE ? '직선' : '곡선'} (a)`).parent(animationContainer);

    setTimeout(() => {
        const PADDING = controls.elt.offsetHeight;
        resizeCanvas(windowWidth, windowHeight - PADDING - 20);
    }, 0);

    addVertexBtn.elt.addEventListener("click", () => {
        if (between(mouseX, vertexRadius * 2, width - vertexRadius * 2) && between(mouseY, vertexRadius * 2, height - vertexRadius * 2)) graph.addVertex(mouseX, mouseY);
        else graph.addVertex(width / 2, height / 2);
    });

    edgeModeToggle.changed(() => {
        isAddEdgeMode = edgeModeToggle.checked();
        selectedVertex = edgeStartVertex = null;
    });

    arrangeBtn.elt.addEventListener("click", () => {
        graph.arrangeVertices(min(height, width) / 2 - vertexRadius * 3);
    });
    
    undoBtn.elt.addEventListener("click", () => {
        graph.undo();
    });
    
    redoBtn.elt.addEventListener("click", () => {
        graph.redo();
    });

    animationToggle.changed(() => {
        animationMode = animationToggle.checked() ? AnimationMode.ELLIPSE : AnimationMode.LINE;
        animationLabel.html(`애니메이션 : ${animationMode === AnimationMode.LINE ? '직선' : '곡선'} (a)`);
    });
    
    window.addEventListener("keydown", (e) => {
        if (e.key === "v" || e.key === "V") addVertexBtn.elt.click();
        else if (e.key === "s" || e.key === "S") arrangeBtn.elt.click();
        else if (e.key === "z" || e.key === "Z") undoBtn.elt.click();
        else if (e.key === "y" || e.key === "Y") redoBtn.elt.click();
        else if (e.key === "e" || e.key === "E") {
            edgeModeToggle.checked(!edgeModeToggle.checked());
            edgeModeToggle.elt.dispatchEvent(new Event("change"));
        }
        else if (e.key === "a" || e.key === "A") {
            animationToggle.checked(!animationToggle.checked());
            animationToggle.elt.dispatchEvent(new Event("change"));
        }
    });
}

// function windowResized() {
//     resizeCanvas(windowWidth, windowHeight - PADDING);
// }

function draw() {
    background(255);
    colorManager.update();

    stroke(0);
    strokeWeight(3);
    noFill();
    rect(0, 0, width, height, 3, 3, 3, 3);
    
    if (selectedVertex) selectedVertex.setPosition(mouseX, mouseY);

    graph.run();

    if (edgeStartVertex) {
        stroke(colorManager.getCurrentColor());
        dottedLine(edgeStartVertex.x, edgeStartVertex.y, mouseX, mouseY);
    }
}

function mousePressed() {
    if (isAddEdgeMode) {
        let v = graph.getVertexUnderMouse();
        if (v) {
            if (!edgeStartVertex) edgeStartVertex = v;
            else {
                graph.addEdge(edgeStartVertex, v);
                edgeStartVertex = null;
                // window.dispatchEvent(new KeyboardEvent("keydown", { key: "e" }));
            }
        }
    }
    else {
        selectedVertex = graph.getVertexUnderMouse();
        if (selectedVertex) graph.backupVertexPositions();
    }
}

function mouseReleased() {
    selectedVertex = null;
}

// 정점이동기능 모바일 지원용
function touchStarted() {
    if (mouseX < 0 || mouseX > width || mouseY < 0 || mouseY > height) return true;
    mousePressed();
    return false;
}
function touchMoved() {
    if (mouseX < 0 || mouseX > width || mouseY < 0 || mouseY > height) return true;
    if (selectedVertex) selectedVertex.setPosition(mouseX, mouseY);
    return false;
}
function touchEnded() {
    if (mouseX < 0 || mouseX > width || mouseY < 0 || mouseY > height) return true;
    selectedVertex = null;
    return false;
}

// function init(input) {
//     /* input 구조

//     n m     <- 노드 개수, 간선 개수

//     u v w   <- 간선 m개
//     ...

//     */

    
//     const lines = input.replace(/\n+/g, '\n').split('\n');
//     const [n, m] = lines[0].split(' ').map(Number);
//     console.log(`Received n: ${n}, m: ${m}`);

//     graph = new Graph(n);

//     for (let i = 1; i <= m; i++) {
//         const [u, v, w] = lines[i].split(' ').map(Number);
//         console.log(`Received u: ${u}, v: ${v}, w: ${w}`);
//         graph.addEdge(u, v, w);
//     }
// }