let utils = require('../core/utils.js');
let _ = require('underscore');

/*
 * beware of distance (period) versus
 * values (date), see {date,nbr}Mgr.js
*/
let computeTicks = function(first,last,minor,fac){
	let mgr = utils.mgr(first);
	let start = mgr.closestRoundUp(first,mgr.divide(mgr.distance(first,last),10));
	let length = mgr.distance(start,last);
	// distance min criteria 1
	// 10 ticks max
	let dec = mgr.divide(length,10);
	let majDist = mgr.roundUp(dec);
	let minDist = mgr.roundDown(majDist);

// redefine start to have the biggest rounded value
	let biggestRounded = mgr.orderMagValue(last,first);
	start = utils.isNil(biggestRounded) ? start : biggestRounded;
	while(mgr.greaterThan(start,first) || mgr.equal(start,first)){
		start = mgr.subtract(start,majDist);
	}
	start = mgr.add(start,majDist);
	length = mgr.distance(start,last);
	let llength = mgr.multiply(majDist,mgr.labelF);

	let out = [];
	let curValue = start;
	// if a date, might want a first label with no tick
	if(mgr.type === 'date'){
		let pos = mgr.subtract(curValue,majDist);
		if(mgr.greaterThan(mgr.distance(first,curValue),llength)){
			out.push({
				position: pos,
				offset: {
					along: mgr.offset(majDist),
					perp: 0
				},
				label: mgr.label(pos,majDist,fac),
				show: false,
				showLabel: true
			});
		}
	}

	while(mgr.lowerThan(curValue,last)){
		let lte = mgr.distance(curValue,last);
		out.push({
			position: curValue,
			offset: {
				along: mgr.offset(majDist),
				perp: 0
			},
			extra: false,
			label: mgr.type !== 'date' || mgr.greaterThan(lte, llength) ? mgr.label(curValue,majDist,fac) : '',
			minor: false
		});
		// minor ticks
		if(minor){
			let curminValue = mgr.add(curValue,minDist);
			let ceil = mgr.add(curValue,majDist);
			while(mgr.lowerThan(curminValue,ceil)){
				if(mgr.greaterThan(curminValue,last)){
					break;
				}
				out.push({
					position: curminValue,
					offset: {
						along: mgr.offset(minDist),
						perp: 0
					},
					extra: false,
					label: mgr.label(curminValue,minDist,fac),
					minor: true
				});
				curminValue = mgr.add(curminValue,minDist);
			}
		}

		curValue = mgr.add(curValue,majDist);
	}

	out = out.concat(mgr.extraTicks(majDist,first,last, out));
	return out;
};

let m = {};

m.ticks = function(start,length,labels,minor,fac){
	if(!!labels && labels.length > 0){
		return _.map(labels, (lab) => {
			return {
				position: lab.coord, 
				label: lab.label, 
				offset: {
					along: 0,
					perp: 0
				}
			};
		});
	}

	return computeTicks(start,length,minor,fac);
};


module.exports = m;
