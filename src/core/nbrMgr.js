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

// value & distance methods
m.closestRound = (ref,om,type) => (type === 'up')? m.closestRoundUp(ref,om):m.closestRoundDown(ref,om);

m.min          = (values) => min.apply(null,values);

m.max          = (values) => max.apply(null,values);

m.label        = (value, useless, fac) => (value / fac).toFixed(1);

m.multiply     = (d,f) => d * f;

m.divide       = (d,f) => d / f;

m.increase     = (d1,d2) => d1 + d2;

m.offset       = (/*d*/) => 0;

m.add          = (d1,d2) => d1 + d2;

m.subtract     = (d1,d2) => d1 - d2;

m.distance     = (d1,d2) => abs(d1 - d2);

m.greaterThan  = (v1,v2) => v1 > v2;

m.lowerThan    = (v1,v2) => v1 < v2;

m.equal        = (v1,v2) => v1 === v2;

// some management
m.extraTicks = () => [];

m.getValue = m.value = m.step = (v) => v;

m.smallestStep = () => 1;

m.labelF = 0.75;

m.type = 'number';

m.autoFactor = function(ma,mi){
  let orMax = m.orderMag(ma);
  let orMin = m.orderMag(mi);
  let a = min(orMax, orMin);
  let b = max(orMax, orMin);
  
  return b - a < 3 ? pow(10,a) : pow(10,b);
};

module.exports = m;
