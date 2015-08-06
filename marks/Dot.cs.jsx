var React = require('react');

module.exports = React.createClass({
	getDefaultProps: function(){
		return {
			x: '0',
			y: '0',
			radius: -1,
			fill: 'black',
			size: 3
		};
	},
	render: function(){
		var x = this.props.x;
		var y = this.props.y;
		var r = this.props.radius;
		var s = this.props.size;
		var f = this.props.fill;
		if(r > 0){s = r;}
		return <circle cx={x} cy={y} r={s} fill={f}/>;
	}
});
