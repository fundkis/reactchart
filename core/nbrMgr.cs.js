var pow   = Math.pow;
var floor = Math.floor;
var log   = Math.log;
var min   = Math.min;
var max   = Math.max;
var abs   = Math.abs;
var LN10  = Math.LN10;

var firstDigit = function(r){
	var str = '' + r;
	var out = str[0] || 0;
	return Number(out);
};

var m = {};

// distance methods
m.orderMag = function(r){
	if(r < 0){
		r = -r;
	}
	return floor( log(r) / LN10);
};

m.orderMagValue = m.orderMagDist = function(r){
	return pow(10,m.orderMag(r));
};

m.roundUp = function(r){
	var step = 5 * pow(10,m.orderMag(r) - 1);
	var cand = pow(10,m.orderMag(r)) * firstDigit(r);
	while(cand < r){cand += step;}
	return cand;
};

m.roundDown = function(r){
	return firstDigit(r) * pow(10,m.orderMag(r));
};

m.multiply = function(d,f){
	return d * f;
};

m.divide = function(d,f){
	return d / f;
};

m.increase = function(d1,d2){
	return d1 + d2;
};

m.offset = function(/*d*/){
	return 0;
};

// value methods
m.closestRoundUp = function(ref,dist){

	if(ref < 0){
		return - m.closestRoundDown(-ref,dist);
	}

	var refOm = m.orderMag(ref);
	var start = pow(10,refOm) * firstDigit(ref);
	while(start <= ref){
		start += dist;
	}
	return start;
};

m.closestRoundDown = function(ref,dist){

	var om = m.orderMag(dist);

	if(ref < 0){
		return - m.closestRoundUp(-ref,om);
	}

	var refOm = m.orderMag(ref);
	var start = pow(10,refOm) * firstDigit(ref);
	if(refOm !== om){
		while(start < ref){
			start += dist;
		}
	}

	while(start >= ref){
		start -= dist;
	}

	return start;
};

m.closestRound = function(ref,om,type){
	return (type === 'up')? m.closestRoundUp(ref,om):m.closestRoundDown(ref,om);
};

m.min = function(values){
	return min.apply(null,values);
};

m.max = function(values){
	return max.apply(null,values);
};

m.label = function(value, useless, fac){
	var out = (value / fac).toFixed(2);
	return out;
};

// value & distance methods
m.add = function(d1,d2){
	return d1 + d2;
};

m.subtract = function(d1,d2){
	return d1 - d2;
};

m.distance = function(d1,d2){
	return abs(d1 - d2);
};

m.greaterThan = function(v1,v2){
	return v1 > v2;
};

m.lowerThan = function(v1,v2){
	return v1 < v2;
};

// some management

m.extraTicks = function(){
	return [];
};

m.getValue = function(v){
	return v;
};

m.smallestStep = function(){
	return 1;
};

module.exports = m;
