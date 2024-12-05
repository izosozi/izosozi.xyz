import SimplexNoise from "https://cdn.skypack.dev/simplex-noise@2.4.0";

console.log('hello');

const canvas = document.getElementById('grid-canvas');
const ctx = canvas.getContext('2d');
const simplexX = new SimplexNoise();
const simplexY = new SimplexNoise();

const options = {
    // resolution: 1,
    cellWidth: 50,
    cellHeight: 50,
    noiseXInFactor: 1 / 300,
    noiseYInFactor: 1 / 300,
    noiseTInFactor: 1 / 50000,
    // noiseTInOffset: 0.3,
    noiseXOutFactor: 50,
    noiseYOutFactor: 50
};

let lastRenderTime = 0;
const FPS_INTERVAL = 1000 / 8;

function setSize() {
    const dpr = window.devicePixelRatio || 1;
    console.log("dpr", dpr);
    canvas.width = canvas.offsetWidth * dpr;
    console.log("width", canvas.width);
    canvas.height = canvas.offsetHeight * dpr;
    console.log("height", canvas.height);
    ctx.scale(dpr, dpr);

    console.log("offsetWidth", canvas.offsetWidth);
    console.log("offsetHeight", canvas.offsetHeight);
}

function warpLine(ctx, x1, y1, x2, y2, warp) {
    const divisions = 3; // Adjust number of line segments for smoothness
    const dx = (x2 - x1) / divisions;
    const dy = (y2 - y1) / divisions;

    for (let i = 0; i <= divisions; i++) {
        const x = x1 + dx * i;
        const y = y1 + dy * i;
        ctx.lineTo(...warp([x, y]));
    }
}

function drawGrid(t) {
    const { cellWidth, cellHeight, noiseXInFactor, noiseYInFactor, noiseXOutFactor, noiseYOutFactor } = options;
    const cellsX = Math.ceil(canvas.width / cellWidth);
    const cellsY = Math.ceil(canvas.height / cellHeight);

    const warp = ([x, y]) => {
        const noiseX = simplexX.noise3D(x * noiseXInFactor, y * noiseYInFactor, t) * noiseXOutFactor;
        const noiseY = simplexY.noise3D(x * noiseXInFactor, y * noiseYInFactor, t) * noiseYOutFactor;
        return [x + noiseX, y + noiseY];
    };

    for (let i = 0; i <= cellsX; i++) {
        for (let j = 0; j <= cellsY; j++) {
            const startX = i * cellWidth;
            const startY = j * cellHeight;

            ctx.beginPath();
            ctx.moveTo(...warp([startX, startY])); // Start at the warped starting point
            warpLine(ctx, startX, startY, startX + cellWidth, startY, warp); // Warp horizontally
            warpLine(ctx, startX + cellWidth, startY, startX + cellWidth, startY + cellHeight, warp); // Warp vertically
            ctx.stroke();
        }
    }
}

function frame(timestamp) {
    if (timestamp - lastRenderTime < FPS_INTERVAL) {
        requestAnimationFrame(frame);
        return;
    }
    lastRenderTime = timestamp;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#80282C';
    // ctx.strokeStyle = '#FFF';
    drawGrid(timestamp * options.noiseTInFactor);
    requestAnimationFrame(frame);
}

window.addEventListener('resize', setSize);

setSize();
frame();