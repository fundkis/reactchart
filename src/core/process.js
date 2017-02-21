let _ = require('underscore');
let space = require('./space-mgr.js');
let utils = require('./utils.js');
let gProps = require('./proprieties.js');
let vm = require('./VMbuilder.js');
let im = require('./im-utils.js');
let legender = require('./legendBuilder.js');

let preprocessAxis = function(props){

  // axisProps is an Array, 
  // can be given as a non array
  // empty <==> ticks.major.show === false && ticks.minor.show === false
  if(!!props.axisProps){
    for(let u in props.axisProps){
      if(!Array.isArray(props.axisProps[u])){
        props.axisProps[u] = [props.axisProps[u]];
      }
      for(let ax = 0; ax < props.axisProps[u].length; ax++){
        let axe = props.axisProps[u][ax]; // too long
        if(axe.empty){
          if(!axe.ticks){
            axe.ticks = {};
          }
          if(!axe.ticks.major){
            axe.ticks.major = {};
          }
          if(!axe.ticks.minor){
            axe.ticks.minor = {};
          }
          axe.ticks.major.show = false;
          axe.ticks.minor.show = false;
        }else{
            // no major ticks
          if(!!axe.ticks && !!axe.ticks.major && axe.ticks.major.show === false){
              // no minor ticks
              if(!axe.ticks.minor || axe.ticks.minor.show !== true){
                axe.empty = true;
              }
          }
        }
      }
    }
  }

	// axis depends on data,
	// where are they?
	let axis = {
		abs: _.uniq(_.map(_.pluck(props.data, 'abs'), (e) => utils.isNil(e) ? 'bottom' : e.axis || 'bottom')),
		ord: _.uniq(_.map(_.pluck(props.data, 'ord'), (e) => utils.isNil(e) ? 'left'   : e.axis || 'left')),
	};

	// default
	if(axis.abs.length === 0){
		axis.abs.push('bottom');
	}
	if(axis.ord.length === 0){
		axis.ord.push('left');
	}

	return axis;

};

let postprocessAxis = function(props){

	let fetchBounds = (type,where) => {
		let serie = [];
		for (let id = 0; id < props.data.length; id++){
			let dataW = !!props.data[id][type] && !!props.data[id][type].axis ? props.data[id][type].axis : 
				type === 'abs' ? 'bottom' : 'left';
			if(dataW === where){
				serie = serie.concat(_.pluck(props.data[id].series, type === 'abs' ? 'x' : 'y'));
			}
		}

		let mgr = utils.mgr(serie[0]);
		return {
			max: mgr.max(serie),
			min: mgr.min(serie),
			mgr
		};

	};

	let cores = (wa) => {
		switch(wa){
			case 'left':
			case 'right':
				return 'top';
			case 'top':
			case 'bottom':
				return 'right';
		}
	};

	/// common factor, should we add some margin?
	for(let ax in {abs: true, ord: true}){

		for(let ia = 0; ia < props.axisProps[ax].length; ia++){

			let axisProps = props.axisProps[ax][ia];

		  if(axisProps.factor === 'auto'){
  	  	let { max, min, mgr } = fetchBounds(ax,axisProps.placement);

     		if(mgr.type === 'number'){
					axisProps.factor = mgr.autoFactor(max, min);
					if(axisProps.factor !== 1){
						let sax = cores(axisProps.placement);
						props.factorMargin[sax] = gProps.defMargins.outer.factor[sax];
					}
				}else{
					axisProps.factor = 1;
				}
	    }else{
  	    axisProps.factor = 1;
   		}
 		}

	}

};

let defaultTheProps = function(props){

	let axis = preprocessAxis(props);

	// fill by default
	let fullprops = utils.deepCp(utils.deepCp({},gProps.Graph(axis)), props);

	postprocessAxis(fullprops);

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

let addDefaultDrop = function(serie, dir, ds, after){

let fetchDs = (d) => !!ds[d].bottom ? ds[d].bottom : 
			!!ds[d].top ? ds[d].top : 
			!!ds[d].left ? ds[d].left : 
			!!ds[d].right ? ds[d].right : null;

let defZero = (point) => utils.isDate(point[dir]) ? new Date(0) : 0 ;

let def = (point,locdir) => {
	let min = !!ds ? fetchDs(locdir).d.min : defZero(point);
	let raw = point;
		raw.drop[locdir] = utils.isNil(raw.drop[locdir]) ? min : raw.drop[locdir];
		
		return raw;
	};

  // if dir is specified, only this dir, if not, both
	return _.map(serie, (point) => !!dir ? def(point,dir) : after ? def(def(point,'x'), 'y') : point);
};

let copySerie = function(serie){

	return _.map(serie, (point,idx) => {
	let xstr = utils.isString(point.x);
	let ystr = utils.isString(point.y);
	let raw = {
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
		for(let u in point){
			if(u !== 'x' &&
				u !== 'y'  &&
				u !== 'label'){
				raw[u] = point[u];
			}
		}
		return raw;
	});
};

let validate = function(series,discard){

	for(let se = 0; se < series.length; se++){
		if(utils.isNil(series[se])){
			series[se] = [];
		}
		for(let p = 0; p < series[se].length; p++){
		let px = utils.isValidNumber(series[se][p].x);
		let py = utils.isValidNumber(series[se][p].y); 
		let pv = utils.isValidNumber(series[se][p].value);
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

let addOffset = function(series,stacked){
let xoffset = [];
let yoffset = [];

let span = (ser,idx) => ser.length > 1 ? idx === 0 ? Math.abs(ser[idx + 1] - ser[idx]) * 0.9:	// if first
		idx === ser.length - 1 ? Math.abs(ser[idx] - ser[idx - 1]) * 0.9 :	// if last
			Math.min(Math.abs(ser[idx] - ser[idx-1]),Math.abs(ser[idx+1] - ser[idx])) * 0.9 : // if in between
				0; // if no serie

let ensure = (obj,prop) => !!obj[prop] ? null : obj[prop] = {};
let writeIfUndef = (obj,prop,val) => !!obj[prop] ? null : obj[prop] = val;

	for(let i = 0 ; i < series.length; i++){

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
					for(let j = 0; j < xoffset.length; j++){
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
					for(let k = 0; k < yoffset.length; k++){
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

let makeSpan = function(series,data){

let spanSer = (barType) => {

	let makeOffset = (serie,n,s,sb) => {
			if(utils.isNil(serie.Span) || series[s].length === 0){
				return;
			}
			if(utils.isNil(serie.offset)){
				serie.offset = {};
			}

		let dir = barType[0] === 'y' ? 'y' : 'x';
		let othdir = dir === 'y' ? 'x' : 'y';

		let mgr = utils.mgr(series[s][0][dir]);
		let othmgr = utils.mgr(series[s][0][othdir]);

	// start[s] = x - span * n / 2 + sb * span => offset = (sb *	span	- span * n / 2 ) = span * (sb - n / 2 )
			serie.offset[dir] = mgr.multiply(serie.span, sb - (n - 1) / 2);
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

	let spanDiv = (serie,n,idx,idxb) => {
			if(utils.isNil(serie.Span)){
				return;
			}
		let mgr = utils.mgr(serie.span);
			serie.span = mgr.divide(serie.span,n);
			makeOffset(serie,n,idx,idxb);
		};

	let n = 0;
	let out = [];
	let oidx = [];
		_.each(series, (serie,idx) => {
			if(data[idx].type === barType){
				out[idx] = serie.length ? spanify(serie, data[idx]) : {};
				oidx[idx] = n;
        n++;
			}
		});

		_.each(out, (serie,idx) => serie ? spanDiv(serie,n,idx,oidx[idx]) : null );
	};

	spanSer('Bars');
	spanSer('yBars');

	spanSer('bars');
	spanSer('ybars');

};

let spanify = function(serie,data){
let out = {};
	if(utils.isNil(data.span) || data.span === 0){
	let d;
	let dir = (data.type[0] === 'y')?'y':'x';

	let mgr = utils.mgr(serie[0][dir]);
		for(let i = 1; i < serie.length; i++){
		let dd = mgr.distance(serie[i][dir],serie[i - 1][dir]);
			if(d === undefined || mgr.lowerThan(dd, d)){
				d = mgr.multiply(dd,0.99);
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
let offStairs = function(serie,gprops){
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

let m = {};

m.process = function(rawProps){

	let props = defaultTheProps(utils.deepCp({},rawProps));

	let raw = _.pluck(props.data,'series');

	let state = {};
	let lOffset = [];

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
	let marginalize = (mar) => {
		for(let m in {left: true, right: true, bottom: true, top: true}){
			if(!mar[m]){
				mar[m] = undefined;
			}
		}

		return mar;
	};

		// axis data, min-max from series (computed in space-mgr)
	let abs = utils.isArray(props.axisProps.abs) ? props.axisProps.abs : [props.axisProps.abs];
	let ord = utils.isArray(props.axisProps.ord) ? props.axisProps.ord : [props.axisProps.ord];

	// let's look for labels given in the data
	_.each(props.data, (dat,idx) => {
	let locObDir = {x: 'abs', y: 'ord'};
	let ser = state.series[idx];
		for(let u in locObDir){
			let dir = locObDir[u];
			let locAxis = _.find(props.axisProps[dir], (ax) => ax.placement === dat[dir].axis);
				for(let p = 0; p < ser.length; p++){
				let point = ser[p];
					if(!!point.label[u]){  
						locAxis.tickLabels.push({coord: point[u], label: point.label[u]});
					}
				}
		}
	});

	let borders = {
		ord: ord,
		abs: abs,
		marginsO: marginalize(props.outerMargin),
		marginsF: marginalize(props.factorMargin),
		marginsI: marginalize(props.innerMargin),
	};

	// xmin, xmax...
	let obDir = {x: 'abs', y: 'ord'};
	let obMM = {min: true, max: true};
	for(let dir in obDir){
		for(let type in obMM){
		let tmp = dir + type; //xmin, xmax, ...
			if(!utils.isNil(props[tmp])){
				borders[obDir[dir]][0][type] = props[tmp];
			}
		}
	}

	let title = {title: props.title, titleFSize: props.titleFSize};

	// getting dsx and dsy
	let universe = {width: props.width, height: props.height};

	// span and offet pointwise
	// drops if required and not given (default value)
	_.each(state.series, (serie,idx) => {
	let dir;
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

	let data = _.map(state.series,(ser,idx) => {
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
	let dir, ds;
		switch(props.data[idx].type){
			case 'Bars':
			case 'bars':
				dir = 'y';
        ds = state.spaces;
				break;
			case 'yBars':
			case 'ybars':
				dir = 'x';
        ds = state.spaces;
				break;
			default:
				break;
		}

    if(!!props.data[idx].stacked){
      dir = props.data[idx].stacked;
    }
		if(!dir && !!props.graphProps[idx].process){
			dir = !props.graphProps[idx].process.dir || props.graphProps[idx].process.dir === 'x' ? 'y' : 'x';
		}
		return addDefaultDrop(serie,dir,ds,true);
	});

	//now to immutable VM
	let imVM = {
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

	// 7 - legend
	imVM.legend = () => legender(props);

	return im.freeze(imVM,props.freeze);

};

m.processLegend = function(rawProps){
	let props = defaultTheProps(utils.deepCp({},rawProps));
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
