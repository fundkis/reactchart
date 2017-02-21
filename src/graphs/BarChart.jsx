let React = require('react');
let Mark = require('../marks/Mark.jsx');
let _ = require('underscore');
let imUtils = require('../core/im-utils.js');

/*
	{
		markType: 'bar'
		marks: [Bar]
	}
*/

class BarChart extends React.Component {

	shouldComponentUpdate(props) {
	 return !imUtils.isEqual(props.state,this.props.state);
	}

	render() {

	if(this.props.state.marks.length === 0){
		return null;
	}

	 return <g>
		{_.map(this.props.state.marks,(bar) => <Mark key={bar.key} state={bar} type='bar'/>)}
		</g>;
	}
}

module.exports = BarChart;
