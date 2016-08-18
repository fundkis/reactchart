var React = require('react');
var Path = require('./Path.jsx');
var Mark = require('../marks/Mark.jsx');
var _ = require('underscore');

var imUtils = require('../core/im-utils.js');

/*
	{
		path: Path,
		markType: '',
		marks: [Dot || Square]
	}
*/
var PlainChart = React.createClass({

	shouldComponentUpdate: function(props) {
		return !imUtils.isEqual(props.state,this.props.state);
	},

	render: function(){
		var marks = this.props.state.marks;
		return marks.length === 0 ? <Path state={this.props.state.path}/> : <g>
			<Path state={this.props.state.path}/>
			{_.map(marks, (point) => <Mark key={point.key} state={point} type={this.props.state.markType}/>)}
			</g>;
}
});

module.exports = PlainChart;
