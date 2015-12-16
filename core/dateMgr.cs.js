//var moment = require('moment');
var hd = require('../../tech/helpers/date.cs.js');

var m = {};


m.before = function(ms,y,m,d){
	var then = (hd.isDate(ms))?ms:new Date(ms);
	y = y || 0;
	m = m || 0;
	d = d || 0;

	//go back
	then = hd.addYears(then,-y);
	then = hd.addMonths(then,-m);
	then = hd.addDays(then,-d);

	return then;
};

m.after = function(ms,y,m,d){
	var then = (hd.isDate(ms))?ms:new Date(ms);
	y = y || 0.0;
	m = m || 0.0;
	d = d || 0.0;

	//go ahead
	then = hd.addYears(then,y);
	then = hd.addMonths(then,m);
	then = hd.addDays(then,d);

	return then;
};


m.dateBefore = function(ms,y,m,d){
	var then = (hd.isDate(ms))?ms:new Date(ms);
	if(!y && !m && !d){
		throw 'When before exactly??';
	}
	var mb = !!m;
	var db = !!d;


	y = y || then.getFullYear();
	m = (!!m)?m-1:then.getMonth();
	d = (!!d)?d:then.getDate();

	var out = new Date(y,m,d);

	if(hd.compare(then,out) < 0){
		if(db){
			out = hd.addMonths(out,-1);
		}else if(mb){
			out = hd.addYears(out,-1);
		}
	}
	return out;
};


m.dateAfter = function(ms,y,m,d){
	var then = (hd.isDate(ms))?ms:new Date(ms);
	if(!y && !m && !d){
		throw 'When after exactly??';
	}
	var mb = !!m;
	var db = !!d;

	y = y || then.getFullYear();
	m = (!!m)?m-1:then.getMonth();
	d = (!!d)?d:then.getDate();

	var out = new Date(y,m,d);

	if(hd.compare(then,out) > 0){
		if(db){
			out = hd.addMonths(out,1);
		}else if(mb){
			out = hd.addYears(out,1);
		}
	}
	return out;
};

module.exports = m;
