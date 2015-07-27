/*
 * Here we define how we want to
 * put the ticks on an axis:
 *
 *  - step is imposed:
 *	    - number: 0.1, 0.5, 1 ...
 *     - date: 1 day, 1 week, 2 weeks, 1 month, 3 months, 6 months, N * year(s)
 *     - text: 
 *  - label is taken care of:
 *	    - number, text: obvious
 *	    - date: format the date as follow:
 *          - YYYY if step > year
 *   	      - MMM  if step  = 2 months
 *          - YYYY if step > 2 month
 *          - DD/MM else
 */

var space  = require('../core/space-transf.cs.js');
var moment = require('moment');

/*
 * responsible for printing the label
 * step is {step: , toNum:}
 */
var labelize = function(ds,step,i){

// label i is (ds.d.min + i * step) textalized :)
	var cur_step = ds.d.min + step.toNum * i;

	if(step.step === step.toNum){ // number
		return (Math.round(cur_step.toFixed(5) * 1e5) / 1e5).toString(); // ce qu'il faut faire pour arrondir...
	}else{// date

			// step > year
		if(step.step.asYears() >= 1){
			return moment(new Date(cur_step)).format("YYYY");
			// step = 2 month
		}else if(step.step.asMonths() === 2){
			return moment(new Date(cur_step)).format("MMM");
			// step >= 1 month
		} else if(step.step.asMonths() >= 2){
			return moment(new Date(cur_step)).format("YYYY");
		} else {
			return moment(new Date(cur_step)).format("DD/MM");
		}
	}
};

// helper function
// returns the min and a stepper function
// {min, next_step(step,dir), dist(step1,step2)}
var default_step = function(type){
	switch(type){
		case 'text':
			return {};
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
					// 1 month = 30 days
					// 1 year  = 365 days
					// it is then translated back into a duration
					var step_days = step.asDays();
					var steps = [1,7,14,30,60,90,365];
					var step_as = [
						{n: 1,  t: 'day'},
						{n: 7,  t: 'day'},
						{n: 14, t: 'day'},
						{n: 1,  t: 'month'},
						{n: 2,  t: 'month'},
						{n: 3,  t: 'month'},
						{n: 1,  t: 'year'}];
					var ic = 0;
					while(steps[ic] < step_days){
						ic++;
						if(ic === steps.length - 1){
							break;
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
			throw 'type is "text", "number" or "date"';
	}
};

var m = {};

// find the step, this is a 1D step in the dir direction
// constrains are:
//   - 1) no more than 10 ticks
//   - 2) no less than 25 px between ticks
m.stepper = function(ds,type){

	var max_ticks = 10; // rule 1)
	var min_dist  = space.toDwidth(ds,25); // rule 2) in data space

	var closest = function(step,stepper){

		var step_up = stepper.next_step(step,'+');
		var up = stepper.dist(step_up,step);

		var step_down = stepper.next_step(step,'-');
		var down = stepper.dist(step_down,step);

		return (up < down)?step_up:step_down;
	};

	// small helper function to deal with dates
	// steps are duration (moment.duration())
	var toNum = function(thing,type){
		return (type === 'date')?thing.asMilliseconds():thing;
	};

	// finding step
	var def_step = default_step(type); // step defs

	// by def, cond 1) will be respected
	var step = (type === 'date')?moment.duration((ds.d.max - ds.d.min) / max_ticks, 'milliseconds'):(ds.d.max - ds.d.min) / max_ticks; // useless but let's be explicit
	step = closest(step,def_step);

	// now inforcing cond 2), still checking cond 1)
	var dist = toNum(step,type);
	var n = (ds.d.max - ds.d.min)/dist;
	while(dist < min_dist || n > max_ticks){
		step = def_step.next_step(step,'+');
		dist = toNum(step,type);
		n = (ds.d.max - ds.d.min)/dist;
	}

	return {step: step, toNum: toNum(step,type)};

};

// origin = {x, y}
// ds = {c:{min, max}, d: {min, max}, d2c, c2d}
// props.type = 'text' || 'number' || 'date'
// props.labels = ['tick labels'] // if props.type === 'text'
// props.placement = 'top' || 'bottom' || 'left' || 'right'
m.ticks = function(origin,ds,dir,props){

	// tick direction in degrees
	var tickdir = parseFloat(dir) + 90; // forcing float addition
	if(props.placement === 'left' || props.placement === 'top'){tickdir += 180;}
	if(tickdir > 180){tickdir -= 360;}

	// in data space, d_step = {step: Date || double, toNum: double}
	var d_step = m.stepper(ds,props.type);

	// to coord space in direction dir
		// origin of axis
	var dirr = parseFloat(dir) * Math.PI / 180;
	var xdir = Math.cos(dirr);
	var ydir = Math.sin(dirr);
	var xstart = origin.x;
	var ystart = origin.y;
		// steps
	var c_stepx = space.toCwidth(ds, xdir * d_step.toNum);
	var c_stepy = space.toCwidth(ds, ydir * d_step.toNum);

	var out = [];
	var nTick = Math.floor((ds.d.max - ds.d.min) / d_step.toNum) + 1;
	var full_length = Math.abs(ds.c.max - ds.c.min);
	var dist = function(x,y){
		return Math.sqrt( (x - xstart) * (x - xstart) + (y - ystart) * (y - ystart) );
	};
	for(var i = 0; i < nTick; i++){

		var here = {
			x: xstart + i * c_stepx,
			y: ystart + i * c_stepy
		};
		if(dist(here.x,here.y) > full_length){break;}

		var me = (props.type === 'text')?props.labels[i]:labelize(ds,d_step,i);

		out.push({dir:tickdir, here:here, me:me});
	}
	return out;
};



module.exports = m;
