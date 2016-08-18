var React = require('react');
var Plain = require('./Plain.jsx');
var Stairs = require('./Stairs.jsx');
var BarChart = require('./BarChart.jsx');
var Pie = require('./Pie.jsx');

var utils = require('../core/utils.js');

// the graphs function generator
var graph = {};

graph.Plain = function(props){
		return <Plain key={props.key} state={props}/>;
};

graph.Stairs = function(props){
	return <Stairs key={props.key} state={props}/>;
};

graph.Bars = graph.yBars = function(props){
	return <BarChart key={props.key} state={props}/>;
};

graph.Pie = function(props){
	return <Pie key={props.key} state={props}/>;
};

var m = function(key,props){
	if(utils.isNil(graph[key])){
		throw new Error('Unknown graph type "' + key + '"');
	}

	return graph[key](props);
};

module.exports = m;
