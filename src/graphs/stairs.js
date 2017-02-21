let utils = require('../core/utils.js');
let _ = require('underscore');
let shader = require('../core/colorMgr.js');

let m ={};

m.VM = function(serie,props,ds){

	// easy stuff
	let color = props.color || 'back';
	let fill = props.fill || 'none';
	let	width = utils.isNil(props.width) ? 1 : props.width; // 0 is valid
	let stairs = props.stairs || 'right';
	let shade = props.shade || 1;

	let positions = _.map(serie, (point) => {return {x: point.x, y: point.y};});
	let drops = _.map(serie, (point) => {return {x: point.drop.x, y: point.drop.y};});

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

	let dlx = props.dropLine.x || false;
	let dly = props.dropLine.y || false;

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
