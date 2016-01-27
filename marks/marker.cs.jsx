var React = require('react');
var Dot = require('./Dot.cs.jsx');
var Bar = require('./Bar.cs.jsx');
var Square = require('./Square.cs.jsx');
var _ = require('underscore');
var utils = require('../core/utils.cs.js');


// overwrite props if needed
var p2P = function(props,point){
	for(var p in point){
		props[p] = point[p];
	}
};

var marks = {};

<<<<<<< HEAD
marks.dot = function(data,props){
=======
marks.square = function(data,props){
>>>>>>> develop

	return _.map(data, function(point){
		var key = props.name + 'd' + point.x + ',' + point.y;
		p2P(props,point);
<<<<<<< HEAD
=======
		return <Square key={key} name={key} {...props}/>;
	});
};

marks.dot = function(data,props){

	return _.map(data, function(point,idx){
		var key = props.name + 'd.' + idx + ':' + point.x + ',' + point.y;
		p2P(props,point);
>>>>>>> develop
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
