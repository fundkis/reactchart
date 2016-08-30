var React = require('react');
var utils = require('./core/utils.js');
var imUtils = require('./core/im-utils.js');
var sptr = require('./core/space-transf.js');

var Foreground = React.createClass({

	shouldComponentUpdate: function(props){
		return !imUtils.isEqual(props.state,this.props.state);
	},

	render: function(){
		if(utils.isNil(this.props.state.content)){
			return null;
		}
		var wxc = utils.isNil(this.props.state.x) ? (this.props.state.cx - this.props.state.width / 2)  + this.props.pWidth / 2 : sptr.toC(this.props.state.ds.x, this.props.state.x);
		var wyc = utils.isNil(this.props.state.y) ? (this.props.state.cy + this.props.state.height / 2) + this.props.pHeight / 2 : sptr.toC(this.props.state.ds.y, this.props.state.y);
		var trans = 'translate(' + wxc + ',' + wyc + ')';
		return <g transform={trans} {...this.props.state}>{this.props.state.content()}</g>;
	}
});

module.exports = Foreground;
