let utils = require('../core/utils.js');
let m = {};

m.VM = function(position,props,ds,key,pin){

	let defSpan = {
		x: utils.isDate(position.x) ? utils.makePeriod({months: 3}) : 0.5,
		y: utils.isDate(position.y) ? utils.makePeriod({months: 3}) : 0.5
	};

	let draw = props.markProps.draw || position.draw || false;
	let color = position.color || props.markProps.color || props.markColor || props.color || 'black';
	let width = position.width || props.markProps.width || draw ? 1 : 0;
	let fill = position.fill || props.markProps.fill || color;
	let shade = position.shade || props.markProps.shade || 1;
	let span = position.span || props.span || defSpan;

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
