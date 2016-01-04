/*
 * various transformation between a data space
 * and a coordinate space.
 *
 * We have linear, we need:
 *
 *  - log
 *  - polar
 */

var homothe = require('./utils.cs.js').homothe;

/**
 * ds is { c : {min, max}, d: {min,max}, c2d , d2c}
 */

var m={};

m.toC = function(ds, data) {
	return homothe(ds.d.min,ds.c.min,ds.d2c,data);
};

m.toCwidth = function(ds, dist){
	var d = (dist === undefined)?1:dist;
	return Math.abs(ds.d2c * d);
};

m.toD = function(ds, coord) {
	return homothe(ds.c.min,ds.d.min,ds.c2d,coord);
};

m.toDwidth = function(ds, dist){
	var d = (dist === undefined)?1:dist;
	return Math.abs(ds.c2d * d);
};

module.exports = m;
