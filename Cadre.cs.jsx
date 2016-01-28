var React = require('react');

var Cadre = React.createClass({
	render: function(){
		return (!!this.props.cadre)?<rect width={this.props.width} height={this.props.height} strokeWidth='1' stroke='black' fill='none' x='0' y='0'/>:null;
	}
});

module.exports = Cadre;
