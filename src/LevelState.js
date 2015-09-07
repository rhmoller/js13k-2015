import GameState from "./GameState"
import Body from "./Body"
import ShipGenerator from "./ShipGenerator"

const MAXV = 10;
const WIDTH = 1000;
const HEIGHT = 600;

export default class LevelState extends GameState {

  constructor(engine) {
    super(engine);

    let block = new Body(16, 16);
    block.setPosition(200, 200);
    block.setVelocity(0, 0);
    block.a = 0;
    this.block = block;

    this.bullets = new Set();
    this.bulletTime = 0;

    this.foes = new Set();
    this.foeBullets = new Set();
    this.foeTime = 0;
    this.foeSeq = 0;

    this.explosions = new Set();
    this.lastTime = 0;

    this.soundURL = jsfxr([0,,0.1578,,0.1923,0.4813,0.0763,-0.4521,,,,,,0.4145,-0.0485,,,,1,,,0.1648,,0.5]);
    this.soundPool = [];
    this.soundIdx = 0;

    this.explodeUrl = jsfxr([3,,0.3503,0.4872,0.2499,0.0754,,0.2127,,,,,,,,0.6977,,,1,,,,,0.5]);
    this.explodePool = [];
    this.explodeIdx = 0;

    this.explode2Url = jsfxr([3,,0.3569,0.3891,0.63,0.0483,,,,,,,,,,,0.5952,-0.1039,1,,,,,0.5]);
    this.explode2Pool = [];
    this.explode2Idx = 0;

    for (let i = 0; i < 10; i++) {
      var player = new Audio();
      player.src = this.soundURL;
      this.soundPool.push(player);

      var player2 = new Audio();
      player2.src = this.explodeUrl;
      this.explodePool.push(player2);

      var player3 = new Audio();
      player3.src = this.explode2Url;
      this.explode2Pool.push(player3);
    }

    let generator = new ShipGenerator();

    let subCanvas = document.createElement("canvas");
    subCanvas.width = 40;
    subCanvas.height = 40;
    let subCtx = subCanvas.getContext("2d");
    // subCtx.fillStyle = "#000";
    // subCtx.fillRect(0, 0, 40, 40);
    subCtx.translate(20, 20);
    subCtx.rotate(-0.5 * Math.PI);
    subCtx.scale(0.2, 0.2);
    generator.paintShip(subCtx);
    this.subCanvas = subCanvas;

    let foeSprites = [];
    for (let i = 0; i < 50; i++) {
      let sub2Canvas = document.createElement("canvas");
      sub2Canvas.width = 40;
      sub2Canvas.height = 40;
      let sub2Ctx = sub2Canvas.getContext("2d");
      // subCtx.fillStyle = "#000";
      // subCtx.fillRect(0, 0, 40, 40);
      sub2Ctx.translate(20, 20);
      sub2Ctx.rotate(-0.5 * Math.PI);
      sub2Ctx.scale(0.2, 0.2);
      generator.paintShip(sub2Ctx);
      foeSprites.push(sub2Canvas);
    }
    this.foeSprites = foeSprites;
    this.init();
  }

  init() {
    this.score = 0;
    this.lives = 3;
  }

  update(timestamp) {
    let dt = timestamp - this.lastTime;
    let ctx = this.engine.ctx;

    let block = this.block;
    let gamePad = this.engine.gamepad;

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

    let targetA = Math.atan2(block.vy, 12);
    let da = targetA - block.a;
    block.a += 0.2 * da;
    block.update();

    if (timestamp - this.foeTime > 500) {
      let foe = { x: -50, y: Math.sin(timestamp * 0.0001) * HEIGHT * 0.5 + 0.5 * HEIGHT, vx: 2, vy: 0, seq: this.foeSeq++ };
      foe.lastX = foe.x - foe.vx;
      foe.lastY = foe.y - foe.vy;
      this.foes.add(foe);
      this.foeTime = timestamp;
    }

    if (gamePad.fire && (timestamp - this.bulletTime) > 150) {
      this.bullets.add({ x : WIDTH, y : block.y, vx: -6, vy: 0 });
      this.bulletTime = timestamp;
      this.soundIdx = (this.soundIdx + 1) % 10;
      let sound = this.soundPool[this.soundIdx];
      sound.play();
    }

    for (let foe of this.foes) {
      foe.x += foe.vx * 1.5;
      foe.y = Math.sin(-0.6 * foe.seq + timestamp * 0.001) * HEIGHT * 0.4 + 0.5 * HEIGHT;
      // foe.y = Math.sin(-0.6 * foe.seq + timestamp * 0.002) * 40 + 50;
      //if (foe.seq % 2 == 0) foe.y = HEIGHT - foe.y;
      foe.a = Math.atan2(foe.y - foe.lastY, foe.x - foe.lastX);
      foe.lastX = foe.x;
      foe.lastY = foe.y;
      if (foe.x > 0.01 * WIDTH && Math.random() < 0.01) {
        this.foeBullets.add({ x: 0, y: foe.y, vx: 4, vy: 0, owner: foe});
      }

      let b2px = block.x - foe.x;
      let b2py = block.y - foe.y;
      let d = Math.sqrt(b2px * b2px + b2py * b2py);

      if (foe.x > WIDTH + 32) {
        this.foes.delete(foe);
      } else if (d < 32) {
        this.foes.delete(foe);
        this.explosions.add({ x: foe.x, y: block.y, energy: 10, vx: Math.random() - 0.5, vy: Math.random() - 0.5 })
        this.explosions.add({ x: foe.x, y: block.y, energy: 10, vx: Math.random() - 0.5, vy: Math.random() - 0.5 })
        this.explosions.add({ x: foe.x, y: block.y, energy: 10, vx: Math.random() - 0.5, vy: Math.random() - 0.5 })

        this.lives--;
        block.y = HEIGHT * 0.5;
        block.x = 100;

        this.explode2Idx = (this.explode2Idx + 1) % 10;
        this.explode2Pool[this.explode2Idx].play();

        this.explodeIdx = (this.explodeIdx + 1) % 10;
        this.explodePool[this.explodeIdx].play();
      }


    }

    for (let bullet of this.bullets) {
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
        this.bullets.delete(bullet);
      }
    }

    for (let bullet of this.foeBullets) {
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
        this.foeBullets.delete(bullet);
      }

      let bx = block.x - bullet.x;
      let by = block.y - bullet.y;
      let d2 = Math.sqrt(bx * bx + by * by);
      if (d2 < 20) {
        this.foeBullets.delete(bullet);
        this.explosions.add({ x: block.x, y: block.y, energy: 10 })
        block.y = HEIGHT * 0.5;
        block.x = 100;

        this.lives--;

        this.explode2Idx = (this.explode2Idx + 1) % 10;
        this.explode2Pool[this.explode2Idx].play();
      }
    }

    for (let bullet of this.bullets) {
      for (let foe of this.foes) {
        let b2px = foe.x - bullet.x;
        let b2py = foe.y - bullet.y;
        let d = Math.sqrt(b2px * b2px + b2py * b2py);
        if (d < 20) {
          this.explosions.add({ x: foe.x, y: block.y, energy: 10, vx: Math.random() - 0.5, vy: Math.random() - 0.5 })
          this.explosions.add({ x: foe.x, y: block.y, energy: 10, vx: Math.random() - 0.5, vy: Math.random() - 0.5 })
          this.explosions.add({ x: foe.x, y: block.y, energy: 10, vx: Math.random() - 0.5, vy: Math.random() - 0.5 })

          this.foes.delete(foe);
          this.bullets.delete(bullet);

          this.score += 100;

          this.explodeIdx = (this.explodeIdx + 1) % 10;
          this.explodePool[this.explodeIdx].play();
        }
      }
    }

    for (let e of this.explosions) {
      e.energy -= 0.2;
      if (e.energy < 0 ) {
        this.explosions.delete(e);
      }
    }

    if (this.lives == 0) {
      this.engine.setState("gameOverState");
    }

    document.title = `Bullets: ${this.bullets.size}`
    // ctx.shadowColor = "#000";
    // ctx.shadowOffsetX = 10;
    // ctx.shadowOffsetY = 10;
    // ctx.shadowBlur = 5;

    ctx.fillStyle = "#001";
    ctx.strokeStyle = "#012";
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

    ctx.save();
    ctx.translate(block.x, block.y);
    ctx.rotate(block.a);
    ctx.drawImage(this.subCanvas, -20, -20);
    ctx.restore();


    // ctx.fillStyle = "#888";
    // ctx.lineWidth = 2;
    // ctx.strokeStyle = "#fff";
    // // ctx.fillRect(block.x, block.y, block.w, block.h);
    // ctx.beginPath();
    // ctx.moveTo(block.x - 10, block.y - 10);
    // ctx.lineTo(block.x + 10, block.y);
    // ctx.lineTo(block.x - 10, block.y + 10);
    // ctx.closePath();
    // ctx.fill();
    // ctx.stroke();

    ctx.fillStyle = "#0ff";
    for (let bullet of this.bullets) {
      ctx.fillRect(bullet.x - 6, bullet.y - 2, 12, 4);
    }

    ctx.fillStyle = "#f0f";
    for (let bullet of this.foeBullets) {
      ctx.fillRect(bullet.x - 6, bullet.y - 2, 12, 4);
    }

    ctx.fillStyle = "#00f";
    ctx.strokeStyle = "#0ff";
    for (let foe of this.foes) {
      // ctx.fillRect(foe.x - 25, foe.y - 25, 50, 50);
      // ctx.beginPath();
      // ctx.arc(foe.x, foe.y, 25, 0, 2 * Math.PI, false);
      // ctx.fill();
      // ctx.stroke();

      ctx.save();
      ctx.translate(foe.x, foe.y);
      ctx.rotate(foe.a);
      ctx.drawImage(this.foeSprites[foe.seq % 50], -20, -20);
      // ctx.drawImage(sub2Canvas, foe.x - 25, foe.y - 25);
      ctx.restore();
    }

    ctx.globalCompositeOperation = "lighter";
    ctx.lineWidth = 1;
    for (let e of this.explosions) {
      let sz = 100 - (100 * e.energy * e.energy * 0.01);
      let a = 1 - sz / 100;
      let r = 255;
      let g = (255 - 200 * (1-a))|0;
      let b = 0;
      let c = `rgba(${r}, ${g}, ${b}, ${a})`;
      ctx.strokeStyle = `rgba(255, 0, 0, ${a})`;
      ctx.fillStyle = c;

      if (e.vx) {
        e.x += e.vx;
        e.y += e.vy;
      }

      ctx.beginPath();
      ctx.arc(e.x, e.y, 0.5 * sz, 0, 2 * Math.PI, false);
      ctx.fill();
      ctx.stroke();
    }
    ctx.globalCompositeOperation = "source-over";

    ctx.fillStyle = "#fff";
    ctx.font = "20px sans-serif";
    let livesText = `${this.lives} lives`;
    ctx.fillText(livesText, WIDTH - (20 + ctx.measureText(livesText).width), 20);
    ctx.fillText(`Score: ${this.score}`, 20, 20);

    this.lastTime = timestamp;
  }
}
