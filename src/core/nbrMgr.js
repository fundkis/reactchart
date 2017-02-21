let { pow, floor, log, min, max, abs, LN10 } = Math;

let suffixes = {
	18: 'E', // exa
	15: 'P', // peta
	12: 'T', // tera
	9: 'G',  // giga
	6: 'M',  // mega
	3: 'k',  // kilo
  0: '',   // unit
	'-3': 'm', // milli
	'-6': '\u03BC', // micro
	'-9': 'n', // nano
	'-12': 'p', // pico
	'-15': 'f', // femto
	'-18': 'a' // atto
};

let m = {};

let firstDigit = function(r){
	let res = r * pow(10,-m.orderMag(r));
	let str = '' + res;
	let out = str[0] || 0;
	return Number(out);
};

let firstNonNull = function(v){
	let str = v + '';
	let com = str.indexOf('.');
	if(com < 0){
		return 0;
	}
	let i, out;
	for (i = str.length - 1; i >= 0; i--){
		if(str[i] !== '0'){
			break;
		}
	}
	out = i - com;
	return max(out,0);
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

let scientific = (val, orMax) => {
	let om = m.orderMag(val);
	let face = val / pow(10,om);
	while(face >= 10){
		face /= 10;
		om += 1;
	}

	let maxV = max(om - orMax + 1, 0);
	let f = min(firstNonNull(face), maxV);

	return {base: face.toFixed(f), power: om};
};

let suffixe = (order) => {
	let num = order % 3 === 0 ? order : (order - 1) % 3 === 0 ? order - 1 : order - 2;
	return {
		num, 
		string: suffixes[num]
	};
};

let natural = (val, orMax) => {
	let om = m.orderMag(val);
	let { num, string } = suffixe(om);
	let base = val / pow(10, num);
	while(base >= 1e3){
		base /= 1e3;
		om += 3;
		string = suffixe(om).string;
	}

	let maxV = max(om - orMax + 1, 0);
	let comp = firstNonNull(base);
	let f = min(comp, maxV);

	return base.toFixed(f) + string;
};

let labelFromType = (type, dist) => {

	switch(type){
		case 'sci':
			return (val) => scientific(val, m.orderMag(dist));
		case 'nat':
			return (val) => natural(val, m.orderMag(dist));
		default:
			return () => false;
	}
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

// management
m.labelize     = (type, dist) => labelFromType(type, dist);

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
