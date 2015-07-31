/*
 * Responsible for making the ds object:
 *
 * ds is { c : {min, max}, d: {min,max}}
 */

var _ = require('underscore');
var space = require('./space-transf.cs.js');
var stepMgr = require('../base/ticker.cs.js');

var m = {};

/* universe is {width , height}, this
 * is the total size of the svg picture.
 * The goal here is to compute the
 * world, i.e. the printed area
 *
 *				width
 * <------------------------>
 *  ________________________
 * |								 | ^
 * |	title/top axis			 | |
 * |	  ________________	 | |
 * |	 |						|	 | |
 * |	 |						|	 | |
 * | 1 |						| 2 | |
 * |	 |		  WORLD		|	 | | height
 * |	 |						|	 | |
 * |	 |						|	 | |
 * |	 |________________|	 | |
 * |								 | |
 * |	bottom axis				 | |
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
 *  - axis.xLabel
 *  - axis.xLabelFSize
 *  - axis.yLabel
 *  - axis.yLabelFSize
 *  - axis.xPlace ('top' || 'bottom')
 *  - axis.yPlace ('left' || 'right')
 *  - axis.marginsO.t
 *  - axis.marginsO.b
 *  - axis.marginsO.l
 *  - axis.marginsO.r
 *  - axis.marginsI.t
 *  - axis.marginsI.b
 *  - axis.marginsI.l
 *  - axis.marginsI.r
 *
 *  - title.title
 *  - title.titleFSize
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
 *
 *	datas: {serie:[{ type : 'curve', data : {serie:[{x:0, y:0}], type:'number'}, axe : 'left', color: 'black'}]}, //
 */
m.space = function(datas,universe,axis,title){
	// 1 - the coordinate space
		// compute the world
			// universe-world margins
		var xlm = 0.0;
		var xrm = 0.0;
		var ytm = 0.0;
		var ybm = 0.0;

		// min and max of coord space
		var xcmin = 0.0;
		var xcmax = 0.0;
		var ycmin = 0.0;
		var ycmax = 0.0;
		// nothing to compute,
		// we require ALL the margins to
		// be defined
		// TODO more suppleness
		if(!!axis.marginsO 	&& 
			!!axis.marginsO.l && 
			!!axis.marginsO.r && 
			!!axis.marginsO.t && 
			!!axis.marginsO.b){
			xlm = axis.marginsO.l;
			xrm = axis.marginsO.r;
			ytm = axis.marginsO.t;
			ybm = axis.marginsO.b;

		}else{

			// labels
			var yl = (axis.xLabel.length !== 0)?axis.xLabelFSize + 10.0:0.0; // we hardcode a 10px margin on labels
			var xl = (axis.yLabel.length !== 0)?axis.yLabelFSize + 10.0:0.0;

			// title is at the top
			ytm += (title.length !== 0)?title.titleFSize + 10.0:0.0;

			// default margin for ticks is 20px for the y dir,
         // 40px for the x dir
			var defy = 20.0;
			var defx = 40.0;

			// x
			switch(axis.xPlace){
			case 'bottom':
				ybm += defy + yl; 
				break;
			case 'top':
				ytm += defy + yl; 
				break;
			default:
				throw 'Illegal value for "xaxis" prop. Use "bottom" or "top" instead of "' + this.props.xaxis + '"';
			}
			// y
			switch (axis.yPlace){
			case 'left':
				xlm += defx + xl;
				break;
			case 'right':
				xrm += defx + xl;
				break;
			default:
				throw 'Illegal value for "yaxis" prop. Use "left" or "right" instead of "' + this.props.yaxis + '"';
			}

		} // end if(!!axis.marginO)

		ycmin = universe.height - ybm;
		ycmax = ytm;
		xcmin = xlm;
		xcmax = universe.width - xrm;


		// we have the world's corners
		// the transformation between data space and the world space is
		// given by data space scaled to (world size - inner margins) and
		// placed at (origin.x.x + inner x margin, origin.y.y - inner y margin)
		// c : outer margins
		// p : inner margins
		var xpmin = xcmin + axis.marginsI.l;
		var xpmax = xcmax - axis.marginsI.r;
		var ypmin = ycmin - axis.marginsI.b;
		var ypmax = ycmax + axis.marginsI.t;

	// 2 - the data space
	// either data defined or explicitely defined

		var data_min_max = function(series,what,defmin,defmax,pmin,pmax,cmin,cmax){
			// locally defined
			var toAbs = function(point){
				return (datas.type === 'date')?point.x.getTime():point.x;
			};
			// min of all the abscissa: from inner to outer:
			// for a (abs,y) point, get the abscissa, -> {abs}
			var points = _.map(series, function(dataP) {
				return _.map(dataP.data.series,function(point){return {x: toAbs(point), y: point.y};}
				);});
			// do that for all points in the graph -> [abs, abs, ...]
			// do that for all graph -> [[abs],[abs],...]
			// flatten this array of arrays -> [abs, abs, ...]
			var allValues = _.flatten(_.map(points,function(graph){
				return _.map(graph,function(point){
					return point[what];
				});
			}));
			// get the min
			var min = (allValues.length !== 0)?_.min(allValues):defmin;
			// get the max
			var max = (allValues.length !== 0)?_.max(allValues):defmax;

			// rescaling, here we have the inner part of
			// world
			var tmpDs = {
				c:{
					min:pmin, 
					max:pmax
				},
				d:{
					min: min, 
					max: max
				}, 
				c2d:(max - min)/(pmax - pmin), 
				d2c:(pmax - pmin)/(max - min)
			};

			// extend data to full world
			max = space.toD(tmpDs,cmax);
			min = space.toD(tmpDs,cmin);

			return {min: min, max: max};
		};



	// first, treating data to have points = [ [ {x, y} || {Date, y} ] ]
	//	datas: {serie:[{ type : 'curve', data : {serie:[{x:0, y:0}]}, axe : 'left', color: 'black'}], type:'number'}

	// if we have empty points, we define default so the graph can still
	// be alive with axis and empty curves

		var dxmindef = (datas.type === 'date')?1000:1.0;
		var dxmaxdef = (datas.type === 'date')?4000:4.0;
		var dymindef = 1.0;
		var dymaxdef = 4.0;
		var xdmin = 0.0;
		var xdmax = 0.0;
		var ydmin = 0.0;
		var ydmax = 0.0;

		
		var xbounds = data_min_max(datas.series,'x',dxmindef,dxmaxdef,xpmin,xpmax,xcmin,xcmax);
		xdmin = xbounds.min;
		xdmax = xbounds.max;

		var ybounds = data_min_max(datas.series,'y',dymindef,dymaxdef,ypmin,ypmax,ycmin,ycmax);
		ydmin = ybounds.min;
		ydmax = ybounds.max;

		// if explicitely defined
		if(datas.xmin !== undefined){
			xdmin = datas.xmin;
		}
		if(datas.xmax !== undefined){
			xdmax = datas.xmax;
		}
		if(datas.ymin !== undefined){
			ydmin = datas.ymin;
		}
		if(datas.ymax !== undefined){
			ydmax = datas.ymax;
		}


		var ds = {};
		ds.x = {
			c:{
				min: xcmin, 
				max: xcmax
			}, 
			d:{
				min: xdmin,
				max: xdmax
			},
			d2c: (xcmax - xcmin) / (xdmax - xdmin),
			c2d: (xdmax - xdmin) / (xcmax - xcmin)
		};

		ds.y = {
			c:{
				min: ycmin, 
				max: ycmax
			}, 
			d:{
				min: ydmin,
				max: ydmax
			},
			d2c: (ycmax - ycmin)/(ydmax - ydmin),
			c2d: (ydmax - ydmin)/(ycmax - ycmin)
		};


		// now they're rescaled, we might want to
		// round them (specially in case of Date)
		// to beautify the graph
		var round_borders = function(ds,type){
			// simple search
			var search_closest = function(target,step){
				var x = 0.0;
				var olddist = target - x;
				var prop = x + step * olddist / Math.abs(olddist);
				var newdist = target - prop;
				while(Math.abs(newdist) > Math.abs(olddist)){
					x = prop;
					olddist = newdist;
					prop = x + step * olddist / Math.abs(olddist);
					newdist = target - prop;
				}
				return x;
			};
			var stepper = stepMgr.stepper(ds,type);
			if(type === 'date'){
				ds.d.min -= Math.min(stepper.step.asMilliseconds(), 1000 * 3600 * 24 * 30 * 6); // max is 6 month, using moment's convention
				if(ds.d.min < 0){ds.d.min = 0.0;}
				ds.d.max += Math.min(stepper.step.asMilliseconds(), 1000 * 3600 * 24 * 30 * 6);
			}else{
				// stepper
				var som = Math.pow(10, Math.floor(Math.log(stepper.toNum) / Math.log(10)) );
				// get order of magnitude, min
				var om = 0.0;
				if(ds.d.min !== 0.0){
					om = (ds.d.min > 0)?Math.pow(10, Math.floor(Math.log(ds.d.min) / Math.log(10)) ):
						- Math.pow(10, Math.floor(Math.log(Math.abs(ds.d.min)) / Math.log(10)) + 1 );
					// order of magnitude of step, if higher, then we need to start
					// at this order of magniture, closest to min
					if(Math.abs(som) > Math.abs(om)){
						om = search_closest(ds.d.min,stepper.toNum);
					}
				}
				while(om <= ds.d.min){
					om += stepper.toNum;
				}
				om -= 0.75 * stepper.toNum;
				if(om >= ds.d.min){om -= 0.25 * stepper.toNum;}
				ds.d.min = om;

				// get order of magnitude, max
				om = 0.0;
				if(ds.d.max !== 0.0){
					om = (ds.d.max > 0)?Math.pow(10, Math.floor(Math.log(ds.d.max) / Math.log(10)) +1 ):
						- Math.pow(10, Math.floor(Math.log(Math.abs(ds.d.max)) / Math.log(10)) );
					// order of magnitude of step, if higher, then we need to start
					// at this order of magniture, closest to max
					// is that possible ??
					if(Math.abs(som) > Math.abs(om)){
						om = search_closest(ds.d.max,stepper.toNum);
					}
				}
				while(om >= ds.d.max){
					om -= stepper.toNum;
				}
				om += 0.75 * stepper.toNum;
				if(om <= ds.d.min){om += 0.25 * stepper.toNum;}
				ds.d.max = om;
			}
			ds.c2d = (ds.d.max - ds.d.min) / (ds.c.max - ds.c.min);
			ds.d2c = (ds.c.max - ds.c.min) / (ds.d.max - ds.d.min);
		};

		round_borders(ds.x,datas.type);
		round_borders(ds.y,'number');

		return ds;

};


m.reset_min = function(ds,newmin){
	// reset ds first
	ds.d.min = newmin;
	ds.d2c = (ds.c.max - ds.c.min) / (ds.d.max - ds.d.min);
	ds.c2d = (ds.d.max - ds.d.min) / (ds.c.max - ds.c.min);
};

m.reset_max = function(ds,newmax){
	// reset ds first
	ds.d.max = newmax;
	ds.d2c = (ds.c.max - ds.c.min) / (ds.d.max - ds.d.min);
	ds.c2d = (ds.d.max - ds.d.min) / (ds.c.max - ds.c.min);
};

module.exports = m;
