let React = require('react');
let Bins = require('./Bins.jsx');
let Mark = require('../marks/Mark.jsx');
let _ = require('underscore');

let imUtils = require('../core/im-utils.js');

/*
	{
		markType: '',
		marks: [Dot || Square],
		path: Bins 
	}
*/

class StairsChart extends React.Component {

	shouldComponentUpdate(props) {
	 return !imUtils.isEqual(props.state,this.props.state);
	}

	render(){
		let marks = this.props.state.marks;
		return marks.length === 0 ? <Bins state={this.props.state.path} /> : <g>
			<Bins state={this.props.state.path} />
			{_.map(marks, (point) => <Mark key={point.key} state={point} type={this.props.state.markType}/>)}
			</g>;
	}
}

module.exports = StairsChart;
