var React = require('react');

var icon = {};
icon.square = icon.Square = function(data,open){
	var l = Math.min(data.width, data.height) * 3/5;
	var x = data.hMargin + (data.width - l)/2 ;
	var y = data.vMargin + (data.height - l);
	var f = open ? 'none' : data.color;
	return <rect x={x} y={y} width={l} height={l} fill={f} stroke={data.color} />;
};

icon.opensquare = icon.OpenSquare = function(data){
	return icon.square(data,true);
};

icon.dot = icon.Dot = function(data,open){
	var x = (data.width + 2 * data.hMargin)/2;
	var r = Math.min(data.height, data.width) * 3 / 10; // 3 / 5 de remplissage
	var y = data.height + data.vMargin - r;
	var f = open ? 'none' : data.color;
	return <circle cx={x} cy={y} r={r} fill={f} stroke={data.color}/>;
};

icon.opendot = icon.OpenDot = function(data){
	return icon.dot(data,true);
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

icon.line = function(data){

	var l = Math.min(data.width, data.height);
	var x1 = data.hMargin + (data.width - l)/2 ;
	var x2 = x1 + l;
	var y = data.vMargin + (data.height - 6); // fraction of height of letters...
  return <line x1={x1} y1={y} x2={x2} y2={y} stroke={data.color} strokeWidth={data.strokeWidth}/>;
};

var m = {};

m.icon = function(data, key){
	if(!icon[key]){
		throw new Error('unrecognized mark type: "' + key + '"');
	}

	return icon[key](data);
};

module.exports = m;
