var React = require('react');

var imUtils = require('./core/im-utils.cs.js');

var Title = React.createClass({

	shouldComponentUpdate: function(props){
		return !imUtils.isEqual(props.state,this.props.state);
	},

	render: function(){
		var xT = this.props.state.width / 2;
		var yT = this.props.state.FSize + 5; // see defaults in space-mgr, its 10 px margin
		return (!!this.props.state.title && this.props.state.title.length !== 0) ? <text textAnchor='middle' fontSize={this.props.state.FSize} x={xT} y={yT}>{this.props.state.title}</text>:null;
	}
});

module.exports = Title;
