var React = require('react');

var Background = React.createClass({
	render: function(){
		if(utils.isNil(this.props.background)){
			return null;
		}
		var col = this.props.background;

		var x = this.props.spaceX.min;
		var y = this.props.spaceY.max;
		var width = this.props.spaceX.max - this.props.spaceX.min;
		var height = this.props.spaceY.min - this.props.spaceY.max;
		return <rect width={width} height={height} strokeWidth='0' fill={col} x={x} y={y}/>;

	}
});

module.exports = Background;
