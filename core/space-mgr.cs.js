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
			bottom: 20,
			top: 20,
			left: 20,
			right: 20,
			mar: 10
		},
		ticks: {
			left: 20,
			right: 20,
			bottom: 15,
			top: 15
		},
		min: 3
	},
	title: 10,
	min: 0,
	max: 4
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
 *  marginsI: {l: 10, r: 10},
 *  min: ,
 *  max:
 * } or
 * borders = {
 *  axis: [{label: '', labelFSize: 15, placement: bottom}],
 *  marginsO: {t: 0,  b: 0}, 
 *  marginsI: {t: 10, b: 10},
 *  min: ,
 *  max:
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
		// if no data, we don't waste time
		if(datas.length === 0){
			return null;
		}

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

		// fetch the margin (label + ticks + default) for an axis
		var margin = function(axis){
			var marg = defaults.axis.label[axis.placement];
			if(!axis.empty){
				marg += defaults.axis.ticks[axis.placement];
			}
			if(axis.label.length !== 0){
			marg += ( axis.labelFSize + defaults.axis.label.mar );
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
			margins[k] = Math.max(margins[k],defaults.axis.min);
		}

		// we have the world's corners
		// the transformation between data space and the world space is
		// given by data space scaled to (world size - inner margins) and
		// placed at (origin.x.x + inner x margin, origin.y.y - inner y margin)
		var min, max;
		var rmin, rmax;
		if(utils.isNil(margins.left)){
			min = universe - margins.bottom;
			max = margins.top;
			rmin = min - borders.marginsI.bottom;
			rmax = max + borders.marginsI.top;
		}else{
			min = margins.left;
			max = universe - margins.right;
			rmin = min + borders.marginsI.left;
			rmax = max - borders.marginsI.right;
		}

		var cWorld = {
			min: min,
			max: max
		};
		var posCWorld = {
			min: rmin,
			max: rmax
		};

	// 2 - the data space

		var allValues = _.flatten(datas);

		var mgr = (allValues.length === 0)?utils.mgr(5):utils.mgr(allValues[0]);

	// either data defined or explicitely defined
		var minVals = (vals) => {
      if(vals.length === 0){
        return null;
      }

			return mgr.min(vals);
		};

		var maxVals = (vals) => {
      if(vals.length === 0){
        return null;
      }

			return mgr.max(vals);
		};


		var bounds = {
			min: minVals(allValues),
			max: maxVals(allValues)
		};
		// empty graph
		if(!isFinite(bounds.min)){
			bounds.min = 0;
		}
		if(!isFinite(bounds.max)){
			bounds.max = 4;
		}

		// on augmente la distance totale
		var cRelMinMore = Math.abs( (cWorld.min - posCWorld.min) / (posCWorld.max - posCWorld.min) );
		var cRelMaxMore = Math.abs( (cWorld.max - posCWorld.max) / (posCWorld.max - posCWorld.min) );
		var dMinMore = mgr.multiply(mgr.distance(bounds.max,bounds.min),cRelMinMore);
		var dMaxMore = mgr.multiply(mgr.distance(bounds.max,bounds.min),cRelMaxMore);
		var dWorld = {
			min: mgr.subtract(bounds.min, dMinMore),
			max: mgr.add(bounds.max, dMaxMore)
		};

		// si imposé par l'utilisateur
		if(!utils.isNil(borders.min)){
			dWorld.min = borders.min;
		}
		if(!utils.isNil(borders.max)){
			dWorld.max = borders.max;
		}

		// on s'assure que ce sera toujours > 0, peu importe ce que dit l'user
		if(dWorld.min - dWorld.max === 0){
			dWorld.min = mgr.subtract(bounds.min, mgr.smallestStep());
			dWorld.max = mgr.add(bounds.max, mgr.smallestStep());
		}

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
		var fromCtoD = mgr.getValue( mgr.divide( mgr.distance( dWorld.max , dWorld.min ), cWorld.max - cWorld.min));
		return {
			c: {
				min: cWorld.min,
				max: cWorld.max,
			},
			d: {
				min: dWorld.min,
				max: dWorld.max,
			},
			d2c: 1 / fromCtoD,
			c2d: fromCtoD
		};

};

m.spaces = function(datas,universe,borders,title){

	var filter = (datas,dir) => {
		return _.map(datas, (serie) => {
			// global characteristics
			var offset = serie.offset;
			var span = serie.span;
			var loff = serie.limitOffset;
			var limOfIdx = utils.isNil(loff) ? -1 : loff > 0 ? serie.series.length - 1: 0;
			return _.map(serie.series, (point,idx) => {
					// if label
					if(utils.isString(point[dir])){
						return idx;
					}
					var val = point[dir];
					// modifiers are span, drop and offset
					// offset changes the value
					if(!utils.isNil(offset) && !utils.isNil(offset[dir])){
						var mgr = utils.mgr(val);
						val = mgr.add(val,offset[dir]);
					}
					// drop adds a value
					if(!utils.isNil(point.drop) && !utils.isNil(point.drop[dir])){
						val = [val];
						val.push(point.drop[dir]);
					}

					// offset can be a point def
					if(!utils.isNil(point.offset) && !utils.isNil(point.offset[dir])){
						var pmgr = utils.mgr(val);
						val = pmgr.add(val,point.offset[dir]);
					}

					// span makes value into two values, in the other direction than drop
					if(!utils.isNil(span) && !utils.isNil(point.drop) && utils.isNil(point.drop[dir])){
						val = [val];
						var mm = utils.mgr(val[0]);
						val[0] = mm.subtract(val[0],mm.divide(span,2));
						val.push(mm.add(val[0],span));
					}

					// span can be a point def
					if(!utils.isNil(point.span) && !utils.isNil(point.drop) && utils.isNil(point.drop[dir])){
						val = [val];
						var pmm = utils.mgr(val[0]);
						val[0] = pmm.subtract(val[0],pmm.divide(point.span,2));
						val.push(pmm.add(val[0],point.span));
					}

					// limitOffset changes only one boundary
					if(limOfIdx === idx){
						val += loff;
					}
					return val;
				});
			});
	};

	var ob = {right: 'ord', left: 'ord', top: 'abs', bottom: 'abs'};
	var dats = {};
	for(var w in ob){
		dats[w] = _.filter(datas,(series) => {return !!series[ob[w]] && series[ob[w]].axis === w;});
	}

	var mins = {};
	var maxs = {};
	for(w in ob){
		mins[w] = null;
		maxs[w] = null;
		for(var i = 0; i < borders[ob[w]].length; i++){
			if(borders[ob[w]][i].placement !== w){
				continue;
			}
			// min
			var mgr;
			if(!utils.isNil(borders[ob[w]][i].min)){
				mgr = utils.mgr(borders[ob[w]][i].min);
				if(utils.isNil(mins[w]) || mgr.lowerThan(borders[ob[w]][i].min,mins[w])){
					mins[w] = borders[ob[w]][i].min;
				}
			}
			// max
			if(!utils.isNil(borders[ob[w]][i].max)){
				mgr = utils.mgr(borders[ob[w]][i].max);
				if(utils.isNil(maxs[w]) || mgr.greaterThan(borders[ob[w]][i].max,maxs[w])){
					maxs[w] = borders[ob[w]][i].max;
				}
			}
		}
	}

	// worlds = (l,b), (l,t), (r,b), (r,t)
	var rights = filter(dats.right,  'y');
	var lefts  = filter(dats.left,   'y');
	var top    = filter(dats.top,    'x');
	var bottom = filter(dats.bottom, 'x');


	var border = {};
	border.ord = {
		marginsO: {top: borders.marginsO.top, bottom: borders.marginsO.bottom},
		marginsI: {top: borders.marginsI.top, bottom: borders.marginsI.bottom},
		axis: borders.abs
	};

	border.abs = {
		marginsO: {left: borders.marginsO.left, right: borders.marginsO.right},
		marginsI: {left: borders.marginsI.left, right: borders.marginsI.right},
		axis: borders.ord
	};

	var bor = {};
	for(w in ob){
		// copy/expand
		bor[w] = _.extend(_.extend({},border[ob[w]]), {min: mins[w], max: maxs[w]});
	}
	

	return {
		y: {
			left:  space(lefts, universe.height,bor.left,title),
			right: space(rights,universe.height,bor.right,title)
		}, 
		x: {
			bottom: space(bottom,universe.width,bor.bottom),
			top:    space(top,   universe.width,bor.top)
		}
	};
};

module.exports = m;
