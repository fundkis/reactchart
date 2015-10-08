/*
 * Here we define how we want to
 * put the ticks on an axis:
 *
 *  - step is imposed:
 *		 - number: 0.1, 0.5, 1 ...
 *		 - date: 1 day, 1 week, 2 weeks, 1 month, 3 months, 6 months, N * year(s)
 *		 - text: 
 *  - label is taken care of:
 *		 - number, text: obvious
 *		 - date: format the date as follow:
 *				- YYYY if step > year
 *				- MMM  if step = 1 month
 *				- T    if step = 3 month
 *				- YYYY if step > 3 month
 *				- DD/MM else
 */

var space  = require('../core/space-transf.cs.js');
var moment = require('moment');
var hd = require('../../tech/helpers/date.cs.js');
var hmisc = require('../../tech/helpers/misc.cs.js');

/*
 * responsible for printing the label
 * step is {step: , toNum:}
 */
var labelize = function(val_d,step,func){

	func = func || function(val){
		return (Math.round(val.toFixed(5) * 1e5) / 1e5).toString(); // ce qu'il faut faire pour arrondir...
	};

	var out = {};

// label from date or number?
	if(step.step === step.toNum){ // number
		out.val = func(val_d);
		out.off = true;
	}else{// date
		var val = new Date(val_d);
			// step = 1 year
		if( (step.step.asYears() === 1) ){
			out.val = moment(val).format("YYYY");
			out.off = true;
			// step > 1 year
		}else if(step.step.asYears() >= 1){
			out.val = moment(val).format("YYYY");
			// step = 2 month
		}else if(step.step.asMonths() === 1){
			out.val = moment(val).format("MMM");
			out.off = true;
			// step = 3 month
		} else if(step.step.asMonths() === 3){
				//this is the first days of the next period, going back one day
			var t = 'T' + ( Math.floor(( hd.addDays(val,-1).getMonth() + 1 )/3));
			out.val = t;
			out.off = true;
		} else if(step.step.asMonths() === 6){
				//this is the first days of the next period, going back one day
			var s = 'S' + ( Math.floor(( hd.addDays(val,-1).getMonth() + 1 )/2));
			out.val = s;
			out.off = true;
		} else {
			out.val = moment(val).format("DD/MM/YY");
		}
	}

	return out;

};

// helper function
// returns the min and a stepper function
// {min, next_step(step,dir), dist(step1,step2)}
var default_step = function(type){
	switch(type){
		case 'number':
			// 0.00001, 0.00005, 0.0001, 0.0005, ...
			return {
				min: 1e-5, 
				next_step: function(step,dir){
					var lastDigit = function(num,e){
						if(!e){e = 1e5;}
						if(num * e < 1){
							e *= 10;
							return lastDigit(num,e);
						}
						if(num * e > 9){
							e /= 10;
							return lastDigit(num,e);
						}
						return num * e;
					};
					var check_step = 1e-5;
					while(step > check_step){
						check_step *= (lastDigit(check_step) % 5 === 0)? 2: 5;
					}
					if(dir === '+'){
						if(step !== check_step){ 
							return check_step;
						}else{
							return (lastDigit(step) % 5 === 0)?step * 2:step * 5;
						}
					}else if (dir === '-'){
						if(step !== check_step){
							step = check_step;
						}
						return (lastDigit(step) % 5 === 0)?step / 5:step / 2;
					}else{
						throw 'error in stepper function';
					}
				},
				dist: function(step1,step2){
					return Math.abs(step1 - step2);
				}
			};
		case 'date':
			// day, week, 2 weeks, 1 month, 2 months, 3 months, 6 month, N year(s)
			// 1, 7, 14, 30, 60, 90, 180, 365 * N
			// step is a duration ( moment.duration() )
			return {
				min: moment.duration(1, 'day'),
				next_step: function(step,dir){
					// we're using moment.js convention to compute
					// the step:
					// 1 year  = 365 days
					// it is then translated back into a duration
					var step_days = step.asDays();
					var steps = [
						moment.duration({day:1}).asDays(),
						moment.duration({week:1}).asDays(),
						moment.duration({week:2}).asDays(),
						moment.duration({month:1}).asDays(),
						moment.duration({month:2}).asDays(),
						moment.duration({month:3}).asDays(),
//						moment.duration({month:6}).asDays(),
						moment.duration({year:1}).asDays()
					];
					var step_as = [
						{n: 1, t: 'day'},
						{n: 1, t: 'week'},
						{n: 2, t: 'week'},
						{n: 1, t: 'month'},
						{n: 2, t: 'month'},
						{n: 3, t: 'month'},
//						{n: 6, t: 'month'},
						{n: 1, t: 'year'}
					];
					var ic = 0;
					while(steps[ic] < step_days){
						ic++;
						if(ic === steps.length - 1){ // we add a year
							var ny = step_as[ic].n + 1;
							step_as.push({
								n:ny,
								t:'year'
							});
							steps.push( moment.duration({year:ny}).asDays() );
						}
					}
					// we imposed the step, whatever happens
					if(step_days !== steps[ic]){step_days = steps[ic];} 
					if(dir === '+'){
						return (ic === steps.length - 1)?moment.duration(step_days/365 + 1, step_as[ic].t):moment.duration(step_as[ic+1].n,step_as[ic+1].t);
					}else if (dir === '-'){
						return (ic === 0)?moment.duration(step_as[ic].n,step_as[ic].t):moment.duration(step_as[ic-1].n,step_as[ic-1].t);
					}else{
						throw 'error in stepper function';
					}
				},
				dist: function(step1,step2){
					var one = step1.asMilliseconds();
					var two = step2.asMilliseconds();
					return Math.abs(one - two);
				}
			};
		default:
			throw 'type is "number" or "date"';
	}
};


// the floor for date, we don't care below the day
var floorDate = function(ds,ori,step){
	if(step.step.asDays() < 7){
		return ori;
	}
	var out;
	var newori = new Date(ori);
	var ndays;
	// weekly, we want to start mondays
	if(step.step.asDays() < 14){
		ndays = 1 - newori.getDay();
		if(ndays < 0){
			ndays += 8;
		}
			out = hd.addDays(newori,ndays);
		// months, we want to start the 01/cur month
		}else if(step.step.asMonths() <= 3){
			ndays = 0;
			while(newori.getDate() !== 1){
				newori = hd.addDays(newori,1);
				ndays++;
			}
			out = newori;
		// years, we want the 01/01/cur year
		}else{
			ndays = 0;
			while(newori.getDate() !== 1 || newori.getMonth() !== 0){
				newori = hd.addDays(newori,1);
				ndays++;
			}
			out = newori;
		}
		return out.getTime();
};


var findTick = function(start,d_step,i){
	if(d_step.step === d_step.toNum){ // number
		return start + i * d_step.toNum;
	}else{ // date, d_step.step is a duration

		var where = new Date(start);
		var duree = [{d: 'days', D:'Days'},{d:'months', D:'Months'},{d: 'years', D:'Years'}];
		for (var m = 0; m < duree.length; m++){
			var j = d_step.step[duree[m].d]() * i;
			where = hd['add' + duree[m].D](where,j);
		}

		return where.getTime();
	}
};

var roundStart = function(start,d_step){
	// order of magnitude
	var om = (start > 0)?Math.pow(10, Math.floor(Math.log(start) / Math.log(10) + 1)):
					- Math.pow(10, Math.floor(Math.log(Math.abs(start)) / Math.log(10)) );
	// where on this order
	var l = 1;
	if(om > 0){
		if(9 / 10 * om > start){
			om /= 10;
			while(om * l < start){
				l++;
			}
		}
	}else if(om < 0){
		l++;
		while(l * om > start){
			l++;
		}
		l--;
	}
	if(l === 9){
		l++;
	}else if(l === 1 && om < 0 && ( d_step.toNum / Math.abs(om) <= 0.1 )){
		l = 0;
	}
	while(om * l < start){
		(om < 0)?l--:l++;
	}

	return om * l;

};


var m = {};

// find the step, this is a 1D step in the dir direction
// constrains are:
//   - 1) no more than 10 ticks
//   - 2) no less than 25 px between ticks
m.stepper = function(ds,type){

	var step = 0;

	// small helper function to deal with dates
	// steps are duration (moment.duration())
	var toNum = function(thing,type){
		return (type === 'date')?thing.asMilliseconds():thing;
	};

	if(type === 'text'){
		step = 1.0;
	}else{

		var max_ticks = 10; // rule 1)
		var min_dist  = space.toDwidth(ds,25); // rule 2) in data space

		var closest = function(step,stepper){

			var step_up = stepper.next_step(step,'+');
			var up = stepper.dist(step_up,step);

			var step_down = stepper.next_step(step,'-');
			var down = stepper.dist(step_down,step);

			return (up < down)?step_up:step_down;
		};

		// finding step
		var def_step = default_step(type); // step defs

		// by def, cond 1) will be respected
		step = (type === 'date')?moment.duration((ds.d.max - ds.d.min) / max_ticks, 'milliseconds'):(ds.d.max - ds.d.min) / max_ticks; // useless but let's be explicit
		step = closest(step,def_step);

		// now inforcing cond 2), still checking cond 1)
		var dist = toNum(step,type);
		var n = Math.floor( (ds.d.max - ds.d.min)/dist );
		while(dist < min_dist || n > max_ticks){
			step = def_step.next_step(step,'+');
			dist = toNum(step,type);
			n = Math.floor( (ds.d.max - ds.d.min)/dist );
			if(n * dist === (ds.d.max - ds.d.min)){
				n -= 2;
			}
		}
	}

	return {step: step, toNum: toNum(step,type)};

};

// origin = {x, y}
// ds = {c:{min, max}, d: {min, max}, d2c, c2d}
// props.type = 'text' || 'number' || 'date'
// props.labels = [{coord: , label:'tick labels'}] // if props.type === 'text'
// props.placement = 'top' || 'bottom' || 'left' || 'right'
// props.labelize = function(val){return ...}
m.ticks = function(origin,ds,dir,props){
	// boolean to simplify writings
	var text = (props.type === 'text');

	// tick direction in degrees
	var tickdir = parseFloat(dir) + 90; // forcing float addition
	if(props.placement === 'left' || props.placement === 'top'){tickdir += 180;}
	if(tickdir > 180){tickdir -= 360;}

	// in data space, d_step = {step: Date || double, toNum: double}
	var d_step = m.stepper(ds,props.type);
	var start = ds.d.min;

	// we want the date to behave
	if(props.type === 'date'){
		start = floorDate(ds,start,d_step);
	}else{
		start = roundStart(start,d_step);
	}

	// to coord space in direction dir
	// origin of axis
	var dirr = parseFloat(dir) * Math.PI / 180;
	var xdir = Math.cos(dirr);
	var ydir = Math.sin(dirr);

	var out = [];
	var nTick = (text)?props.labels.length:Math.floor((ds.d.max - ds.d.min) / d_step.toNum) + 1;
	for(var i = 0; i < nTick; i++){

		// 1D coor
		var d_val = (text)?props.labels[i].coord:findTick(start,d_step,i); 
		if(hmisc.greaterEqualThan(d_val,ds.d.max)){
			break;
		}

		var loc_coord = space.toC(ds,d_val);

		var xpos = origin.x + xdir * (loc_coord - origin.x);
		var ypos = origin.y + ydir * (loc_coord - origin.y);

		var here = {
			x: xpos,
			y: ypos
		};

		var me = (text)?props.labels[i].label:labelize(d_val,d_step,props.labelize).val;

		var toOut = {
			dir:tickdir, 
			here:here, 
			me:me
		};
		if(props.type === 'date' && (d_step.step.asYears() === 1 || d_step.step.asMonths() === 1) ){
			toOut.offset = {
				x: space.toCwidth(ds,d_step.toNum)/2,
				y: 0
			};
		}

		out.push(toOut);
	}
	return out;
};

// origin = {x, y}
// ds = {c:{min, max}, d: {min, max}, d2c, c2d}
// props.type = 'text' || 'number' || 'date'
// props.labels = [{coord: , label:'tick labels'}] // if props.type === 'text'
// props.placement = 'top' || 'bottom' || 'left' || 'right'
// props.empty = true || false // if there's no data
// props.labelize = function(val){return ...}
m.subticks = function(origin,ds,dir,props){

	// boolean to simplify writings
	if(props.type === 'text'){
		throw 'no subtick can be a text';
	}

	// tick direction in degrees
	var tickdir = parseFloat(dir) + 90; // forcing float addition
	if(props.placement === 'left' || props.placement === 'top'){tickdir += 180;}
	if(tickdir > 180){tickdir -= 360;}

	// small helper function to deal with dates
	// steps are duration (moment.duration())
	var toNum = function(thing,type){
		return (type === 'date')?thing.asMilliseconds():thing;
	};
	// in data space, d_step = {step: Date || double, toNum: double}
	var d_step = m.stepper(ds,props.type);
	var def_step = default_step(props.type); // step defs
	var substep = {
			step: def_step.next_step(d_step.step,'-'),
			toNum: toNum(def_step.next_step(d_step.step,'-'),props.type)
	};

	var offsetLabel = (!props.empty) || ( (props.type === 'date') && (d_step.step.years() === 1) );

	// to coord space in direction dir
		// origin of axis
	var dirr = parseFloat(dir) * Math.PI / 180;
	var xdir = Math.cos(dirr);
	var ydir = Math.sin(dirr);
	var start = ds.d.min;

	// we want the date to behave
	if(props.type === 'date'){
		start = floorDate(ds,start,d_step);
	}else{
		start = roundStart(start,d_step);
	}

	var subtickme = function(boolFunc,ds,main,substep,orix,oriy,dirx,diry,tickdir,j,offset){

		var sub_val = findTick(main,substep,j);
		var out = [];

		while(boolFunc(sub_val) && labelize(sub_val,substep).off){

			var lab = labelize(sub_val,substep); 

			var loc_coord = space.toC(ds,sub_val);

			var here = {
				x: orix + dirx * (loc_coord - orix),
				y: oriy + diry * (loc_coord - oriy)
			};
			var toOut = {
				dir:tickdir, 
				here:here, 
				me:lab.val
			};
			if(offset){
				toOut.offset = {
					x: - space.toCwidth(ds,substep.toNum)/2,
					y: - 23 // hard-coded for the moment
				};
			}
			out.push(toOut);

			if(j > 0){
				j++;
			}else{
				j--;
			}
			sub_val = findTick(main,substep,j);
		}

		return out;
	};


	// boundaries to treat dist v/s values
	// beware of double precision
	var difTime = function(val,next){
		if(substep.step !== substep.toNum){
			return (substep.step.asYears() >= 1)?hmisc.lowerThan(val,next): hmisc.lowerEqualThan(val,next);
		}else{
			return hmisc.lowerThan(val,next);
		}
	};
	// 1 - subticks between ds.d.min and start
	var out = subtickme(function(curval){
			var minval = (hd.isDate(ds.d.min))?ds.d.min.getTime():ds.d.min;
			minval += substep.toNum / 2;
			return hmisc.greaterEqualThan(curval,minval) && difTime(curval,start);
		},
		ds, start, substep, origin.x, origin.y, xdir, ydir, tickdir, 0, offsetLabel);

	// 2 - subticks from start to end
	var nTick = Math.floor((ds.d.max - ds.d.min) / d_step.toNum) + 1;
	var func = function(cur_val){
		return hmisc.lowerThan(cur_val,ds.d.max) && difTime(cur_val,d_nval);
	};
	for(var i = 0; i < nTick; i++){

		// 1D coor
		var d_val = findTick(start,d_step,i); 
		var d_nval = findTick(start,d_step,i + 1); 

		out = out.concat(subtickme(func,
			ds, d_val, substep, origin.x, origin.y, xdir, ydir, tickdir, 1, offsetLabel));
	}
	return out;
};


module.exports = m;
