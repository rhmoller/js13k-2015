export default class GamePad {

  constructor() {
    this.left = false;
    this.up = false;
    this.right = false;
    this.down = false;
    this.fire = false;

    window.addEventListener("keydown", (e) => {
      let passThrough = false;
      switch (e.keyCode) {
        case 37: this.left = true; break;
        case 38: this.up = true; break;
        case 39: this.right = true; break;
        case 40: this.down = true; break;
        case 32: this.fire = true; break;
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
      }
      e.preventDefault();
    }, false);
  }

}
