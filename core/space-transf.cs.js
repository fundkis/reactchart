/*
 * various transformation between a data space
 * and a coordinate space.
 *
 * We have linear, we need:
 *
 *  - log
 *  - polar
 */

var homothe = function(src,tgt,fac,val){
  return tgt + (val - src) * fac;
};

/**
 * ds is { c : {min, max}, d: {min,max}, c2d , d2c}
 */

var m={};

m.toC = m.toCy = m.toCx = function(ds, data) {
	return homothe(ds.d.min,ds.c.min,ds.d2c,data);
};

m.toCwidth = function(ds, dist){
	var d = (dist === undefined)?1.0:dist;
	return ds.d2c * d;
};

m.toD = m.toDy = m.toDx = function(ds, coord) {
	return homothe(ds.c.min,ds.d.min,ds.c2d,coord);
};

m.toDwidth = function(ds, dist){
	var d = (dist === undefined)?1.0:dist;
	return ds.c2d * d;
};

module.exports = m;
