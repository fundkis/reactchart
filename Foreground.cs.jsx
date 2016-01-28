var React = require('react');

var Foreground = React.createClass({
	render: function(){
		return this.props.foreground ?<g> {this.props.doForeground} </g>: null;
	}
});

module.exports = Foreground;
