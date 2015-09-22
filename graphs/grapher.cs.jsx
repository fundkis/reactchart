var React = require('react');
var Plain = require('./Plain.cs.jsx');
var Stairs = require('./Stairs.cs.jsx');
var BarChart = require('./BarChart.cs.jsx');
// the graphs function generator
var m = {};

m.Plain = function(points,props,keyid){
		var key = 'plain' + keyid;
		return <Plain name={key} {...props} points={points} />;
};

m.Stairs = function(points,props,keyid){
	var key = 'stairs' + keyid;
	return <Stairs name={key} {...props} points={points} />;
};

m.Bars = function(points,props,keyid){
	var key = 'bars' + keyid;
	return <BarChart name={key} {...props} points={points} />;
};

module.exports = m;
