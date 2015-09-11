import Foe from "./Foe"
import SineWaveController from "./SineWaveController"
import BezierCurveController from "./BezierCurveController"
import Bezier from "./Bezier"
import CurvyController from "./CurvyController"

const WIDTH = 1000;
const HEIGHT = 600;

const MODE_WAIT = 0;
const MODE_WAVE = 1;

export default class FoeFactory {

  constructor(level) {
      this.level = level;
      this.foeSeq = 0;
      this.foeTime = level.engine.timestamp;
      this.hardness = 1;
      this.bezier = new Bezier(this.buildBezierPoints());
      this.curve = this.makeCurve();
      this.sprite = 0;
      this.spawnUntil = level.engine.timestamp + 2500;
      this.waitUntil = level.engine.timestamp + 2000;
      this.spawnType = 0;
      this.prepareNextWave();
  }

  spawn(timestamp, controller, sprite) {
    let foe = new Foe(this.foeSeq++, controller, sprite);
    controller.init(foe, timestamp);
    return foe;
  }

  spawnTo(foes, timestamp) {
    if (timestamp < this.waitUntil) {
      return;
    }

    if (timestamp - this.foeTime > this.spawnRate) {
      let controller = null;
      switch (this.spawnType) {
        case 0:
          controller = new BezierCurveController(this.bezier);
          break;

        case 1:
          controller = new CurvyController(this.curve);
          break;

        default:
        controller = new SineWaveController();
      }

      let foe = this.spawn(timestamp, controller, this.sprite);
      foes.add(foe);
      this.foeTime = timestamp;
    }

    if (timestamp > this.spawnUntil) {
      this.prepareNextWave();
    }

  }

  prepareNextWave() {
    this.waitUntil = this.spawnUntil + 2000 + 500 * Math.random() * this.hardness * 0.75;
    if (this.hardness % 10 == 9) {
      this.waitUntil += 5000;
    }
    this.spawnUntil = this.waitUntil + 1000 + 500 * 0.5 * this.hardness + 100 * Math.random();
    this.spawnRate = 500 + 100 * Math.random();
    this.sprite++;
    if (this.sprite >= 50) {
      this.sprite = 1;
    }

    this.spawnType = (this.spawnType + 1) % 3;
    if (this.spawnType == 0) {
      this.bezier = new Bezier(this.buildBezierPoints());
    } else if (this.spawnType == 1) {
      this.curve = this.makeCurve();
    }
    this.hardness += 1;
  }

  makeCurve() {
    let curve = {};
    curve.x1 = -150;
    curve.x2 = WIDTH + 150;
    curve.y1 = 100 + (HEIGHT - 200) * Math.random();
    curve.y2 = 100 + (HEIGHT - 200) * Math.random();

    curve.xm1 = 10 + 50 * Math.min(0.1 * this.hardness, 5) * Math.random();// + 50 * Math.random();
    curve.ym1 = 200 + 100 * Math.min(10, 0.2 * this.hardness) * Math.random();

    curve.xm2 = 10 + 10 * Math.random();
    curve.ym2 = 50 + 20 * Math.random();

    curve.xs1 = 20 + Math.random() * 10;
    curve.ys1 = 5 + Math.random() * 2;

    curve.xs2 = 25 + Math.random() * 10;
    curve.ys2 = 2 + Math.random() * 5;

    curve.tm = Math.random();
    return curve;
  }

  buildBezierPoints() {
    let pts = [];
    let top = (Math.random() > 0.5);

    let cursor = { x: Math.random() * WIDTH * 0.5, y : top ? -50 : HEIGHT + 50}
    pts.push({x: cursor.x, y: cursor.y});

    let dx = 50;
    for (let i = 0; i < 3; i++) {

      cursor.x += dx;
      cursor.y = (top) ? 0 : HEIGHT;
      pts.push({x: cursor.x, y: cursor.y});

      let fwd = Math.min(100, Math.max(50, (WIDTH - cursor.x) * Math.random()));
      let bwd = Math.min(50, Math.max(25, cursor.x * Math.random()));
      dx = (Math.random() > 0.5 && cursor.x > 100) ?  -bwd : fwd;

      cursor.x += dx;
      cursor.y = 0.5 * HEIGHT;
      pts.push({x: cursor.x, y: cursor.y});

      top = !top;
      cursor.x += dx;
      cursor.y = (top) ? 0 : HEIGHT;
      pts.push({x: cursor.x, y: cursor.y});

      cursor.x += dx;
      cursor.y = (top) ? 0 : HEIGHT;
      pts.push({x: cursor.x, y: cursor.y});
    }

    cursor.x += dx;
    cursor.y = (top) ? 0 : HEIGHT;
    pts.push({x: cursor.x, y: cursor.y});

    pts.push({x: WIDTH + 100, y: Math.random() * HEIGHT});
    return pts;
  }

}
