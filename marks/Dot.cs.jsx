var React = require('react');
var dataScale = require('../core/space-transf.cs.js');

var DotMark = React.createClass({
	getDefaultProps: function(){
		return {
			dsx: {},
			dsy: {},
			x: '0',
			y: '0',
			radius: 3,
			fill: 'black',
			size: -1,
			shade: 1
		};
	},
	render: function(){
		var x = dataScale.toC(this.props.dsx,this.props.x);
		var y = dataScale.toC(this.props.dsy,this.props.y);
		var r = this.props.radius;
		var s = this.props.size;
		var f = this.props.fill;
		if(s > 0){r = s;}
		return <circle cx={x} cy={y} r={r} fill={f} opacity={this.props.shade}/>;
	}
});

module.exports = DotMark;
