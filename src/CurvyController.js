export default class CurvyController {

  constructor(settings) {
    this.x1 = settings.x1;
    this.y1 = settings.y1;
    this.x2 = settings.x2;
    this.y2 = settings.y2;

    this.xm1 = settings.xm1;
    this.ym1 = settings.ym1;
    this.xm2 = settings.xm2;
    this.ym2 = settings.ym2;

    this.xs1 = settings.xs1;
    this.ys1 = settings.ys1;
    this.xs2 = settings.xs2;
    this.ys2 = settings.ys2;

    this.t = 0;
    this.tm = settings.tm;
  }

  init(foe, timestamp) {
  }

  update(foe, timestamp) {
    this.t += 0.002;

    let rt = Math.min(this.t, 1);
    let x = rt * this.x2 + (1 - rt) * this.x1;
    let y = rt * this.y2 + (1 - rt) * this.y1;

    let t2 = this.t + this.tm;
    x += Math.cos(0.01 * this.tm + t2 * this.xs1) * this.xm1 - 150;
    y += Math.sin(0.02 * this.tm + t2 * this.ys2) * this.ym1 * 0.4;
    x += Math.cos(0.03 * this.tm + t2 * this.xs1) * this.xm2;
    y += Math.sin(0.04 * this.tm + t2 * this.ys2) * this.ym2;

    foe.setPosition(x, y);
  }

}
