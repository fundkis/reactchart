let React = require('react');
let Tick = require('./Tick.jsx');
let AxisLine = require('./AxisLine.jsx');
let _ = require('underscore');
let imUtils = require('../core/im-utils.js');

/*
	{
		axisLine: AxisLine,
		ticks: [Tick]
	}
*/

class Axe extends React.Component {
	shouldComponentUpdate(props){
		return !imUtils.isEqual(props.state,this.props.state);
	}

	render(){

		let { state, className, css } = this.props;

		let axisName = className + 'Line';
		let tickName = className + 'Tick';

		return <g>
			{ _.map(state.ticks, (tick) => <Tick className={tickName} css={css} key={tick.key} state={tick}/> ) }
			<AxisLine className={axisName} css={css} state={state.axisLine}/>
		</g>;
	}
}

module.exports = Axe;
