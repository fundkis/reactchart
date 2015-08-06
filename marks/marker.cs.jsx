var React = require('react');
var Dot = require('./Dot.cs.jsx');
var _ = require('underscore');

var m = {};

m.marks_map = {};

m.marks_map.dot = function(data,props){
	var radius = 3; //default
	if(!!props.radius){
		radius = props.radius;
	}

	var size = -1; // default
	if(!!props.size){
		size = props.size;
	}
	var fill = 'black'; // default
	if(!!props.fill){
		fill = props.fill;
	}

	return _.map(data, function(point){
		var key = 'd' + point.x + ':' + point.y;
		return <Dot key={key} x={point.x} y={point.y} fill={fill} radius={radius} size={size}/>;
	});
};

m.marks = function(data,props,print,key){
	if(!print)return [];
	if(!m.marks_map[key]){
		throw 'unrecognized mark type';
	}

	return (print)?m.marks_map[key](data,props):{};
};

module.exports = m;
