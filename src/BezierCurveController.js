import Bezier from "./Bezier"

const WIDTH = 1000;
const HEIGHT = 600;

export default class BezierCurveController {

  constructor() {
    this.bezier = new Bezier([
      { "x": 100, "y": 0 },
      { "x": 100, "y": HEIGHT - 100},
      { "x": 0.5 * WIDTH, "y": HEIGHT - 100 },
      { "x": WIDTH + 75, "y": HEIGHT - 100 },
      { "x": WIDTH + 75, "y": 100 }
    ]);
  }

  init(foe, timestamp) {
    foe.bezierTime = 0;
  }

  update(foe, timestamp) {
    foe.bezierTime += 0.004;
    if (foe.bezierTime > 2) {
      foe.bezierTime = 0;
    }
    let bezPt = this.bezier.getPoint(foe.bezierTime);
    foe.setPosition(bezPt.x, bezPt.y);
  }

  shuffle() {
    // this.bezier.controlPoints[0].x = 100 + (0.5 * WIDTH) * Math.random();
    // if (Math.random() > 0) {
    //   this.bezier.controlPoints[0].y = -50;
    // } else {
    //   this.bezier.controlPoints[0].y = HEIGHT + 50;
    // }
  }

}
