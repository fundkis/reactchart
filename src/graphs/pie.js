let _ = require('underscore');
let space = require('../core/space-transf.js');
let utils = require('../core/utils.js');
let color = require('../core/colorMgr.js');

let m = {

	VM: function(serie,props,ds){

		let sum		 = _.reduce(serie, (memo, value) => memo + value.value, 0);
		let positions = _.map(serie, (point,idx) => {return {
			value: Math.max(Math.min(point.value/sum * 360,360),0),
			color: point.color || color(idx)
		};});

		let origin = {
			x: space.toC(ds.x, props.pieOrigin.x + (ds.x.d.max + ds.x.d.min)/2),
			y: space.toC(ds.y, props.pieOrigin.y + (ds.y.d.max + ds.y.d.min)/2)
		};

		let labels = [];
		if(props.tag.show){
			labels = _.map(serie, (val) => props.tag.print(val.tag));
		}

		let maxR = Math.min( space.toCwidth(ds.x,ds.x.d.max - ds.x.d.min) / 2, space.toCwidth(ds.y,ds.y.d.max - ds.y.d.min) / 2);

		let radius = utils.isNil(props.pieRadius) ? maxR : Math.min(maxR,props.pieRadius);

		return {
			ds: ds,
			fill: props.pie !== 'tore',
			positions: positions,
			origin: origin,
			radius: radius,
			toreRadius: props.pieToreRadius * radius,
			labels: labels,
			pinRadius: props.tag.pinRadius * radius,
			pinLength: props.tag.pinLength * radius,
			pinHook: props.tag.pinHook,
			pinDraw: props.tag.pin,
			pinFontSize: props.tag.fontSize
		};
	}
};

module.exports = m;
