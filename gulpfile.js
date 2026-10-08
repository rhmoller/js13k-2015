var gulp = require("gulp");
var log = require("fancy-log");
var source = require("vinyl-source-stream");
var browserify = require("browserify");
var watchify = require("watchify");
var babelify = require("babelify");
var exorcist = require("exorcist");
var browserSync = require("browser-sync").create();
var uglify = require("gulp-uglify");

var bundler = watchify(browserify("./src/main.js", Object.assign({}, watchify.args, { debug: true })));

bundler.transform(babelify.configure({
  presets: [ "@babel/preset-env" ]
}));

bundler.on("update", bundle);

function bundle() {
  log("Compiling JS");
  return bundler.bundle()
    .on("error", function (err) {
      log(err.message);
      browserSync.notify("Browserify error");
      this.emit("end");
    })
    .pipe(exorcist("build/game.js.map"))
    .pipe(source("game.js"))
    .pipe(gulp.dest("./build"))
    .pipe(browserSync.stream({ once: true }));
}

gulp.task("bundle", function () {
  return bundle();
});

gulp.task("assets", function () {
  return gulp.src("./assets/**/*", { base: "./assets"})
    .pipe(gulp.dest("./build"))
    .pipe(browserSync.reload({ stream: true, once: true }));
});

gulp.task("default", gulp.series(gulp.parallel("bundle", "assets"), function serve() {
  browserSync.init({
    server: "./build",
    open: false
  });

  gulp.watch("./assets/**/*.*", gulp.series("assets"));
}));
