"use strict";
const gulp = require("gulp");
const plugins = require('gulp-load-plugins')();
const browserSync = require('browser-sync').create();

const tsProject = plugins.typescript.createProject("tsconfig.json");

gulp.task("build", ["compile-ts"]);

gulp.task("compile-ts", () => {
    const tsResult = tsProject.src().pipe(tsProject());

    return tsResult.js.pipe(gulp.dest("public/app"));
});

gulp.task("serve", ["build"], () => {
    browserSync.init({
        server: {
            baseDir: "./public"
        }
    });
    gulp.watch("src/**/*.ts", ["build"]);
});


gulp.task("default", ["build"]);
