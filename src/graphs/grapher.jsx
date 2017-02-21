let React = require('react');
let Plain = require('./Plain.jsx');
let Stairs = require('./Stairs.jsx');
let BarChart = require('./BarChart.jsx');
let Pie = require('./Pie.jsx');

let utils = require('../core/utils.js');

// the graphs function generator
let graph = {};

graph.Plain  = (props) => <Plain key={props.key} state={props}/>;

graph.Stairs = (props) => <Stairs key={props.key} state={props}/>;

graph.Bars   = graph.yBars = (props) => <BarChart key={props.key} state={props}/>;

graph.Pie    = (props) => <Pie key={props.key} state={props}/>;

let m = function(key,props){
	if(utils.isNil(graph[key])){
		throw new Error('Unknown graph type "' + key + '"');
	}

	return graph[key](props);
};

module.exports = m;
