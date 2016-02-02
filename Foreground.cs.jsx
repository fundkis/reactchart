var React = require('react');
var utils = require('./core/utils.cs.js');
var imUtils = require('./core/im-utils.cs.js');

var Foreground = React.createClass({

	shouldComponentUpdate: function(props){
		return !imUtils.isEqual(props,this.props);
	},

	render: function(){
		if(utils.isNil(this.props.content)){
			return null;
		}
		var wxc = this.props.cx - this.props.width / 2;
		var wyc = this.props.cy + this.props.height / 2;
		var trans = 'translate(' + wxc + ',' + wyc + ')';
		return <g transform={trans} {...this.props}>{this.props.content()}</g>;
	}
});

module.exports = Foreground;
