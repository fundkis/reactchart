var React = require('react');
var dataScale = require('../core/space-transf.cs.js');

var SquareMark = React.createClass({
	getDefaultProps: function(){
		return {
			dsx: {},
			dsy: {},
			x: '0',
			y: '0',
			draw: false,
			color: 'black',
			width: 0,
			fill: undefined,
			size: 0,
			shade: 1
		};
	},
	render: function(){
		var x = dataScale.toC(this.props.dsx,this.props.x) - this.props.size / 2;
		var y = dataScale.toC(this.props.dsy,this.props.y) + this.props.size / 2;
		var f = this.props.fill || this.props.color;

		return <rect x={x} y={y} width={this.props.size} height={this.props.size} fill={f} opacity={this.props.shade} stroke={this.props.color} strokeWidth={this.props.width}/>;
	}
});

module.exports = SquareMark;
