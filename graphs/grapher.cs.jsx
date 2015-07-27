var React = require('react');
var Courbe = require('./Courbes.cs.jsx');
var Stairs = require('./Stairs.cs.jsx');
// var BarChart = require('./BarChart.cs.jsx');
// the graphs function generator
var m = {};

m.Courbe = function(points,props,keyid){
		var key = 'courbe' + keyid;
		return <Courbe key={key} {...props} points={points} />;
};

m.Stairs = function(points,props,keyid){
	var key = 'stairs' + keyid;
	return <Stairs key={key} {...props} points={points} />;
};

m.Bars = function(points,props,keyid){
	var key = 'bars' + keyid;
	return <BarChart key={key} {...props} points={points} />;
};

module.exports = m;
