import GameState from "./GameState"
import Body from "./Body"
import ShipGenerator from "./ShipGenerator"
import FoeFactory from "./FoeFactory"
import Scratch from "./Scratch"

const MAXV = 10;

const POWERUP_BULLET_DELAY = 10000;
const POWERUP_SHIELD_DELAY = 15000;
const POWERUP_LIFE_DELAY = 20000;

export default class LevelState extends GameState {

  constructor(engine) {
    super(engine);

    let block = new Body(16, 16);
    block.x = 0.5 * this.engine.width;
    block.y = 0.5 * this.engine.height;
    block.setVelocity(0, 0);
    block.a = 0;
    this.block = block;
    this.block.shield = 1;

    this.bullets = new Set();
    this.bulletTime = 0;

    this.foes = new Set();
    this.foeBullets = new Set();
    this.foeTime = 0;
    this.foeSeq = 0;

    this.explosions = new Set();
    this.lastTime = 0;


    // this.soundURL = jsfxr([0,,0.1578,,0.1923,0.4813,0.0763,-0.4521,,,,,,0.4145,-0.0485,,,,1,,,0.1648,,0.5]);
    this.soundURL = jsfxr([0,,0.1142,,0.206,0.7893,0.2,-0.3076,,,,,,0.197,0.1255,,0.1282,-0.0075,1,,,,,0.5]);
    this.soundPool = [];
    this.soundIdx = 0;

    this.explodeUrl = jsfxr([3,,0.3503,0.4872,0.2499,0.0754,,0.2127,,,,,,,,0.6977,,,1,,,,,0.5]);
    this.explodePool = [];
    this.explodeIdx = 0;

    this.explode2Url = jsfxr([3,,0.3569,0.3891,0.63,0.0483,,,,,,,,,,,0.5952,-0.1039,1,,,,,0.5]);
    this.explode2Pool = [];
    this.explode2Idx = 0;

    this.powerUpUrl = jsfxr([0,,0.1414,,0.497,0.3508,,0.4704,,,,,,0.1086,,0.4007,,,1,,,,,0.5]);
    this.powerUpSndPool = [];
    this.powerUpSndIdx = 0;

    this.nextShieldPowerUp = 0;
    this.nextBulletPowerUp = 0;
    this.nextLifePowerUp = 0;
    this.firePower = 1;
    this.flash = 0;

    this.sector = 1;
    this.sectorAnnounce = 1;

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

      var player4 = new Audio();
      player4.src = this.powerUpUrl;
      this.powerUpSndPool.push(player4);
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
    this.foeFactory = new FoeFactory(this);
    this.init();

    this.shieldPowerUp = null;
    this.bulletPowerUp = null;
    this.lifePowerUp = null;
  }

  init() {
    this.score = 0;
    this.lives = 3;
    this.foes.clear();
    this.foeBullets.clear();
    this.bullets.clear();
    this.explosions.clear();
    this.block.shield = 1;
    this.block.x = 0.5 * this.engine.width;
    this.block.y = 0.5 * this.engine.height;
    this.scratch = new Scratch();
    this.foeFactory.hardness = 1;

    this.nextShieldPowerUp = this.engine.timestamp + POWERUP_SHIELD_DELAY;
    this.nextBulletPowerUp = this.engine.timestamp + POWERUP_BULLET_DELAY;
    this.nextLifePowerUp = this.engine.timestamp + POWERUP_LIFE_DELAY;
    this.firePower = 3;
    this.flash = 0;

    this.sector = 1;
    this.sectorAnnounce = 1;
  }

  update(timestamp) {
    let dt = timestamp - this.lastTime;
    let ctx = this.engine.ctx;

    let block = this.block;
    let gamePad = this.engine.gamepad;

    if (gamePad.esc) {
      this.engine.setState("titleState");
    }

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

    if (block.y < 20) {
      block.y = 20;
    } else if (block.y > this.engine.height - 20) {
      block.y = this.engine.height - 20;
    }

    if (block.x < 20) {
      block.x = 20;
    } else if (block.x > this.engine.width - 20) {
      block.x = this.engine.width - 20;
    }

    this.foeFactory.spawnTo(this.foes, timestamp);

    if (gamePad.fire && (timestamp - this.bulletTime) > 150) {
      switch (this.firePower) {
        case 1:
          this.bullets.add({ x : this.engine.width, y : block.y, vx: -6, vy: 0 });
        break;
        case 2:
          this.bullets.add({ x : this.engine.width, y : block.y - 10, vx: -6, vy: 0 });
          this.bullets.add({ x : this.engine.width, y : block.y + 10, vx: -6, vy: 0 });
        break;
        case 3:
          this.bullets.add({ x : this.engine.width, y : block.y + 20, vx: -6, vy: 0 });
          this.bullets.add({ x : this.engine.width + 5, y : block.y, vx: -6, vy: 0 });
          this.bullets.add({ x : this.engine.width, y : block.y - 20, vx: -6, vy: 0 });
        break;
        case 4:
          this.bullets.add({ x : this.engine.width, y : block.y - 10, vx: -6, vy: 0 });
          this.bullets.add({ x : this.engine.width + 5, y : block.y + 10, vx: -6, vy: 0 });
          this.bullets.add({ x : this.engine.width + 5, y : block.y - 30, vx: -6, vy: 0 });
          this.bullets.add({ x : this.engine.width, y : block.y + 30, vx: -6, vy: 0 });
        break;
        case 5:
        this.bullets.add({ x : this.engine.width, y : block.y + 40, vx: -6, vy: 0 });
          this.bullets.add({ x : this.engine.width + 5, y : block.y + 20, vx: -6, vy: 0 });
          this.bullets.add({ x : this.engine.width + 10, y : block.y, vx: -6, vy: 0 });
          this.bullets.add({ x : this.engine.width + 5, y : block.y - 20, vx: -6, vy: 0 });
          this.bullets.add({ x : this.engine.width, y : block.y - 40, vx: -6, vy: 0 });
        break;
      }
      this.bulletTime = timestamp;
      this.soundIdx = (this.soundIdx + 1) % 10;
      let sound = this.soundPool[this.soundIdx];
      sound.play();
    }

    if (this.shieldPowerUp == null && this.nextShieldPowerUp < timestamp) {
      this.shieldPowerUp = {
        x: this.engine.width + 10,
        y: Math.cos(timestamp * 0.0001) * this.engine.height * 0.4 + 0.5 * this.engine.height
      };
    }

    if (this.shieldPowerUp) {
      this.shieldPowerUp.x -= 1;
      this.shieldPowerUp.y = Math.cos(timestamp * 0.0001) * this.engine.height * 0.4 + 0.5 * this.engine.height

      let dx = this.shieldPowerUp.x - block.x;
      let dy = this.shieldPowerUp.y - block.y;
      let d = Math.sqrt(dx * dx + dy * dy);
      if (d < 30) {
        this.shieldPowerUp = null;
        this.nextShieldPowerUp = timestamp + POWERUP_SHIELD_DELAY;
        this.block.shield = 1;
        this.powerUpSndIdx = (this.powerUpSndIdx + 1) % 10;
        let sound = this.powerUpSndPool[this.powerUpSndIdx];
        sound.play();
      }
      if (this.shieldPowerUp.x < 0) {
        this.shieldPowerUp = null;
        this.nextShieldPowerUp = timestamp + POWERUP_SHIELD_DELAY;
      }
    }

    if (this.bulletPowerUp == null && this.nextBulletPowerUp < timestamp && this.firePower < 5) {
      this.bulletPowerUp = {
        x: this.engine.width + 10,
        y: Math.cos(timestamp * 0.0001) * this.engine.height * 0.4 + 0.5 * this.engine.height
      };
    }

    if (this.bulletPowerUp) {
      this.bulletPowerUp.x -= 1;
      this.bulletPowerUp.y = Math.cos(timestamp * 0.0002) * this.engine.height * 0.4 + 0.5 * this.engine.height

      let dx = this.bulletPowerUp.x - block.x;
      let dy = this.bulletPowerUp.y - block.y;
      let d = Math.sqrt(dx * dx + dy * dy);
      if (d < 30) {
        this.bulletPowerUp = null;
        this.nextBulletPowerUp = timestamp + POWERUP_BULLET_DELAY;
        this.firePower++;
        this.powerUpSndIdx = (this.powerUpSndIdx + 1) % 10;
        let sound = this.powerUpSndPool[this.powerUpSndIdx];
        sound.play();
      }
      if (this.bulletPowerUp.x < 0) {
        this.bulletPowerUp = null;
        this.nextBulletPowerUp = timestamp + POWERUP_BULLET_DELAY;
      }
    }

    if (this.lifePowerUp == null && this.nextLifePowerUp < timestamp) {
      this.lifePowerUp = {
        x: this.engine.width + 10,
        y: Math.cos(timestamp * 0.0001) * this.engine.height * 0.4 + 0.5 * this.engine.height
      };
    }

    if (this.lifePowerUp) {
      this.lifePowerUp.x -= 1;
      this.lifePowerUp.y = Math.cos(timestamp * 0.0003) * this.engine.height * 0.4 + 0.5 * this.engine.height

      let dx = this.lifePowerUp.x - block.x;
      let dy = this.lifePowerUp.y - block.y;
      let d = Math.sqrt(dx * dx + dy * dy);
      if (d < 30) {
        this.lifePowerUp = null;
        this.nextLifePowerUp = timestamp + POWERUP_LIFE_DELAY;
        this.lives++;
        this.powerUpSndIdx = (this.powerUpSndIdx + 1) % 10;
        let sound = this.powerUpSndPool[this.powerUpSndIdx];
        sound.play();
      }
      if (this.lifePowerUp.x < 0) {
        this.lifePowerUp = null;
        this.nextLifePowerUp = timestamp + POWERUP_LIFE_DELAY;
      }
    }



    this.foes.forEach(foe => {
      foe.update(timestamp);
      if (foe.x > 0.01 * this.engine.width && Math.random() < 0.005) {
        this.foeBullets.add({ x: 0, y: foe.y, vx: 4, vy: 0, owner: foe});
      }

      let b2px = block.x - foe.x;
      let b2py = block.y - foe.y;
      let d = Math.sqrt(b2px * b2px + b2py * b2py);

      if (foe.x > this.engine.width + 32) {
        this.foes.delete(foe);
      } else if (d < 32 && block.shield <= 0) {
        this.foes.delete(foe);
        for (let i = 0; i < 5; i++) {
          this.explosions.add({ x: block.x + 5 * Math.random() - 10, y: block.y+ 5 * Math.random() - 10, energy: 10, vx: Math.random() - 0.5, vy: Math.random() - 0.5 })
        }

        this.lives--;
        this.block.shield = 1;
        this.firePower = 3;
        this.flash = 1;

        this.explode2Idx = (this.explode2Idx + 1) % 10;
        this.explode2Pool[this.explode2Idx].play();

        this.explodeIdx = (this.explodeIdx + 1) % 10;
        this.explodePool[this.explodeIdx].play();
      }
    });

    this.bullets.forEach(bullet => {
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

      if (bullet.x < block.x - 70 || bullet.x < 0 || bullet.y > this.engine.height + 100 || bullet.y < -100 || d < 20) {
        this.bullets.delete(bullet);
      }
    });

    this.foeBullets.forEach(bullet => {
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

      if (d < 20 || bullet.x > this.engine.width) {
        this.foeBullets.delete(bullet);
      }

      let bx = block.x - bullet.x;
      let by = block.y - bullet.y;
      let d2 = Math.sqrt(bx * bx + by * by);
      if (d2 < 20 && block.shield <= 0) {
        this.foeBullets.delete(bullet);
        for (let i = 0; i < 5; i++) {
          this.explosions.add({ x: block.x + 5 * Math.random() - 10, y: block.y+ 5 * Math.random() - 10, energy: 10, vx: Math.random() - 0.5, vy: Math.random() - 0.5 })
        }

        this.block.shield = 1;
        this.lives--;
        this.firePower = 3;
        this.flash = 1;

        this.explode2Idx = (this.explode2Idx + 1) % 10;
        this.explode2Pool[this.explode2Idx].play();
      }
    });

    this.block.shield -= 0.005;

    this.bullets.forEach(bullet => {
      this.foes.forEach(foe => {
        let b2px = foe.x - bullet.x;
        let b2py = foe.y - bullet.y;
        let d = Math.sqrt(b2px * b2px + b2py * b2py);
        if (d < 20) {
          for (let i = 0; i < 5; i++) {
            this.explosions.add({ x: foe.x + 5 * Math.random() - 10, y: foe.y + 5 * Math.random() - 10, energy: 10, vx: Math.random() - 0.5, vy: Math.random() - 0.5 })
          }

          this.foes.delete(foe);
          this.bullets.delete(bullet);

          this.score += 100;

          this.explodeIdx = (this.explodeIdx + 1) % 10;
          this.explodePool[this.explodeIdx].play();
        }
      });
    });

    this.explosions.forEach(e => {
      e.energy -= 0.2;
      if (e.energy < 0 ) {
        this.explosions.delete(e);
      }
    });

    if (this.lives < 1) {
      this.engine.setState("gameOverState");
    }

    // ctx.shadowColor = "#000";
    // ctx.shadowOffsetX = 10;
    // ctx.shadowOffsetY = 10;
    // ctx.shadowBlur = 5;

    this.flash -= 0.05;
    if (this.flash > 0) {
      let r = (255 * this.flash) | 0
      ctx.fillStyle = `rgb(${r}, 0, 16)`;
      ctx.strokeStyle = `rgb(${r}, 16, 33)`;
    } else {
      ctx.fillStyle = "#001";
      ctx.strokeStyle = "#012";
    }

    ctx.fillRect(0, 0, this.engine.width, this.engine.height);
    let levelx = (timestamp * 0.2) % 50;
    for (let x = 0; x < this.engine.width; x+= 50) {
      ctx.beginPath();
      ctx.moveTo(this.engine.width - (x + 50 - levelx) % this.engine.width, 0);
      ctx.lineTo(this.engine.width - (x + 50 - levelx) % this.engine.width, this.engine.height);
      ctx.stroke();
    }
    for (let y = 0; y < this.engine.height; y+= 50) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(this.engine.width, y);
      ctx.stroke();
    }

    if (this.foeFactory.hardness / 10 > this.sector) {
      this.sector++;
      this.sectorAnnounce = 1;
    }

    this.sectorAnnounce -= 0.005;
    if (this.sectorAnnounce > 0) {
      ctx.font = "30px sans-serif";
      ctx.fillStyle = `rgba(255,255,255,${this.sectorAnnounce})`;

      this.engine.centerText(`Approaching sector ${this.sector}`, this.engine.height - 50);
    }

    ctx.save();
    ctx.translate(block.x, block.y);
    if (block.shield > 0) {
      ctx.lineWidth = 2;
      let alpha = 0.5 * block.shield * (0.75 + 0.25 * Math.sin(timestamp * 0.02));
      ctx.strokeStyle = `rgba(100,255,255,${alpha})`;
      ctx.beginPath();
      ctx.arc(0, 0, 30, 0, Math.PI * 2, false);
      ctx.stroke();
      ctx.fillStyle = `rgba(0,100,255,${0.25 * alpha})`;
      ctx.fill();
    }
    ctx.rotate(block.a);

    ctx.globalCompositeOperation = "lighter";
    ctx.fillStyle = `rgba(255,150,10,${(0.75 + 0.25 * Math.cos(timestamp * 0.05))})`;
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      ctx.moveTo(0, 7 * Math.random() - 2);
      ctx.lineTo(0, -7 * Math.random() + 2);
      ctx.lineTo(- 2.0 * block.vx + 10 * Math.random() - 20, 5 * Math.random() - 2.5);
    }
    ctx.fill();
    ctx.globalCompositeOperation = "source-over";
    ctx.drawImage(this.subCanvas, -20, -20);
    ctx.restore();


    if (this.shieldPowerUp) {
      let alpha = 0.5 + 0.3 * Math.cos(0.01 * timestamp);
      ctx.fillStyle = `rgba(255,255,0,${alpha * 0.1})`;
      ctx.beginPath();
      ctx.arc(this.shieldPowerUp.x, this.shieldPowerUp.y, 16, 0, Math.PI * 2, false);
      ctx.fill();
      ctx.fillStyle = `rgba(255,255,0,${alpha})`;
      ctx.beginPath();
      ctx.arc(this.shieldPowerUp.x, this.shieldPowerUp.y, 8, 0, Math.PI * 2, false);
      ctx.fill();
    }

    if (this.bulletPowerUp) {
      let alpha = 0.5 + 0.3 * Math.cos(0.01 * timestamp);
      ctx.fillStyle = `rgba(0,255,255,${alpha * 0.1})`;
      ctx.beginPath();
      ctx.arc(this.bulletPowerUp.x, this.bulletPowerUp.y, 16, 0, Math.PI * 2, false);
      ctx.fill();
      ctx.fillStyle = `rgba(0,255,255,${alpha})`;
      ctx.beginPath();
      ctx.arc(this.bulletPowerUp.x, this.bulletPowerUp.y, 8, 0, Math.PI * 2, false);
      ctx.fill();
    }

    if (this.lifePowerUp) {
      let alpha = 0.5 + 0.3 * Math.cos(0.01 * timestamp);
      ctx.fillStyle = `rgba(255,0,0,${alpha * 0.1})`;
      ctx.beginPath();
      ctx.arc(this.lifePowerUp.x, this.lifePowerUp.y, 16, 0, Math.PI * 2, false);
      ctx.fill();
      ctx.fillStyle = `rgba(255,0,0,${alpha})`;
      ctx.beginPath();
      ctx.arc(this.lifePowerUp.x, this.lifePowerUp.y, 8, 0, Math.PI * 2, false);
      ctx.fill();
    }
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
    this.bullets.forEach(bullet => {
      ctx.fillRect(bullet.x - 6, bullet.y - 2, 12, 4);
    });

    ctx.fillStyle = "#f0f";
    this.foeBullets.forEach(bullet => {
      ctx.fillRect(bullet.x - 6, bullet.y - 2, 12, 4);
    });

    ctx.fillStyle = "#00f";
    ctx.strokeStyle = "#0ff";
    this.foes.forEach(foe => {
      ctx.save();
      ctx.translate(foe.x, foe.y);
      ctx.rotate(foe.a);

      ctx.globalCompositeOperation = "lighter";
      ctx.fillStyle = `rgba(255,150,10,${(0.75 + 0.25 * Math.cos(timestamp * 0.05))})`;
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        ctx.moveTo(0, 7 * Math.random() - 2);
        ctx.lineTo(0, -7 * Math.random() + 2);
        ctx.lineTo(10 * Math.random() - 20, 5 * Math.random() - 2.5);
      }
      ctx.fill();
      ctx.globalCompositeOperation = "source-over";

      ctx.drawImage(this.foeSprites[foe.sprite], -20, -20);
      ctx.restore();
    });

    ctx.globalCompositeOperation = "lighter";
    ctx.lineWidth = 1;
    this.explosions.forEach(e => {
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
    });
    ctx.globalCompositeOperation = "source-over";

    ctx.fillStyle = "#fff";
    ctx.font = "20px sans-serif";
    let livesText = `${this.lives} lives`;
    ctx.fillText(livesText, this.engine.width - (20 + ctx.measureText(livesText).width), 20);
    ctx.fillText(`Score: ${this.score}`, 20, 20);
    ctx.fillText(`Sector: ${this.sector}`, 400, 20);
    ctx.fillText(`Wave: ${this.foeFactory.hardness%10}`, 600, 20);

    ctx.strokeStyle = "#ff0";
    if (gamePad.touchId || true) {
      ctx.beginPath();
      ctx.moveTo(gamePad.touchStartX, gamePad.touchStartY);
      ctx.lineTo(gamePad.touchStartX + gamePad.touchDx, gamePad.touchStartY + gamePad.touchDy);
      ctx.stroke();
    }

    this.scratch.update(ctx, timestamp);
    this.lastTime = timestamp;
  }
}
