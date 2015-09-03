export default class Body {

  constructor(width, height) {
    this.x = 0;
    this.y = 0;
    this.w = width;
    this.h = height;
    this.vx = 0;
    this.vy = 0;
  }

  setPosition(x, y) {
    this.x = x;
    this.y = y;
  }

  setVelocity(vx, vy) {
    this.vx = vx;
    this.vy = vy;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
  }
}
