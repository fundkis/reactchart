var pow   = Math.pow;
var floor = Math.floor;
var log   = Math.log;
var min   = Math.min;
var max   = Math.max;
var abs   = Math.abs;
var LN10  = Math.LN10;


var m = {};

var firstDigit = function(r){
	var res = r * pow(10,-m.orderMag(r));
	var str = '' + res;
	var out = str[0] || 0;
	return Number(out);
};

var roundMe = function(min,max){
	var valOrder = m.orderMag(max);
	var val = firstDigit(max) * pow(10,valOrder);
	var distOrd = m.orderMag(m.distance(max - min));

	var valid = (cand) => {
		return cand >= min && cand <= max;
	};

	if(!valid(val)){
		var cand = val;
		if(distOrd < valOrder){
			var newOrder = valOrder;
			var prev = Math.floor(val * pow(10,-newOrder)) * pow(10,newOrder);
			while(!valid(cand)){
				newOrder--;
				cand = prev;
				var step = pow(10,newOrder);
				while(!valid(cand)){
					cand -= step;
					if(cand < prev){
						break;
					}
				}
				prev = cand;
			}
		}else{ // distOrd === valOrder ???
			return null;
		}
	}
	return val;
};

// distance methods
m.orderMag = function(r){
	if(r < 0){
		r = -r;
	}
	return (r === 0) ? 0 : floor( log(r) / LN10);
};

m.orderMagValue = m.orderMagDist = function(max,min){

	// zero case treated right away
	if(min * max < 0){
		return 0;
	}
	var absMin = max < 0 ? Math.abs(max) : min;
	var absMax = max < 0 ? Math.abs(min) : max;
	var fac = max < 0 ? -1 : 1;
	return fac * roundMe(absMin,absMax);
};

m.roundUp = function(r){
	var step = (val) => {
		switch(firstDigit(val)){
			case 2:
				return 5 * pow(10,m.orderMag(cand));
			default:
				return 2 * cand;
		}
		
	};
	var cand = pow(10,m.orderMag(r));
	while(cand <= r){
		cand = step(cand);
	}

	var test = cand * pow(10,-m.orderMag(cand)); // between 0 and 1
	if(test > 6){
		cand = pow(10,m.orderMag(cand) + 1);
	}
	return cand;
};

m.roundDown = function(r){
	var step = 5 * pow(10,m.orderMag(r) - 1);
	var cand = firstDigit(r) * pow(10,m.orderMag(r));
	while(cand >= r){cand -= step;}
	return cand;
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
	var out = (value / fac).toFixed(1);
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

m.getValue = m.value = m.step = function(v){
	return v;
};

m.smallestStep = function(){
	return 1;
};

m.labelF = 0.75;

m.type = 'number';

module.exports = m;
