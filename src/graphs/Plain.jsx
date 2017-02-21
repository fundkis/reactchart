let React = require('react');
let Path = require('./Path.jsx');
let Mark = require('../marks/Mark.jsx');
let _ = require('underscore');

let imUtils = require('../core/im-utils.js');

/*
	{
		path: Path,
		markType: '',
		marks: [Dot || Square]
	}
*/
class PlainChart extends React.Component {

	shouldComponentUpdate(props) {
		return !imUtils.isEqual(props.state,this.props.state);
	}

	render(){
		let marks = this.props.state.marks;
		return marks.length === 0 ? <Path state={this.props.state.path}/> : <g>
			<Path state={this.props.state.path}/>
			{_.map(marks, (point) => <Mark key={point.key} state={point} type={this.props.state.markType}/>)}
			</g>;
	}
}

module.exports = PlainChart;
