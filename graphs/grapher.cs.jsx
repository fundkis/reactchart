var React = require('react');
var Plain = require('./Plain.cs.jsx');
var Stairs = require('./Stairs.cs.jsx');
var BarChart = require('./BarChart.cs.jsx');

var utils = require('../core/utils.cs.js');

// the graphs function generator
var graph = {};

graph.Plain = function(points,props,keyid){
		var key = 'plain' + keyid;
		return <Plain name={key} {...props} points={points} />;
};

graph.Stairs = function(points,props,keyid){
	var key = 'stairs' + keyid;
	return <Stairs name={key} {...props} points={points} />;
};

graph.Bars = function(points,props,keyid){
	var key = 'bars' + keyid;
	return <BarChart name={key} dir={{x: false, y: true}} {...props} points={points} />;
};

graph.yBars = function(points,props,keyid){
	var key = 'ybars' + keyid;
	return <BarChart name={key} dir={{x: true, y: false}} {...props} points={points} />;
};

var m = {};

m.grapher = function(key,points,props,keyid){
	if(utils.isNil(graph[key])){
		throw new Error('Unknown graph type "' + key + '"');
	}

	return graph[key](points,props,keyid);
};

module.exports = m;
