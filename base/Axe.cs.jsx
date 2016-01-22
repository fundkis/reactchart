var React = require('react');
var Tick = require('./Tick.cs.jsx');
var ticker = require('./ticker.cs.js');
var _ = require('underscore');
var utils = require('../core/utils.cs.js');
var aProps = require('../core/proprieties.cs.js');
var sp = require('../core/space-transf.cs.js');

var Axe = React.createClass({
	getDefaultProps: function(){
		return aProps.Axe;
	},

	points: function(){
		var length = (this.props.ds.c.max - this.props.ds.c.min);
		return {
					start: this.props.origin,
					end: {
						x: this.props.origin.x + this.props.dir.x * length,
						y: this.props.origin.y + this.props.dir.y * length
					}
				};
	},

	axis: function(){
		switch(this.props.CS){
			case 'cart':
				var points = this.points();
				return <line 
					x1={points.start.x} x2={points.end.x} y1={points.start.y} y2={points.end.y} 
					stroke={this.props.color} strokeWidth={this.props.width} />;
			case 'polar':
				return <ellipse cx={this.props.origin.x} cy={this.props.origin.y} rx={this.props.dir.x} ry={this.props.dir.y}
					stroke={this.props.color} strokeWidth={this.props.width}/>;
			default:
				throw new Error('Unknown coordinate system: "' + this.props.CS + '"' );
		}
	},

	label: function(){
		if(utils.isNil(this.props.label) || this.props.label.length === 0){
			return null;
		}

// label
		// on axis
		var fs = this.props.labelFSize; // font size
		var fd = 0.25 * fs; // font depth, 25 %
		var fh = 0.75 * fs; // font height, 75 %

		// arbitrary values, from some font:
		// width "m" = 40 px
		// width "M" = 45 px => used
		var labelWidthOff = - this.props.label.length * 22.5;
		var labelHeightOff = (dir) => {
			return dir > 0 ? fh : fd;
		};

		var xoffset = this.props.labelDir.x !== 0 ? labelHeightOff(this.props.labelDir.x) : labelWidthOff ;
		var yoffset = this.props.labelDir.y !== 0 ? labelHeightOff(this.props.labelDir.y) : labelWidthOff ;

		var points = this.points();
		var xL = (points.end.x + points.start.x)/2 + this.props.labelDir.x * ( xoffset + this.props.labelOffset.x);
		var yL = (points.end.y + points.start.y)/2 + this.props.labelDir.y * ( yoffset + this.props.labelOffset.y); 
		var textAnchor = 'middle'; // base point, middle
		// x = r cos(theta)
		// y = r sin(theta)
		// => theta = arctan(y/x) [-90,90]
		var theta = Math.floor( Math.atan( -this.props.dir.y / this.props.dir.x ) * 180 / Math.PI ); // in degrees
		// shifting from axis

		var rotate = 'rotate(' + theta + ' ' + xL + ' ' + yL + ')';

		return <text x={xL} y={yL} transform={rotate} textAnchor={textAnchor} fontSize={fs}>{this.props.label}</text>;
	},

	factor: function(){
		if(utils.isNil(this.props.comFac) || this.props.comFac === 1){
			return null;
		}

		var points = this.points();
		var off = this.props.labelFsize || 2 * this.props.ticks.major.labelFSize;
		var fac = {
			x: this.props.dir.y * off + points.end.x,
			y: - this.props.dir.x * off + points.end.y
		};

		var mgr = utils.mgr(this.props.comFac);
		var om = mgr.orderMag(this.props.comFac);
		return <text {...fac} textAnchor='center' fontSize={this.props.ticks.major.labelFSize}>
				10<sup>{om}</sup>
			</text>;
	},

	grid: function(){
		var ds = this.props.ds;
		var majProps = this.props.ticks.major;
		var minProps = this.props.ticks.minor;
		var majGrid = this.props.grid.major;
		var minGrid = this.props.grid.minor;
		var minor = (this.props.ticks.minor.show === true || this.props.grid.minor.show === true);
		var axisDir = this.props.dir;
		var labelDir = this.props.labelDir;
		var origin = this.props.origin;

		return _.map(ticker.ticks(ds.d.min,ds.d.max,this.props.ticksLabel,minor,this.props.comFac), (tick,idx) => {
			var cstick = {};
			cstick.where = {
				x: origin.x + (sp.toC(ds,tick.where) * axisDir.x - origin.x) * axisDir.x,
				y: origin.y + (sp.toC(ds,tick.where) * axisDir.y - origin.y) * axisDir.y
			};
			cstick.labelOffset = {
				x: sp.toCwidth(ds,tick.offset.along) * axisDir.x + tick.offset.perp * axisDir.y * majGrid.length,
				y: sp.toCwidth(ds,tick.offset.along) * axisDir.y + tick.offset.perp * axisDir.x * majGrid.length
			};
			for(var pr in tick){
				if(pr === 'where' || pr === 'labelOffset'){continue;}
				cstick[pr] = utils.deepCp({},tick[pr]);
			}
			// for grid length, just in case
			if(!!cstick.grid){
				cstick.grid.length = minGrid.length;
			}
			var p = tick.minor ? minProps : majProps;
			p.labelDir = labelDir;
			if(!utils.isNil(tick.extra)){
				p.width = 0;
			}
			p.grid = tick.minor ? minGrid.show ? minGrid: null : majGrid.show ? majGrid: null;

			if(!utils.isNil(p.labelize) && typeof p.labelize === 'function' ){
				cstick.label = p.labelize(tick.where);
			}
			var k = 'tick.' + idx;
			return <Tick key={k} {...p} {...cstick}/>;
		});
	},

	render: function(){

		// initialize
		this.ticker = null;

		return <g>
			{this.grid()}
			{this.axis()}
			{this.label()}
			{this.factor()}
			</g>;
}
});

module.exports = Axe;
