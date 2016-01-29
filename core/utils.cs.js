var date = require('./dateMgr.cs.js');
var nbr  = require('./nbrMgr.cs.js');

var m ={};

var isPeriod = function(v){
	var out = false;
	for(var t in {years: true, 	months: true, weeks: true, days: true}){
		out = out || !m.isNil(v[t]);
	}
	return out;
};

m.math = require('./mathMgr.cs.js');

m.isDate = function(v){
	return !!v && (v instanceof Date || isPeriod(v));
};

m.isArray = function(v){
	return !!v && Array.isArray(v);
};

m.isString = function(v){
	return !!v && typeof v === 'string';
};

m.isNil = function(v){
	return v === null || v === undefined;
};

m.isValidNumber = function(r){
	return !isNaN(r) && isFinite(r);
};

m.isValidParam = function(p){
	return m.isDate(p) || m.isString(p) || m.isValidNumber(p);
};

m.deepCp = function(tgt,thing){

	if(typeof thing === 'object'){
		if(!tgt || typeof tgt !== 'object'){
			if(m.isArray(thing)){
				tgt = [];
			}else if(thing instanceof Date){
				tgt = new Date(thing.getTime());
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
	var t = m.isDate(tgt) ? date.getValue(tgt) : tgt;
	var v = m.isDate(val) ? date.getValue(val) : val;
	var s = m.isDate(src) ? date.getValue(src) : src;
	var sol = t + (v - s) * fac;
  return ( m.isDate(tgt) ) ? new Date(sol) : sol ;
};

m.toValue = function(val){
	return m.isDate(val) ? date.getValue(val) : val;
};

m.direction = function(line){
		// line is AC
		//
		//             C
		//            /|
		//          /  |
		//        /    |
		//      /      |
		//    /        |
		//	A -------- B
		//

		var distSqr = (p1,p2) => {return (p2.x - p1.x) * (p2.x - p1.x) + (p2.y - p1.y) * (p2.y - p1.y);};
		var B = {x: line.end.x, y: line.start.y};
		var AB = distSqr(line.start,B);
		var BC = distSqr(B,line.end);

		return {x: AB, y: BC, line: distSqr(line.end,line.start)};

};

module.exports = m;
