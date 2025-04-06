const colorManager = (function () {
    let _c = [210, 210, 210];
    let _dc = [10, 10, 10];

    function update() {
        let rand = int(random(0, 3));
        _c[rand] += _dc[rand];
        if (_c[rand] >= 240 || _c[rand] <= 100) _dc[rand] *= -1;
    }

    function getCurrentColor(alpha = 255) {
        return color(_c[0], _c[1], _c[2], alpha);
    }

    return {
        update,
        getCurrentColor
    };
})();

const dotLength = 7;
function dottedLine(x1, y1, x2, y2) {
    let cnt = int(dist(x1, y1, x2, y2) / dotLength);
    cnt += ~cnt & 1;
    
    for (let i = 0; i < cnt; i += 2) {
        line(lerp(x1, x2, i / cnt), lerp(y1, y2, i / cnt), lerp(x1, x2, (i + 1) / cnt), lerp(y1, y2, (i + 1) / cnt));
    }
}

function mapByLine(rate, sx, sy, ex, ey) {
    let x = map(rate, 0, 1, sx, ex);
    let y = map(rate, 0, 1, sy, ey);
    return { x, y };
}

const EPS = 1e-5;
function mapByEllipse(rate, sx, sy, ex, ey) {
    const a = dist(sx, sy, ex, ey) / 2;
    const b = a * 0.7;
    if (a < EPS) return { x: ex, y: ey };

    let theta = map(rate, 0, 1, 0, PI);
    let d;
    if (abs(theta - PI / 2) < EPS) d = 0;
    else {
        if (theta < PI / 2) d = -a * b / sqrt(sq(a * tan(theta)) + sq(b));
        else d = a * b / sqrt(sq(a * tan(theta)) + sq(b));
    }

    let x, y;
    if (a > 0) {
        x = map(d, -a, a, sx, ex);
        y = map(d, -a, a, sy, ey);
    
        theta = atan(-1 * (ex - sx) / (ey - sy));
        d = map2(0.7, x, y, sx, sy, ex, ey);
        x += d * cos(theta);
        y += d * sin(theta);
    }
    
    return { x, y };
}

function map2(rate, x3, y3, x1, y1, x2, y2) {
    let a = dist(x1, y1, x2, y2) / 2;
    let distX = dist(x3, y3, (x1 + x2) / 2, (y1 + y2) / 2);
    return a * rate * sqrt(1 - sq(distX / a));
}

function between(x, x1, x2) {
    return x >= min(x1, x2) && x <= max(x1, x2);
}