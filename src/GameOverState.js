import GameState from "./GameState"

export default class GameOverState extends GameState {

  constructor(engine) {
    super(engine);
  }

  init() {
    this.uiTime = this.engine.timestamp;
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

    ctx.strokeStyle = "#512";
    ctx.save();
    ctx.translate(0.5 * this.engine.width - Math.cos(0.0006 * timestamp) * 100, 0.5 * this.engine.height +  - Math.sin(0.001 * timestamp) * 100);
    ctx.rotate(0.0002 * timestamp);
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
    let textSize = ctx.measureText("Game Over");
    ctx.fillText("Game Over", 0.5 * (this.engine.width - textSize.width), 200);

    ctx.font = "32px sans-serif";
    ctx.fillStyle = "#fff";

    let scoreText = `Score: ${this.engine.gameStates.levelState.score}`;
    ctx.fillText(scoreText, 0.5 * (this.engine.width - ctx.measureText(scoreText).width), 400);

    let sectorText = `Sector: ${this.engine.gameStates.levelState.sector}`;
    ctx.fillText(sectorText, 0.5 * (this.engine.width - ctx.measureText(sectorText).width), 350);

  }
}
