var React = require('react');
var Bar = require('../marks/Bar.cs.jsx');
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
	 return !imUtils.isEqual(props,this.props);
  },

  render : function() {

	if(this.props.marks.length === 0){
		return null;
	}

	 return <g>
		{_.map(this.props.marks,(bar) => {return <Bar {...bar}/>;})}
		</g>;
  }
});

module.exports = BarChart;
