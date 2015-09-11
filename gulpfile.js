var gulp = require("gulp");
var gutil = require("gulp-util");
var source = require("vinyl-source-stream");
var browserify = require("browserify");
var watchify = require("watchify");
var babelify = require("babelify");
var exorcist = require("exorcist");
var browserSync = require("browser-sync").create();
var uglify = require("gulp-uglify");

watchify.args.debug = true;
var bundler = watchify(browserify("./src/main.js", watchify.args));

bundler.transform(babelify.configure({
  sourceMapRelative: "src"
}));

bundler.on("update", bundle);

function bundle() {
  gutil.log("Compiling JS");
  return bundler.bundle()
    .on("error", function (err) {
      gutil.log(err.message);
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
})

gulp.task("default", [ "bundle", "assets" ], function () {
  browserSync.init({
    server: "./build",
    open: false
  });

  gulp.watch("./assets/**/*.*", [ "assets" ]);
});
