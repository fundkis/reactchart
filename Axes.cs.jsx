var React = require('react');
var Axe = require('./Axe.cs.jsx');
var _ = require('underscore');

var Axes = React.createClass({
	shouldComponentUpdate: function(props){
		return props !== this.props;
	},

	abscissa: function(){
		return _.map(this.props.abs, (p,idx) => {var key = 'a.' + idx; return <Axe key={key} {...p}/>;});
	},

	ordinate: function(){
		return _.map(this.props.ord, (p,idx) => {var key = 'o.' + idx; return <Axe key={key} {...p}/>;});
	},

	render: function(){

		return <g>
				{this.abscissa()}
				{this.ordinate()}
			</g>;
	}

});

module.exports = Axes;
