import Bezier from "./Bezier"

const WIDTH = 1000;
const HEIGHT = 600;

export default class BezierCurveController {

  constructor(bezier) {
    this.bezier = bezier;
    this.segments = (bezier.controlPoints.length - 1) / 2;
  }

  init(foe, timestamp) {
    foe.bezierTime = 0;
  }

  update(foe, timestamp) {
    foe.bezierTime += 0.008;
    if (foe.bezierTime > this.segments) {
      foe.bezierTime = 0;
    }
    let bezPt = this.bezier.getPoint(foe.bezierTime);
    foe.setPosition(bezPt.x, bezPt.y);
  }

}
