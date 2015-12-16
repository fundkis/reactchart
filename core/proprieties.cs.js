/*
	all the proprieties
*/
var _ = require('underscore');

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
	color: 'LightGray',
	width: 0.5,
	major: true,
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
	length: 15,
	out: 0.25, // proportion that is outside (-dir)
	color: 'black',
	labelOffset: {
		x: 0,
		y: 0
	},
	labelize: null,
	label: '',
	labelFSize: 10,
	labelColor: 'black'
};


//
m.Axe = {
	ticks: {
		major: m.Tick,
		minor: _.extendOwn(m.Tick,{
			show: false,
			length: 7,
			out: 0,
			color: 'gray',
			labelOffset: {
				x: 0,
				y: 3.75
			}
		})
	},
	grid: {
		major: m.Grid,
		minor: _.extendOwn(m.Grid,{
			width: 0.3,
			major: false
		})
	},
	color:     'black',
	width:      1,
	label:      '',
	labelDist:  20,
	labelFSize: 20,
	ds:         {},
	empty:      true,
	CS:         'cart',
	// in c coordinate
	origin: {
		x: 0,
		y: 0
	},
	// vector of axis
	dir: {
		x: 1,
		y: 0
	}
};

m.Axes = {
	abs: [
		_.extend(m.Axe,{placement: 'bottom', partner: 0})
	],
	ord: [
		_.extend(m.Axe,{placement: 'left', partner: 0})
	],
	CS: 'cart'
};


///
m.Graph = {
	// general
	name: 'G',
	height: 800,	// defines the universe's height
	width:	400,	// defines the universe's width
	foreground: undefined,
	background: undefined,
	title: '',
	titleFSize: 30,
	// data
	data: [{
		type: 'Plain', // Plain, Bars, yBars, Stairs
		series:[{x:0, y:0}], // x, y
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
	graphProps: [{
		color: 'black', 
		mark: true, 
		markSize: 3, 
		markColor: undefined, // if undefined = color 
		onlyMarks: false,
		shader: null, //playing with colors
		process: null //playing with data {dir: x || y, type: 'histogram'}
	}],
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
	// to force definition
	xmin: undefined,
	xmax: undefined,
	ymin: undefined,
	ymax: undefined,
	// margins
	axisMargin: {left: 10, bottom: 10, right: 10, top: 10}, // left, bottom, right, top
	outerMargin: {} // left, bottom, right, top
};

module.exports = m;
