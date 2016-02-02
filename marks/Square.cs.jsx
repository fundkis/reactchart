var React = require('react');
var dataScale = require('../core/space-transf.cs.js');
var imUtils = require('../core/im-utils.cs.js');

/*
	{
		draw: false,
		ds: {
			x: {},
			y: {}
		},
		position:{
			x: 0,
			y: 0
		},
		color: 'black',
		width: 0,
		fill: undefined,
		size: 0,
		shade: 1
	}
*/

var SquareMark = React.createClass({

	shouldComponentUpdate: function(props){
		return !imUtils.isEqual(props,this.props);
	},

	render: function(){
		var x = dataScale.toC(this.props.ds.x,this.props.position.x) - this.props.size / 2;
		var y = dataScale.toC(this.props.ds.y,this.props.position.y) + this.props.size / 2;
		var f = this.props.fill || this.props.color;

		return <rect x={x} y={y} width={this.props.size} height={this.props.size} fill={f} opacity={this.props.shade} stroke={this.props.color} strokeWidth={this.props.width}/>;
	}
});

module.exports = SquareMark;
