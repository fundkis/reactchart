/////////////////////
/// misc
///////////////////

let relEps = 1e-16;

let misc = {};

// a < b
misc.lowerThan = (a,b) => (a - b) < - relEps;

// a < b
misc.greaterThan = (a,b) => (a - b) > relEps;

// a <= b
misc.lowerEqualThan = (a,b) => (a - b) < relEps;

// a <= b
misc.greaterEqualThan = (a,b) => (a - b) > - relEps;

// a === b
misc.equalTo = function(a,b,coef){
	coef = coef || 1;
	return Math.abs(a-b) < coef * relEps;
};

// a !== b
misc.notEqualTo = function(a,b,coef){
	coef = coef || 1;
	return Math.abs(a-b) > coef * relEps;
};

misc.isZero = function(a,coef){
	coef = coef || 1;
	return Math.abs(a) < coef * relEps;
};

let m = {};

m.misc = misc;

module.exports = m;
