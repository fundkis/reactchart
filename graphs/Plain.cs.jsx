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
		return !imUtils.isEqual(props,this.props);
	},

	render: function(){

		return <g>
			<Path {...this.props.path}/>
			{marker.marks(this.props.marks,this.props.markType)}
			</g>;
}
});

module.exports = PlainChart;
