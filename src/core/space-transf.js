/*
 * various transformation between a data space
 * and a coordinate space.
 *
 * We have linear, we need:
 *
 *  - log
 *  - polar
 */

let utils = require('./utils.js');

/**
 * ds is { c : {min, max}, d: {min,max}, c2d , d2c}
 */

let m={};

m.toC = (ds, data) => utils.homothe(ds.d.min,ds.c.min,ds.d2c,data);

m.toCwidth = function(ds, dist){
	let d = dist === undefined ? 1 : utils.toValue(dist);
	return Math.abs(ds.d2c * d);
};

m.toD = (ds, coord) => utils.homothe(ds.c.min,ds.d.min,ds.c2d,coord);

m.toDwidth = function(ds, dist){
	let d = dist === undefined ? 1 : utils.toValue(dist);
	return Math.abs(ds.c2d * d);
};

m.fromPic = function(ds,data){
	let fac = (ds.c.max - ds.c.min);
	return utils.homothe(0,ds.c.min,fac,data);
};

module.exports = m;
