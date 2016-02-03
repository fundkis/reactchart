var React = require('react');
var Dot = require('./Dot.cs.jsx');
var Bar = require('./Bar.cs.jsx');
var Square = require('./Square.cs.jsx');
var _ = require('underscore');

var marks = {};

marks.square = marks.Square = function(data){

	return _.map(data, function(point){
		return <Square key={point.key} state={point} />;
	});
};

marks.dot = marks.Dot = function(data){

	return _.map(data, function(point){
		return <Dot key={point.key} state={point} />;
	});
};

marks.bar = marks.Bar = function(data){
	return _.map(data, function(point){
		return <Bar key={point.key} state={point} />;
	});
};

var m = {};

m.marks = function(data,key){

	if(!marks[key]){
		throw new Error('unrecognized mark type: "' + key + '"');
	}

	return data.length === 0 ? null : marks[key](data);
};

module.exports = m;
