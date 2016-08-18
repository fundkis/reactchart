var _ = require('underscore');
var utils = require('./utils.js');
var shader = require('./colorMgr.js');
var axisLine = require('../axis/axisLine.js');
var ticks = require('../axis/tick.js');
var plainVM = require('../graphs/plain.js');
var barChartVM = require('../graphs/barChart.js');
var stairsVM = require('../graphs/stairs.js');
var pieVM = require('../graphs/pie.js');
var dotVM = require('../marks/dot.js');
var squareVM = require('../marks/square.js');
var barVM = require('../marks/bar.js');
// pin
var pinMgr = require('../marks/pin.js');

// graph
var graphVM = {};
graphVM.plain = graphVM.Plain = plainVM.VM;
graphVM.bars = graphVM.Bars = barChartVM.VM;
graphVM.ybars = graphVM.yBars = barChartVM.VM;
graphVM.stairs = graphVM.Stairs = stairsVM.VM;
graphVM.pie = graphVM.Pie = pieVM.VM;

// marks
var marksVM = {};
marksVM.dot = marksVM.Dot = dotVM.VM;
marksVM.square = marksVM.Square = squareVM.VM;
marksVM.bar = marksVM.Bar = barVM.VM;

var curve = function(spaces,serie,data,props,idx){

			// 1 - find ds: {x: , y:}
			// common to everyone

			// we add the world
			// we find the proper x & y axis
			var xplace = 'bottom';
			if(!!data.abs && 
				!!data.abs.axis){
				xplace = data.abs.axis;
			}

			var yplace = 'left';
			if(!!data.ord && 
				!!data.ord.axis){
				yplace = data.ord.axis;
			}
			var ds = {
				x: spaces.x[xplace],
				y: spaces.y[yplace]
			};

			// 2 - line of graph
			var gtype = data.type || 'Plain';

			// positions are offsetted here
			var positions = _.map(serie, (point) => {

				var mgr = {
					x: utils.mgr(point.x),
					y: utils.mgr(point.y)
				};

				var offx = utils.isNil(point.offset.x) ? 0 : point.offset.x;
				var offy = utils.isNil(point.offset.y) ? 0 : point.offset.y;

				var out = {
					x: mgr.x.add(point.x,offx),
					y: mgr.y.add(point.y,offy),
					drop: {
						x: utils.isNil(point.drop.x) ? null : mgr.x.add(point.drop.x,offx),
						y: utils.isNil(point.drop.y) ? null : mgr.y.add(point.drop.y,offy),
					},
					span: point.span
				};

				for(var aa in point){
					switch(aa){
						case 'x':
						case 'y':
						case 'drop':
						case 'span':
						case 'offset':
							continue;
						default:
							out[aa] = point[aa];
					}
				}

				return out;

			});

			var lineProps = props.onlyMarks ? {show: false} : graphVM[gtype](positions,props,ds);

			// 3 - points
			// we extend positions with any precisions done by the user,

			// first shader
			if(!utils.isNil(props.shader)){
				shader(props.shader,positions);
			}

			// then explicit, takes precedence
			_.each(positions, (pos,idx) => {
				for(var u in data.series[idx]){
					switch(u){
						case 'x':
						case 'y':
						case 'drop':
						case 'span':
							continue;
						default:
							pos[u] = data.series[idx][u];
					}
				}
			});



			var isBar = (type) => {
				return type.search('Bars') >= 0 || type.search('bars') >= 0;
			};

			var graphKey = gtype + '.' + idx;
			var mtype = isBar(gtype) ? 'bar' : props.markType || 'dot';
			var mprops = props.mark ? _.map(positions,(pos,idx) => {
				var markKey = graphKey + '.' + mtype[0] + '.' + idx;
				return marksVM[mtype](pos,props,ds,markKey,pinMgr(pos,props.tag,ds));
			}) : [];

			return {
				key: graphKey,
				type: gtype,
				path: lineProps,
				markType: mtype,
				marks: mprops
			};
};

var axis = function(props,state,axe,dir){

	var partnerAxe = axe === 'abs' ? 'ord' : 'abs';
	var othdir = dir === 'x' ? 'y' : 'x';

	// for every abscissa
	var out = _.map(state.spaces[dir], (ds,key) => {

		if(utils.isNil(ds)){
			return null;
		}

		var find = (key) => {
			switch(key){
				case 'top':
				case 'right':
					return 'max';
				default:
					return 'min';
			}
		};

		var axisKey = axe + '.' + key;

		// add here the common factor computations and definitions
		var comFac = 1;

		var axisProps = _.findWhere(props.axisProps[axe], {placement: key});
		axisProps.CS = props.axisProps.CS;

		var partnerAxis = props.axisProps[partnerAxe][axisProps.partner];
		var partnerDs = state.spaces[othdir][partnerAxis.placement];

		var DS = {};
		DS[dir] = ds;
		DS[othdir] = partnerDs;
		var mgr = utils.mgr(partnerDs.d.max);
		var partner = {
			pos: partnerDs.d[find(key)],
			length: mgr.distance(partnerDs.d.max,partnerDs.d.min)
		};
		var bounds = {min: ds.d.min, max: ds.d.max};

		return {
			show: axisProps.show,
			key: axisKey,
			axisLine: axisLine.VM(ds,axisProps,partnerDs,dir),
			ticks: ticks.VM(DS, partner, bounds, dir, axisProps, comFac, axisKey)
		};
	});

	return _.reject(out, (val) => {return utils.isNil(val);});

};

var m = {};

m.abscissas = function(props,state){
	return axis(props,state,'abs','x');
};

m.ordinates = function(props,state){
	return axis(props,state,'ord','y');
};

m.curves = function(props,state){
	return _.map(state.series,(serie,idx) => {
		return curve(state.spaces,serie,props.data[idx],props.graphProps[idx],idx);
	});
};

module.exports = m;
