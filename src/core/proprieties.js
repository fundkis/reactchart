/*
	all the proprieties
*/
let _ = require('underscore');
let utils = require('./utils.js');

// defaults for marks
let marks = {};

marks.dot = marks.Dot = () => {
	return {
		draw: false,
		ds: {
			x: {},
			y:{}
		},
		position: {
			x: 0,
			y: 0
		},
		radius: 3,
		color: 'black',
		width: 0,
		fill: undefined,
		size: undefined,
		shade: 1
	};
};

marks.square = marks.Square = () => {
	return {
		draw: false,
		ds: {
			x: {},
			y: {}
		},
		position:{
			x: 0,
			y: 0
		},
		color: 'black',
		width: 0,
		fill: undefined,
		size: 0,
		shade: 1
	};
};

marks.bar = marks.Bar = () => {
	return {
		draw: false,
		ds: {
			x: {}, // see space-mgr for details
			y: {}
		}, // see space-mgr for details
		position:{
			x:0,
			y:0
		},
		drop:{
			x:null,
			y:0
		},
		width: 0,
		span:0.5,
		offset: {
			x: 0,
			y: 0
		},
		shade: 1
	};
};

// defaults for graphs
let graph = {};
graph.common = () => {
	return {
		color: 'black',
		width: 1,
		fill: 'none',
		shade: 1,
		// mark props, explicit at heigh level
		// overwritten if present in markProps
		mark: true,
		markColor: undefined,
		baseLine: {x:undefined, y:0},
		dropLine: {x: false, y:false},
		markSize: 3,
		markType: 'dot',
		onlyMarks: false,
		// contains low-level description,
		// i.e. specific things like radius
		// for a dot, or anything.
		markProps: {},
		shader: undefined, //playing with colors
		process: undefined, //playing with data {dir: x || y, type: 'histogram'}
		tag: {
			show: false, // show the tag
			print: (t) => t + '',
			fontSize: 10,
			pin: false, // show the pin
			pinColor: 'black', // color of the pin
			pinLength: 10, // 10 px as pin length
			pinAngle: 90, // direction of pin
			pinHook: 3, // 3px for hook
			color: 'black' // color of the tag
		}
	};
};

graph.Bars = graph.bars = () => _.extend(utils.deepCp({},graph.common()), {
	color: 'none',
	width: 0,
	dir: {
		x: false,
		y: true
	},
	drop: {x: undefined, y: 0},
	markType: 'bar',
	markProps: {
		width: 0,
		draw: false
	},
	// Number or {}
	span: undefined, // auto compute
	offset: {x: 0, y: 0}
});

graph.yBars = graph.ybars = () => _.extend(utils.deepCp({},graph.Bars()),{
	dir: {
		x: true,
		y: false
	},
});

graph.Pie = graph.pie = () => _.extend(utils.deepCp({},graph.common()),{
	pie: 'disc', // tore
	pieOrigin: {x: 0, y:0}, // offset from center
	pieRadius: undefined, // 2/3 of world
	pieToreRadius: 0, // 0: no hole, 1 : no border!
	tag: {
		show: false, // show the tag
		print: (t) => t + '',
		pin: false, // show the pin
		pinColor: 'black', // color or the pin
		pinLength: 0.35, // 10 px as pin length
		pinRadius: 0.75, // 3/4 of pie size
		pinHook: 10, // absolute length
		color: 'black' // color of the tag
	}
});

//graph.Bars = graph.common;
graph.Plain = graph.plain = graph.Stairs = graph.stairs = graph.common;

///////////
// major / minor props
/////////////

let m = {};

// that's a major
m.Grid = {
	show: false,
	color: 'LightGray',
	width: 0.5,
	length: 0
};

// that's a major
m.Tick = {
	show: true,
	width: 1,
	length: 15,
	out: 0.25, // proportion that is outside
	color: 'black',
	labelOffset: {x:0, y:0},
	labelize: () => {return false;}, //utils.isNil(val) ? '' : val instanceof Date ? moment(val).format('YYYY') : val.toFixed(1);},
	label: '',
	labelFSize: 10,
	labelColor: 'black'
};


//
let axe = {
	ticks: {
		major: m.Tick,
		minor: _.extendOwn(_.extend({},m.Tick),{
			show: false,
			length: 7,
			out: 0,
			color: 'gray',
			labelize: () => {return '';}
		})
	},
	grid: {
		major: m.Grid,
		minor: _.extendOwn(_.extend({},m.Grid),{
			width: 0.3
		})
	},
	show: true,
	// to force locally definition
	min: undefined,
	max: undefined,
	tickLabels: [], //{coord: where, label: ''}, coord in ds
	color:     'black',
	width:      1,
	label:      '',
	labelOffset: {x: 0, y: 0},
	labelAnchor: 'middle',
	labelFSize: 20,
	labelColor: 'black',
	empty:      false,
	CS:         'cart',
	partner: 0,
	// for ticklabel formatting
	factor: 1,
	factorColor: 'black',
	factorOffset: {x: 0, y: 0},
	factorAnchor: 'middle',
	factorFSize: 10
};

m.Axes = (axis) => {
	return {
		abs: _.map(axis.abs, (p) => _.extend({placement: p}, axe)),
		ord: _.map(axis.ord, (p) => _.extend({placement: p}, axe)),
		CS: 'cart'
	};
};


///
m.Graph = (axis) => {
	return {
		// general
 	 css: false,
		name: 'G',
		height: 400,	// defines the universe's height
		width:	800,	// defines the universe's width
		legend: {
			iconWidth: 30,
			iconHeight: 20,
			iconHMargin: 0, // offset from center
			iconVMargin: 0, // offset from center
			iconUnit: 'px'
		},
		foreground: undefined,
		background: undefined,
		title: '',
		titleFSize: 30,
		axisOnTop: false,
		// margins
		innerMargin: {}, // left, bottom, right, top
		// defMargins.axis.ticks
		// if defined, overwrite
		factorMargin: {},  // left, bottom, right, top
		// factorMargin + defMargins.axis.label + defMargins.axis.ticks
		// if defined, overwrite
		outerMargin: {}, // left, bottom, right, top
		// data
		data: [],
		graphProps: [],
		// axis
		axisProps: m.Axes(axis),
		axis: undefined,	// b = bottom, l = left, t = top, r = right, any combination; overrides xaxis and yaxis
		// shorcuts for easyness of use, overrides
		// settings in axisProps
		// label of axis
		xLabel: '',
		yLabel: '',
		xLabelFSize: null,
		yLabelFSize: null,
		// axis
		xaxis: '',	// bottom || top
		yaxis: '',		// left || right
		// data process
		discard: true
	};
};

let data = 	{
	type: 'Plain', // Plain, Bars, yBars, Stairs
	series:[], // x, y
	phantomSeries:[], // added points to play on the world's limit
	stacked: undefined, // x || y || null
	coordSys: 'cart', // cart || polar
	ord: {
		axis: 'left', // 'left' || 'right'
		type: 'number' // 'number' || 'date' || 'label'
	},
	abs: {
		axis: 'bottom', // 'bottom' || 'top'
		type: 'number' // 'number' || 'date' || 'label'
	}
};

m.defaults     = (key) => key === 'data' ? data : graph[key]();

m.marksDefault = (key) => marks[key]();

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
m.defMargins = {
	outer: {
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
		factor: {
			right: 30,
			top: 25
		},
		min: 3
	},
	inner: {
		left: 10, 
		bottom: 10, 
		right: 10, 
		top: 10
	},
	title: 10,
	min: 0,
	max: 4
};

module.exports = m;
