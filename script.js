let gameOver = false;
const DOOM = [
    "0%",
    "1%",
    "3%",
    "7%",
    "15%",
    "30%",
    "50%",
    "75%",
    "90%",
    "99%",
    "99.999%",
    "100%"
];const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const Engine = Matter.Engine;
const doomText = document.getElementById("doom");
const World = Matter.World;
const Bodies = Matter.Bodies;
const Events = Matter.Events;

const engine = Engine.create();
const world = engine.world;

// =====================
// 이미지
// =====================

const imageFiles = [
    "1.jpg",
    "2.jpg",
    "3.jpg",
    "4.jpg",
    "5.jpg",
    "6.jpg",
    "7.gif",
    "8.jpg",
    "9.jpg",
    "10.jpg",
    "11.jpg"
];

const images = [];

for (const file of imageFiles) {

    const img = new Image();
    img.src = file;
    images.push(img);
}

// =====================
// 단계별 크기
// =====================

const SIZES = [
    12,
    15,
    18,
    22,
    27,
    33,
    40,
    50,
    65,
    85,
    110
];

// =====================
// 맵
// =====================

const floor = Bodies.rectangle(
    200,
    620,
    450,
    40,
    { isStatic: true }
);

const leftWall = Bodies.rectangle(
    -10,
    300,
    20,
    600,
    { isStatic: true }
);

const rightWall = Bodies.rectangle(
    410,
    300,
    20,
    600,
    { isStatic: true }
);

World.add(world, [
    floor,
    leftWall,
    rightWall
]);

// =====================
// 공
// =====================

const balls = [];

let nextX = 200;
let nextLevel = getRandomLevel();
function getRandomLevel() {

    const random = Math.random();

    if (random < 0.65) {
        return 1;
    }
    else if (random < 0.87) {
        return 2;
    }
    else if (random < 0.97) {
        return 3;
    }
    else {
        return 4;
    }
}
function spawnBall(x, level = 1, y = 50) {

    const radius = SIZES[level - 1];

    const ball = Bodies.circle(
        x,
        y,
        radius
    );

    ball.level = level;
    ball.radius = radius;
    ball.merged = false;

    balls.push(ball);

    World.add(world, ball);

    return ball;
}

function updateDoom() {

    let highestLevel = 1;

    for (const ball of balls) {

        if (ball.level > highestLevel) {
            highestLevel = ball.level;
        }
    }

    doomText.textContent =
        `세계 멸망도 : ${DOOM[highestLevel - 1]}`;
}

// =====================
// 입력
// =====================

canvas.addEventListener("pointermove", (event) => {

    const rect = canvas.getBoundingClientRect();

    nextX = event.clientX - rect.left;

    const radius = SIZES[0];

    if (nextX < radius)
        nextX = radius;

    if (nextX > canvas.width - radius)
        nextX = canvas.width - radius;
});

canvas.addEventListener("pointerdown", () => {
    if (gameOver) return;

    spawnBall(nextX, nextLevel);

    updateDoom();

    nextLevel = getRandomLevel();
});
// =====================
// 합체
// =====================

Events.on(engine, "collisionStart", (event) => {

    for (const pair of event.pairs) {

        const bodyA = pair.bodyA;
        const bodyB = pair.bodyB;

        if (
            bodyA.level &&
            bodyB.level &&
            bodyA.level === bodyB.level &&
            bodyA.level < 11
        ) {

            if (bodyA.merged || bodyB.merged)
                continue;

            bodyA.merged = true;
            bodyB.merged = true;

            const newLevel = bodyA.level + 1;
            if (newLevel >= 11) {

    gameOver = true;

    doomText.textContent =
        "세계 멸망도 : 100%";
}

            const x =
                (bodyA.position.x + bodyB.position.x) / 2;

            const y =
                (bodyA.position.y + bodyB.position.y) / 2;

            World.remove(world, bodyA);
            World.remove(world, bodyB);

            const indexA = balls.indexOf(bodyA);

            if (indexA !== -1)
                balls.splice(indexA, 1);

            const indexB = balls.indexOf(bodyB);

            if (indexB !== -1)
                balls.splice(indexB, 1);

            spawnBall(x, newLevel, y);

updateDoom();

break;
        }
    }
});

// =====================
// 그리기
// =====================

function drawBall(ball) {

    const x = ball.position.x;
    const y = ball.position.y;

    const img = images[ball.level - 1];

    ctx.save();

    ctx.beginPath();

    ctx.arc(
        x,
        y,
        ball.radius,
        0,
        Math.PI * 2
    );

    ctx.clip();

    ctx.drawImage(
        img,
        x - ball.radius,
        y - ball.radius,
        ball.radius * 2,
        ball.radius * 2
    );

    ctx.restore();
}

function draw() {

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    // 떨어진 공

    for (const ball of balls) {
        drawBall(ball);
    }

    // 대기 공

    const radius = SIZES[nextLevel - 1];
    ctx.save();

    ctx.beginPath();

    ctx.arc(
        nextX,
        30,
        radius,
        0,
        Math.PI * 2
    );

    ctx.clip();

   ctx.drawImage(
    images[nextLevel - 1],
        nextX - radius,
        30 - radius,
        radius * 2,
        radius * 2
    );

    ctx.restore();
    if (gameOver) {

    ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    ctx.fillStyle = "white";
    ctx.textAlign = "center";

    ctx.font = "bold 32px Arial";

    ctx.fillText(
        "☢ 세계가 멸망했습니다 ☢",
        canvas.width / 2,
        canvas.height / 2 - 30
    );

    ctx.font = "22px Arial";

    ctx.fillText(
        "세계 멸망도 : 100%",
        canvas.width / 2,
        canvas.height / 2 + 20
    );
}
}

// =====================
// 루프
// =====================

function gameLoop() {

    Engine.update(engine);

    draw();

    requestAnimationFrame(gameLoop);
}

gameLoop();
