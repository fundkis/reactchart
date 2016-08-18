var React = require('react');
var Tick = require('./Tick.jsx');
var AxisLine = require('./AxisLine.jsx');
var _ = require('underscore');
var imUtils = require('../core/im-utils.js');

/*
	{
		axisLine: AxisLine,
		ticks: [Tick]
	}
*/

var Axe = React.createClass({
	shouldComponentUpdate: function(props){
		return !imUtils.isEqual(props.state,this.props.state);
	},

	render: function(){

    var axisName = this.props.className + 'Line';
    var tickName = this.props.className + 'Tick';

		return <g>
			{_.map(this.props.state.ticks, (tick) => {
				return <Tick className={tickName} css={this.props.css} key={tick.key} state={tick}/>;
			})}
			<AxisLine className={axisName} css={this.props.css} state={this.props.state.axisLine}/>
		</g>;
}
});

module.exports = Axe;
