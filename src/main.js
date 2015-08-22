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

function update() {
    requestAnimationFrame(update);

    if (keys.left) {
      block.x -= 2;
    }
    if (keys.up) {
      block.y -= 2;
    }
    if (keys.right) {
      block.x += 2;
    }
    if (keys.down) {
      block.y += 2;
    }

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

    ctx.drawImage(preloader.get("giddy.png"), 0, 0);
    ctx.drawImage(preloader.get("giddy2.png"), 20, 0);
}

preloader.load(()=> {
  requestAnimationFrame(update);
});
