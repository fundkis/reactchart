var utils = require('../core/utils.cs.js');
var _ = require('underscore');
var shader = require('../core/colorMgr.cs.js');

var m ={};

m.VM = function(serie,props,ds){

	// easy stuff
	var color = props.color || 'back';
	var fill = props.fill || 'none';
	var	width = utils.isNil(props.width) ? 1 : props.width; // 0 is valid
	var stairs = props.stairs || 'right';
	var shade = props.shade || 1;

	var positions = _.map(serie, (point) => {return {x: point.x, y: point.y};});
	var drops = _.map(serie, (point) => {return {x: point.drop.x, y: point.drop.y};});

	// color can be bin-defined
	// 1 - a shader
	if(!utils.isNil(props.shader) && props.shader.type === 'fill'){ // we don't care about 'color'
		shader(props.shader,positions);
	}

	// 2 - explicit, takes precedence
	_.each(serie, (point,idx) => {
		if(!utils.isNil(point.fill)){
			positions[idx].fill = point.fill;
		}
	});

	var dlx = props.dropLine.x || false;
	var dly = props.dropLine.y || false;

 return {
		ds: ds,
		color: color,
		fill: fill,
		shade: shade,
		width: width,
		stairs: stairs,
		positions: positions,
		drops: drops,
		dropLine: {
			x: dlx,
			y: dly
		}
	};

};

module.exports = m;
