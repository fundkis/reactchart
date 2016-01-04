var nbr = require('./nbrMgr.cs.js');
var date = require('./dateMgr.cs.js');

var m ={};

m.math = require('./mathMgr.cs.js');

m.isDate = function(v){
	return v instanceof Date;
};

m.isString = function(v){
	return typeof v === 'string';
};

m.isNil = function(v){
	return (v === null || v === undefined);
};

m.isValidNumber = function(r){
	return !isNaN(r) && isFinite(r);
};

m.isValidParam = function(p){
	return m.isDate(p) || m.isString(p) || m.isValidNumber(p);
};

m.deepCp = function(tgt,thing){
	if(typeof thing === 'object'){
		if(!tgt){
			if(thing instanceof Array){
				tgt = [];
			}else{
				tgt = {};
			}
		}
		for(var t in thing){
			tgt[t] = m.deepCp(tgt[t],thing[t]);
		}
	}else{
		tgt = thing;
	}
	return tgt;
};

m.mgr = function(ex){
	return m.isDate(ex)?date:nbr;
};

m.homothe = function(src,tgt,fac,val){
	var t = m.isDate(tgt) ? tgt.getTime() : tgt;
	var v = m.isDate(val) ? val.getTime() : val;
	var s = m.isDate(src) ? src.getTime() : src;
	var sol = t + (v - s) * fac;
  return ( m.isDate(tgt) ) ? new Date(sol) : sol ;
};

module.exports = m;
