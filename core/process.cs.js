var _ = require('underscore');
var space = require('./space-mgr.cs.js');
var utils = require('./utils.cs.js');

var m = {};

var copySerie = function(serie){
	return _.map(serie, (point,idx) => {
		var xstr = utils.isString(point.x);
		var ystr = utils.isString(point.y);
		return {
			x: (xstr)?idx:point.x, 
			y: (ystr)?idx:point.y, 
			xlabel: (xstr)?point.x:null,
			ylabel: (ystr)?point.y:null
		};
	});
};

var validate = function(series){

	var serTest = (ser) => {
		if(utils.isNil(ser[0])){
			return true;
		}
		for(var i = 0; i < ser.length; i++){
			if(!utils.isValidParam(ser[i])){
				return false;
			}
		}
		return true;
	};

	var testSerie = (serie) => {
		var vx	= serTest(_.map(serie, (p) => {return p.x;}));
		var vy	= serTest(_.map(serie, (p) => {return p.y;}));
		return vx && vy;
	};

	for(var s = 0; s < series.length; s++){
		if(utils.isNil(series[s]) || series[s].length === 0 || !testSerie(series[s])){
			return false;
		}
	}

	return true;

};

var preprocess = function(serie,type){

		if(type.key !== 'histogram'){
			throw new Error("Only 'histogram' is known as a preprocessing");
		}

		var equal = function(p1,p2){
			if( utils.isDate(p1) ){
				if( !utils.isDate(p2) ){
					throw new Error('Inconsistent data point in preprocess');
				}
				return p1.getTime() === p2.getTime();
			}else if( utils.isString(p1) ){
				if( !utils.isString(p2) ){
					throw new Error('Inconsistent data point in preprocess');
				}
				return p1 === p2;
			}else{
				return p1 === p2;
			}
		};

		var out = [];

		var dir = type.dir;
		var otherdir = (dir === 'x')?'y':'x';
		var ind = 0;
		var curref = serie[0][otherdir];

		var notComplete = true;
		var u = 0;
		while(notComplete){
			var data = _.map( _.filter(serie, (point) => {return equal(point[otherdir],curref);}),
				(point) => {return point[dir];}
			);
			var hist = utils.math.histo.opt_histo(data);
// drop -> bin
// value -> bin + db ( = next bin)
// shade -> prob
			var maxProb = -1;
			var start = ind;
			for(var d = 0; d < hist.length; d++){
				out[ind] = {};
				out[ind]['drop' + dir] = hist[d].bin;
				out[ind][dir] = hist[d].bin + hist[d].db;
				out[ind].shade = hist[d].prob;
				out[ind][otherdir] = curref;
				if(utils.isString(curref)){
					out[ind][otherdir + 'label'] = curref;
				}
				if(hist[d].prob > maxProb){
					maxProb = hist[d].prob;
				}
				ind++;
			}
			for(var i = start; i < ind; i++){
				out[i].shade /= maxProb;
				out[i].span = out[i].shade;
			}

			notComplete = false;
			for(var p = u; p < serie.length; p++){
				if(!equal(curref,serie[p])){
					curref = serie[p];
					u = p;
					notComplete = true;
					break;
				}
			}

		}
		return out;
};

var addOffset = function(series,stacked){
	var xoffset = [];
	var yoffset = [];
	for(var i = 0 ; i < series.length; i++){
		if(stacked[i]){ // stacked in direction 'stacked', 'x' and 'y' are accepted
			switch(stacked[i]){
				case 'x':
					// init xoffset
					if(xoffset.length === 0){
						xoffset = _.map(series[i],function(/*point*/){return 0;});
					}else{
						if(xoffset.length !== series[i].length){
							throw new Error('Stacked data needs to be of same size (x dir)!!');
						}
					}
					// add, compute and update
					for(var j = 0; j < xoffset.length; j++){
						series[i][j].xOffset = xoffset[j];
						xoffset[j] += series[i][j].x;
					}
					break;
				case 'y':
						// init yoffset
					if(yoffset.length === 0){
						yoffset = _.map(series[i],function(/*point*/){return 0;});
					}else{
						if(yoffset.length !== series[i].length){
							throw new Error('Stacked data needs to be of same size (y dir)!!');
						}
					}
					// add, compute and update
					for(var k = 0; k < yoffset.length; k++){
						series[i][j].yOffset = yoffset[j];
						yoffset[j] += series[i][j].y;
					}
					break;
			}
		}
	}
};

var makeSpan = function(series,data){

	var out = [];

	var spanSer = (barType) => {
		var n = 0;
		_.each(series, (serie,idx) => {
			if(data[idx].type === barType){
				out[idx] = spanify(serie, data[idx]);
				n++;
			}
		});

		var makeOffset = (serie,n,s) => {
			if(utils.isNil(serie.Span)){
				return;
			}
			var mgr = utils.mgr(serie.span);
			if(utils.isNil(serie.offset)){
				serie.offset = {};
			}

			var dir = barType[0] === 'y' ? 'y' : 'x';
			var othdir = dir === 'y' ? 'x' : 'y';
	// start[s] = x - span * n / 2 + s * span => offset = (s *  span  - span * n / 2 ) = span * (s - n / 2 )
			serie.offset[dir] = mgr.multiply(serie.span, s - n / 2 );
			if(utils.isNil(serie.offset[othdir])){
				serie.offset[othdir] = 0;
			}
			delete serie.Span;
		};

		var spanDiv = (serie,n,idx) => {
			if(utils.isNil(serie.Span)){
				return;
			}
			var mgr = utils.mgr(serie.span);
			serie.span = mgr.divide(serie.span,n);
			makeOffset(serie,n,idx);
		};

		_.each(out, (serie,idx) => spanDiv(serie,n,idx));
	};

	spanSer('Bars');
	spanSer('yBars');

	return out;
};

var spanify = function(serie,data){
	var out = {};
	if(utils.isNil(data.span)){
		var d = null;
		var dir = (data.type[0] === 'y')?'y':'x';

		var mgr = utils.mgr(serie[0][dir]);
		for(var i = 1; i < serie.length; i++){
			var dd = mgr.distance(serie[i][dir],serie[i - 1][dir]);
			if(d === null || mgr.lowerThan(dd, d)){
				d = dd;
			}
		}
		out.span = d;
	}else{
		out.span = data.span;
	}
	out.Span = true;

	return out;
};

m.process = function(props){

	var raw = _.map(props.data,(dat) => {return dat.series;});

	var state = {};
	var spanOffset = [];
	if(!validate(raw)){

		state.series = _.map(props.data, (/*ser*/) => {return [];});
	
	}else{

		var preproc = _.map(props.graphProps, (gp) => {return (!!gp.process.type)?gp.process:null;});
		state.series = _.map(raw, (serie,idx) => { return (!!preproc[idx])?preprocess(serie,preproc[idx]):copySerie(serie);});
		addOffset(state.series, _.map(props.data, (ser) => {return ser.stacked;}));
		spanOffset = makeSpan(state.series, _.map(props.data, (ser,idx) => {return {type: ser.type, span: props.graphProps[idx].span};}));

	}
	state.spanOffset = spanOffset;

		// so we have all the keywords
	var marginalize = (mar) => {
		for(var m in {left: true, right: true, bottom: true, top: true}){
			if(!mar[m]){
				mar[m] = null;
			}
		}

		return mar;
	};

	var abs = (utils.isArray(props.axisProps.abs))?props.axisProps.abs:[props.axisProps.abs];
	var ord = (utils.isArray(props.axisProps.ord))?props.axisProps.ord:[props.axisProps.ord];

	var borders = {
		ord: ord, 
		abs: abs,
		marginsO: marginalize(props.outerMargin), 
		marginsI: marginalize(props.axisMargin)
	};
	var title = {title: props.title, titleFSize: props.titleFSize};

	// getting dsx and dsy
	var universe = {width: props.width, height: props.height};

	var data = _.map(state.series,(ser,idx) => {
		return {
			series: ser,
			stacked: props.data[idx].stacked,
			abs: props.data[idx].abs,
			ord: props.data[idx].ord,
			offset: (!!spanOffset[idx]) ? spanOffset[idx].offset : null
		};
	});
 
	// space = {dsx, dsy}
	state.spaces = space.spaces(data,universe,borders,title);


	return state;

};

module.exports = m;
