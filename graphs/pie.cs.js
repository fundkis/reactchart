var _ = require('underscore');
var space = require('../core/space-transf.cs.js');

var m = {

	VM: function(serie,props,ds){

		var sum    = _.reduce(serie, (memo, value) => memo + value.value, 0);
		var positions = _.map(serie, (point) => {return {
			value: Math.max(Math.min(point.value/sum * 360,360),0),
			color: point.color
		};});

		var origin = {
			x: space.toC(ds.x, props.pieOrigin.x + (ds.x.d.max + ds.x.d.min)/2),
			y: space.toC(ds.y, props.pieOrigin.y + (ds.y.d.max + ds.y.d.min)/2)
		};

		var labels = [];
		if(props.showPieLabel){
			labels = _.map(serie, (val) => val.tag);
		}

		return {
			ds: ds,
			fill: props.pie !== 'tore',
			positions: positions,
			origin: origin,
			radius: props.pieRadius,
			toreRadius: props.pieToreRadius,
			labels: labels,
			pinRadius: props.piePinRadius,
			pinHook: props.piePinHook
		};
	}
};

module.exports = m;
