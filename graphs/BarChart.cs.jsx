var React = require('react');
var Mark = require('../marks/Mark.cs.jsx');
var _ = require('underscore');
var imUtils = require('../core/im-utils.cs.js');

/*
	{
		markType: 'bar'
		marks: [Bar]
	}
*/

var BarChart = React.createClass({

  shouldComponentUpdate: function(props) {
	 return !imUtils.isEqual(props.state,this.props.state);
  },

  render : function() {

	if(this.props.state.marks.length === 0){
		return null;
	}

	 return <g>
		{_.map(this.props.state.marks,(bar) => <Mark key={bar.key} state={bar} type='bar'/>)}
		</g>;
  }
});

module.exports = BarChart;
