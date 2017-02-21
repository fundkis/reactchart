let utils = require('../core/utils.js');
let _ = require('underscore');

let m ={};

m.VM = function(serie,props,ds){

	// easy stuff
	let color = props.color || 'back';
	let fill = props.fill || 'none';
	let	width = utils.isNil(props.width) ? 1 : props.width; // 0 is valid
	let shade = props.shade || 1;

	let positions = _.map(serie, (point) => {return {x: point.x, y: point.y};});
	let drops = _.map(serie, (point) => {return {x: point.drop.x, y: point.drop.y};});

	let clx = false;
	let cly = fill !== 'none';

	let dlx = props.dropLine.x || false;
	let dly = props.dropLine.y || false;

 return {
		ds: ds,
		color: color,
		fill: fill,
		shade: shade,
		width: width,
		positions: positions,
		drops: drops,
		close: {
			x: clx,
			y: cly
		},
		dropLine: {
			x: dlx,
			y: dly
		}
	};

};

module.exports = m;
