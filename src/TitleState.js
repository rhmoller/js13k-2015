import GameState from "./GameState"

export default class TitleState extends GameState {

  constructor(engine) {
    super(engine);
    this.selected = 0;
    this.uiTime = this.engine.timestamp;
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


    ctx.strokeStyle = "#013";
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

    ctx.fillStyle = "rgba(128,255,255,0.1)";
    ctx.fillRect(0, 320 + this.selected * 40, this.engine.width, 40);

    ctx.fillStyle = "#fff";

    ctx.font = "112px sans-serif";
    this.engine.centerText("\"Bullet Pull\"", 200);

    ctx.font = "20px sans-serif";
    this.engine.centerText("Backwards through space and time");

    ctx.font = "32px sans-serif";
    this.engine.centerText("New Game", 350);
    this.engine.centerText("Controls", 390);
    this.engine.centerText("About", 430);
  }

}
