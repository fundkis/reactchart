var utils = require('../core/utils.cs.js');
var _ = require('underscore');

/*
 * beware of distance (period) versus
 * values (date), see {date,nbr}Mgr.cs.js
*/
var computeTicks = function(start,length,minor,fac){
	var mgr = utils.mgr(length);
	// distance min criteria 1
	// 10 ticks max
	var dec = mgr.divide(length,10);
	var majDist = mgr.roundUp(dec);
	var minDist = 0;
	if(minor){
		minDist = majDist;
		majDist = mgr.roundUp(majDist);
	}

	var out = [];
	var nmaj = 0;
	var totLength =	mgr.multiply(majDist,nmaj);
	while(totLength <= length){
		var curValue = mgr.add(start,totLength);
		out.push({
			where: curValue,
			offset: mgr.offset(majDist),
			label: mgr.label(curValue,majDist,fac)
		});
		// minor ticks
		if(minor){
			var nmin = 1;
			var minLength = mgr.multiply(minDist,nmin);
			totLength = mgr.increase(totLength,minLength);
			while(minLength < majDist){
				if(totLength > length){
					break;
				}
				curValue = mgr.add(start,minLength);
				out.push({
					where: curValue,
					offset: mgr.offset(minDist),
					label: mgr.label(curValue,minDist,fac)
				});
				nmin++;
				minLength = mgr.multiply(minDist,nmin);
				totLength = mgr.increase(totLength,minLength);
			}
		}

		if(totLength > length){
			break;
		}

		nmaj++;
		totLength =	mgr.multiply(majDist,nmaj);
	}

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
