var utils = require('../core/utils.js');
var m = {};

m.VM = function(position,props,ds,key,pin){

	var dir = utils.isNil(position.drop.x) ? 'x' : 'y';
	var defSpan = utils.isDate(position[dir]) ? utils.makePeriod({months: 3}) : 0.5;

	var draw = props.markProps.draw || position.draw || false;
	var color = position.color || props.markProps.color || props.markColor || props.color || 'black';
	var width = position.width || props.markProps.width || draw ? 1 : 0;
	var fill = position.fill || props.markProps.fill || color;
	var shade = position.shade || props.markProps.shade || 1;
	var span = position.span || props.span || defSpan;

	return {
		key: key,
		draw: draw,
		ds: ds,
		position: {
			x: position.x,
			y: position.y
		},
		drop:{
			x: position.drop.x,
			y: position.drop.y
		},
		span: span,
		color: color,
		width: width,
		fill: fill,
		shade: shade,
		pin: pin
	};

};

module.exports = m;
