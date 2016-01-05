var moment = require('moment');
var _ = require('underscore');

var pow   = Math.pow;
var floor = Math.floor;
var log   = Math.log;
var min   = Math.min;
var max   = Math.max;
var abs   = Math.abs;
var LN10  = Math.LN10;

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

var fetchFormat = function(p){
	p = processPeriod(p);
	if(p.years !== 0){
		return {
			string: 'YYYY',
			pref: ''
		};
	}else if(p.months >= 6){
		return {
			string: 'S',
			pref: 'S'
		};
	}else if(p.months >= 3){
		return {
			string: 'Q',
			pref: 'T'
		};
	}else if(p.weeks !== 0){
		return {
			string: 'E/MM/YY',
			pref: ''
		};
	}else{
		return {
			string: 'DD/MM/YY',
			pref: ''
		};
	}
};

var roundDownPeriod = function(p){

	var make = (lab,val) => {
		return {
			label: lab,
			val: val
		};
	};

	var out = {};
	if(p.asYears > 2){
		out = make('years',max(floor(p.asYears)/10,1));
	}else if(p.asMonths >= 6){
		out = make('months', 6);
	}else if(p.asMonths >= 3){
		out = make('months', 3);
	}else if(p.asMonths >= 1){
		out = make('months', 1);
	}else if(p.asWeeks >= 2){
		out = make('weeks', 2);
	}else if(p.asWeeks >= 1){
		out = make('weeks', 1);
	}else{
		out = make('days', 1);
	}

	return out;
};

var roundUpPeriod = function(p){

	var make = (lab,val) => {
		return {
			label: lab,
			val: val
		};
	};

	var out = {};
	if(p.asYears > 2){
		out = make('years',max(floor(p.asYears)/10,1));
	}else if(p.asMonths >= 6){
		out = make('years', 1);
	}else if(p.asMonths >= 3){
		out = make('months', 6);
	}else if(p.asMonths >= 1){
		out = make('months', 3);
	}else if(p.asWeeks >= 2){
		out = make('months', 1);
	}else if(p.asWeeks >= 1){
		out = make('weeks', 2);
	}else if(p.asDays() >= 1){
		out = make('weeks', 1);
	}else{
		out = make('days', 1);
	}

	return out;
};

// round period of sale order of magnitude
// down by default
var roundPeriod = function(p,type){

	type = type || 'down';

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
	var round = ( type === 'up' ) ? roundUpPeriod(p) : roundDownPeriod(p);
	makeThis(round.label,round.val);

	p.total = moment.duration(p).asDays();

	return p;
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

var m = {};

// distance methods
m.orderMag = function(dop){
	var ms = (dop instanceof Date) ? dop.getTime() : moment.duration({days: processPeriod(dop).total}).asMilliseconds();

	return floor( log(ms) / LN10);
};

m.roundUp = function(p){
	return roundPeriod(p,'up');
};

m.roundDown = function(p){
	return roundPeriod(p,'down');
};

m.multiply = function(p,f){
	return makePeriod(moment.duration({days: processPeriod(p).total * f}).asMilliseconds());
};

m.divide = function(p,f){
	return makePeriod(moment.duration({days: processPeriod(p).total / f}).asMilliseconds());
};

m.increase = function(p1,p2){
	return makePeriod(moment.duration({days: processPeriod(p1).total + processPeriod(p2).total}).asMilliseconds());
};

m.offset = function(p){
	p = roundPeriod(processPeriod(p));
	return (p.offset )? roundPeriod(m.divide(p,2)) : null ;
};

// date methods
m.closestRoundUp = function(ref,om){
	return closestUp(ref, roundPeriod(makePeriod(pow(10,om))) );
};

m.closestRoundDown = function(ref,om){
	return closestDown(ref, roundPeriod(makePeriod(pow(10,om))) );
};

m.closestRound = function(ref,om,type){
	return (type === 'up')? m.closestRoundUp(ref,om):m.closestRoundDown(ref,om);
};

m.min = function(dates){
	return new Date(min.apply(null,_.map(dates, (date) => {return date.getTime();})));
};

m.max = function(dates){
	return new Date(max.apply(null,_.map(dates, (date) => {return date.getTime();})));
};

m.label = function(date,period){
	var format = fetchFormat(period);
	var out = '';
	if(format.pref === 'S'){
		out = (date.getMonth() > 5)? '2' : '1';
	}else{
		out = moment(date).format(format.string);
	}
	return format.pref + out;
};

// date & period methods
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

m.distance = function(d1,d2){
	return makePeriod(abs(d1.getTime() - d2.getTime()));
};

module.exports = m;
