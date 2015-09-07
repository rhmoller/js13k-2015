import GameState from "./GameState"

const WIDTH = 1000;
const HEIGHT = 500;

export default class TitleState extends GameState {

  constructor(engine) {
    super(engine);
    this.selected = 0;
    this.uiTime = performance.now();
  }

  update(timestamp) {
    if (this.engine.gamepad.fire && (timestamp - this.uiTime) > 200) {
      switch (this.selected) {
        case 0:
          this.engine.setState("levelState");
          break;
        case 1:
          this.engine.setState("controlsState");
          break;
        case 2:
          this.engine.setState("aboutState");
          break;
      }
    }
    if (this.engine.gamepad.up && (timestamp - this.uiTime) > 200) {
      this.selected = (this.selected + 2) % 3;
      this.uiTime = timestamp;
    }
    if (this.engine.gamepad.down && (timestamp - this.uiTime) > 200) {
      this.selected = (this.selected + 1) % 3;
      this.uiTime = timestamp;
    }

    let ctx = this.engine.ctx;
    ctx.fillStyle = "#002";
    ctx.fillRect(0, 0, this.engine.width, this.engine.height);

    ctx.font = "112px sans-serif";
    ctx.fillStyle = "#fff";
    let textSize = ctx.measureText("Bullet Pull");
    ctx.fillText("Bullet Pull", 0.5 * (WIDTH - textSize.width), 200);

    ctx.fillStyle = "rgba(128,255,255,0.1)";
    ctx.fillRect(0, 320 + this.selected * 40, WIDTH, 40);

    ctx.font = "32px sans-serif";
    ctx.fillStyle = "#fff";
    ctx.fillText("New Game", 0.5 * (WIDTH - ctx.measureText("New Game").width), 350);
    ctx.fillText("Controls", 0.5 * (WIDTH - ctx.measureText("Controls").width), 390);
    ctx.fillText("About", 0.5 * (WIDTH - ctx.measureText("About").width), 430);
  }

}
