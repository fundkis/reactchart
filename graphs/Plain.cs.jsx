var React = require('react');
var Path = require('./Path.cs.jsx');

var marker = require('../marks/marker.cs.jsx');
var imUtils = require('../core/im-utils.cs.js');

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

		return <g>
			<Path state={this.props.state.path}/>
			{marker.marks(this.props.state.marks,this.props.state.markType)}
			</g>;
}
});

module.exports = PlainChart;
