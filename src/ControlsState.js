import GameState from "./GameState"

export default class ControlState extends GameState {

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
    ctx.fillStyle = "#303 ";
    ctx.fillRect(0, 0, this.engine.width, this.engine.height);

    ctx.strokeStyle = "#414";
    ctx.save();
    ctx.translate(0.5 * this.engine.width - Math.cos(0.0006 * timestamp) * 100, 0.5 * this.engine.height +  - Math.sin(0.001 * timestamp) * 100);
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
    this.engine.centerText("Controls", 150);

    ctx.font = "24px sans-serif";

    this.engine.centerText("Move your space ship with", 250);
    this.engine.centerText("WASD or arrow keys", 280);

    this.engine.centerText("Shoot with", 340);
    this.engine.centerText("Space or enter", 370);

    this.engine.centerText("Press ESC to exit to menu", 430);

  }
}
