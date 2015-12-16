var moment = require('moment');
var _ = require('underscore');

var m = {};

// period = {
//	years : ,
//	months : ,
//	weeks : ,
//	days : ,
//  total: *nb days*
// }
var processPeriod = function(period){

	for(var t in {years: true, months: true, weeks: true, days: true}){
		if(!period[t]){
			period[t] = 0;
		}
	}
	if(!period.total){
		period.total = moment.duration(period).asDays();
	}

	return period;
};

var makePeriod = function(ms){
	var dur = moment.duration(ms);
	return {
		years: dur.years(),
		months: dur.months(),
		weeks: dur.weeks(),
		days: dur.days(),
		total: dur.asDays()
	};
};

// order of magnitude of a period
// always down
var roundPeriod = function(p){

	var types = ['years','months','weeks','days'];

	var makeThis = (type,n) => {
		for(var t = 0; t < types.length; t++){
			if(type === types[t]){
				continue;
			}
			p[types[t]] = 0;
		}
		p[type] = n;
	};

	// 1/10 of years or 1
	// 6, 3 or 1 month(s)
	// 2 or 1 week(s)
	// 1 day
	if(p.asYears > 2){
		makeThis('years',Math.max(Math.floor(p.asYears)/10,1));
	}else if(p.asMonths >= 6){
		makeThis('months', 6);
	}else if(p.asMonths >= 3){
		makeThis('months', 3);
	}else if(p.asMonths >= 1){
		makeThis('months', 1);
	}else if(p.asWeeks >= 2){
		makeThis('weeks', 2);
	}else if(p.asWeeks >= 1){
		makeThis('weeks', 1);
	}else{
		makeThis('days', 1);
	}

	p.total = moment(p).duration.asDays();
};

var closestUp = function(date,per){
	var out = closestDown(date,per);
	while(out.getTime() < date.getTime()){
		out = m.add(out,per);
	}

	return out;
};

// beginning of period
var closestDown = function(date,per){
	// day
	if(per.days !== 0){
		return moment(date).subtract(per.days,'days').startOf('day').toDate();
	}
	// start of week: Sunday
	if(per.weeks !== 0){
		 return moment(date).subtract(per.weeks,'weeks').startOf("week").toDate();
	}
	// start of month
	if(per.months !== 0){
		 return moment(date).subtract(per.months,'months').startOf('month').toDate();
	}
	// start of year
	if(per.months !== 0){
		 return moment(date).subtract(per.years,'years').startOf("year").toDate();
	}
};

m.add = function(d,p){
	// preprocess period
	p = processPeriod(p);

	return moment(d)
		.add(p.years,'years')
		.add(p.months,'months')
		.add(p.weeks,'weeks')
		.add(p.days,'days').toDate();
};

m.subtract = function(d,p){
	// preprocess period
	p = processPeriod(p);

	return moment(d)
		.subtract(p.years,'years')
		.subtract(p.months,'months')
		.subtract(p.weeks,'weeks')
		.subtract(p.days,'days').toDate();
};

m.closestRoundUp = function(ref,om){
	return closestUp(ref, roundPeriod(makePeriod(Math.pow(10,om))) );
};

m.closestRoundDown = function(ref,om){
	return closestDown(ref, roundPeriod(makePeriod(Math.pow(10,om))) );
};

m.closestRound = function(ref,om,type){
	return (type === 'up')? m.closestRoundUp(ref,om):m.closestRoundDown(ref,om);
};

m.min = function(dates){
	return new Date(Math.min.apply(null,_.map(dates, (date) => {return date.getTime();})));
};

m.max = function(dates){
	return new Date(Math.max.apply(null,_.map(dates, (date) => {return date.getTime();})));
};

module.exports = m;
