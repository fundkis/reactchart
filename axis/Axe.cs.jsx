var React = require('react');
var Tick = require('./Tick.cs.jsx');
var AxisLine = require('./AxisLine.cs.jsx');
var _ = require('underscore');

/*
	{
		axisLine: AxisLine,
		ticks: [Tick]
	}
*/

var Axe = React.createClass({
	shouldComponentUpdate: function(props){
		return props !== this.props;
	},

	grid: function(){

	},

	render: function(){

		// initialize
		this.ticker = null;

		return <g>
			{_.map(this.props.ticks, (tick) => {
				return <Tick {...tick}/>;
			})}
			<AxisLine {...this.props.axisLine}/>
			</g>;
}
});

module.exports = Axe;
