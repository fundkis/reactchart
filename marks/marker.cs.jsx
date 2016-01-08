var React = require('react');
var Dot = require('./Dot.cs.jsx');
var Bar = require('./Bar.cs.jsx');
var _ = require('underscore');


// overwrite props if needed
var p2P = function(ps,props,point){

	var addProp = function(p,props,point){
		if(!!point[p]){
			props[p] = point[p];
		}
	};

	for(var p = 0; p < ps.length; p++){
		addProp(ps[p],props,point);
	}
};

var marks = {};

marks.dot = function(data,props){

	return _.map(data, function(point){
		var key = props.name + 'd' + point.x + ',' + point.y;
		p2P(['x','y'],props,point);
		return <Dot key={key} name={key} {...props}/>;
	});
};

marks.bar = function(data,props){
	return _.map(data, function(point,index){
		var key = props.name + '-' + index;
		p2P(['x','y','shade'],props,point);
		return <Bar {...props} key={key} name={key}/>;
	});
};

var m = {};

m.marks = function(data,props,key){

	if(!marks[key]){
		throw new Error('unrecognized mark type');
	}

	return marks[key](data,props);
};

module.exports = m;
