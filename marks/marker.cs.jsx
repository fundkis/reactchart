var React = require('react');
var Dot = require('./Dot.cs.jsx');
var Bar = require('./Bar.cs.jsx');
var _ = require('underscore');

var m = {};

m.marks_map = {};

m.marks_map.dot = function(data,props){

	return _.map(data, function(point){
		var key = props.name + 'd' + point.x + ',' + point.y;
		return <Dot name={key} x={point.x} y={point.y} {...props}/>;
	});
};

m.marks_map.bar = function(data,props){
	return _.map(data, function(point,index){
		var key = props.name + '-' + index;
		// props are passed first so they can be overwritten (like name)
		return <Bar {...props} name={key} x={point.x} y={point.y} shade={point.shade} drop={point.drop}/>;
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
