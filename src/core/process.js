var _ = require('underscore');
var space = require('./space-mgr.js');
var utils = require('./utils.js');
var gProps = require('./proprieties.js');
var vm = require('./VMbuilder.js');
var im = require('./im-utils.js');
var legender = require('./legendBuilder.js');

var defaultTheProps = function(props){

	// axis depends on data,
	// where are they?
	let axis = {
		abs: _.uniq(_.map(_.pluck(props.data, 'abs'), (e) => utils.isNil(e) ? 'bottom'	 : e.axis || 'bottom')),
		ord: _.uniq(_.map(_.pluck(props.data, 'ord'), (e) => utils.isNil(e) ? 'left' : e.axis || 'left')),
	};

	// empty graph
	if(axis.abs.length === 0){
		axis.abs.push('bottom');
	}
	if(axis.ord.length === 0){
		axis.ord.push('left');
	}

	// fill by default
	let fullprops = utils.deepCp(utils.deepCp({},gProps.Graph(axis)), props);

	// default for pie !!!bad coding!!!, Pie should do it (how?)
	let noMark = (idx) => {
		fullprops.graphProps[idx].markType = 'pie';
		fullprops.graphProps[idx].mark = false;
	};

	if(!!_.find(props.data, (data) => data.type === 'Pie')){
		_.each(fullprops.axisProps.abs, (ax) => {ax.show = false;});
		_.each(fullprops.axisProps.ord, (ax) => {ax.show = false;});
		_.each(props.data, (d,idx) => d.type === 'Pie' ? noMark(idx) : null);
	}

	// data & graphProps
	let data = gProps.defaults('data');
	for(let ng = 0; ng < fullprops.data.length; ng++){
		let gprops = gProps.defaults(props.data[ng].type || 'Plain');
		fullprops.data[ng] = utils.deepCp(utils.deepCp({},data), props.data[ng]);
		fullprops.graphProps[ng] = utils.deepCp(utils.deepCp({},gprops), props.graphProps[ng]);
	}

	return fullprops;
};

var addDefaultDrop = function(serie, dir, ds){

	var fetchDs = () => !!ds[dir].bottom ? ds[dir].bottom : 
			!!ds[dir].top ? ds[dir].top : 
			!!ds[dir].left ? ds[dir].left : 
			!!ds[dir].right ? ds[dir].right : null;

	var defZero = (point) => utils.isDate(point[dir]) ? new Date(0) : 0 ;

	var def = (point) => {
		var min = !!ds ? fetchDs().d.min : defZero(point);
		var raw = point;
		raw.drop[dir] = utils.isNil(raw.drop[dir]) ? min : raw.drop[dir];
		//var othdir = dir === 'x' ? 'y' : 'x';
		//raw.drop[othdir] = undefined;
		
		return raw;
	};

	var cus = (p) => p;

	var comp = !!dir ? def : cus ;

	return _.map(serie, (point) => comp(point));
};

var copySerie = function(serie){

	return _.map(serie, (point,idx) => {
		var xstr = utils.isString(point.x);
		var ystr = utils.isString(point.y);
		var raw = {
			x: xstr ? idx : point.x,
			y: ystr ? idx : point.y,
			label: {
				x: xstr ? point.x : !!point.label && point.label.x ? point.label.x : undefined,
				y: ystr ? point.y : !!point.label && point.label.y ? point.label.y : undefined
			},
			drop: {
				x: ystr ? 0 : undefined,
				y: xstr ? 0 : undefined
			},
			tag: !utils.isNil(point.value) ? point.value + '' : // explicitely defined
				xstr ? xstr : ystr ? ystr : // it's a label
					'(' + point.x + ',' + point.y + ')' // the (x,y) coordinates
		};
		for(var u in point){
			if(u !== 'x' &&
				u !== 'y'  &&
				u !== 'label'){
				raw[u] = point[u];
			}
		}
		return raw;
	});
};

var validate = function(series,discard){

	for(var se = 0; se < series.length; se++){
		if(utils.isNil(series[se])){
			series[se] = [];
		}
		for(var p = 0; p < series[se].length; p++){
			var px = utils.isValidNumber(series[se][p].x);
			var py = utils.isValidNumber(series[se][p].y); 
			var pv = utils.isValidNumber(series[se][p].value);
			if(!pv && ( !utils.isValidParam(px) || !utils.isValidParam(py) ) ){
				if(!discard){
					return false;
				}
				series[se].splice(p,1);
				p--;
			}
		}
	}

	return true;

};

var addOffset = function(series,stacked){
	var xoffset = [];
	var yoffset = [];

	var span = (ser,idx) => ser.length > 1 ? idx === 0 ? Math.abs(ser[idx + 1] - ser[idx]) * 0.9:	// if first
		idx === ser.length - 1 ? Math.abs(ser[idx] - ser[idx - 1]) * 0.9 :	// if last
			Math.min(Math.abs(ser[idx] - ser[idx-1]),Math.abs(ser[idx+1] - ser[idx])) * 0.9 : // if in between
				0; // if no serie

	var ensure = (obj,prop) => !!obj[prop] ? null : obj[prop] = {};
	var writeIfUndef = (obj,prop,val) => !!obj[prop] ? null : obj[prop] = val;

	for(var i = 0 ; i < series.length; i++){

		_.each(series[i],(point) => {
			if(utils.isNil(point.offset)){
				point.offset = {};
			}
			point.offset.x = point.offset.x || undefined;
			point.offset.y = point.offset.y || undefined;
		});

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
						series[i][j].offset.x = xoffset[j];
						ensure(series[i][j],'drop');
						series[i][j].drop.x = 0;
						ensure(series[i][j],'span');
						writeIfUndef(series[i][j].span,'y',span(_.pluck(series[i],'y'),j));
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
						series[i][k].offset.y = yoffset[k];
						ensure(series[i][k],'drop');
						series[i][k].drop.y = 0;
						ensure(series[i][k],'span');
						writeIfUndef(series[i][k].span,'x',span(_.pluck(series[i],'x'),k));
						yoffset[k] += series[i][k].y;
					}
					break;
			}
		}
	}
};

var makeSpan = function(series,data){

	var spanSer = (barType) => {

		var makeOffset = (serie,n,s) => {
			if(utils.isNil(serie.Span) || series[s].length === 0){
				return;
			}
			if(utils.isNil(serie.offset)){
				serie.offset = {};
			}

			var dir = barType[0] === 'y' ? 'y' : 'x';
			var othdir = dir === 'y' ? 'x' : 'y';

			var mgr = utils.mgr(series[s][0][dir]);
			var othmgr = utils.mgr(series[s][0][othdir]);

	// start[s] = x - span * n / 2 + s * span => offset = (s *	span	- span * n / 2 ) = span * (s - n / 2 )
			serie.offset[dir] = mgr.multiply(serie.span, s - (n - 1) / 2);
			if(utils.isNil(serie.offset[othdir])){
				serie.offset[othdir] = othmgr.step(0);
			}
			_.each(series[s], (point) => {
				point.span = point.span || {};
				point.span[dir] = serie.span;
				point.offset = point.offset || {};
				point.offset[dir] = serie.offset[dir];
				point.offset[othdir] = serie.offset[othdir];
			});
		};

		var spanDiv = (serie,n,idx) => {
			if(utils.isNil(serie.Span)){
				return;
			}
			var mgr = utils.mgr(serie.span);
			serie.span = mgr.divide(serie.span,n);
			makeOffset(serie,n,idx);
		};

		var n = 0;
		var out = [];
		_.each(series, (serie,idx) => {
			if(data[idx].type === barType){
				out[idx] = serie.length ? spanify(serie, data[idx]) : {};
				n++;
			}
		});

		_.each(out, (serie,idx) => spanDiv(serie,n,idx));
	};

	spanSer('Bars');
	spanSer('yBars');

	spanSer('bars');
	spanSer('ybars');

};

var spanify = function(serie,data){
	var out = {};
	if(utils.isNil(data.span) || data.span === 0){
		var d;
		var dir = (data.type[0] === 'y')?'y':'x';

		var mgr = utils.mgr(serie[0][dir]);
		for(var i = 1; i < serie.length; i++){
			var dd = mgr.distance(serie[i][dir],serie[i - 1][dir]);
			if(d === undefined || mgr.lowerThan(dd, d)){
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

// if stairs, we need an offset
// at one boundary value
var offStairs = function(serie,gprops){
	if(serie.length < 2){
		return undefined;
	}

	if(!gprops.stairs || gprops.stairs === 'right'){
		return serie[serie.length - 1].x - serie[serie.length - 2].x;
	}else if(gprops.stairs === 'left'){
		return serie[0].x - serie[1].x;
	}else{
		return undefined;
	}
	return undefined;
};

var m = {};

m.process = function(rawProps){

	var props = defaultTheProps(utils.deepCp({},rawProps));

	var raw = _.pluck(props.data,'series');

	var state = {};
	var lOffset = [];

	// empty
	if(!validate(raw,props.discard)){

		state.series = _.map(props.data, (/*ser*/) => [] );

	}else{
			// data depening on serie, geographical data only
		state.series = _.map(raw, (serie) => copySerie(serie) );
			// offset from stacked
		addOffset(state.series, _.map(props.data, (ser) => ser.stacked ));
			// span and offset from Bars || yBars
		makeSpan(state.series, _.map(props.data, (ser,idx) => {return {type: ser.type, span: props.graphProps[idx].span};}));
			// offset from Stairs
		lOffset = _.map(props.data, (p,idx) => p.type === 'Stairs' ? offStairs(state.series[idx],props.graphProps[idx]) : undefined);

	}

		// so we have all the keywords
	var marginalize = (mar) => {
		for(var m in {left: true, right: true, bottom: true, top: true}){
			if(!mar[m]){
				mar[m] = undefined;
			}
		}

		return mar;
	};

		// axis data, min-max from series (computed in space-mgr)
	var abs = utils.isArray(props.axisProps.abs) ? props.axisProps.abs : [props.axisProps.abs];
	var ord = utils.isArray(props.axisProps.ord) ? props.axisProps.ord : [props.axisProps.ord];

	// let's look for labels given in the data
	_.each(props.data, (dat,idx) => {
		var locObDir = {x: 'abs', y: 'ord'};
		var ser = state.series[idx];
		for(var u in locObDir){
				var dir = locObDir[u];
				var locAxis = _.find(props.axisProps[dir], (ax) => ax.placement === dat[dir].axis);
				for(var p = 0; p < ser.length; p++){
					var point = ser[p];
					if(!!point.label[u]){  
						locAxis.tickLabels.push({coord: point[u], label: point.label[u]});
					}
				}
		}
	});

	var borders = {
		ord: ord,
		abs: abs,
		marginsO: marginalize(props.outerMargin),
		marginsI: marginalize(props.axisMargin)
	};

	// xmin, xmax...
	var obDir = {x: 'abs', y: 'ord'};
	var obMM = {min: true, max: true};
	for(var dir in obDir){
		for(var type in obMM){
			var tmp = dir + type; //xmin, xmax, ...
			if(!utils.isNil(props[tmp])){
				borders[obDir[dir]][0][type] = props[tmp];
			}
		}
	}

	var title = {title: props.title, titleFSize: props.titleFSize};

	// getting dsx and dsy
	var universe = {width: props.width, height: props.height};

	// span and offet pointwise
	// drops if required and not given (default value)
	_.each(state.series, (serie,idx) => {
		var dir;
		switch(props.data[idx].type){
			case 'Bars':
			case 'bars':
				dir = 'y';
				break;
			case 'yBars':
			case 'ybars':
				dir = 'x';
				break;
			default:
				break;
		}
		addDefaultDrop(serie,dir);
	});

	var data = _.map(state.series,(ser,idx) => {
		return {
			series: ser,
			phantomSeries: props.data[idx].phantomSeries,
			stacked: props.data[idx].stacked,
			abs: props.data[idx].abs,
			ord: props.data[idx].ord,
			limitOffset: (!!lOffset[idx]) ? lOffset[idx] : undefined,
		};
	});

	// empty
	if(data.length === 0){
		data[0] = {
			series: [{x: 42, y: 42}],
			abs: {
				axis: 'bottom',
				type: 'number'
			},
			ord: {
				axis: 'left',
				type: 'number'
			},
		};
	}

	// space = {dsx, dsy}
	state.spaces = space.spaces(data,universe,borders,title);

	// defaut drops for those that don't have them
	state.series = _.map(state.series, (serie,idx) => {
		var dir;
		switch(props.data[idx].type){
			case 'Bars':
			case 'bars':
				dir = 'y';
				break;
			case 'yBars':
			case 'ybars':
				dir = 'x';
				break;
			default:
				break;
		}
		if(!dir && !!props.graphProps[idx].process){
			dir = !props.graphProps[idx].process.dir || props.graphProps[idx].process.dir === 'x' ? 'y' : 'x';
		}
		return addDefaultDrop(serie,dir,state.spaces);
	});

	//now to immutable VM
	var imVM = {
		width: props.width,
		height: props.height,
		axisOnTop: props.axisOnTop
	};

	// 1 - cadre
	imVM.cadre = props.cadre;

	// 2 - background
	imVM.background = {
		color: props.background || 'none',
		spaceX:{
			min: Math.min.apply(null,_.map(state.spaces.x,(ds) => {return !!ds ? ds.c.min : 1e6;})),
			max: Math.max.apply(null,_.map(state.spaces.x,(ds) => {return !!ds ? ds.c.max : -1e6;}))
		},
		spaceY:{
			min: Math.min.apply(null,_.map(state.spaces.y,(ds) => {return !!ds ? ds.c.min : 1e6;})),
			max: Math.max.apply(null,_.map(state.spaces.y,(ds) => {return !!ds ? ds.c.max : -1e6;}))
		}
	};

	// 3 - foreground
	imVM.foreground = props.foreground || {};
	imVM.foreground.cx		 = imVM.foreground.cx			|| 0;
	imVM.foreground.cy		 = imVM.foreground.cy			|| 0;
	imVM.foreground.width  = imVM.foreground.width	|| 0;
	imVM.foreground.height = imVM.foreground.height || 0;
	imVM.foreground.ds		 = {
		x: state.spaces.x.bottom,
		y: state.spaces.y.left
	};

	// 4 - Title
	imVM.title = {
		title: props.title,
		FSize: props.titleFSize,
		width: props.width,
		// as of now, it's not used
		height: props.height,
		placement: 'top'
	};

	// 5 - Axes
	imVM.axes = {
		css: props.css,
		abs: vm.abscissas(props,state),
		ord: vm.ordinates(props,state)
	};

	// 6 - Curves
	imVM.curves = vm.curves(props,state);

	var le = legender(props);
	imVM.legend = () => le;

	return im.freeze(imVM,props.freeze);

};

m.processLegend = function(rawProps){
	var props = defaultTheProps(utils.deepCp({},rawProps));
	// data depening on serie, geographical data only
	props.data = _.map(props.data, (dat,idx) =>  {
		return {
		type: rawProps.data[idx].type,
		series: copySerie(dat.series)
		};
	});

	return legender(props);
};

module.exports = m;
