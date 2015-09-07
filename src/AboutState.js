import GameState from "./GameState"

const WIDTH = 1000;
const HEIGHT = 600;

export default class AboutState extends GameState {

  constructor(engine) {
    super(engine);
  }

  init() {
    this.uiTime = performance.now();
    this.engine.gamepad.fire = false;
  }

  update(timestamp) {
    if ((this.engine.gamepad.fire || this.engine.gamepad.esc) &&
        (timestamp - this.uiTime) > 200) {
      this.engine.setState("titleState");
      this.engine.gamepad.fire = false;
    }

    let ctx = this.engine.ctx;
    ctx.fillStyle = "#030";
    ctx.fillRect(0, 0, this.engine.width, this.engine.height);

    ctx.strokeStyle = "#140";
    ctx.save();
    ctx.translate(0.5 * WIDTH - Math.cos(0.0006 * timestamp) * 100, 0.5 * HEIGHT +  - Math.sin(0.001 * timestamp) * 100);
    ctx.rotate(2 * Math.cos(0.0001 * timestamp));
    let levelx = timestamp * 0.2;
    ctx.beginPath();
    for (let x = -700; x < 700; x+= 50) {
      ctx.moveTo(x, -700);
      ctx.lineTo(x, 700);
    }
    ctx.stroke();
    ctx.beginPath();
    for (let y = -700; y < 700; y+= 50) {
      ctx.moveTo(-700, y);
      ctx.lineTo(700, y);
    }
    ctx.stroke();
    ctx.restore();


    ctx.font = "112px sans-serif";
    ctx.fillStyle = "#fff";
    let textSize = ctx.measureText("About");
    ctx.fillText("About", 0.5 * (WIDTH - textSize.width), 200);
  }
}
