var React = require('react');
var Bins = require('./Bins.cs.jsx');

var imUtils = require('../core/im-utils.cs.js');
var marker = require('../marks/marker.cs.jsx');

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

		return this.props.state.path.positions.length === 0 ? null : <g>
					<Bins state={this.props.state.path} />
					{marker.marks(this.props.state.marks,this.props.state.markType)}
				</g>;
}
});

module.exports = StairsChart;
