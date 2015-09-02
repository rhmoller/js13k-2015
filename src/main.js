import Preloader from "./Preloader.js"
import GamePad from "./GamePad.js"
import Body from "./Body.js"

const WIDTH = 1000;
const HEIGHT = 600;

let preloader = new Preloader();
preloader.queue("giddy.png");
preloader.queue("giddy2.png");

let canvas = document.createElement("canvas");
canvas.width = WIDTH;
canvas.height = HEIGHT;

let ctx = canvas.getContext("2d");
ctx.fillStyle = "#000";
ctx.fillRect(0, 0, WIDTH, HEIGHT);

document.body.appendChild(canvas);
document.body.style.backgroundColor = "#000";
document.body.style.align = "center";
canvas.style.marginLeft = "auto";
canvas.style.marginRight = "auto";
canvas.style.display = "block";

let block = new Body(16, 16);
block.setPosition(200, 200);
block.setVelocity(0, 0);

let bullets = new Set();
let bulletTime = 0;

let foes = new Set();
let foeBullets = new Set();
let foeTime = 0;
let foeSeq = 0;

let MAXV = 10;

let explosions = new Set();

let gamePad = new GamePad();

let lastTime = 0;

function update(timestamp) {
    requestAnimationFrame(update);
    let dt = timestamp - lastTime;

    if (gamePad.left) {
      block.vx = -4;
    } else if (gamePad.right) {
      block.vx = 4;
    } else {
      block.vx = 0;
    }

    if (gamePad.up) {
      block.vy = -4;
    } else if (gamePad.down) {
      block.vy = 4;
    } else {
      block.vy = 0;
    }

    block.update();

    if (timestamp - foeTime > 1500) {
      let foe = { x: -50, y: Math.sin(timestamp * 0.01) * HEIGHT * 0.5 + 0.5 * HEIGHT, vx: 2, vy: 0, seq: foeSeq++ };
      foes.add(foe);
      foeTime = timestamp;
    }

    if (gamePad.fire && (timestamp - bulletTime) > 200) {
      bullets.add({ x : WIDTH, y : block.y, vx: -6, vy: 0 });
      bulletTime = timestamp;
    }

    for (let foe of foes) {
      foe.x += foe.vx;
      foe.y = Math.sin(-0.6 * foe.seq + timestamp * 0.001) * HEIGHT * 0.5 + 0.5 * HEIGHT;
      if (foe.x > 0.01 * WIDTH && Math.random() < 0.01) {
        foeBullets.add({ x: 0, y: foe.y, vx: 4, vy: 0, owner: foe});
      }

      let b2px = block.x - foe.x;
      let b2py = block.y - foe.y;
      let d = Math.sqrt(b2px * b2px + b2py * b2py);

      if (foe.x > WIDTH + 32) {
        foes.delete(foe);
      } else if (d < 32) {
        foes.delete(foe);
        explosions.add({ x: foe.x, y: block.y, energy: 10, vx: Math.random() - 0.5, vy: Math.random() - 0.5 })
        explosions.add({ x: foe.x, y: block.y, energy: 10, vx: Math.random() - 0.5, vy: Math.random() - 0.5 })
        explosions.add({ x: foe.x, y: block.y, energy: 10, vx: Math.random() - 0.5, vy: Math.random() - 0.5 })
        block.y = HEIGHT * 0.5;
        block.x = 100;
      }


     }

    for (let bullet of bullets) {
      let b2px = block.x - bullet.x;
      let b2py = block.y - bullet.y;
      let d = Math.sqrt(b2px * b2px + b2py * b2py);
      let a = Math.atan2(b2py, b2px);
      let ax = Math.cos(a);
      let ay = Math.sin(a);

      bullet.vx = ax * 8;
      bullet.vy = ay * 8;

      bullet.x += bullet.vx;
      bullet.y += bullet.vy;

      if (bullet.x < block.x - 70 || bullet.x < 0 || bullet.y > HEIGHT + 100 || bullet.y < -100 || d < 20) {
        bullets.delete(bullet);
      }
    }

    for (let bullet of foeBullets) {
      let b2px = bullet.owner.x - bullet.x;
      let b2py = bullet.owner.y - bullet.y;
      let d = Math.sqrt(b2px * b2px + b2py * b2py);
      let a = Math.atan2(b2py, b2px);
      let ax = Math.cos(a);
      let ay = Math.sin(a);

      bullet.vx = ax * 8;
      bullet.vy = ay * 8;

      bullet.x += bullet.vx;
      bullet.y += bullet.vy;

      if (d < 20 || bullet.x > WIDTH) {
        foeBullets.delete(bullet);
      }

      let bx = block.x - bullet.x;
      let by = block.y - bullet.y;
      let d2 = Math.sqrt(bx * bx + by * by);
      if (d2 < 20) {
        explosions.add({ x: block.x, y: block.y, energy: 10 })
        foeBullets.delete(bullet);
      }
    }

    for (let bullet of bullets) {
      for (let foe of foes) {
        let b2px = foe.x - bullet.x;
        let b2py = foe.y - bullet.y;
        let d = Math.sqrt(b2px * b2px + b2py * b2py);
        if (d < 20) {
            explosions.add({ x: foe.x, y: block.y, energy: 10, vx: Math.random() - 0.5, vy: Math.random() - 0.5 })
            explosions.add({ x: foe.x, y: block.y, energy: 10, vx: Math.random() - 0.5, vy: Math.random() - 0.5 })
            explosions.add({ x: foe.x, y: block.y, energy: 10, vx: Math.random() - 0.5, vy: Math.random() - 0.5 })

            foes.delete(foe);
            bullets.delete(bullet);
        }
      }
    }

    for (let e of explosions) {
      e.energy -= 0.2;
      if (e.energy < 0 ) {
        explosions.delete(e);
      }
    }

    document.title = `Bullets: ${bullets.size}`

    ctx.fillStyle = "#001800";
    ctx.strokeStyle = "#020";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    let levelx = timestamp * 0.2;
    for (let x = 0; x < WIDTH; x+= 50) {
      ctx.beginPath();
      ctx.moveTo(WIDTH - (x + levelx) % WIDTH, 0);
      ctx.lineTo(WIDTH - (x + levelx) % WIDTH, HEIGHT);
      ctx.stroke();
    }
    for (let y = 0; y < HEIGHT; y+= 50) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(WIDTH, y);
      ctx.stroke();
    }

    ctx.fillStyle = "#888";
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#fff";
    // ctx.fillRect(block.x, block.y, block.w, block.h);
    ctx.beginPath();
    ctx.moveTo(block.x - 10, block.y - 10);
    ctx.lineTo(block.x + 10, block.y);
    ctx.lineTo(block.x - 10, block.y + 10);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#0ff";
    for (let bullet of bullets) {
      ctx.fillRect(bullet.x - 6, bullet.y - 2, 12, 4);
    }

    ctx.fillStyle = "#f0f";
    for (let bullet of foeBullets) {
      ctx.fillRect(bullet.x - 6, bullet.y - 2, 12, 4);
    }

    ctx.fillStyle = "#00f";
    ctx.strokeStyle = "#0ff";
    for (let foe of foes) {
      // ctx.fillRect(foe.x - 25, foe.y - 25, 50, 50);
      ctx.beginPath();
      ctx.arc(foe.x, foe.y, 25, 0, 2 * Math.PI, false);
      ctx.fill();
      ctx.stroke();
    }

    for (let e of explosions) {
      let r = e.energy * 5;
      let sz = 100 - (100 * e.energy * e.energy * 0.01);
      let c = `rgba(255, 255, 0, ${1 - sz / 100})`;
      ctx.fillStyle = c;
      ctx.strokeStyle = `rgba(255, 255, 0, ${1 - sz / 100})`;

      if (e.vx) {
        e.x += e.vx;
        e.y += e.vy;
      }

      ctx.beginPath();
      ctx.arc(e.x, e.y, 0.5 * sz, 0, 2 * Math.PI, false);
      ctx.fill();
      ctx.stroke();
    }

    ctx.drawImage(preloader.get("giddy.png"), 0, 0);
    ctx.drawImage(preloader.get("giddy2.png"), 20, 0);

    lastTime = timestamp;
}

preloader.load(()=> {
  lastTime = Performance.now;
  requestAnimationFrame(update);
});
