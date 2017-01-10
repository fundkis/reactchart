/////////////////////
/// misc
///////////////////

var relEps = 1e-16;

var misc = {};

// a < b
misc.lowerThan = function(a,b){
	return (a - b) < - relEps;
};

// a < b
misc.greaterThan = function(a,b){
	return (a - b) > relEps;
};

// a <= b
misc.lowerEqualThan = function(a,b){
	return (a - b) < relEps;
};

// a <= b
misc.greaterEqualThan = function(a,b){
	return (a - b) > - relEps;
};

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

var m = {};

m.misc = misc;

module.exports = m;
