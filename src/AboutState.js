import GameState from "./GameState"

const WIDTH = 1000;

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

    ctx.font = "112px sans-serif";
    ctx.fillStyle = "#fff";
    let textSize = ctx.measureText("About");
    ctx.fillText("About", 0.5 * (WIDTH - textSize.width), 200);
  }
}
