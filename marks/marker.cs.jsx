var React = require('react');
var Dot = require('./Dot.cs.jsx');
var Bar = require('./Bar.cs.jsx');
var _ = require('underscore');
var utils = require('../core/utils.cs.js');


// overwrite props if needed
var p2P = function(props,point){
	for(var p in point){
		props[p] = point[p];
	}
};

var marks = {};

marks.dot = function(data,props){

	return _.map(data, function(point){
		var key = props.name + 'd' + point.x + ',' + point.y;
		p2P(props,point);
		return <Dot key={key} name={key} {...props}/>;
	});
};

marks.bar = function(data,props){
	return _.map(data, function(point,index){
		var key = props.name + '-' + index;
		p2P(props,point);
		return <Bar {...props} key={key} name={key}/>;
	});
};

var m = {};

m.marks = function(data,props,key){

	if(!marks[key]){
		throw new Error('unrecognized mark type: "' + key + '"');
	}

	return marks[key](data,props);
};

module.exports = m;
