var React = require('react');
var Plain = require('./Plain.cs.jsx');
var Stairs = require('./Stairs.cs.jsx');
var BarChart = require('./BarChart.cs.jsx');

var utils = require('../core/utils.cs.js');

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

var m = function(key,props){
	if(utils.isNil(graph[key])){
		throw new Error('Unknown graph type "' + key + '"');
	}

	return graph[key](props);
};

module.exports = m;
