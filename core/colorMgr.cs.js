var _ = require('underscore');
var utils = require('./utils.cs.js');

var shader = {};
<<<<<<< HEAD
shader.color = function(colors,f){
=======
shader.color = function(options,f){
>>>>>>> develop

		var toRGB= function(str,w){
			return {
				R: Math.round(parseInt(str.substr(1,2),16) * w),
				G: Math.round(parseInt(str.substr(3,2),16) * w),
				B: Math.round(parseInt(str.substr(5,2),16) * w)
			};
		};

		var addRGB = function(){
			return {
				R: _.reduce(arguments,(memo,ar) => {return memo + ar.R;},0),
				G: _.reduce(arguments,(memo,ar) => {return memo + ar.G;},0),
				B: _.reduce(arguments,(memo,ar) => {return memo + ar.B;},0)
			};
		};

		var toString = function(rgb){
			return '#' + (rgb.R.toString(16) + rgb.G.toString(16) + rgb.B.toString(16)).toUpperCase();
		};

		var coord = (utils.isArray(f)) ? f : [f, 1 - f];
<<<<<<< HEAD
		return toString(_.reduce(colors, (memo, col, idx) => addRGB(memo,toRGB(col,coord[idx])), {R:0, G:0, B:0}));
=======
		return toString(_.reduce(options.colors, (memo, col, idx) => addRGB(memo,toRGB(col,coord[idx])), {R:0, G:0, B:0}));
>>>>>>> develop
	
};

shader.shade = function(options,f){
<<<<<<< HEAD
	return f;
=======
	var val = f;
	if(!!options.shadings && options.shadings.length >= 2){
		val = options.shadings[0] + (options.shadings[1] - options.shadings[0]) * f;
	}
	return val;
>>>>>>> develop
};

var compute = function(mgr){
	switch(mgr.computation){
		case 'by index':
<<<<<<< HEAD
			return shader[mgr.type](mgr.options.colors,mgr.index / mgr.N);
		case 'explicit':
			return shader[mgr.type](mgr.options.colors,mgr.factor[mgr.index]);
=======
			return shader[mgr.type](mgr.options,mgr.index / mgr.N);
		case 'explicit':
			return shader[mgr.type](mgr.options,mgr.factor[mgr.index]);
		case 'by function':
			return !!mgr.shadeFunction ? mgr.shadeFunction(mgr.point) : 'black';
>>>>>>> develop
	}
};

// 
var fun = function(shade,points){

	if(utils.isNil(shade)){
		return;
	}

	var mgr = _.extend({},shade);
	mgr.N = points.length - 1;
	for(var i = 0; i < points.length; i++){
		mgr.index = i;
<<<<<<< HEAD
=======
		mgr.point = points[i];
>>>>>>> develop
		points[i][shade.type] = compute(mgr);
	}
};

module.exports = fun;
