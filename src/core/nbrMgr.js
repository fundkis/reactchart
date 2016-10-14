let { pow, floor, log, min, max, abs, LN10 } = Math;

let m = {};

let firstDigit = function(r){
	let res = r * pow(10,-m.orderMag(r));
	let str = '' + res;
	let out = str[0] || 0;
	return Number(out);
};

let roundMe = function(min,max){
	let valOrder = m.orderMag(max);
	let distOrd = m.orderMag(m.distance(max,min));

	let valid = (cand) => cand >= min && cand <= max;

	let val = firstDigit(max) * pow(10,valOrder);
	if(!valid(val)){
		if(distOrd < valOrder){
			let step = pow(10,distOrd);
			return floor(min / step) * step + step;
		}else{ // distOrd === valOrder
			return min;
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
	let absMin = max < 0 ? Math.abs(max) : min;
	let absMax = max < 0 ? Math.abs(min) : max;
	let fac = max < 0 ? -1 : 1;
	return fac * roundMe(absMin,absMax);
};

m.roundUp = function(r){
	let step = (val) => {
		switch(firstDigit(val)){
			case 2:
				return 5 * pow(10,m.orderMag(cand));
			default:
				return 2 * cand;
		}
		
	};
	let cand = pow(10,m.orderMag(r));
	while(cand <= r){
		cand = step(cand);
	}

	let test = cand * pow(10,-m.orderMag(cand)); // between 0 and 1
	if(test > 6){
		cand = pow(10,m.orderMag(cand) + 1);
	}
	return cand;
};

m.roundDown = function(r){
	let step = 5 * pow(10,m.orderMag(r) - 1);
	let cand = firstDigit(r) * pow(10,m.orderMag(r));
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

	let refOm = m.orderMag(ref);
	let start = pow(10,refOm) * firstDigit(ref);
	while(start <= ref){
		start += dist;
	}
	return start;
};

m.closestRoundDown = function(ref,dist){

	let om = m.orderMag(dist);

	if(ref < 0){
		return - m.closestRoundUp(-ref,om);
	}

	let refOm = m.orderMag(ref);
	let start = pow(10,refOm) * firstDigit(ref);
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
	let out = (value / fac).toFixed(1);
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

m.equal = function(v1,v2){
	return v1 === v2;
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
