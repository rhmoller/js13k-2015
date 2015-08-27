const WIDTH = 800;
const HEIGHT = 600;

let preloader = {
  paths: [],
  assets: {},
  loaded: 0,

  queue(path) {
    this.paths.push(path);
  },

  get(path) {
    return this.assets[path];
  },

  load(callback) {
    for (let i = 0; i < this.paths.length; i++) {
      let img = new Image();
      img.onload = () => {
        this.assets[this.paths[i]] = img;
        this.loaded++;
        if (this.loaded == this.paths.length) {
          callback.call(this);
        }
      }
      img.src = this.paths[i];
    }
  }
};

preloader.queue("giddy.png");
preloader.queue("giddy2.png");

let canvas = document.createElement("canvas");
canvas.width = WIDTH;
canvas.height = HEIGHT;

let ctx = canvas.getContext("2d");
ctx.fillStyle = "#000";
ctx.fillRect(0, 0, WIDTH, HEIGHT);

document.body.appendChild(canvas);

let bouncy = { x: 100, y: 100, w: 16, h: 16, dx: 2, dy: 3 };
let block = { x: 200, y: 200, w: 16, h: 16 };

let bullets = new Set();

let bulletTime = 0;

let keys = {
  up: false,
  down: false,
  left: false,
  right: false,
  fire: false
};

window.addEventListener("keydown", (e) => {
  switch (e.keyCode) {
    case 37: keys.left = true; break;
    case 38: keys.up = true; break;
    case 39: keys.right = true; break;
    case 40: keys.down = true; break;
    case 32: keys.fire = true; break;
  }
}, false);

window.addEventListener("keyup", (e) => {
  switch (e.keyCode) {
    case 37: keys.left = false; break;
    case 38: keys.up = false; break;
    case 39: keys.right = false; break;
    case 40: keys.down = false; break;
    case 32: keys.fire = false; break;
  }
}, false);

let lastTime = 0;

function update(timestamp) {
    requestAnimationFrame(update);
    let dt = timestamp - lastTime;

    if (keys.left) {
      block.x -= 4;
    }
    if (keys.up) {
      block.y -= 4;
    }
    if (keys.right) {
      block.x += 4;
    }
    if (keys.down) {
      block.y += 4;
    }

    if (keys.fire && (timestamp - bulletTime) > 100) {
      bullets.add({ x : WIDTH + 100 - 50 * Math.random(), y : block.y + 100 - 50 * Math.random(), vx: -6, vy: 0 });
      bullets.add({ x : WIDTH + 100 - 50 * Math.random(), y : block.y + 100 - 50 * Math.random(), vx: -6, vy: 0 });
      bullets.add({ x : WIDTH + 100 - 50 * Math.random(), y : block.y + 100 - 50 * Math.random(), vx: -6, vy: 0 });
      bulletTime = timestamp;
    }

    for (let bullet of bullets) {
      let b2px = block.x - bullet.x;
      let b2py = block.y - bullet.y;
      let d = Math.sqrt(b2px * b2px + b2py * b2py);
      let a = Math.atan2(b2py, b2px);
      let ax = Math.cos(a);
      let ay = Math.sin(a);

      bullet.vx += ax;
      bullet.vy += ay;

      let v = Math.sqrt(bullet.vx * bullet.vx + bullet.vy * bullet.vy);
      if (v > 6) {
        let a = Math.atan2(bullet.vy, bullet.vx);
        bullet.vx = 6 * Math.cos(a);
        bullet.vy = 6 * Math.sin(a);
      }

      bullet.x += bullet.vx;
      bullet.y += bullet.vy;

      if (bullet.x < 0 || bullet.y > HEIGHT + 100 || bullet.y < -100 || d < 12) {
        bullets.delete(bullet);
      }
    }

    document.title = `Bullets: ${bullets.size}`

    bouncy.x += bouncy.dx;
    bouncy.y += bouncy.dy;

    if (bouncy.y > HEIGHT - bouncy.h) bouncy.dy *= -1;
    if (bouncy.y < 0) bouncy.dy *= -1;
    if (bouncy.x > WIDTH - bouncy.w) bouncy.dx *= -1;
    if (bouncy.x < 0) bouncy.dx *= -1;

    ctx.fillStyle = "#888";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    ctx.fillStyle = "#fff";
    ctx.fillRect(bouncy.x, bouncy.y, bouncy.w, bouncy.h);

    ctx.fillStyle = "#000";
    ctx.fillRect(block.x, block.y, block.w, block.h);

    ctx.fillStyle = "#ff0";
    for (let bullet of bullets) {
      ctx.fillRect(bullet.x, bullet.y, 8, 8);
    }

    ctx.drawImage(preloader.get("giddy.png"), 0, 0);
    ctx.drawImage(preloader.get("giddy2.png"), 20, 0);

    lastTime = timestamp;
}

preloader.load(()=> {
  lastTime = Performance.now;
  requestAnimationFrame(update);
});
