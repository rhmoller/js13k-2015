export default class Bezier {

  constructor(controlPoints) {
    this.controlPoints = controlPoints;
  }

  getPoint(pt) {
    let pti = pt | 0;

    let pt1 = pti * 2;
    let pt2 = Math.min(pt1 + 1, this.controlPoints.length);
    let pt3 = Math.min(pt1 + 2, this.controlPoints.length);

    let t = pt - pti;
    let t2 = t * t;
    let omt = (1 - t)
    let omt2 = omt * omt;

    let x1 = this.controlPoints[pt1].x;
    let y1 = this.controlPoints[pt1].y
    let x2 = this.controlPoints[pt2].x;
    let y2 = this.controlPoints[pt2].y;
    let x3 = this.controlPoints[pt3].x;
    let y3 = this.controlPoints[pt3].y;

    let x = omt2 * x1 + 2 * omt * t * x2 + t2 * x3;
    let y = omt2 * y1 + 2 * omt * t * y2 + t2 * y3;
    return { "x": x, "y": y};
  }

}
