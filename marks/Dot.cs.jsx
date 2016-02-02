var React = require('react');
var dataScale = require('../core/space-transf.cs.js');
var imUtils = require('../core/im-utils.cs.js');

/*
	{
		draw: true || false,
		ds: {
			x: {}, 
			y:{}
		},
		position: {
			x: 0,
			y: 0
		},
		radius: ,
		color: '',
		width: ,
		fill: ,
		size: ,
		shade: 1
	}
*/

var DotMark = React.createClass({

	shouldComponentUpdate: function(props){
		return !imUtils.isEqual(props,this.props);
	},

	render: function(){
		var x = dataScale.toC(this.props.ds.x,this.props.position.x);
		var y = dataScale.toC(this.props.ds.y,this.props.position.y);
		var r = this.props.radius || this.props.size;
		var f = this.props.fill || this.props.color;

		return <circle cx={x} cy={y} r={r} fill={f} opacity={this.props.shade} stroke={this.props.color} strokeWidth={this.props.width}/>;
	}
});

module.exports = DotMark;
