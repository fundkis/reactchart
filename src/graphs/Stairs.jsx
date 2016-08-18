var React = require('react');
var Bins = require('./Bins.jsx');
var Mark = require('../marks/Mark.jsx');
var _ = require('underscore');

var imUtils = require('../core/im-utils.js');

/*
	{
		markType: '',
		marks: [Dot || Square],
		path: Bins 
	}
*/

var StairsChart = React.createClass({

  shouldComponentUpdate: function(props) {
	 return !imUtils.isEqual(props.state,this.props.state);
  },

	render: function(){
		var marks = this.props.state.marks;
		return marks.length === 0 ? <Bins state={this.props.state.path} /> : <g>
			<Bins state={this.props.state.path} />
			{_.map(marks, (point) => <Mark key={point.key} state={point} type={this.props.state.markType}/>)}
			</g>;
	}
});

module.exports = StairsChart;
