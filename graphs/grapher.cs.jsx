var React = require('react');
var Plain = require('./Plain.cs.jsx');
var Stairs = require('./Stairs.cs.jsx');
var BarChart = require('./BarChart.cs.jsx');

var utils = require('../core/utils.cs.js');
var defaults = require('../core/proprieties.cs.js').defaults;

// the graphs function generator
var graph = {};

graph.Plain = function(points,props,keyid){
<<<<<<< HEAD
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
=======
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
>>>>>>> develop
};

var m = {};

<<<<<<< HEAD
m.grapher = function(key,points,props,keyid){
=======
m.grapher = function(key,points,props){
>>>>>>> develop
	if(utils.isNil(graph[key])){
		throw new Error('Unknown graph type "' + key + '"');
	}

<<<<<<< HEAD
	var pr = utils.deepCp({},defaults(key));
	utils.deepCp(pr,props);

	return graph[key](points,pr,keyid);
=======
	var pr = utils.deepCp(utils.deepCp({},defaults(key)),props);

	return graph[key](points,pr);
>>>>>>> develop
};

module.exports = m;
