var React = require('react');
var Tick = require('./Tick.cs.jsx');
var ticker = require('./ticker.cs.js');
var _ = require('underscore');
var utils = require('../core/utils.cs.js');
var aProps = require('../core/proprieties.cs.js');

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
		var fd = 0.25 * fh; // font depth, 25 %
		var fh = 0.75 * fh; // font height, 75 %

		// arbitrary values, from some font:
		// width "m" = 40 px
		// width "M" = 45 px => used
		var xoffset = this.props.label.length * 22.5;
		var yoffset = (this.props.labelDir.y > 0)? fh : fd ;

		var points = this.points();
		var xL = (points.end.x + points.start.x)/2 + this.props.labelDir.x * xoffset + this.props.labelOffset.x;
		var yL = (points.end.y + points.start.y)/2 + this.props.labelDir.y * yoffset + this.props.labelOffset.y;
		var textAnchor = 'middle'; // base point, middle
		// x = r cos(theta)
		// y = r sin(theta)
		// => theta = arctan(y/x) [-90,90]
		var theta = Math.floor( Math.atan( this.props.dir.y / this.props.dir.x ) * 180 / Math.PI ); // in degrees
		// shifting from axis

		var rotate = 'rotate(' + theta + ' ' + xL + ' ' + yL + ')';

		return <text x={xL} y={yL} transform={rotate} textAnchor={textAnchor} fontSize={fs}>{this.props.label}</text>;
	},

	majorG: function(){
		if(!this.props.ticks.major.show &&
			!this.props.grid.major.show){
			return null;
		}
		var props = this.props.ticks.major;
		return _.map(ticker.ticks(this.props.ds,this.props.origin,this.props.ticksLabel), (tick) => {
			return <Tick labelDir={this.props.labelDir}  {...props} {...tick}/>;
		});
	},

	minorG: function(){
		if(!this.props.ticks.minor.show &&
			!this.props.grid.minor.show){
			return null;
		}
		// require major to be defined
		if(this.ticker.major === null){
			return null;
		}

		var props = this.props.ticks.minor;
		return _.map(ticker.ticks(this.props.ds,this.props.origin,null,this.tick.major), (tick) => {
			return <Tick {...props} {...tick}/>;
		});
	},

	buildGrid: function(){
		this.ticker = {};
		this.ticker.major = this.majorG();
		this.ticker.minor = this.minorG();
	},

	grid: function(){
		if(this.ticker === null){
			this.buildGrid();
		}
	},

	ticks: function(){
		if(this.ticker === null){
			this.buildGrid();
		}
	},

	render: function(){

		// initialize
		this.ticker = null;

		return <g>
			{this.grid()}
			{this.axis()}
			{this.ticks()}
			{this.label()}
			</g>;
}
});

module.exports = Axe;
