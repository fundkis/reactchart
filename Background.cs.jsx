var React = require('react');

var imUtils = require('./core/im-utils.cs.js');

/*
	{
		width: ,
		height: ,
		color: ,
		spaceX: {
			min: , 
			max:
		},
		spaceY: {
			min: ,
			max:
		}
	}
*/

var Background = React.createClass({

	shouldComponentUpdate: function(props){
		return !imUtils.isEqual(props.state,this.props.state);
	},

	render: function(){
		var x = this.props.state.spaceX.min;
		var y = this.props.state.spaceY.max;
		var width = this.props.state.spaceX.max - this.props.state.spaceX.min;
		var height = this.props.state.spaceY.min - this.props.state.spaceY.max;
		return this.props.state.color === 'none' ? null : <rect width={width} height={height} strokeWidth='0' fill={this.props.state.color} x={x} y={y}/>;

	}
});

module.exports = Background;
