var React = require('react');
var _ = require('underscore');
var Axes = require('./base/Axes.cs.jsx');
var spaceMgr = require('./core/space-mgr.cs.js');
var grapher = require('./graphs/grapher.cs.jsx');
var Khist = require('../tech/helpers/Knuth-histogram.cs.js');

///////////////////////////////////////////
/* high-level API
 *
 * We provide as props only what's needed for high
 * level calculations. We play on the "javascript
 * doesn't care about variables' type" to define
 * the props only where they are use, and define
 * only an empty object at higher level to
 * pass them down if they're user-defined.
 *
 * The Graph computes the world, the axis origins
 * and transformation from data space to picture space (pixels),
 * then pass down axis-data to Axes and build
 * the vector of graphs that are needed.
 *
 * It requires (all is optional/defaulted):
 *  - the universe description:
 *		 - the height
 *		 - the width
 *  - the title description:
 *		 - the title, 
 *		 - the title font size,
 *  - high level description of axis:
 *		 - placement, 
 *		 - labels, 
 *		 - margins,
 *  - graphs information:
 *		 - type,
 *		 - data
 *
 * Please note that all computations requires to
 * remember that the y axis in picture space is
 * reversed (top value < bottom value).
 */
/////////////////////////////////////

module.exports = React.createClass({
	getDefaultProps: function() {
		return {
			// general
			height: 500,		// defines the universe's height
			width: 500,		// defines the universe's width
			foreground: undefined,
			// this is a template, the minimum structure that MUST be respected
			// other things can be added at the data s levels
			data: {series:[{ type : 'Plain', data : {series:[{x:0, y:0}], type: 'number'}, axe : 'left', color: 'black', stacked: undefined}], type: 'number'}, //
			title: '',
			titleFSize: 30,
			// axis
			// label of axis
			xLabel: 'x label',
			yLabel: 'y label',
			xLabelFSize: 15,
			yLabelFSize: 15,
			// axis
			axis: undefined,	// left = (bottom,left), right = {top,right}, overrides x,y-axis
			xaxis: 'bottom',	// bottom || top
			yaxis: 'left',		// left || right
			// to force definition
			xmin: undefined,
			xmax: undefined,
			ymin: undefined,
			ymax: undefined,
			// margins
			axisMargin: {l: 10, b: 10, r: 10, t: 10}, // left, bottom, right, top
			outerMargin: {}, // left, bottom, right, top
			// lower level descriptions
			axisProps: {},
			graphProps: [{color: 'blue', mark: true, markSize: 3, markColor: 'red', onlyMarks: false}],
			name: 'noname'
		};
	},
	buildFore: function(ds){
		var wxc = (ds.x.c.max + ds.x.c.min - this.props.foreground.width) / 2;
		var wyc = (ds.y.c.max + ds.y.c.min + this.props.foreground.height) / 2;
		var trans = 'translate(' + wxc + ',' + wyc + ')';
		var keyF = this.props.name + 'F';
		return <g key={keyB} transform={trans} {...this.props.foreground}>{this.props.foreground.content}</g>;
	},
	pseries: [],
	preprocess: function(nb){
		var datas = this.props;
		nb.n = 0;
		// right now the evil way: we change the props!!
		for(var g = 0; g < this.props.graphProps.length; g++)
		{
			if(this.props.graphProps[g].shader &&	// there's a shader
				this.props.graphProps[g].shader.type === 'histogram'){ // this one needs preprocessing
				nb.n++;
				var dir = this.props.graphProps[g].shader.dir;
				var otherdir = (dir === 'x')?'y':'x';
				var series = [];
				var ind = 0;
				var curref = this.props.data.series[g].data.series[0][otherdir];
				var notcomplete = true;
				var u = 0;
				while(notcomplete){
					var data = _.map(	_.filter(this.props.data.series[g].data.series, function(point){
							return point[otherdir] === curref;
						}),
						function(point){return point[dir];});
					var hist = Khist.opt_histo(data);
					var dataseries = this.props.data.series[g];
					dataseries.stacked = false; // to be on the safe side
// drop	-> bin
// value -> bin + db ( = next bin)
// shade -> prob
					var maxProb = -1;
					var start = ind;
					for(var d = 0; d < hist.length; d++){
						series[ind] = {};
						series[ind]['drop' + dir] = hist[d].bin;
						series[ind][dir] = hist[d].bin + hist[d].db;
						series[ind].shade = hist[d].prob;
						series[ind][otherdir] = curref;
						if(!!this.props.graphProps[g].shader.labels){
							series[ind][otherdir + 'label'] = this.props.graphProps[g].shader.labels(curref);
						}
						if(hist[d].prob > maxProb){
							maxProb = hist[d].prob;
						}
						ind++;
					}
					for(var i = start; i < ind; i++){
						series[i].shade /= maxProb;
						series[i].span = series[i].shade;
					}
					while( u < this.props.data.series[g].data.series.length && 
							this.props.data.series[g].data.series[u][otherdir] === curref){u++;}
					if(u >= this.props.data.series[g].data.series.length){
						notcomplete = false;
					}else{
						curref = this.props.data.series[g].data.series[u][otherdir];
					}
				}
				this.pseries[g] = series;
			}
		}


		return datas;
	},
	droper: function(){
		var xoffset = [];
		var yoffset = [];
		var nBar = 0;
		for(var i = 0 ; i < this.props.data.series.length; i++){
			if(this.props.data.series[i].type === 'Bars'){
				nBar++;
			}
			if(this.props.data.series[i].stacked){ // stacked in direction 'stacked', 'x' and 'y' are accepted
				this.pseries[i] = [];
				switch(this.props.data.series[i].stacked){
					case 'x': // not asynchronous
						// init xoffset
						if(xoffset.length === 0){
							xoffset = _.map(this.props.data.series[i].data.series,function(/*point*/){return undefined;});
						}else{
							if(xoffset.length !== this.props.data.series[i].data.series.length){
								throw 'Stacked data needs to be of same size (x dir)!!';
							}
						}
						// add, compute and update
						for(var j = 0; j < xoffset.length; j++){
							this.pseries[i][j] = {};
							var c = this.props.data.series[i].data.series[j].x;
							// new point
							this.pseries[i][j] = {};
							this.pseries[i][j].x = c + xoffset[j];
							this.pseries[i][j].y = this.props.data.series[i].data.series[j].y;
							this.pseries[i][j].dropx = xoffset[j];
							if(!!this.props.data.series[i].data.series[j].xlabel){
								this.pseries[i][j].xlabel = this.props.data.series[i].data.series[j].xlabel;
							}
							if(!!this.props.data.series[i].data.series[j].ylabel){
								this.pseries[i][j].ylabel = this.props.data.series[i].data.series[j].ylabel;
							}
							xoffset[j] += c;
						}
						break;
					case 'y': // not asynchronous
							// init yoffset
						if(yoffset.length === 0){
							yoffset = _.map(this.props.data.series[i].data.series,function(/*point*/){return 0;});
						}else{
							if(yoffset.length !== this.props.data.series[i].data.series.length){
								throw 'Stacked data needs to be of same size (y dir)!!';
							}
						}
						// add, compute and update
						for(var k = 0; k < yoffset.length; k++){
							var o = this.props.data.series[i].data.series[k].y;
							// new point
							this.pseries[i][k] = {};
							this.pseries[i][k].y = o + yoffset[k];
							this.pseries[i][k].x = this.props.data.series[i].data.series[k].x;
							this.pseries[i][k].dropy = yoffset[k];
							if(!!this.props.data.series[i].data.series[k].ylabel){
								this.pseries[i][k].ylabel = this.props.data.series[i].data.series[k].ylabel;
							}
							if(!!this.props.data.series[i].data.series[k].xlabel){
								this.pseries[i][k].xlabel = this.props.data.series[i].data.series[k].xlabel;
							}
							yoffset[k] += o;
						}
						break;
					default:  // direction, we need both x and y, I have no drops for these
						break;
				}
			}
		}
		return nBar;
	},
	render: function(){

		// clear
		this.pseries = [];

		// getting dsx and dsy
		var universe = {width: this.props.width, height: this.props.height};

		var nb = {};
		var datas  = this.preprocess(nb).data;
		var nBar = nb.n;

		// dealing with stacked data here => good idea ???
		// we just offset the data values and drops of the concerned graphs
		nBar += this.droper();

		var xaxis = this.props.xaxis;
		var yaxis = this.props.yaxis;
		if(!!this.props.axis){ //overrides xaxis and yaxis
			if(this.props.axis === 'left'){
				xaxis = 'bottom';
				yaxis = 'left';
			}else if(this.props.axis === 'right'){
				xaxis = 'top';
				yaxis = 'right';
			}else{
				throw 'Bad request on keyword "axis" of Graph object. Use "left" or "right"';
			}
		}
/* 
 *  - axis.xLabel
 *  - axis.xLabelFSize
 *  - axis.yLabel
 *  - axis.yLabelFSize
 *  - axis.xPlace ('top' || 'bottom')
 *  - axis.yPlace ('left' || 'right')
 *  - axis.marginsO.t
 *  - axis.marginsO.b
 *  - axis.marginsO.l
 *  - axis.marginsO.r
 *  - axis.marginsI.t
 *  - axis.marginsI.b
 *  - axis.marginsI.l
 *  - axis.marginsI.r
 */
		var axis = {
			xLabel: this.props.xLabel, xLabelFSize: this.props.xLabelFSize,
			yLabel: this.props.yLabel, yLabelFSize: this.props.yLabelFSize,
			xPlace: xaxis, yPlace: yaxis,
			marginsO: this.props.outerMargin, marginsI: this.props.axisMargin
		};
		var title = {title: this.props.title, titleFSize: this.props.titleFSize};

		// we select the correct datas, series or pseries
		var tmps = this.pseries;
		var tmpp = this.props.graphProps;
		var series = {};
		series.series = _.map(datas.series,function(serie,index){
			return {
				series: (!!tmps[index])?tmps[index]:serie.data.series,
				stacked: serie.stacked,
				offset: (serie.type !== 'Stairs')?0:(!tmpp[index].stairs || tmpp[index].stairs === 'right')?1:-1
			};
		});

		series.type = datas.type;
		series.xmin = this.props.xmin;
		series.xmax = this.props.xmax;
		series.ymin = this.props.ymin;
		series.ymax = this.props.ymax;
		// here is the data space, the world is fully defined inside
		var ds = spaceMgr.space(series,universe,axis,title);

		var toAbs = function(point){
			return (datas.type === 'date')?point.x.getTime():point.x;
		};
		var cloneToAbs = function(point){
			var out = {};
			for(var v in point){
				if(v === 'x'){
					out.x = toAbs(point);
				}else{
					out[v] = point[v];
				}
			}
			return out;
		};

		// printing the graph
		var prints = [];
		for(var m = 0; m < this.props.data.series.length; m++){
			var serie = (!!this.pseries[m])?this.pseries[m]:this.props.data.series[m].data.series;
			var print = _.map(serie,function(point){
				return cloneToAbs(point);
			});
			// the actual graph
			var graphProps = {};
			if(this.props.graphProps.length > m){
				graphProps = this.props.graphProps[m];
			}
			// if bars
			var spanNeed = (this.props.data.series[m].type === 'Bars' && !this.props.data.series[m].stacked) ||
				(this.props.graphProps[m].shader && this.props.graphProps[m].shader.type === 'histogram');
			if(spanNeed && !graphProps.span){
				// necessary in x dir (for the moment)
				graphProps.span = 0.8/nBar;
				graphProps.xoffset = - 0.4 + (0.8 * m + 0.1)/nBar + 0.5 * graphProps.span;
			}
			// the world
			graphProps.dsx = ds.x;
			graphProps.dsy = ds.y;
			// the graph
			graphProps.stroke = (!!graphProps.color)?graphProps.color:this.props.data.series[m].color;
			graphProps.markProps = {};
			graphProps.markProps.fill = this.props.data.series[m].color;
			graphProps.key = this.props.name + 'G' + m;
			prints.push(grapher[this.props.data.series[m].type](print,graphProps,m));
		}

		// the ticks are labelled? gotta pass that down
		// it is assumed that we need them only once (same for everyone)
		// and placed in the first graph, pseries or data.series
		var btl = {x: undefined, y: undefined};
		if(this.props.data.type === 'text' && this.props.data.series.length !== 0){
			var labelsw = (!!this.pseries[0])?this.pseries[0]:this.props.data.series[0].data.series;
			// supress doublons
			btl.x = [];
			btl.y = [];
			for(var l = 0; l < labelsw.length; l++){
				if(_.find(btl.x,function(lab){return lab.coord === labelsw[l].x;}) === undefined){
					btl.x.push({label: labelsw[l].xlabel, coord: labelsw[l].x});
				}
				if(_.find(btl.y,function(lab){return lab.coord === labelsw[l].y;}) === undefined){
					btl.y.push({label: labelsw[l].ylabel, coord: labelsw[l].y});
				}
			}
			// if undefined, no need to keep an array of undefined
			if(!btl.x[0].label){btl.x = undefined;}
			if(!btl.y[0].label){btl.y = undefined;}
		}
		var placement = {x:xaxis, y:yaxis};
		var yt = _.map(datas.series, function(ygraph){return ygraph.data.type || 'number';});
		if(yt.length === 0){yt = ['number'];}
		var types = {x:datas.type, y:yt};

		var xT = (ds.x.c.max + ds.x.c.min) / 2;
		var yT = title.titleFSize;
		// axis are rendered every time, thus we fall back to
		// default every time
		var axisProps = Axes.getDefaultProps();
		_.each(this.props.axisProps,function(value,key){
				axisProps[key] = value;
		});
		axisProps.label = {x: this.props.xLabel, y: this.props.yLabel};

		var empty = false;
		_.reduce(this.props.data.series,function(empty,serie){return empty || (serie.data.serie.length !== 0);});
		empty = !empty;

		var keyA = this.props.name + 'A';
		var keyT = this.props.name + 'T';
		var foreground;
		if(this.props.foreground){
			foreground = this.buildFore(ds);
		}

		return <svg key={this.props.name} width={this.props.width} height={this.props.height}>
					<text key={keyT} textAnchor='middle' fontSize={title.titleFSize} x={xT} y={yT}>{title.title}</text>
					{prints}
					<Axes name={keyA} empty={empty} {...axisProps} type={types} placement={placement} barTicksLabel={btl} ds={ds} />
					{foreground}
			</svg>;
	}
});
