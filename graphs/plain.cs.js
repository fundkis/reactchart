var utils = require('../core/utils.cs.js');
var _ = require('underscore');

var m ={};

m.VM = function(serie,props,ds){

	// easy stuff
	var color = props.color || 'back';
	var fill = props.fill || 'none';
	var	width = utils.isNil(props.width) ? 1 : props.width; // 0 is valid
	var shade = props.shade || 1;

	var positions = _.map(serie, (point) => {return {x: point.x, y: point.y};});
	var drops = _.map(serie, (point) => {return {x: point.drop.x, y: point.drop.y};});

	var clx = false;
	var cly = fill !== 'none';

	var dlx = props.dropLine.x || false;
	var dly = props.dropLine.y || false;

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
