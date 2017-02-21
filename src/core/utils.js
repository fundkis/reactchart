let date = require('./dateMgr.js');
let nbr  = require('./nbrMgr.js');

let m ={};

let isPeriod = function(v){
	let out = false;
	for(let t in {years: true, 	months: true, weeks: true, days: true}){
		out = out || !m.isNil(v[t]);
	}
	return out;
};

m.math = require('./mathMgr.js');

m.isDate = (v) => !!v && (v instanceof Date || isPeriod(v));

m.isArray = (v) => !!v && Array.isArray(v);

m.isString = (v) => !!v && typeof v === 'string';

m.isNil = (v) => v === null || v === undefined;

m.isValidNumber = (r) => !m.isNil(r) && !isNaN(r) && isFinite(r);

m.isValidParam = (p) => m.isDate(p) || m.isString(p) || m.isValidNumber(p);

m.deepCp = function(tgt,thing){

	if(typeof thing === 'object'){
		if(!tgt || typeof tgt !== 'object'){
			if(m.isArray(thing)){
				tgt = [];
			}else if(thing instanceof Date){
				tgt = new Date(thing.getTime());
			}else if(thing === null){
				return null;
			}else{
				tgt = {};
			}
		}
		for(let t in thing){
			tgt[t] = m.deepCp(tgt[t],thing[t]);
		}
	}else{
		tgt = thing;
	}
	return tgt;
};

m.mgr = (ex) => m.isDate(ex) ? date : nbr;

m.homothe = function(src,tgt,fac,val){
	let t = m.isDate(tgt) ? date.getValue(tgt) : tgt;
	let v = m.isDate(val) ? date.getValue(val) : val;
	let s = m.isDate(src) ? date.getValue(src) : src;
	let sol = t + (v - s) * fac;
  return ( m.isDate(tgt) ) ? new Date(sol) : sol ;
};

m.toValue = (val) => m.isDate(val) ? date.getValue(val) : val;

m.direction = function(line, ds){
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

		let distSqr = (p1,p2) => (p2.x - p1.x) * (p2.x - p1.x) + (p2.y - p1.y) * (p2.y - p1.y);
		let B = {x: line.end.x, y: line.start.y};
		let AB = distSqr(line.start,B);
		let BC = distSqr(B,line.end);

		let hor = '-1';
		let ver = '-1';
		if(!!ds){
			// 0: left, 1: right
			hor = Math.abs(line.end.x - ds.x.c.min) < Math.abs(ds.x.c.max - line.end.x) ? '0' : '1';
			// 0: bottom, 1: top
			ver = Math.abs(line.end.y - ds.y.c.min) < Math.abs(ds.y.c.max - line.end.y) ? '0' : '1';
		}

		return {x: AB, y: BC, line: distSqr(line.end,line.start), corner: hor + ver};

};

// to make proper period objects
m.makePeriod = date.makePeriod;

module.exports = m;
