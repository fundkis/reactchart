let _ = require('underscore');
let utils = require('./utils.js');
let shader = require('./colorMgr.js');
let axisLine = require('../axis/axisLine.js');
let ticks = require('../axis/tick.js');
let plainVM = require('../graphs/plain.js');
let barChartVM = require('../graphs/barChart.js');
let stairsVM = require('../graphs/stairs.js');
let pieVM = require('../graphs/pie.js');
let dotVM = require('../marks/dot.js');
let squareVM = require('../marks/square.js');
let barVM = require('../marks/bar.js');
// pin
let pinMgr = require('../marks/pin.js');

// graph
let graphVM = {};
graphVM.plain  = graphVM.Plain  = plainVM.VM;
graphVM.bars   = graphVM.Bars   = barChartVM.VM;
graphVM.ybars  = graphVM.yBars  = barChartVM.VM;
graphVM.stairs = graphVM.Stairs = stairsVM.VM;
graphVM.pie    = graphVM.Pie    = pieVM.VM;

// marks
let marksVM = {};
marksVM.opendot     = marksVM.OpenDot     = dotVM.OVM;
marksVM.dot         = marksVM.Dot         = dotVM.VM;
marksVM.opensquare  = marksVM.OpenSquare  = squareVM.OVM;
marksVM.square      = marksVM.Square      = squareVM.VM;
marksVM.bar         = marksVM.Bar         = barVM.VM;

let curve = function(spaces,serie,data,props,idx){

			// 1 - find ds: {x: , y:}
			// common to everyone

			// we add the world
			// we find the proper x & y axis
			let xplace = 'bottom';
			if(!!data.abs && 
				!!data.abs.axis){
				xplace = data.abs.axis;
			}

			let yplace = 'left';
			if(!!data.ord && 
				!!data.ord.axis){
				yplace = data.ord.axis;
			}
			let ds = {
				x: spaces.x[xplace],
				y: spaces.y[yplace]
			};

			// 2 - line of graph
			let gtype = data.type || 'Plain';

			// positions are offsetted here
			let positions = _.map(serie, (point) => {

				let mgr = {
					x: utils.mgr(point.x),
					y: utils.mgr(point.y)
				};

				let offx = utils.isNil(point.offset.x) ? 0 : point.offset.x;
				let offy = utils.isNil(point.offset.y) ? 0 : point.offset.y;

				let out = {
					x: mgr.x.add(point.x,offx),
					y: mgr.y.add(point.y,offy),
					drop: {
						x: utils.isNil(point.drop.x) ? null : mgr.x.add(point.drop.x,offx),
						y: utils.isNil(point.drop.y) ? null : mgr.y.add(point.drop.y,offy),
					},
					span: point.span
				};

				for(let aa in point){
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

			let lineProps = props.onlyMarks ? {show: false} : graphVM[gtype](positions,props,ds);

			// 3 - points
			// we extend positions with any precisions done by the user,

			// first shader
			if(!utils.isNil(props.shader)){
				shader(props.shader,positions);
			}

			// then explicit, takes precedence
			_.each(positions, (pos,idx) => {
				for(let u in data.series[idx]){
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



			let isBar = (type) => {
				return type.search('Bars') >= 0 || type.search('bars') >= 0;
			};

			let graphKey = gtype + '.' + idx;
			let mtype = isBar(gtype) ? 'bar' : props.markType || 'dot';
			let mprops = props.mark ? _.map(positions,(pos,idx) => {
				let markKey = graphKey + '.' + mtype[0] + '.' + idx;
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

let axis = function(props,state,axe,dir){

	let partnerAxe = axe === 'abs' ? 'ord' : 'abs';
	let othdir = dir === 'x' ? 'y' : 'x';

	// for every abscissa
	let out = _.map(state.spaces[dir], (ds,key) => {

		if(utils.isNil(ds)){
			return null;
		}

		let find = (key) => {
			switch(key){
				case 'top':
				case 'right':
					return 'max';
				default:
					return 'min';
			}
		};

		let axisKey = axe + '.' + key;

		let axisProps = _.findWhere(props.axisProps[axe], {placement: key});
		axisProps.CS = props.axisProps.CS;

		let partnerAxis = props.axisProps[partnerAxe][axisProps.partner];
		let partnerDs = state.spaces[othdir][partnerAxis.placement];

		let DS = {};
		DS[dir] = ds;
		DS[othdir] = partnerDs;
		let mgr = utils.mgr(partnerDs.d.max);
		let partner = {
			pos: partnerDs.d[find(key)],
			length: mgr.distance(partnerDs.d.max,partnerDs.d.min)
		};
		let bounds = {min: ds.d.min, max: ds.d.max};

		return {
			show: axisProps.show,
			key: axisKey,
			axisLine: axisLine.VM(ds,axisProps,partnerDs,dir ),
			ticks: ticks.VM(DS, partner, bounds, dir, axisProps, axisProps.factor, axisKey)
		};
	});

	return _.reject(out, (val) => utils.isNil(val));

};

let m = {};

m.abscissas = (props,state) => axis(props,state,'abs','x');

m.ordinates = (props,state) => axis(props,state,'ord','y');

m.curves = (props,state) => _.map(state.series,(serie,idx) => curve(state.spaces,serie,props.data[idx],props.graphProps[idx],idx));

module.exports = m;
