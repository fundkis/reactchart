/*
 * Responsible for making the ds object:
 *
 * ds is { c : {min, max}, d: {min,max}}
 */
var _ = require('underscore');
var utils = require('./utils.cs.js');

/* If no marginsO are defined, here are the rules:
 *  - ticks and ticks labels are 20 px in the y dir (height of text),
 *			40 px in the x dir (length of text).
 *  - we take a 10px margin on title and labels
 *  - bottom and right margin:
 *			- 20px + ({x,y}LabelFSize + 10 px) if a {x,y}Label is defined,
 *  - top and left margin:
 *			- 20px + ({x,y}LabelFSize	+ 10 px) if a {x,y}Label is defined,
 *  - top margin takes a titleFSize + 10px more if a title is defined
 */
var defaults = {
	axis: {
		label: {
			x: 20,
			y: 20,
			mar: 10
		},
		ticks: {
			y: 20,
			X: 40
		}
	},
	title: 10,
	min: 0,
	max: 4
};

var roundDWorld = function(dWorld,isDate){

	var min = dWorld.min;
	var max = dWorld.max;
	var om = utils.orderMag(max - min);

	return {
		min: (isDate)? utils.date.closestRound(min,om,'down'):utils.nbr.closestRound(min,om,'down'),
		max: (isDate)? utils.date.closestRound(max,om,'up'):utils.nbr.closestRound(max,om,'up'),
	};

};

var m = {};

/* universe is {width , height}, this
 * is the total size of the svg picture.
 * The goal here is to compute the
 * world, i.e. the printed area
 *
 *				width
 * <------------------------>
 *  ________________________
 * |                        | ^
 * |   title/top axis       | |
 * |    ________________    | |
 * |   |                |   | |
 * |   |                |   | |
 * | 1 |                | 2 | |
 * |   |     WORLD      |   | | height
 * |   |                |   | |
 * |   |                |   | |
 * |   |________________|   | |
 * |                        | |
 * |   bottom axis          | |
 * |________________________| |
 *										^
 * 1 - left axis
 * 2 - right axis
 *
 *
 */

/*
 * We need to know some stuff to compute the margins:
 *
 *
 * title = {
 *  title: '', 
 *  titleFSize: 30
 * } if given
 *
 * universe = in coordinate space, length
 * 
 * borders = {
 *  axis: [{label: '', labelFSize: 15, placement: left}],
 *  marginsO: {l: 0,  r: 0}, 
 *  marginsI: {l: 10, r: 10}
 * } or
 * borders = {
 *  axis: [{label: '', labelFSize: 15, placement: bottom}],
 *  marginsO: {t: 0,  b: 0}, 
 *  marginsI: {t: 10, b: 10}
 * }
 *
 * marginsO is for the outer margin, it overrides any
 * computations of them du to title and axis definitions.
 * marginsI are the inner margins we add to the world to
 * have a more aesthetic view.
 *
 * If no marginsO are defined, here are the rules:
 *  - ticks and ticks labels are 20 px in the y dir (height of text),
 *			40 px in the x dir (length of text).
 *  - we take a 10px margin on title and labels
 *  - bottom and right margin:
 *			- 20px + ({x,y}LabelFSize + 10 px) if a {x,y}Label is defined,
 *  - top and left margin:
 *			- 20px + ({x,y}LabelFSize	+ 10 px) if a {x,y}Label is defined,
 *  - top margin takes a titleFSize + 10px more if a title is defined
 *
 * Then the data space is extended to the inner margin values,
 * then the data space can be even more extended to reach round values.
 *
 *	datas: {series:[{x:0, y:0}], stacked:'y', type:{ abs: 'number', ord: 'number'}], //
 *
 *
 * the cs/ds correspondance is found with:
 *    universe - marginsO - marginsI = datas
 */
var space = function(datas,universe,borders,title){
	// 1 - the coordinate space

		// get the (right,left) or (top,bottom)
		var places = [];
		for(var p in borders.marginsO){
			places.push(p);
		}

		// compute the world
		// universe-world margins
		// min and max of coord space
		// margins between borders and axis
		var margins = {};
		for(p  = 0; p < places.length; p++){
			margins[places[p]] = 0;
		}

		// fetch the margin (label + default) for an axis
		var margin = function(axis){
			var marg = defaults.axis[axis.placement];
			if(axis.label.length !== 0){
			marg += ( axis.labelFSize + defaults.axis.mar );
			}
			return marg;
		};

		// labels
		for(var l = 0; l < borders.axis.length; l++){
			var key = borders.axis[l].placement;
			margins[key] = Math.max(margins[key],margin(borders.axis[l]));
		}

		// title is at the top
		if(!!margins.top && !!title){
			margins.top += (title.length !== 0)?title.titleFSize + defaults.title:0;
		}

		// more suppleness, but less
		// efficiencies: automatic
		// margins computed whatever
		// happens, overwrite here
		// if defined
		for(p = 0; p < places.length; p++){
			var k = places[p];
			if(!utils.isNil(borders.marginsO[k])){
				margins[k] = borders.marginsO[k];
			}
		}

		// we have the world's corners
		// the transformation between data space and the world space is
		// given by data space scaled to (world size - inner margins) and
		// placed at (origin.x.x + inner x margin, origin.y.y - inner y margin)
		var min, max;
		var rmin, rmax;
		if(!!margins.left){
			min = margins.left;
			max = universe - margins.right;
			rmin = min + borders.marginsI.left;
			rmax = max - borders.marginsI.right;
		}else{
			min = universe - margins.bottom;
			max = margins.top;
			rmin = min - borders.marginsI.bottom;
			rmax = max + borders.marginsI.top;
		}

		var cWorld = {
			min: min,
			max: max
		};
		var rawCWorld = {
			min: rmin,
			max: rmax
		};

	// 2 - the data space
	// either data defined or explicitely defined
		var minVals = (vals) => {
			return utils.isDate(vals[0])? utils.date.min(vals) : utils.nbr.min(vals);
		};
		var maxVals = (vals) => {
			return utils.isDate(vals[0])? utils.date.max(vals) : utils.nbr.max(vals);
		};


		var bounds = {
			min: minVals(datas),
			max: maxVals(datas)
		};
		// empty graph
		if(!isFinite(bounds.min)){
			bounds.min = 0;
		}
		if(!isFinite(bounds.max)){
			bounds.max = 4;
		}

		var multiply = (val,fac) => {
			return ( utils.isDate(val) ) ?  new Date(val.getTime() * fac):val * fac;
		};

		var subtract = (val1,val2) => {
			return ( utils.isDate(val1) ) ?  val1.getTime() - val2.getTime() : val1 - val2;
		};

		var divide = (val,fac) => {
			return ( utils.isDate(val) ) ?  val.getTime() / fac : val / fac;
		};

		// règle de trois
		var rawDWorld = {
			min: multiply(bounds.min, cWorld.min / rawCWorld.min),
			max: multiply(bounds.max, cWorld.max / rawCWorld.max)
		};

		var isDate = (!!_.find(datas, (value) => {return utils.isDate(value);}))?true:false;
		var dWorld = roundDWorld(rawDWorld,isDate);

/**
 * ds is { 
    c : {
      min, 
      max
    }, 
    d: {
      min,
      max
    }, 
    c2d , 
    d2c
  }
*/
		return {
			c: {
				min: cWorld.min,
				max: cWorld.max,
			},
			d: {
				min: dWorld.min,
				max: dWorld.max,
			},
			d2c: divide(cWorld.max - cWorld.min, subtract( dWorld.max , dWorld.min ) ),
			c2d: divide ( subtract(dWorld.max, dWorld.min) , cWorld.max - cWorld.min ) 
		};

};

m.spaces = function(datas,universe,borders,title){

	var filter = (datas,dir) => {
		return _.map(datas, (serie) => {
			return _.map(serie.series, (point,idx) => {
				return (utils.isString(point[dir]))?idx:point[dir];
				});
			});
	};

	// worlds = (l,b), (l,t), (r,b), (r,t)
	var rights = filter(_.filter(datas,(series) => {return !!series.ord            && series.ord.axis === 'right';}),  'y');
	var lefts  = filter(_.filter(datas,(series) => {return utils.isNil(series.ord) || series.ord.axis === 'left';}),   'y');
	var top    = filter(_.filter(datas,(series) => {return !!series.abs            && series.abs.axis === 'top';}),    'x');
	var bottom = filter(_.filter(datas,(series) => {return utils.isNil(series.abs) || series.abs.axis === 'bottom';}), 'x');

	var bordersy = {
		marginsO: {top: borders.marginsO.top, b: borders.marginsO.bottom},
		marginsI: {top: borders.marginsI.top, b: borders.marginsI.bottom},
		axis: borders.abs
	};

	var bordersx = {
		marginsO: {left: borders.marginsO.left, right: borders.marginsO.right},
		marginsI: {left: borders.marginsI.left, right: borders.marginsI.right},
		axis: borders.ord
	};

	return {
		y: {
			left:  space(lefts, universe.height,bordersy,title),
			right: space(rights,universe.height,bordersy,title)
		}, 
		x: {
			bottom: space(bottom,universe.width,bordersx),
			top:    space(top,   universe.width,bordersx)
		}
	};
};

module.exports = m;
