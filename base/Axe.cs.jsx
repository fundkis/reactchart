var React = require('react');
var Tick = require('./Tick.cs.jsx');
var ticker = require('./ticker.cs.js');
var _ = require('underscore');

module.exports = React.createClass({
	PropTypes:{
		majorGrid: React.PropTypes.bool,
		minorGrid: React.PropTypes.bool
	},
	getDefaultProps: function(){
		return {
			// general for axis, default to abscissa bottom
			ds:{}, // see space-mgr for details
			type: 'number',
			dir: 0, // \theta in degrees
			placement: 'bottom',
			origin: {x:0, y:0},
			ticksLabel: [], // bars, text labels and coord pos
			label:'',
			labelFSize:'20',
			majorGrid: false,
			minorGrid: false,
			gridLength: 0,
			stroke: 'black',
			strokeWidth: '1',
			// ticks
			tickProps: {}
		};
	},
	render: function(){

// theta in radian
		var theta = this.props.dir * Math.PI / 180;

// axes
		var length = this.props.ds.c.max - this.props.ds.c.min;
		var xstart = this.props.origin.x;
		var ystart = this.props.origin.y;
		var xend = xstart + length * Math.cos(theta);
		var yend = ystart + length * Math.sin(theta); // y sign already dealt with

// ticks
		// ds = {c:{min, max}, d: {min, max}, d2c, c2d}
		// props.type = 'text' || 'number' || 'date'
		// props.labels = ['tick labels'] // if props.type === 'text'
		// props.placement = 'top' || 'bottom' || 'left' || 'right'
		var props = {};
		props.type = this.props.type;
		props.labels = this.props.ticksLabel;
		props.placement = this.props.placement;
		var tickProps = this.props.tickProps;
		tickProps.majorGrid = this.props.majorGrid;
		tickProps.gridLength = this.props.gridLength;
		var ticks = _.map(ticker.ticks(this.props.origin,this.props.ds,this.props.dir,props),function(tick){
			return <Tick {...tickProps} where={tick.here} label={tick.me} dir={tick.dir} />;
		});

// label
		// on axis
		var fs = parseFloat(this.props.labelFSize); // such an annoyance...
		var xL = (xend + xstart)/2;
		var yL = (yend + ystart)/2;
		var textAnchor = 'middle';
		// shifting from axis
		var offset = function(fac){return 20 + fac * fs;}; // hard-coded for the moment, size of ticks
		switch(this.props.placement){
			case 'bottom':
				yL += offset(1); // font height
				break;
			case 'top':
				yL -= offset(0.33); // font depth
				break;
			case 'left':
				xL -= offset(1);
				break;
			case 'right':
				xL += offset(0);
				break;
			default:
				throw 'Unkonw anchor attribute';
		}

		var dird = (this.props.dir > 0)?-this.props.dir:this.props.dir;
		var rotate = 'rotate(' + dird + ' ' + xL + ' ' + yL + ')'; // in degrees

		return <g>
			<line x1={xstart} x2={xend} y1={ystart} y2={yend} 
				stroke={this.props.stroke}
				strokeWidth={this.props.strokeWidth} />
			<text x={xL} y={yL} transform={rotate} textAnchor={textAnchor} fontSize={fs}>{this.props.label}</text>
			<g>{ticks}</g>
			</g>;
}
});
