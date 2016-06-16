var _ = require('underscore');
var utils = require('../core/utils.cs.js');
var ticker = require('../core/ticker.cs.js');

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
			ds: {x, y},
			length: ,
			dir: {x, y},
			width: ,
			out:
		},

	// tick label
		label: Label = {
			ds: {x:, y: },
			position: {x: , y:},
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

m.VM = function(ds,partner, bounds, dir, locProps, comFac, axisKey){

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
	var ticksLabel = locProps.tickLabels;
	// do we want the minor ticks to be computed?
	// do we want the minor grid?
	var minor = (minProps.show === true || locProps.grid.minor.show === true);

	return _.map(ticker.ticks(min,max,ticksLabel,minor,comFac), (tick,idx) => {
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
		ticksProps.ds = ds;

		ticksProps.dir = {};
		ticksProps.dir[dir] = 0;
		ticksProps.dir[othdir] =  locProps.placement === 'right' || locProps.placement === 'top' ? -1 : 1;

		if(tick.extra){
			ticksProps.show = tick.show;
		}

		var mgr = {
			x: utils.mgr(ticksProps.position.x),
			y: utils.mgr(ticksProps.position.y)
		};

/*
		label: Label = {
			ds: {x:, y: },
			position: {x: , y:},
			label: '',
			FSize: ,
			offset: {x, y},
			anchor: '',
			color: '',
			dir: {x, y}
		}
*/

		var labelProps = {
			ds: ds,
			label:  p.labelize(tick.position) === false ? tick.label : p.labelize(tick.position),
			FSize:  p.labelFSize || 15,
			color:  p.labelColor,
			rotate: false,
			transform: true
		};
		labelProps.dir = {};
		labelProps.dir[dir] = locProps.placement === 'top' || locProps.placement === 'right' ? -1 : 1;
		labelProps.dir[othdir] = 0;


		var addPerp =  tick.minor ? 3.75 : 0;
		var offsetCspace = {
			x: p.labelOffset.x, 
			y: tick.offset.perp + addPerp + p.labelOffset.y 
		};

		var offset = {
			x: labelProps.dir.x !== 0 ? tick.offset.along : 0,
			y: labelProps.dir.y !== 0 ? tick.offset.along : 0
		};

		// adding a little margin
		// & anchoring the text
		var fd = 0.25 * labelProps.FSize; // font depth, 25 %
		var fh = 0.75 * labelProps.FSize; // font height, 75 %
		var defOff = 8;

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
							y: fd
						}
					};
				case 'right':
					return {
						anchor: 'start',
						off: {
							x: defOff,
							y: fd
						}
					};
				default:
					throw new Error('Where is this axis: ' + locProps.placement);
			}
		})();
		labelProps.anchor = anchor.anchor;
		offsetCspace.x += anchor.off.x;
		offsetCspace.y += anchor.off.y;
		if(locProps.placement === 'left'){
			offsetCspace.x *= -1;
		}

		labelProps.position = {
			x: mgr.x.add(ticksProps.position.x,offset.x),
			y: mgr.y.add(ticksProps.position.y,offset.y)
		};

		labelProps.offset = offsetCspace;


/*
		grid: {
			show: true || false,
			color: '',
			length: ,
			width: 
		},
*/
			var gridProps = {};
			p = tick.extra ? tick.grid : tick.minor ? minGrid : majGrid;
			tmp = {
				show: true,
				color: true,
				width: true
			};

			for(u in tmp){
				gridProps[u] = p[u];
			}
			gridProps.length = partner.length;

		var tickKey = axisKey + '.t.' + idx;
		return {
			key: tickKey,
			tick: ticksProps,
			grid: gridProps,
			label: labelProps
		};

	});
};

module.exports = m;
