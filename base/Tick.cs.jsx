var React = require('react');
var Tprops = require('../core/proprieties.cs.js');
var utils = require('../core/utils.cs.js');

var Tick = React.createClass({
	getDefaultProps: function(){
		return Tprops.Tick;
	},

	// grid
	grid: function(){
		if(utils.isNil(this.props.grid) || this.props.grid.show === false){
			return null;
		}
		var gridColor = this.props.grid.color || 'grey';
		var gridWidth = this.props.grid.width || 2 / 3 * this.props.width;
		var x1 = this.props.where.x + this.props.labelDir.x * this.props.length * this.props.out;
		var y1 = this.props.where.y + this.props.labelDir.y * this.props.length * this.props.out; // beware about y sign!!
		var xG2 = x1 + this.props.grid.length * this.props.labelDir.x;
		var yG2 = y1 - this.props.grid.length * this.props.labelDir.y; // we're in c space...
		return <line x1={x1} x2={xG2} y1={y1} y2={yG2} stroke={gridColor} strokeWidth={gridWidth}/>;
	},

	tick: function(){
		if(this.props.show === false){
			return null;
		}
		var x1 = this.props.where.x + this.props.labelDir.x * this.props.length * this.props.out;
		var y1 = this.props.where.y + this.props.labelDir.y * this.props.length * this.props.out; // beware about y sign!!
		var x2 = x1 - this.props.labelDir.x * this.props.length;
		var y2 = y1 - this.props.labelDir.y * this.props.length; // beware about y sign!!

		var fs = this.props.labelFSize;
		// label is out, further away by fontsize in y dir
		var xt = x1;
		var yt = y1;
		var textAnchor = 'middle';
		// adding a little margin
		// anchoring the text
		if(this.props.labelDir.y !== 0){
			yt += 5;
			if(this.props.labelDir.y > 0){
				yt += this.props.labelDir.y * fs;  // font size in the way (baseline is at the bottom of label)
			}
			textAnchor = 'middle';
		}

		if(this.props.labelDir.x !== 0){
			yt += fs/3; // baseline adjustment (until I know how to retrieve the depth of the label)
			if(this.props.labelDir.x < 0){
				xt -= 5;
				textAnchor = 'end';
			}else{
				xt += 5;
				textAnchor = 'start';
			}
		}

		// offset
		xt += this.props.labelOffset.x || 0;
		yt += this.props.labelOffset.y || 0;

		return <g>
			<line x1={x1} x2={x2} y1={y1} y2={y2} stroke={this.props.color} strokeWidth={this.props.width}/>
			<text x={xt} y={yt} textAnchor={textAnchor} fontSize={fs} fill={this.props.labelColor}>{this.props.label}</text>
		</g>;
	},
	render: function(){
		return <g>
				{this.grid()}
				{this.tick()}
		</g>;
	}
});

module.exports = Tick;
