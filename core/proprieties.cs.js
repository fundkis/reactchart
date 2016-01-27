/*
	all the proprieties
*/
var _ = require('underscore');

// defaults for graphs
var graph = {};
graph.common = function () {
	return {
		color: 'black',
		width: 1,
		fill: 'none',
<<<<<<< HEAD
=======
		shade: 1,
>>>>>>> develop
		// mark props, explicit at heigh level
		// overwritten if present in markProps
		mark: true,
		markColor: undefined,
<<<<<<< HEAD
=======
		baseLine: {x:undefined, y:0},
		dropLine: {x: false, y:false},
>>>>>>> develop
		markSize: 3,
		markType: 'dot',
		onlyMarks: false,
		// contains low-level description,
		// i.e. specific things like radius
		// for a dot, or anything.
		markProps: {},
		points: [],
		dsx: {}, // see space-mgr for details
		dsy: {},  // see space-mgr for details
		shader: undefined, //playing with colors
		process: undefined //playing with data {dir: x || y, type: 'histogram'}
	};
};

graph.Bars = function() {

	return {
		dsx: {}, // see space-mgr for details
		dsy: {}, // see space-mgr for details
		color: 'none',
<<<<<<< HEAD
=======
		shade: 1,
>>>>>>> develop
		width: 0,
		dir: {
			x: false,
			y: true
		},
<<<<<<< HEAD
=======
		baseLine: {x: undefined, y: 0},
>>>>>>> develop
		drop: {x: undefined, y: 0},
		points: [],
		markColor: undefined,
		markType: 'bar',
		markProps: {
			width: 0,
			draw: false
		},
		// Number or {}
		span: 0.5, // in dataSpace
		offset: {x: 0, y: 0},
		shader: undefined, //playing with colors
		process: undefined//playing with data {dir: x || y, type: 'histogram'}
	};
};

//graph.Bars = graph.common;
graph.Plain = graph.Stairs = graph.common;

/// coordinates systems

var cartCS = {
	start: {
		x: 0,
		y: 0
	},
	end: {
		x: 0,
		y: 0
	}
};

var polarCS = {
	radius: {
		x: 0,
		y: 0
	},
	center: {
		x: 0,
		y: 0
	}
};

///////////
// major / minor props
/////////////

var m = {};

// that's a major
m.Grid = {
	show: false,
	color: 'LightGray',
	width: 0.5,
	length: 0,
	cart: cartCS,
	polar: polarCS
};

// that's a major
m.Tick = {
	show: true,
	where: {
		x: 0,
		y: 0
	},
	labelDir: {
		x: 0,
		y: 1
	},
	width: 1,
	length: 15,
	out: 0.25, // proportion that is outside (-dir)
	color: 'black',
	labelOffset: 0,
	labelize: null,
	label: '',
	labelFSize: 10,
	labelColor: 'black'
};


//
<<<<<<< HEAD
m.Axe = {
=======
var axe = {
>>>>>>> develop
	ticks: {
		major: m.Tick,
		minor: _.extendOwn(_.extend({},m.Tick),{
			show: false,
			length: 7,
			out: 0,
			color: 'gray',
			labelOffset: 3.75,
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
	labelOffset: {
		x: 40,
		y: 40
	},
	labelFSize: 20,
	ds:         {},
	empty:      false,
	CS:         'cart',
<<<<<<< HEAD
=======
	partner: 0,
>>>>>>> develop
	// in c coordinate
	origin: {
		x: 0,
		y: 0
	},
<<<<<<< HEAD
	// vector of axis
	dir: {
		x: 1,
		y: 0
	},
	// in cs !! y is top to bottom
	labelDir: {
		x: 0,
		y: 1
	},
=======
>>>>>>> develop
	// for ticklabel formatting
	comFac: 1
};

<<<<<<< HEAD
m.Axes = {
	abs: [
		_.extend({}, m.Axe,{placement: 'bottom', partner: 0})
	],
	ord: [
		_.extend({}, m.Axe,{placement: 'left', partner: 0})
=======
m.Axe = function(key){
	switch(key){
		case 'abs':
			return _.extend({}, axe,{
				placement: 'bottom',
				// vector of axis
				dir: {
					x: 1,
					y: 0
				},
				// in cs !! y is top to bottom
				labelDir: {
					x: 0,
					y: 1
				}
			});
		case 'ord':
			return _.extend({}, axe,{
				placement: 'left',
				// vector of axis
				dir: {
					x: 0,
					y: 1
				},
				// in cs !! y is top to bottom
				labelDir: {
					x: 1,
					y: 0
				}
			});
		default:
			return axe;
	}
};

m.Axes = {
	abs: [
		m.Axe('abs')
	],
	ord: [
		m.Axe('ord')
>>>>>>> develop
	],
	CS: 'cart'
};


///
m.Graph = {
	// general
	name: 'G',
	height: 400,	// defines the universe's height
	width:	800,	// defines the universe's width
	foreground: undefined,
	background: undefined,
	title: '',
	titleFSize: 30,
<<<<<<< HEAD
=======
	axisOnTop: false,
>>>>>>> develop
	// data
	data: [{
		type: 'Plain', // Plain, Bars, yBars, Stairs
		series:[], // x, y
<<<<<<< HEAD
=======
		phantomSeries:[], // added points to play on the world's limit
>>>>>>> develop
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
	}],
	graphProps: [
<<<<<<< HEAD
		graph.common
=======
		graph.common()
>>>>>>> develop
	],
	// axis
	axisProps: m.Axes,
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
	// margins
	axisMargin: {left: 10, bottom: 10, right: 10, top: 10}, // left, bottom, right, top
	outerMargin: {} // left, bottom, right, top
};

m.defaults = function(key){
	return graph[key]();
};

module.exports = m;
