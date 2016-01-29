var _ = require('underscore');
var ticker = require('../core/ticker.cs.js');
var sp = require('../core/space-transf.cs.js');

/*
	{
		// long thin grey line
		grid: {
			show: true || false,
			color: '',
			length: ,
			width: 
		},

	// tick
		tick: {
			show: true || false,
			color: '',
			position: {x, y},
			length: ,
			dir: {x, y},
			width: ,
			out:
		},

	// tick label
		label: Label = {
			label: '',
			FSize: ,
			offset: {x, y},
			anchor: '',
			color: '',
			dir: {x, y}
		}
	}
*/

var m = {};

m.VM = function(ds,partner, bounds, dir, locProps, comFac){

	//// general defs

	var othdir = dir === 'x' ? 'y' : 'x';


	// min max of the axis
	var min = bounds.min;
	var max = bounds.max;

	// all ticks are computed along, we need to 
	// know for each tick which it is
	var majProps = locProps.ticks.major;
	var minProps = locProps.ticks.minor;
	var majGrid = locProps.grid.major;
	var minGrid = locProps.grid.minor;

	// do we have labels? Only majorTicks
	var ticksLabel = locProps.ticksLabel;
	// do we want the minor ticks to be computed?
	// do we want the minor grid?
	var minor = (minProps.show === true || locProps.grid.minor.show === true);

	return _.map(ticker.ticks(min,max,ticksLabel,minor,comFac), (tick) => {
/*
		tick: {
			show: true || false,
			color: '',
			position: {x, y},
			length: ,
			dir: {x, y},
			width: ,
			out:
		},
*/
		var ticksProps = {};
		var p = tick.minor ? minProps : majProps;
		var tmp = {
			show: true,
			color: true,
			length: true,
			out: true,
			width: true
		};

		for(var u in tmp){
			ticksProps[u] = p[u];
		}
		ticksProps.position = {};
		ticksProps.position[dir] = tick.position;
		ticksProps.position[othdir] = partner.pos;

		ticksProps.dir = {};
		ticksProps.dir[dir] = 1;
		ticksProps.dir[othdir] = 0;

/*
		label: Label = {
			label: '',
			FSize: ,
			offset: {x, y},
			anchor: '',
			color: '',
			dir: {x, y}
		}
*/

		var labelProps = {
			label:  p.label.length === 0 ? p.labelize(tick.position) : p.label,
			FSize:  p.labeLFSize,
			offset: p.labelOffset,
			color:  p.labelColor,
		};
		labelProps.dir = {};
		labelProps.dir[dir] = 0;
		labelProps.dir[othdir] = 1;


		var addPerp =  tick.minor ? 3.75 : 0;
		var offset = {
			x: sp.toCwidth(ds.x,tick.offset.along) * labelProps.dir.x + ( tick.offset.perp + addPerp ) * labelProps.dir.y, 
			y: sp.toCwidth(ds.y,tick.offset.along) * labelProps.dir.y + ( tick.offset.perp + addPerp ) * labelProps.dir.x 
		};

		// adding a little margin
		// & anchoring the text
		var fd = 0.25 * labelProps.FSize; // font depth, 25 %
		var fh = 0.75 * labelProps.FSize; // font height, 75 %
		var defOff = 5;

		var anchor = (() => {
			switch(locProps.placement){
				case 'top':
					return {
						anchor: 'middle',
						off: {
							x: 0,
							y: fd + defOff
						}
					};
				case 'bottom':
					return {
						anchor: 'middle',
						off: {
							x: 0,
							y: fh + defOff
						}
					};
				case 'left':
					return {
						anchor: 'end',
						off: {
							x: defOff,
							y: 0
						}
					};
				case 'right':
					return {
						anchor: 'start',
						off: {
							x: defOff,
							y: 0
						}
					};
				default:
					throw new Error('Where is this axis: ' + locProps.placement);
			}
		})();
		labelProps.anchor = anchor.anchor;
		offset.x += anchor.off.x;
		offset.y += anchor.off.y;
		if(locProps.placement === 'left'){
			offset.x *= -1;
		}


		labelProps.position = {
			x: ticksProps.position.x + offset.x,
			y: ticksProps.position.y - offset.y
		};


/*
		grid: {
			show: true || false,
			color: '',
			length: ,
			width: 
		},
*/
			var gridProps = {};
			p = tick.minor ? minGrid : majGrid;
			tmp = {
				show: true,
				color: true,
				width: true
			};

			for(u in tmp){
				gridProps[u] = p[u];
			}
			gridProps.length = partner.length;


		return {
			tick: ticksProps,
			grid: gridProps,
			label: labelProps
		};

	});
};

module.exports = m;
