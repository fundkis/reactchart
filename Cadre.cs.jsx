var React = require('react');
var imUtils = require('./core/im-utils.cs.js');
var utils = require('./core/utils.cs.js');

var Cadre = React.createClass({

	shouldComponentUpdate: function(props){
		return !imUtils.isEqual(props,this.props);
	},

	render: function(){
		return utils.isNil(this.props.cadre) ? null : <rect width={this.props.width} height={this.props.height} strokeWidth='1' stroke='black' fill='none' x='0' y='0'/>;
	}
});

module.exports = Cadre;
