var gulp = require('gulp');
// js
var browserify = require('browserify');
var uglify     = require('gulp-uglify');
var header     = require('gulp-header');
var replace    = require('gulp-replace');

var collapse   = require('bundle-collapser/plugin');
var source     = require('vinyl-source-stream');
var buffer     = require('vinyl-buffer');

/////////
/// pages
/////

var rootdirname = __dirname;

gulp.task('page-js', function(){
  var headerTxt = '/* ' + new Date().getFullYear() + '- generated at ' + new Date() + '\n*/';
  var browserifyOption = {
	    entries: './pages/pages.js',
	    extensions: ['.js'],
	    //debug: true,
	  };
	
	  var b = browserify(browserifyOption);
	  var bundler = b
	    .transform('partialify')
	    .transform('babelify', {
	      compact: "auto",
	        ignore: [],
	        presets: ['es2015', 'react']
	      });
	  
	  var rebundle = function() {
	    var rc = bundler.plugin(collapse)
	      .bundle()
	      .pipe(source('page.js'))
	      .pipe(buffer())
	  //    .pipe(uglify())
	      .pipe(header(headerTxt))
	      .pipe(gulp.dest(rootdirname));
	
	      return rc;
	    };
	  bundler = bundler.on('update', rebundle);
	  return rebundle();
});
	
gulp.task('page-css', function(){
  return 0;/*gulp.src("./pages/pages.less")
    .pipe(less())
    .pipe(rename('page.css'))
    .pipe(gulp.dest(rootdirname));*/
});

/////////
// dist
/////////
gulp.task('full', function(){

  var headerTxt = '/* ' + new Date().getFullYear() + '- generated at ' + new Date() + '\n*/';
  var browserifyOption = {
    entries: './src/Graph.jsx',
    extensions: ['.js','.jsx']
  };
	
  var b = browserify(browserifyOption);
  var bundler = b
    .transform('partialify')
    .transform('babelify', {
      compact: "auto",
      ignore: [],
      presets: ['es2015', 'react']
  }).external('react');
  
  var rebundle = function() {
    var rc = bundler.plugin(collapse)
      .bundle()
      .pipe(source('reactchart.js'))
      .pipe(buffer())
      .pipe(header(headerTxt))
      .pipe(gulp.dest('./dist'));
	
      return rc;
    };
  bundler = bundler.on('update', rebundle);
  return rebundle();
});

gulp.task('min', function(){

  var headerTxt = '/* ' + new Date().getFullYear() + '- generated at ' + new Date() + '\n*/';
  var browserifyOption = {
    entries: './src/Graph.jsx',
    extensions: ['.js','.jsx']
    //debug: true,
  };
	
  var b = browserify(browserifyOption);
  var bundler = b
    .transform('partialify')
    .transform('babelify', {
      compact: "auto",
      ignore: [],
      presets: ['es2015', 'react']
  }).external('react');
  
  var rebundle = function() {
    var rc = bundler.plugin(collapse)
      .bundle()
      .pipe(source('reactchart.min.js'))
      .pipe(buffer())
      .pipe(uglify())
      .pipe(header(headerTxt))
      .pipe(gulp.dest('./dist'));
	
      return rc;
    };
  bundler = bundler.on('update', rebundle);
  return rebundle();
});

////////////
// jsx -> js in require
///////////

gulp.task('jsx2js', () => {
  return gulp.src(['.lib/*.js',"./lib/**/*.js"])
    .pipe(replace(/\.jsx/g,'.js'))
    .pipe(gulp.dest('./lib'));
});

////////////
// src -> lib in index
///////////

gulp.task('src2libIdx', () => {
  return gulp.src(["./index.js"])
    .pipe(replace(/src/g,'lib'))
    .pipe(gulp.dest('.'));
});

gulp.task('src2libHlp', () => {
  return gulp.src(["./helpers/index.js"])
    .pipe(replace(/src/g,'lib'))
    .pipe(gulp.dest('./helpers'));
});

gulp.task('src2lib',["src2libIdx","src2libHlp"],() => 0);

//////////////
// .npmignore ignores src/
/////////////

gulp.task('noSrc',() => {
  return gulp.src(['./.npmignore'])
    .pipe(header('src\n'))
    .pipe(gulp.dest('.'));
});

gulp.task('buildNpm',['jsx2js','src2lib','noSrc'],() => 0);

gulp.task('dist',['full','min'],() => 0);

gulp.task('doc',['page-js','page-css'],() => 0);

gulp.task('default',['dist','doc'],() => 0);
