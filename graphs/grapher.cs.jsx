var React = require('react');
var Plain = require('./Plain.cs.jsx');
var Stairs = require('./Stairs.cs.jsx');
var BarChart = require('./BarChart.cs.jsx');

var utils = require('../core/utils.cs.js');
var defaults = require('../core/proprieties.cs.js').defaults;

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
	return <BarChart name={key} {...props} dir={{x: false, y: true}} points={points} />;
};

graph.yBars = function(points,props,keyid){
	var key = 'ybars' + keyid;
	return <BarChart name={key} {...props} dir={{x: true, y: false}} points={points} />;
};

var m = {};

m.grapher = function(key,points,props,keyid){
	if(utils.isNil(graph[key])){
		throw new Error('Unknown graph type "' + key + '"');
	}

	var pr = utils.deepCp({},defaults(key));
	utils.deepCp(pr,props);

	return graph[key](points,pr,keyid);
};

module.exports = m;
