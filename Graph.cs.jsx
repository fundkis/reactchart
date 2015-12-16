var React = require('react');
var Axes = require('./base/Axes.cs.jsx');

var grapher = require('./graphs/grapher.cs.jsx');
var core = require('./core/process.cs.js');
var gProps = require('./core/proprieties.cs.js');
var utils = require('./core/utils.cs.js');
var _ = require('underscore');

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
 *	- the universe description:
 *		 - the height
 *		 - the width
 *	- the title description:
 *		 - the title, 
 *		 - the title font size,
 *	- high level description of axis:
 *		 - placement, 
 *		 - labels, 
 *		 - margins,
 *	- graphs information:
 *		 - type,
 *		 - data
 *
 * Please note that all computations requires to
 * remember that the y axis in picture space is
 * reversed (top value < bottom value).
 */
/////////////////////////////////////

var Graph = React.createClass({
	getInitialState: function(){
		return {
			series: [],
			space: null
		};
	},

	componentWillMount: function(){
		this.setState(core.process(this.props));
	},

	componentWillReceiveProps: function(props){
		this.setState(core.process(props));
	},

	getDefaultProps: function() {
		return gProps.Graph;
	},

	foreground: function(){
		if(utils.isNil(this.props.foreground)){
			return null;
		}
		var dsx = (!!this.state.spaces.x.bottom) ? this.state.spaces.x.bottom : this.state.spaces.x.top;
		var dsy = (!!this.state.spaces.y.left)   ? this.state.spaces.y.left   : this.state.spaces.y.right;
		var wxc = (dsx.c.max + dsx.c.min - this.props.foreground.width) / 2;
		var wyc = (dsy.c.max + dsy.c.min + this.props.foreground.height) / 2;
		var trans = 'translate(' + wxc + ',' + wyc + ')';
		return <g transform={trans} {...this.props.foreground}>{this.props.foreground.content}</g>;
	},

	background: function(){
		if(utils.isNil(this.props.background)){
			return null;
		}
		var col = this.props.background;
		return <rect width={this.props.width} height={this.props.height} strokeWidth='0' fill={col} x='0' y='0'/>;
	},

	graphs: function(){

		// printing the graph
		var prints = [];
		for(var m = 0; m < this.state.series.length; m++){
			var graphProps = this.props.graphProps[m];

			// we add the world
			// we find the proper x & y axis
			var xplace = 'bottom';
			if(!!this.props.data[m].abs && 
				!!this.props.data[m].abs.axis &&
				!!this.props.data[m].abs.axis.placement){
				xplace = this.props.data[m].abs.axis.placement;
			}

			var yplace = 'left';
			if(!!this.props.data[m].ord && 
				!!this.props.data[m].ord.axis &&
				!!this.props.data[m].ord.axis.placement){
				yplace = this.props.data[m].ord.axis.placement;
			}

			graphProps.dsx = this.state.spaces[xplace];
			graphProps.dsy = this.state.spaces[yplace];
			// we add the key (it's a vector)
			graphProps.key = this.props.name + '.g.' + m;
			prints.push(grapher.grapher(this.props.data[m].type,this.state.series[m],graphProps,m));
		}
		return prints;
	},

	axis: function(){

		var nameAx = this.props.name + '.axes';

		var props = utils.deepCp(this.props.axisProps);
	/* DS = {
	 *	y: {
	 *		left:  space(lefts, universe.height,bordersy,title),
	 *		right: space(rights,universe.height,bordersy,title)
	 *	}, 
	 *	x: {
	 *		bottom: space(bottom,universe.width,bordersx),
	 *		top:    space(top,   universe.width,bordersx)
	 *	}
	 * }
	 */
		var DS = this.state.spaces;
		var c   = {abs: 'x',      ord: 'y'};
		var def = {abs: 'bottom', ord: 'left'};

		// axis placement
		for(var t in c){
			for(var a = 0; a < props[t].length; a++){
				// defaulted at 'bottom' & 'left'
				if(!!props[t][a].placement){
					props[t][a].ds = DS[c[t]][props[t][a].placement];
				}else{
					props[t][a].placement = def[t];
					props[t][a].ds = DS[c[t]][props[t][a].placement];
				}
			}
		}

		// if labelled data
		for(var s = 0; s < this.state.series.length; s++){
			var firstPoint = this.state.series[s][0];
			for(var k in c){
				var label = c[k] + 'label';
				if(!!firstPoint[label]){
					// default
					var look = def[k];
					if(!utils.isNil(this.props.data[s][k]) && !!this.props.data[s][k].axis){
						look = this.props.data[s][k].axis;
					}
					for(var ax = 0; ax < props[k].length; ax++){
						if(props[k][ax].placement === look){
							props[k][ax].ticksLabel = _.map(this.state.series[s],(point) => {return {coord: point[c[k]], label: point[label]};});
							break;
						}
					}
				}
			}
		}

		return <Axes name={nameAx} {...props} />;
	},

	cadre: function(){
		return (!!this.props.cadre)?<rect width={this.props.width} height={this.props.height} strokeWidth='1' stroke='black' fill='none' x='0' y='0'/>:null;
	},

	title: function(){
		var title = this.props.title;
		var titleFSize = this.props.titleFSize;
		var xT = this.props.width / 2;
		var yT = titleFSize + 5; // see defaults in space-mgr, its 10 px margin
		return (!!title && title.length !== 0)? <text textAnchor='middle' fontSize={titleFSize} x={xT} y={yT}>{title}</text>:null;
	},

	render: function(){

		return <svg width={this.props.width} height={this.props.height}>
					{this.cadre()}
					{this.background()}
					{this.title()}
					{this.graph()}
					{this.axis()}
					{this.foreground()}
			</svg>;

	}
});

module.exports = Graph;
