export default class Preloader {

  constructor() {
    this.paths = [];
    this.assets = {};
    this.loaded = 0;
  }

  queue(path) {
    this.paths.push(path);
  }

  get(path) {
    return this.assets[path];
  }

  load(callback) {
    for (let i = 0; i < this.paths.length; i++) {
      let img = new Image();
      img.onload = () => {
        this.assets[this.paths[i]] = img;
        this.loaded++;
        if (this.loaded == this.paths.length) {
          callback.call(this);
        }
      }
      img.src = this.paths[i];
    }
  }

}
