document.getElementById("app").innerHTML = `
<h1>krater.se</h1>
<div>
  phone: 0704-890413 mail: info@krater.se
</div>
`;

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
let particles = [];
//const numParticles = 10
const emitRate = 10;
const emitBurstNum = 10;
const continous = 0;
let counter = 0;

function getRandomColor() {
  let r = 2;
  let g = 4;
  let b = 5;
  while (r < 100 && g < 100 && b < 100) {
    r = Math.floor(Math.random() * 256);
    g = Math.floor(Math.random() * 256);
    b = Math.floor(Math.random() * 256);
  }

  return `(rgb('${r},${g},${b}')`;
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}

window.addEventListener("click", clickBurst);
window.addEventListener("touchstart", clickBurst);

function clickBurst(e) {
  const x = e.clientX || e.touches[0].clientX;
  const y = e.clientY || e.touches[0].clientY;
  //spawnNew({x, y}, numParticles);
  //console.log(x);
  burst(30, { x, y, grow: 1, damping: 0.97, shape: "dot" });
}

function burst(numParticles, obj) {
  particles.push([...Array(numParticles)].map(part => particle(this, obj)));
  // console.log(particles);
}

function startEmitter() {
  loop();
}

const particle = (context, obj) => {
  console.log(context);
  const defaults = {
    x: canvas.width / 2, // canvas.width * Math.random();
    y: canvas.height / 2, //canvas.height * Math.random();
    vx: 4 * Math.random() - 2,
    vy: 4 * Math.random() - 2,
    color: getRandomColor(),
    age: 0,
    maxAge: getRandomInt(10, 100),
    bounce: false,
    gravity: 0,
    emitRate: 300,
    damping: 1.972,
    radius: 2,
    grow: 1.015
  };

  const data = Object.assign(defaults, obj);

  const checkBounce = (posX, posY) => {
    posX < 0 || posX > canvas.width ? (data.vx = -data.vx) : data.vx;
    posY < 0 || posY > canvas.height ? (data.vy = -data.vy) : data.vy;
  };

  function draw(c = context, shape = "dot") {
    if (shape === "dot") {
      c.fillStyle = data.color;
      c.fillRect(data.x, data.y, 4, 4);
    }
    if (shape === "ball") {
      c.beginPath();
      c.arc(data.x, data.y, data.radius, 0, 2 * Math.PI, false);
      c.fill();
      c.fillStyle = "rgba(255,255,255,0.5)"; //white
      c.lineWidth = 0;
      //c.filter = 'blur(1px)';
      //ctx.strokeStyle = color;
      //ctx.stroke();
    }
  }

  function update() {
    data.vy += data.gravity;
    data.vx *= data.damping;
    data.vy *= data.damping;
    data.x += data.vx;
    data.y += data.vy;
    data.radius *= data.grow;
    // if true bounce on edges
    data.bounce ? checkBounce(data.x, data.y) : null;
  }

  const die = () => data.age++ > data.maxAge;

  return {
    //reset counter
    counter: 0,
    // draw the particle
    draw,
    //update the particle
    update,
    // if old enough set die to true
    die
  };
};

function loop() {
  if (continous) {
    if (counter++ > emitRate) {
      burst(getRandomInt(emitBurstNum, 500), {
        x: canvas.width * Math.random(),
        y: canvas.height * Math.random(),
        bounce: true,
        gravity: 0.03,
        damping: 0.99
      });
      counter = 0;
    }
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.map(emitter => {
    emitter
      .filter(part => !part.dead)
      .forEach(part => {
        part.update();
        part.draw(ctx, "ball");
        if (part.die()) {
          part.dead = true;
        }
      });
  });

  requestAnimationFrame(loop);
}

//initialize particles
startEmitter();
