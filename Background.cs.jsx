var React = require('react');

var imUtils = require('./core/im-utils.cs.js');
var utils = require('./core/utils.cs.js');

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
		return !imUtils.isEqual(props,this.props);
	},

	render: function(){
		if(utils.isNil(this.props.background)){
			return null;
		}

		var x = this.props.spaceX.min;
		var y = this.props.spaceY.max;
		var width = this.props.spaceX.max - this.props.spaceX.min;
		var height = this.props.spaceY.min - this.props.spaceY.max;
		return this.props.color === 'none' ? null : <rect width={width} height={height} strokeWidth='0' fill={this.props.color} x={x} y={y}/>;

	}
});

module.exports = Background;
