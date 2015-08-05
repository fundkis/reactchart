var React = require('react');
var _ = require('underscore');
var Axes = require('./base/Axes.cs.jsx');
var spaceMgr = require('./core/space-mgr.cs.js');
var grapher = require('./graphs/grapher.cs.jsx');

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
			height: '500',		// defines the universe's height
			width: '500',		// defines the universe's width
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
			graphProps: [{color: 'blue', mark: true, markSize: 3, markColor: 'red'}]
		};
	},
	render: function(){

		// getting dsx and dsy
		var universe = {width: this.props.width, height: this.props.height};
		var datas  = this.props.data;
		datas.xmin = this.props.xmin;
		datas.xmax = this.props.xmax;
		datas.ymin = this.props.ymin;
		datas.ymax = this.props.ymax;

		// dealing with stacked data here => good idea ???
		// we just offset the data values and drops of the concerned graphs
		var xoffset = [];
		var yoffset = [];
		var drops = [];
		for(var i = 0 ; i < this.props.data.series.length; i++){
			drops[i] = {x:[], y:[]};
			if(this.props.data.series[i].stacked){ // stacked in direction 'stacked', 'x' and 'y' are accepted
				switch(this.props.data.series[i].stacked){
					case 'x': // not asynchronous
							// init drops
						drops[i].x = _.map(this.props.data.series[i].data.series,function(/*point*/){return 0.0;});
						// init xoffset
						if(xoffset.length === 0){
							xoffset = _.map(this.props.data.series[i].data.series,function(/*point*/){return 0.0;});
						}else{
							if(xoffset.length !== this.props.data.series[i].data.series.length){
								throw 'Stacked data needs to be of same size (x dir)!!';
							}
						}
						// add, compute and update
						for(var j = 0; j < xoffset.length; j++){
							var c = this.props.data.series[i].data.series[j].x;
							//this.props.data.series[i].data.series[j].x += xoffset[j];
							drops[i].x[j] = xoffset[j];
							xoffset[j] += c;
						}
						break;
					case 'y': // not asynchronous
							// init drops
						drops[i].y = _.map(this.props.data.series[i].data.series,function(/*point*/){return 0.0;});
							// init yoffset
						if(yoffset.length === 0){
							yoffset = _.map(this.props.data.series[i].data.series,function(/*point*/){return 0.0;});
						}else{
							if(yoffset.length !== this.props.data.series[i].data.series.length){
								throw 'Stacked data needs to be of same size (y dir)!!';
							}
						}
						// add, compute and update
						for(var k = 0; k < yoffset.length; k++){
							var o = this.props.data.series[i].data.series[k].y;
							//this.props.data.series[i].data.series[k].y += yoffset[k];
							drops[i].y[k] = yoffset[k];
							yoffset[k] += o;
						}
						break;
					default:  // direction, we need both x and y, I have no drops for these
						break;
				}
			}
		}
		// now adding the drops to the datas for space manager
		for(var s = 0; s < datas.series.length; s++){
			for(var p = 0; p < datas.series[s].data.series.length; p++){
				datas.series[s].data.series[p].dropx = drops[s].x[p] || 0.0;
				datas.series[s].data.series[p].dropy = drops[s].y[p] || 0.0;
			}
		}
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

		// here is the data space, the world is fully defined inside
		var ds = spaceMgr.space(datas,universe,axis,title);
		var toAbs = function(point){
			return (datas.type === 'date')?point.x.getTime():point.x;
		};

		// printing the graph
		var prints = [];
		for(var m = 0; m < this.props.data.series.length; m++){
			var print = _.map(this.props.data.series[m].data.series,function(point){
				return {x: toAbs(point), y: point.y};
			});
			// the actual graph
			var graphProps = {};
			if(this.props.graphProps.length > m){graphProps = this.props.graphProps[m];}
			// the world
			graphProps.dsx = ds.x;
			graphProps.dsy = ds.y;
			// the graph
			graphProps.stroke = this.props.data.series[m].color;
			graphProps.markProps = {};
			graphProps.markProps.fill = this.props.data.series[m].color;
			graphProps.mark = false;
			graphProps.drops = drops[m];
			prints.push(grapher[this.props.data.series[m].type](print,graphProps,m));
		}

		// the ticks are labelled? gotta pass that down
		// it is assumed that we need them only once (same for everyone)
		// and placed in the first graph
		var btl = {x: undefined, y: undefined};
		if(this.props.data.type === 'text' && this.props.data.series.length !== 0){
			btl.x = _.map(this.props.data.series[0].data.series, function(point){return {label: point.xlabel, coord: point.x};});
			btl.y = _.map(this.props.data.series[0].data.series, function(point){return {label: point.ylabel, coord: point.y};});
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
		var axisProps = this.props.axisProps;
		axisProps.label = {x: this.props.xLabel, y: this.props.yLabel};

		return <svg width={this.props.width} height={this.props.height}>
				<g>
					<text textAnchor='middle' fontSize={title.titleFSize} x={xT} y={yT}>{title.title}</text>
					<g>{prints}</g>
					<Axes key='axes' {...axisProps} type={types} placement={placement} barTicksLabel={btl} ds={ds} />
				</g>
			</svg>;
	}
});
