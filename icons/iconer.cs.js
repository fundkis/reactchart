var React = require('react');

var icon = {};
icon.square = icon.Square = function(data){
	var x = data.hMargin + data.width / 6;
	var y = data.vMargin + data.height / 6;
	var l = Math.min(data.width, data.height) * 2/3;
	return <rect x={x} y={y} width={l} height={l} fill={data.color} />;
};

icon.dot = icon.Dot = function(data){
	var x = (data.width + 2 * data.hMargin)/2;
	var r = Math.min(data.height, data.width) / 3; // 2/3 de remplissage
	var y = data.height + data.vMargin - r;
	return <circle cx={x} cy={y} r={r} fill={data.color}/>;
};

icon.bar = icon.Bar = icon.square;

icon.pie = icon.Pie = function(data){
	var x = data.hMargin + data.width/2;
	var y = 2 * data.vMargin + data.height;
	var r = data.height;
	var x1 = x + r * Math.cos(3/8 * Math.PI);
	var y1 = y - r * Math.sin(3/8 * Math.PI);
	var x2 = x + r * Math.cos(5/8 * Math.PI);
	var y2 = y - r * Math.sin(5/8 * Math.PI);
	
	var path = 'M' + x + ',' + y + ' L' + x1 + ',' + y1 + ' A' + r + ',' + r + ' 0 0,0 ' + x2 + ',' + y2 + ' z';
	return <path fill={data.color} d={path}/>;
};

var m = {};

m.icon = function(data, key){
	if(!icon[key]){
		throw new Error('unrecognized mark type: "' + key + '"');
	}

	return icon[key](data);
};

module.exports = m;
