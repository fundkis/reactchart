var React = require('react');
var utils = require('./core/utils.js');
var imUtils = require('./core/im-utils.js');

var Foreground = React.createClass({

	shouldComponentUpdate: function(props){
		return !imUtils.isEqual(props.state,this.props.state);
	},

	render: function(){
		if(utils.isNil(this.props.state.content)){
			return null;
		}
		var wxc = this.props.state.cx - this.props.state.width / 2;
		var wyc = this.props.state.cy + this.props.state.height / 2;
		var trans = this.props.state.anchor === 'center' ? 'translate(' + wxc + ',' + wyc + ')' : '';
		return <g transform={trans} {...this.props.state}>{this.props.state.content()}</g>;
	}
});

module.exports = Foreground;
