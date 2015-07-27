var React = require('react');

module.exports = React.createClass({
	getDefaultProps: function(){
		return {
			x: '0',
			y: '0',
			radius: '3',
			fill: 'black',
			size: '-1'
		};
	},
	render: function(){
		var x = this.props.x;
		var y = this.props.y;
		var r = this.props.radius;
		var s = this.props.size;
		var f = this.props.fill;
		if(s > 0){r = s};
		return <circle cx={x} cy={y} r={r} fill={f}/>;
	}
});
