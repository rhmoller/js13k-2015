export default class GamePad {

  constructor(canvas) {
    this.left = false;
    this.up = false;
    this.right = false;
    this.down = false;
    this.fire = false;
    this.esc = false;

    this.touchId = null; // assume single touch
    this.touchStartX = 0;
    this.touchStartY = 0;
    this.touchDx = 0;
    this.touchDy = 0;
    this.canvas = canvas;

    window.addEventListener("keydown", (e) => {
      let passThrough = e.ctrlKey || e.metaKey;

      switch (e.keyCode) {
        case 37: this.left = true; break;
        case 38: this.up = true; break;
        case 39: this.right = true; break;
        case 40: this.down = true; break;

        case 32: this.fire = true; break;
        case 13: this.fire = true; break;

        case 27: this.esc = true; break;

        case 65: this.left = true; break;
        case 87: this.up = true; break;
        case 68: this.right = true; break;
        case 83: this.down = true; break;

        default:
          passThrough = true;
      }
      if (!passThrough) {
        e.preventDefault();
      }
    }, false);

    window.addEventListener("keyup", (e) => {
      switch (e.keyCode) {
        case 37: this.left = false; break;
        case 38: this.up = false; break;
        case 39: this.right = false; break;
        case 40: this.down = false; break;

        case 32: this.fire = false; break;
        case 13: this.fire = false; break;

        case 27: this.esc = false; break;

        case 65: this.left = false; break;
        case 87: this.up = false; break;
        case 68: this.right = false; break;
        case 83: this.down = false; break;
      }
      e.preventDefault();
    }, false);

    canvas.addEventListener("touchstart", (e) => {
      this.fire = true;
      if (!this.touchId) {
        let touches = e.changedTouches;
        this.touchId = touches[0].identifier;
        this.touchStartX = touches[0].pageX - this.canvas.offsetLeft;
        this.touchStartY = touches[0].pageY - this.canvas.offsetTop;
      }
    }, false);

    canvas.addEventListener("touchend", (e) => {
      this.fire = false;
      this.touchId = null;
      this.left = false;
      this.right = false;
      this.up = false;
      this.down = false;
    }, false);

    canvas.addEventListener("touchcancel", (e) => {
      this.fire = false;
      this.touchId = null;
      this.left = false;
      this.right = false;
      this.up = false;
      this.down = false;
    }, false);

    canvas.addEventListener("touchmove", (e) => {
      let touches = e.changedTouches;
      for (let i = 0; i < touches.length; i++) {
        if (touches[i].identifier == this.touchId) {
          let dx = touches[i].pageX - this.touchStartX - this.canvas.offsetLeft;
          let dy = touches[i].pageY - this.touchStartY - this.canvas.offsetTop;
          this.touchDx = dx;
          this.touchDy = dy;

            if (Math.abs(dx) > 20) {
              this.left = (dx < 0);
              this.right = (dx > 0);
            } else {
              this.left = false;
              this.right = false;
            }

            if (Math.abs(dy) > 20) {
              this.up = (dy < 0);
              this.down = (dy > 0);
            } else {
              this.up = false;
              this.down = false;
            }
        }
      }
      e.preventDefault();
    }, false);

  }

}
