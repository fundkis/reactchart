/*
 * Responsible for making the ds object:
 *
 * ds is { c : {min, max}, d: {min,max}}
 */

var _ = require('underscore');
var space = require('./space-transf.cs.js');
var stepMgr = require('../base/ticker.cs.js');
var dm = require('./date-mgr.cs.js');

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
 *	datas: {series:[ { serie: [{x:0, y:0}], stacked:'y' }], type:'number'}, //
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

		// x labels
		var xl = (axis.yLabel.length !== 0)?axis.yLabelFSize + 10.0:0.0; // we hardcode a 10px margin on labels

		// default margin for ticks is 20px for the y dir,
        // 40px for the x dir
		var defx = 40.0;

		// y axis => x dir margins
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

		// y label
		var yl = (axis.xLabel.length !== 0)?axis.xLabelFSize + 10.0:0.0; // we hardcode a 10px margin on labels

		// title is at the top
		ytm += (title.length !== 0)?title.titleFSize + 10.0:0.0;

		// default margin for ticks is 20px for the y dir,
		// 40px for the x dir
		var defy = 20.0;

		// x axis => y dir margins
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


		// more suppleness, but less
		// efficiencies: automatic
		// margins computed whatever
		// happens
		if(!!axis.marginsO.l){
			xlm = axis.marginsO.l;
		}
		if(!!axis.marginsO.r){
			xrm = axis.marginsO.r;
		}
		if(!!axis.marginsO.t){
			ytm = axis.marginsO.t;
		}
		if(!!axis.marginsO.b){
			ybm = axis.marginsO.b;
		}


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

		var data_min_max = function(what,defmin,defmax,pmin,pmax,cmin,cmax){
			// locally defined
			var toAbs = function(point){
				return (datas.type === 'date')?point.x.getTime():point.x;
			};
			// min of all the abscissa: from inner to outer:
			// for a (abs,y) point, get the abscissa, -> {abs}
			var points = _.map(datas.series, function(dataP) {
				return _.map(dataP.series,function(point){
					return [{
							x: toAbs(point),
							y: point.y
						},{
							x: (!!point.dropx)?point.dropx:toAbs(point),
							y: (!!point.dropy)?point.dropy:point.y
						}];
				});
			});
			// do that for all points in the graph -> [abs, abs, ...]
			// do that for all graph -> [[abs],[abs],...]
			// flatten this array of arrays -> [abs, abs, ...]
			var allValues = _.map(_.flatten(points),function(point){
					return point[what];
				});
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
	//	datas: {series:[{series: [{x:0, y:0}], stacked:'y' ], type:'number'}

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

		
		var xbounds = data_min_max('x',dxmindef,dxmaxdef,xpmin,xpmax,xcmin,xcmax);
		xdmin = xbounds.min;
		xdmax = xbounds.max;

		var ybounds = data_min_max('y',dymindef,dymaxdef,ypmin,ypmax,ycmin,ycmax);
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
		var round_borders = function(ds,type,domin,domax){
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

				if(domin){
					ds.d.min = dm.dateBefore( dm.before(ds.d.min,0,Math.min(stepper.step.asMonths(), 6),0),0,0,1).getTime(); // max is 6 month
					if(ds.d.min < 0){ds.d.min = 0.0;}
				}

				if(domax){
					ds.d.max = dm.dateAfter(dm.after(ds.d.max, 0,Math.min(stepper.step.asMonths(), 6),0 ),0,0,1).getTime();
				}

			}else{
				// stepper
				var som = Math.pow(10, Math.floor(Math.log(stepper.toNum) / Math.log(10)) );
				if(domin){

					// get order of magnitude, min
					var om = 0;
					if(ds.d.min !== 0){
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
					if(om >= ds.d.min){om -= 0.5 * stepper.toNum;}
					ds.d.min = om;
				}

				if(domax){
					// get order of magnitude, max
					var oma = 0;
					if(ds.d.max !== 0){
						oma = (ds.d.max > 0)?Math.pow(10, Math.floor(Math.log(ds.d.max) / Math.log(10)) +1 ):
							- Math.pow(10, Math.floor(Math.log(Math.abs(ds.d.max)) / Math.log(10)) );
						// order of magnitude of step, if higher, then we need to start
						// at this order of magniture, closest to max
						// is that possible ??
						if(Math.abs(som) > Math.abs(oma)){
							oma = search_closest(ds.d.max,stepper.toNum);
						}
					}
					while(oma >= ds.d.max){
						oma -= stepper.toNum;
					}
					oma += 0.75 * stepper.toNum;
					if(oma <= ds.d.max){oma += 0.5 * stepper.toNum;}
					ds.d.max = oma;
				}
			}

			ds.c2d = (ds.d.max - ds.d.min) / (ds.c.max - ds.c.min);
			ds.d2c = (ds.c.max - ds.c.min) / (ds.d.max - ds.d.min);
			 // when no data, or all have the same values
			if(!isFinite(ds.d2c)){
				ds.d2c = 0;
			}
		};

		round_borders(ds.x,datas.type,(datas.xmin === undefined),(datas.xmax === undefined));
		round_borders(ds.y,'number',  (datas.ymin === undefined),(datas.ymax === undefined));

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
