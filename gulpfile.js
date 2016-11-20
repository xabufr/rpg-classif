"use strict";
const gulp = require("gulp");
const plugins = require('gulp-load-plugins')();

const tsProject = plugins.typescript.createProject("tsconfig.json");

gulp.task("build", () => {
    const tsResult = tsProject.src().pipe(plugins.typescript());

    return tsResult.js.pipe(gulp.dest("build/"));
});

gulp.task("watch", ["build"], () => {
    gulp.watch("src/**/*.ts", ["build"]);
});

gulp.task("default", ["build"]);
