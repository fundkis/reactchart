var utils = require('../core/utils.cs.js');
var _ = require('underscore');

/*
 * beware of distance (period) versus
 * values (date), see {date,nbr}Mgr.cs.js
*/
var computeTicks = function(first,last,minor,fac){
	var mgr = utils.mgr(first);
	var start = mgr.closestRoundUp(first,mgr.divide(mgr.distance(first,last),10));
	var length = mgr.distance(start,last);
	// distance min criteria 1
	// 10 ticks max
	var dec = mgr.divide(length,10);
	var minDist = mgr.roundUp(dec);
	var majDist = mgr.roundUp(minDist);
	if(!minor){
		majDist = utils.deepCp({},minDist);
	}

// redefine start to have the biggest rounded value
	var biggestRounded = mgr.orderMagValue(last,first);
	start = utils.isNil(biggestRounded) ? start : biggestRounded;
	while(mgr.greaterThan(start,first)){
		start = mgr.subtract(start,majDist);
	}
	start = mgr.add(start,majDist);
	length = mgr.distance(start,last);

	var out = [];
	var curValue = start;
	while(mgr.lowerThan(curValue,last)){
		out.push({
			where: curValue,
			offset: {
				along: mgr.offset(majDist),
				perp: 0
			},
			label: mgr.label(curValue,majDist,fac)
		});
		// minor ticks
		if(minor){
			var curminValue = mgr.add(curValue,minDist);
			var ceil = mgr.add(curValue,majDist);
			while(mgr.lowerThan(curminValue,ceil)){
				if(mgr.greaterThan(curminValue,last)){
					break;
				}
				out.push({
					where: curminValue,
					offset: {
						along: mgr.offset(minDist),
						perp: 0
					},
					label: mgr.label(curminValue,minDist,fac)
				});
				curminValue = mgr.add(curminValue,minDist);
			}
		}

		curValue = mgr.add(curValue,majDist);
	}

	out = out.concat(mgr.extraTicks(majDist,first,last));
	return out;
};

var m = {};

m.ticks = function(start,length,labels,minor,fac){
	if(!!labels && labels.length > 0){
		return _.map(labels, (lab) => {
			return {
				where: lab.coord, 
				label: lab.label, 
				offset: {
					x: 0,
					y: 0
				}
			};
		});
	}

	return computeTicks(start,length,minor,fac);
};


module.exports = m;
