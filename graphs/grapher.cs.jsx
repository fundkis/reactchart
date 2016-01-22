var React = require('react');
var Plain = require('./Plain.cs.jsx');
var Stairs = require('./Stairs.cs.jsx');
var BarChart = require('./BarChart.cs.jsx');

var utils = require('../core/utils.cs.js');
var defaults = require('../core/proprieties.cs.js').defaults;

// the graphs function generator
var graph = {};

graph.Plain = function(points,props,keyid){
		props.name += '.plain';
		return <Plain key={props.name} {...props} points={points} />;
};

graph.Stairs = function(points,props,keyid){
	props.name += '.stairs';
	return <Stairs key={props.name} {...props} points={points} />;
};

graph.Bars = function(points,props){
	props.name += '.bars';
	return <BarChart key={props.name} {...props} dir={{x: false, y: true}} points={points} />;
};

graph.yBars = function(points,props){
	props.name += '.ybars';
	return <BarChart key={props.name} {...props} dir={{x: true, y: false}} points={points} />;
};

var m = {};

m.grapher = function(key,points,props){
	if(utils.isNil(graph[key])){
		throw new Error('Unknown graph type "' + key + '"');
	}

	var pr = utils.deepCp(utils.deepCp({},defaults(key)),props);

	return graph[key](points,pr);
};

module.exports = m;
