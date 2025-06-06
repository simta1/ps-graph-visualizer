let graph;
let edgeStartVertex = null;
let selectedComponent = null;

let addVertexBtn, arrangeBtn, undoBtn, redoBtn;
let componentSelectBtn, dfsTreeBtn;
let edgeModeToggle, directedLabel, directedToggle, physicsToggle, animationLabel, animationToggle;

let graphInput, applyInputBtn;

function setup() {
    graph = new Graph();

    const canvasContainer = createDiv()
        .id('canvas-container')
        .parent('sketch-holder')
        .style('display', 'flex')
        .style('align-items', 'stretch'); // 자식 요소 높이 동일해짐

    createCanvas(0, 0).parent(canvasContainer);
    
    const inputContainer = createDiv().parent(canvasContainer).style('display', 'flex').style('flex-direction', 'column');
    graphInput = createElement('textarea').parent(inputContainer).style('resize', 'none');
    applyInputBtn = createButton("그래프 생성(1-based만 가능)").parent(inputContainer);

    const controls = createDiv()
        .parent('sketch-holder')
        .style('display', 'flex')
        .style('justify-content', 'space-between')
        .style('width', '100%')
        .style('border-bottom', '2px solid black')
        .style('margin-top', '4px')
        .style('margin-bottom', '4px');

    const leftControls = createDiv().parent(controls); // 좌측(버튼들)
    addVertexBtn = createButton("정점 추가(v)").parent(leftControls);
    arrangeBtn = createButton("정점 정렬(s)").parent(leftControls);
    createElement('br').parent(leftControls);
    undoBtn = createButton("실행 취소(z)").parent(leftControls);
    redoBtn = createButton("다시 실행(y)").parent(leftControls);
    createElement('br').parent(leftControls);
    componentSelectBtn = createButton("연결요소 선택(c)").parent(leftControls);
    dfsTreeBtn = createButton("dfs tree 생성(t)").parent(leftControls);

    const rightControls = createDiv().parent(controls); // 우측(토글바들)
    edgeModeToggle = createCheckbox("간선 추가 모드(e)", isAddEdgeMode).parent(rightControls);
    const directedContainer = createDiv().style('display', 'flex').style('align-items', 'center').parent(rightControls);
    directedToggle = createCheckbox('', directed).parent(directedContainer);
    directedLabel = createSpan('간선 방향 여부 (d)').parent(directedContainer);
    physicsToggle = createCheckbox('물리 효과 적용 (p)', physicsOn).parent(rightControls);
    const animationContainer = createDiv().style('display', 'flex').style('align-items', 'center').parent(rightControls);
    animationToggle = createCheckbox('', animationMode === AnimationMode.ELLIPSE).parent(animationContainer);
    animationLabel = createSpan(`애니메이션 : ${animationMode === AnimationMode.LINE ? '직선' : '곡선'} (a)`).parent(animationContainer);

    setTimeout(() => {
        const inputBoxWidth = min(windowWidth / 3, 300);
        const canvasWidth = windowWidth - inputBoxWidth - 5;
        const footer = document.querySelector('footer');
        const footerHeight = footer ? footer.offsetHeight : 0;
        const canvasHeight = windowHeight - controls.elt.offsetHeight - footerHeight - 20;
        resizeCanvas(canvasWidth, canvasHeight);
        inputContainer.style('width', `${inputBoxWidth}px`).style('height', `${canvasHeight}px`);
        
        applyInputBtn.style('margin-bottom', '0px');
        const inputBoxHeight = canvasHeight - applyInputBtn.elt.offsetHeight;
        graphInput.style('width', `${inputBoxWidth}px`).style('height', `${inputBoxHeight}px`)
            .attribute('placeholder', `입력 형식:
n m
u1 v1 w1
u2 v2 w2
...
um vm wm

n: 정점 개수(0 이상 정수)
m: 간선 개수(0 이상 정수, 생략가능)
u: 간선 시작점(자연수)
v: 간선 도착점(자연수)
w: 간선 가중치(실수, 생략가능)`);
    }, 0);

    applyInputBtn.elt.addEventListener("click", () => {
        try {
            const { n, edges } = parseGraphInput();
            if (!confirm("그래프 생성은 실행 취소가 불가능합니다.")) return;
            componentSelectMode = false;
            graph = new Graph(n, edges);
        } catch (e) {
            alert(e.message);
        }
    });

    addVertexBtn.elt.addEventListener("click", () => {
        if (between(mouseX, 0, width) && between(mouseY, 0, height)) graph.addVertex(mouseX, mouseY);
        else graph.addVertex(width / 2, height / 2);
    });

    arrangeBtn.elt.addEventListener("click", () => {
        graph.arrangeVertices(min(height, width) / 2 - vertexRadius * 1.5);
    });
    
    undoBtn.elt.addEventListener("click", () => {
        componentSelectMode = false;
        graph.undo();
    });
    
    redoBtn.elt.addEventListener("click", () => {
        componentSelectMode = false;
        graph.redo();
    });

    componentSelectBtn.elt.addEventListener("click", () => {
        if (isAddEdgeMode) {
            edgeModeToggle.checked(!edgeModeToggle.checked());
            edgeModeToggle.elt.dispatchEvent(new Event("change"));
        }
        graph.deselect();
        componentSelectMode = true;
        selectedComponent = null;
    });
    
    dfsTreeBtn.elt.addEventListener("click", () => {
        if (!componentSelectMode || !selectedComponent || selectedComponent.length === 0) {
            alert("연결요소 선택 필요");
            return;
        }

        if (physicsOn) {
            physicsToggle.checked(!physicsToggle.checked());
            physicsToggle.elt.dispatchEvent(new Event("change"));
        }
        graph.arrangeAsDfsTree(selectedComponent[0]);
    });

    edgeModeToggle.changed(() => {
        isAddEdgeMode = edgeModeToggle.checked();
        selectedVertex = edgeStartVertex = null;
        graph.deselect();
        componentSelectMode = false;
    });

    directedToggle.changed(() => {
        directed = directedToggle.checked();
    });

    physicsToggle.changed(() => {
        physicsOn = physicsToggle.checked();
    });
    
    animationToggle.changed(() => {
        animationMode = animationToggle.checked() ? AnimationMode.ELLIPSE : AnimationMode.LINE;
        animationLabel.html(`애니메이션 : ${animationMode === AnimationMode.LINE ? '직선' : '곡선'} (a)`);
    });
    
    window.addEventListener("keydown", (e) => {
        if (document.activeElement === graphInput.elt) return; // textarea에 입력 중인 경우는 단축키로 취급 안함

        if (e.key === "v" || e.key === "V") addVertexBtn.elt.click();
        else if (e.key === "s" || e.key === "S") arrangeBtn.elt.click();
        else if (e.key === "z" || e.key === "Z") undoBtn.elt.click();
        else if (e.key === "y" || e.key === "Y") redoBtn.elt.click();
        else if (e.key === "c" || e.key === "C") componentSelectBtn.elt.click();
        else if (e.key === "t" || e.key === "T") dfsTreeBtn.elt.click();
        else if (e.key === "e" || e.key === "E") {
            edgeModeToggle.checked(!edgeModeToggle.checked());
            edgeModeToggle.elt.dispatchEvent(new Event("change"));
        }
        else if (e.key === "d" || e.key === "D") {
            directedToggle.checked(!directedToggle.checked());
            directedToggle.elt.dispatchEvent(new Event("change"));
        }
        else if (e.key === "p" || e.key === "P") {
            physicsToggle.checked(!physicsToggle.checked());
            physicsToggle.elt.dispatchEvent(new Event("change"));
        }
        else if (e.key === "a" || e.key === "A") {
            animationToggle.checked(!animationToggle.checked());
            animationToggle.elt.dispatchEvent(new Event("change"));
        }
    });
    
    console.log(`물리 효과 테스트용 입력:
17 19
1 2
2 3
3 4
4 5
5 3
1 3
6 7
7 8
6 8
8 9
9 10
10 11
11 9
12 13
14 15
15 16
16 17
14 17
14 16`);
    console.log(`dfs tree 테스트용 입력:
30 29
1 2
1 3
2 4
2 5
3 6
3 7
4 8
4 9
5 10
5 11
6 12
6 13
7 14
7 15
8 16
9 17
10 18
11 19
12 20
13 21
14 22
15 23
16 24
17 25
18 26
19 27
20 28
21 29
22 30`)
}

// function windowResized() {
//     resizeCanvas(windowWidth, windowHeight - PADDING);
// }

function draw() {
    background(255);
    colorManager.update();
    
    if (selectedVertex) {
        if (componentSelectMode && selectedComponent !== null) {
            const { dx, dy } = selectedVertex.getDiff(mouseX, mouseY);
            for (let v of selectedComponent) v.translate(dx, dy);
        }
        else selectedVertex.setPosition(mouseX, mouseY);
    }

    graph.run();

    if (edgeStartVertex) {
        stroke(colorManager.getCurrentColor());
        dottedLine(edgeStartVertex.x, edgeStartVertex.y, mouseX, mouseY);
    }

    stroke(0);
    strokeWeight(3);
    noFill();
    rect(0, 0, width, height, 3, 3, 3, 3);
}

function mousePressed() {
    if (componentSelectMode) {
        if (selectedComponent === null) {
            let v = graph.getVertexUnderMouse();
            if (v) selectedComponent = graph.selectConnectedComponent(v);
            else componentSelectMode = false;
        }
        else {
            selectedVertex = graph.getVertexUnderMouse();
            if (selectedVertex && selectedComponent.includes(selectedVertex)) {
                graph.backupVertexPositions();
            }
            else componentSelectMode = false;
        }
    }
    else {
        if (isAddEdgeMode) {
            let v = graph.getVertexUnderMouse();
            if (v) {
                if (!edgeStartVertex) edgeStartVertex = v;
                else if (edgeStartVertex !== v) {
                    graph.addEdge(edgeStartVertex, v);
                    edgeStartVertex = null;
                }
            }
        }
        else {
            selectedVertex = graph.getVertexUnderMouse();
            if (selectedVertex) graph.backupVertexPositions();
        }
    }
}

function mouseReleased() {
    selectedVertex = null;
}

function parseGraphInput() {
    const lines = graphInput.value().split('\n').map(line => line.trim()).filter(line => line.length > 0);
    if (lines.length < 1) throw new Error("입력 비어있음");

    let tokens = lines[0].split(/\s+/).map(Number);
    if (!(tokens.length == 1 || tokens.length == 2) || !tokens.every(Number.isInteger)) throw new Error(`${lines[0]} <- 입력 잘못됨
(n m꼴 입력 필요
n: 정점 개수(0 이상 정수)
m: 간선 개수(0 이상 정수, 생략가능))`);

    let n = tokens[0], m = tokens[1] ?? (lines.length - 1);
    if (n < 0 || m < 0) throw new Error(`${lines[0]} <- 입력 잘못됨\n(n과 m은 0 이상 정수만 가능)`);

    const edges = [];

    for (let i = 1; i <= m && i < lines.length; i++) {
        tokens = lines[i].split(/\s+/).map(Number);
        if (!(tokens.length == 2 || tokens.length == 3) || tokens.some(Number.isNaN)) throw new Error(`${lines[i]} <- 입력 잘못됨
(u v w꼴 입력 필요
u: 간선 시작점(자연수)
v: 간선 끝점(자연수)
w: 간선 가중치(실수, 생략 가능))`);

        const u = tokens[0], v = tokens[1], w = tokens[2] ?? 0;
        if (![u, v].every(Number.isInteger) || u <= 0 || v <= 0) throw new Error(`${lines[i]} <- 입력 잘못됨\n(간선의 시작점과 끝점은 자연수만 가능)`);

        n = max(n, u);
        n = max(n, v);
        if (u == v) continue; // self loop
        edges.push([u, v, w]);
    }

    return { n, edges };
}

// 정점이동기능 모바일 지원용
function touchStarted() {
    if (mouseX < 0 || mouseX > width || mouseY < 0 || mouseY > height) return true;
    mousePressed();
    return false;
}
function touchEnded() {
    if (mouseX < 0 || mouseX > width || mouseY < 0 || mouseY > height) return true;
    selectedVertex = null;
    return false;
}