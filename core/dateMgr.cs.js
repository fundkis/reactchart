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

	if(period.total > 7){
		period.offset = true;
	}

	return period;
};

var makePeriod = function(msOrDur){
	var dur = ( !!msOrDur.years ) ? msOrDur : moment.duration(msOrDur);
	return {
		years: dur.years(),
		months: dur.months(),
		weeks: dur.weeks(),
		days: dur.days() - 7 * dur.weeks(),
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
	if(p.years > 2){
		out = make('years',max(floor(p.years)/10,1));
	}else if(p.months >= 6){
		out = make('months', 6);
	}else if(p.months >= 3){
		out = make('months', 3);
	}else if(p.months >= 1){
		out = make('months', 1);
	}else if(p.weeks >= 2){
		out = make('weeks', 2);
	}else if(p.weeks >= 1){
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
	if(p.years !== 0){
		out = make('years',floor(p.years) + 1);
	}else if(p.months >= 6){
		out = make('years', 1);
	}else if(p.months >= 3){
		out = make('months', 6);
	}else if(p.months >= 1){
		out = make('months', 3);
	}else if(p.weeks >= 2){
		out = make('months', 1);
	}else if(p.weeks >= 1){
		out = make('weeks', 2);
	}else if(p.days >= 1){
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
	while(out.getTime() <= date.getTime()){
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
		var month = 0;
		while(month < date.getMonth()){
			month += per.months;
		}
		month -= per.months;
		return new Date(date.getFullYear(),month,1);
	}
	// start of year
	if(per.months !== 0){
		return new Date(date.getFullYear(),0,1);
	}
};

var sameDoP = function(dop1,dop2){
	var b1 = dop1 instanceof Date;
	var b2 = dop2 instanceof Date;
	if(b1 !== b2){
		return null;
	}

	return (b1)?'date':'period';
};

var dateGT = function(d1,d2){
	return d1.getTime() > d2.getTime();
};

var dateLT = function(d1,d2){
	return d1.getTime() < d2.getTime();
};

var periodGT = function(p1,p2){
	return p1.total > p2.total;
};

var periodLT = function(p1,p2){
	return p1.total < p2.total;
};

var greaterThan = function(v1,v2,type){
	return (type === 'date')?dateGT(v1,v2):periodGT(v1,v2);
};

var lowerThan = function(v1,v2,type){
	return (type === 'date')?dateLT(v1,v2):periodLT(v1,v2);
};

var m = {};

// date / distance methods
m.orderMag = function(dop){
	var ms = (dop instanceof Date) ? dop.getTime() : moment.duration({days: processPeriod(dop).total}).asMilliseconds();

	return floor( log(ms) / LN10);
};

m.orderMagValue = function(last/*,first*/){
	return last;
};

m.orderMagDist = function(r){
	return makePeriod(pow(10,m.orderMag(r)));
};

m.roundUp = function(p){
	return roundPeriod(p,'up');
};

m.roundDown = function(p){
	return roundPeriod(p,'down');
};

m.multiply = function(p,f){
	return makePeriod(moment.duration({days: processPeriod(p).total * f}));
};

m.divide = function(p,f){
	return makePeriod(moment.duration({days: processPeriod(p).total / f}));
};

m.increase = function(p1,p2){
	return makePeriod(moment.duration({days: processPeriod(p1).total + processPeriod(p2).total}));
};

m.offset = function(p){
	p = processPeriod(p);

	var offsetMe = (per) => {
		if(per.years !== 0){
			return makePeriod(moment.duration({months: 6}));
		}else{
			return m.divide(p,2);
		}
	};

	return (p.offset )? offsetMe(p) : makePeriod(0) ;
};

// date methods
m.closestRoundUp = function(ref,per){
	return closestUp(ref, roundPeriod(per) );
};

m.closestRoundDown = function(ref,per){
	return closestDown(ref, roundPeriod(per) );
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

m.greaterThan = function(dop1,dop2){
	var sd = sameDoP(dop1,dop2);
	if(sd === null){
		throw 'Error in dateMgr: trying to compare a Date with a Period';
	}
	return greaterThan(dop1,dop2,sd);
};

m.lowerThan = function(dop1,dop2){
	var sd = sameDoP(dop1,dop2);
	if(sd === null){
		throw 'Error in dateMgr: trying to compare a Date with a Period';
	}
	return lowerThan(dop1,dop2,sd);
};

// managements
m.getValue = function(dop){
	return (dop instanceof Date) ? dop.getTime() : moment.duration(dop).asMilliseconds();
};

m.extraTicks = function(step,start,end){
	var out = [];
	var startYear = start.getFullYear();
	var lastYear = end.getFullYear();
	// every year, whatever happens
	for(var ye = startYear; ye <= lastYear; ye++){
		var dat = new Date(ye,0,1);
		if(m.lowerThan(start,dat) && m.lowerThan(dat,end)){
			out.push({
				where: dat,
				offset: {
					along: 0,
					perp: 0
				},
				extra: true,
				grid: {
					show: true,
					color: 'LightGray',
					width: 0.5,
					length: 0
				}
			});
		}
	}

	// label for years if not present
	if(m.lowerThan(step,makePeriod(moment.duration({years: 1})))){
		var zeroPeriod = makePeriod(0);
		for(var y = startYear; y <= lastYear; y++){
			var date = new Date(y,6,1);
			if(m.lowerThan(start,date) && m.lowerThan(date,end)){
				out.push({
					where: date,
					offset: {
						along: zeroPeriod,
						perp: -0.98
					},
					label: '' + y,
					labelColor: '#758D99', // grisFundKis '#3A83F1', // blueFundKis
					labelFSize: 20,
					extra: true
				});
			}
		}
	}
	return out;
};

m.smallestStep = function(){
	return makePeriod(moment.duration({days: 1}));
};

module.exports = m;
