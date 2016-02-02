var React = require('react');
var Tick = require('./Tick.cs.jsx');
var AxisLine = require('./AxisLine.cs.jsx');
var _ = require('underscore');
var imUtils = require('../core/im-utils.cs.js');

/*
	{
		axisLine: AxisLine,
		ticks: [Tick]
	}
*/

var Axe = React.createClass({
	shouldComponentUpdate: function(props){
		return !imUtils.isEqual(props,this.props);
	},

	render: function(){

		return <g>
			{_.map(this.props.ticks, (tick) => {
				return <Tick {...tick}/>;
			})}
			<AxisLine {...this.props.axisLine}/>
		</g>;
}
});

module.exports = Axe;
