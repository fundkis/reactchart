var React = require('react');
var Bins = require('./Bins.cs.jsx');

var _ = require('underscore');
var space = require('../core/space-transf.cs.js');
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
	 return !imUtils.isEqual(props,this.props);
  },

	render: function(){

		return this.props.path.positions.length === 0 ? null : <g>
					<Bins {...this.props.path} />
					{marker.marks(this.props.marks,this.props.markType)}
				</g>;
}
});

module.exports = StairsChart;
