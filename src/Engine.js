import GamePad from "./GamePad"

export default class Engine {

  constructor(width, height, timestamp) {
    this.width = width;
    this.height = height;
    this.timestamp = timestamp;
    this.lastTime = timestamp;

    let canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    this.gamepad = new GamePad(canvas);

    let ctx = canvas.getContext("2d");
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, width, height);

    let stage = document.getElementById("game");
    stage.appendChild(canvas);
    document.body.style.backgroundColor = "#000";
    document.body.style.align = "center";
    canvas.style.marginLeft = "auto";
    canvas.style.marginRight = "auto";
    canvas.style.display = "block";

    let resizer = function () {
      let scaleX = window.innerWidth / width;
      let scaleY = window.innerHeight / height;
      let scale = Math.min(scaleX, scaleY);
      canvas.style.width = width * scale + "px";
      canvas.style.height = height * scale + "px";
      document.body.scrollLeft = 0;
      document.body.scrollTop = 0;
    }
    resizer();

    window.addEventListener("resize", resizer, false);
    window.addEventListener("orientationChange", resizer, false);

    this.canvas = canvas;
    this.ctx = ctx;
    this.updater = this.update.bind(this);
  }

  update(timestamp) {
    requestAnimationFrame(this.updater);
    this.timestamp = timestamp;
    this.state.update(timestamp);
    this.lastTime = timestamp;
  }

  start() {
    requestAnimationFrame(this.updater);
  }

  setState(stateId) {
    this.state = this.gameStates[stateId];
    this.state.init();
  }

  centerText(text, y) {
    let textSize = this.ctx.measureText(text);
    this.ctx.fillText(text, 0.5 * (this.width - textSize.width), y);
  }

}
