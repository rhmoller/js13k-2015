export default class ShipGenerator {

  constructor() {
    let canvas = document.createElement("canvas");
    canvas.width = 800;
    canvas.height = 500;
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    document.body.appendChild(canvas);

    this.ctx.fillStyle = "#000";
    this.ctx.fillRect(0, 0, 800, 500);
    this.shipx = -50;
    this.shipy = 0;
  }

  paintShips() {
    let ctx = this.ctx;

    this.shipx += 50;
    if (this.shipx >= 800) {
      this.shipx = 0;
      this.shipy += 50;
      if (this.shipy >= 500) {
        this.shipy = 0;
      }
    }

    ctx.save();
    ctx.translate(this.shipx, this.shipy);
    ctx.scale(0.25, 0.25);

    let subCanvas = document.createElement("canvas");
    subCanvas.width = 200;
    subCanvas.height = 200;
    let subCtx = subCanvas.getContext("2d");
    subCtx.fillStyle = "#000";
    subCtx.fillRect(0, 0, 100, 100);
    subCtx.translate(100, 100);
    this.paintShip(subCtx);

    ctx.drawImage(subCanvas, 0, 0);

    ctx.restore();
  }

  paintShip(ctx) {
    // ctx.fillStyle = "#003";
    // ctx.fillRect(0, 0, 200, 200);
    // ctx.scale(0.7, -0.7);


    ctx.beginPath();

    let h = (Math.random() * 320)|0;
    let s = (Math.random() * 50)|0 + 50;
    let v = (Math.random() * 50)|0 + 50;
    ctx.fillStyle = `hsl(${h},${s}%,${v}%)`;
    ctx.strokeStyle = `hsl(${h},${90}%,${90}%)`;

    let px = 0;
    let py = 0;
    ctx.moveTo(px, py);

    let points = [];

    let steps = 1 + Math.random() * 3;
    for (let i = 0; i < steps; i++) {
      px += 80 / steps;
      py += 20 - Math.random() * 40;
      ctx.lineTo(px, py);
      points.push({"x":px, "y":py});
    }

    steps = 1 + Math.random() * 3;
    for (let i = 0; i < steps; i++) {
      px += Math.random() * 5 - 12;
      py += 10 + Math.random() * 5;
      ctx.lineTo(px, py);
      points.push({"x":px, "y":py});
    }

    steps = 1 + Math.random() * 2;
    let d = 50 - py;
    for (let i = 0; i < steps; i++) {
      px -= 10;
      py += d / steps;;
      ctx.lineTo(px, py);
      points.push({"x":px, "y":py});
    }

    ctx.lineTo(0, 100);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(0, 0);
    for (let p of points) {
      ctx.lineTo(-p.x, p.y);
    }
    ctx.lineTo(0, 100);
    ctx.fill();

    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.scale(1, 1 + Math.random());
    ctx.arc(0, 5 + Math.random() * 10, 20, 0, Math.PI);
    ctx.fill();
  }

  run() {
    let paint = this.paintShips.bind(this);
    setInterval(paint, 100);
  }
}
