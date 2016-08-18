var _ = require('underscore');
var utils = require('./utils.js');

var palette = [ "#3A83F1", "#DC3FF1", "#F2693F", "#8AF23F", "#758d99",
	"#F1DC41", "#AC310C", "#40C8F2", "#980DAB", "#F6799B", "#9679F6", "#EE2038",
	"#00994D", "#758D99", "#F141AD", "#0C86AC", "#C729C7", "#D26F13", "#092508",
	"#FFBACD", "#7CB603", "#4088EC", "#46002C", "#FF5478", "#43859E", "#72680F",
	"#97E6EC", "#F777BE", "#AE241F", "#35457B", "#CCA9EF", "#4A0202", "#DDDF14",
	"#870062", "#B573F2", "#08B83C", "#F59288", "#056EFC", "#2D1B19", "#3AA676",
	"#2E5045", "#AFE9AA", "#F3D6C2", "#69F393", "#BFFA57", "#FA2C4B", "#355801",
	"#258B85", "#845100", "#14546B", "#034A29", "#B81288", "#F64BB2", "#D1C2EC",
	"#83A3F0", "#FEBCA3", "#362463", "#FDB2EA", "#FD981F", "#49F9DF", "#2490C0",
	"#282807", "#26C186", "#8D54CE", "#6D1662", "#57F2BD"];

var shader = {};
shader.color = function(options,f){

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
		return toString(_.reduce(options.colors, (memo, col, idx) => addRGB(memo,toRGB(col,coord[idx])), {R:0, G:0, B:0}));
	
};

shader.shade = function(options,f){
	var val = f;
	if(!!options.shadings && options.shadings.length >= 2){
		val = options.shadings[0] + (options.shadings[1] - options.shadings[0]) * f;
	}
	return val;
};

var compute = function(mgr){
	switch(mgr.computation){
		case 'by index':
			return shader[mgr.type](mgr.options,mgr.index / mgr.N);
		case 'explicit':
			return shader[mgr.type](mgr.options,mgr.factor[mgr.index]);
		case 'by function':
			return !!mgr.shadeFunction ? mgr.shadeFunction(mgr.point) : 'black';
	}
};

// 
var fun = function(shade,points){

	if(utils.isNil(shade)){
		return;
	}

	if(utils.isNil(points) && typeof shade === 'number'){
		return palette[shade];
	}

	var mgr = _.extend({},shade);
	mgr.N = points.length - 1;
	for(var i = 0; i < points.length; i++){
		mgr.index = i;
		mgr.point = points[i];
		points[i][shade.type] = compute(mgr);
	}
};

module.exports = fun;
