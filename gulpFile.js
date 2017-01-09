var gulp = require('gulp');
// js
var browserify = require('browserify');
var uglify     = require('gulp-uglify');
var header     = require('gulp-header');

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


gulp.task('dist',['full','min'],() => 0);

gulp.task('doc',['page-js','page-css'],() => 0);

gulp.task('default',['dist','doc'],() => 0);
