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
		return !imUtils.isEqual(props.state,this.props.state);
	},

	render: function(){
		var state = this.props.state;

		var x = dataScale.toC(state.ds.x,state.position.x);
		var y = dataScale.toC(state.ds.y,state.position.y);
		var r = state.radius || state.size;
		var f = state.fill || state.color;

		return <circle cx={x} cy={y} r={r} fill={f} opacity={state.shade} stroke={state.color} strokeWidth={state.width}/>;
	}
});

module.exports = DotMark;
