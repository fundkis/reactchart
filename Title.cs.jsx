var React = require('react');

var imUtils = require('./core/im-utils.cs.js');

var Title = React.createClass({

	shouldComponentUpdate: function(props){
		return !imUtils.isEqual(props,this.props);
	},

	render: function(){
		var xT = this.props.width / 2;
		var yT = this.props.FSize + 5; // see defaults in space-mgr, its 10 px margin
		return (!!this.props.title && this.props.title.length !== 0) ? <text textAnchor='middle' fontSize={this.props.FSize} x={xT} y={yT}>{this.props.title}</text>:null;
	}
});

module.exports = Title;
