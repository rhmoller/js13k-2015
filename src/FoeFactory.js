import Foe from "./Foe"
import SineWaveController from "./SineWaveController"
import BezierCurveController from "./BezierCurveController"

const HEIGHT = 600;

const MODE_WAIT = 0;
const MODE_WAVE = 1;

export default class FoeFactory {

  constructor(level) {
      this.level = level;
      this.foeSeq = 0;
      this.sineWaveController = new SineWaveController();
      this.bezierCurveController = new BezierCurveController();
      this.foeTime = performance.now();

      this.waitUntil = performance.now() + 1000;
      this.spawnRate = 500;
      this.spawnUntil = performance.now() + 2000;
      this.spawnType = 1;
      this.sprite = 1;

      this.hardness = 1;
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
      let controller = (this.spawnType == 0 ? this.sineWaveController : this.bezierCurveController);
      let foe = this.spawn(timestamp, controller, this.sprite);
      foes.add(foe);
      this.foeTime = timestamp;
    }

    if (timestamp > this.spawnUntil) {
        this.waitUntil = this.spawnUntil + 500 + 5000 * Math.random();
        this.spawnUntil = this.waitUntil + 500 + this.hardness * 500 * Math.random();
        this.spawnRate = 200 + 1000 * Math.random();
        this.sprite++;
        this.spawnType = (this.spawnType + 1) % 2;
        if (this.spawnType == 1) {
          this.bezierCurveController.shuffle();
        }
        this.hardness += 0.5;
    }

  }

}
