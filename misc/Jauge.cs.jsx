var React = require('react');

var Jauge = React.createClass({
	getDefaultProps: function(){
		return {
			jauge: false,
			color: 'blue',
			value: 0,
			max: 1,
			width: 100,
			height: 20
		};
	},

	render: function(){

		var rw = this.props.value / this.props.max * this.props.width;

		return <svg width={this.props.width} height={this.props.height}>
			{this.props.jauge ? <rect fill='none' stroke='gray' strokeWidth='2' width={this.props.width} height={this.props.height}/> : null}
			<rect width={rw} stroke='none' height={this.props.height} fill={this.props.color}/>
		</svg>;
	}
});

module.exports = Jauge;
