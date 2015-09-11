export default class Foe {

  constructor(seq, controller, sprite) {
    this.seq = seq;
    this.controller = controller;
    this.x = 0;
    this.y = 0;
    this.vx = 0;
    this.vy = 0;
    this.lastX = 0;
    this.lastY = 0;
    this.sprite = sprite;
  }

  setPosition(x, y) {
    this.x = x;
    this.y = y;
  }

  setVelocity(vx, vy) {
    this.vx = vx;
    this.vy = vy;
  }

  update(timestamp) {
    this.controller.update(this, timestamp);
    this.a = Math.PI + Math.atan2(this.y - this.lastY, this.x - this.lastX);
    this.lastX = this.x;
    this.lastY = this.y;
  }

}
