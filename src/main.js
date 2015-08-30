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
let block = { x: 200, y: 200, w: 16, h: 16, dx: 0, dy: 0 };

let bullets = new Set();
let bulletTime = 0;

let foes = new Set();
let foeBullets = new Set();
let foeTime = 0;
let foeSeq = 0;

let MAXV = 10;

let explosions = new Set();

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
      block.dx = -4;
    } else if (keys.right) {
      block.dx = 4;
    } else {
      block.dx = 0;
    }

    if (keys.up) {
      block.dy = -4;
    } else if (keys.down) {
      block.dy = 4;
    } else {
      block.dy = 0;
    }

    block.x += block.dx;
    block.y += block.dy;

    if (timestamp - foeTime > 1500) {
      let foe = { x: -50, y: Math.sin(timestamp * 0.01) * HEIGHT * 0.5 + 0.5 * HEIGHT, vx: 2, vy: 0, seq: foeSeq++ };
      foes.add(foe);
      foeTime = timestamp;
    }

    if (keys.fire && (timestamp - bulletTime) > 200) {
      bullets.add({ x : WIDTH, y : block.y, vx: -6, vy: 0 });
      bulletTime = timestamp;
    }

    for (let foe of foes) {
      foe.x += foe.vx;
      foe.y = Math.sin(-0.6 * foe.seq + timestamp * 0.001) * HEIGHT * 0.5 + 0.5 * HEIGHT;
      if (foe.x > 0.01 * WIDTH && Math.random() < 0.01) {
        foeBullets.add({ x: 0, y: foe.y, vx: 4, vy: 0, owner: foe});
      }

      if (foe.x > WIDTH) {
        foes.delete(foe);
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

      // let v = Math.sqrt(bullet.vx * bullet.vx + bullet.vy * bullet.vy);
      // if (v > MAXV) {
      //   let a = Math.atan2(bullet.vy, bullet.vx);
      //   bullet.vx = MAXV * Math.cos(a);
      //   bullet.vy = MAXV * Math.sin(a);
      // }

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

      // let v = Math.sqrt(bullet.vx * bullet.vx + bullet.vy * bullet.vy);
      // if (v > 0.5 * MAXV) {
      //   let a = Math.atan2(bullet.vy, bullet.vx);
      //   bullet.vx = 0.5 * MAXV * Math.cos(a);
      //   bullet.vy = 0.5 * MAXV * Math.sin(a);
      // }

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

    bouncy.x += bouncy.dx;
    bouncy.y += bouncy.dy;

    if (bouncy.y > HEIGHT) bouncy.dy *= -1;
    if (bouncy.y < 0) bouncy.dy *= -1;
    if (bouncy.x > WIDTH) bouncy.dx *= -1;
    if (bouncy.x < 0) bouncy.dx *= -1;

    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    ctx.fillStyle = "#f00";
    ctx.fillRect(bouncy.x - 0.5 * bouncy.w, bouncy.y - 0.5 * bouncy.h, bouncy.w, bouncy.h);

    ctx.fillStyle = "#ccc";
    // ctx.fillRect(block.x, block.y, block.w, block.h);
    ctx.beginPath();
    ctx.moveTo(block.x - 10, block.y - 10);
    ctx.lineTo(block.x + 10, block.y);
    ctx.lineTo(block.x - 10, block.y + 10);
    ctx.fill();

    ctx.fillStyle = "#0ff";
    for (let bullet of bullets) {
      ctx.fillRect(bullet.x - 6, bullet.y - 2, 12, 4);
    }

    ctx.fillStyle = "#f0f";
    for (let bullet of foeBullets) {
      ctx.fillRect(bullet.x - 6, bullet.y - 2, 12, 4);
    }

    ctx.fillStyle = "#00f";
    for (let foe of foes) {
      // ctx.fillRect(foe.x - 25, foe.y - 25, 50, 50);
      ctx.beginPath();
      ctx.arc(foe.x, foe.y, 25, 0, 2 * Math.PI, false);
      ctx.fill();
    }

    for (let e of explosions) {
      let r = (e.energy) * 5;
      let c = `rgba(255, 255, 0, ${r / 50})`;
      ctx.fillStyle = c;
      let sz = 2 * (50 - r);

      if (e.vx) {
        e.x += e.vx;
        e.y += e.vy;
      }

      ctx.beginPath();
      ctx.arc(e.x, e.y, 0.5 * sz, 0, 2 * Math.PI, false);
      ctx.fill();
    }

    ctx.drawImage(preloader.get("giddy.png"), 0, 0);
    ctx.drawImage(preloader.get("giddy2.png"), 20, 0);

    lastTime = timestamp;
}

preloader.load(()=> {
  lastTime = Performance.now;
  requestAnimationFrame(update);
});
