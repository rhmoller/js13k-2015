import GameState from "./GameState"

const WIDTH = 1000;
const HEIGHT = 600;

export default class GameOverState extends GameState {

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
    ctx.fillStyle = "#300";
    ctx.fillRect(0, 0, this.engine.width, this.engine.height);

    ctx.font = "112px sans-serif";
    ctx.fillStyle = "#fff";
    let textSize = ctx.measureText("Game Over");
    ctx.fillText("Game Over", 0.5 * (WIDTH - textSize.width), 200);

    let scoreText = `Score: ${this.engine.gameStates.levelState.score}`;
    ctx.font = "32px sans-serif";
    ctx.fillStyle = "#fff";
    ctx.fillText(scoreText, 0.5 * (WIDTH - ctx.measureText(scoreText).width), 350);
  }
}
