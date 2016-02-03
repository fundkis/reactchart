var React = require('react');
var Axe = require('./axis/Axe.cs.jsx');
var imUtils = require('./core/im-utils.cs.js');
var _ = require('underscore');

/*
	{
		abs: [Axe],
		ord: [Axe]
	}
*/

var Axes = React.createClass({

	shouldComponentUpdate: function(props){
		return !imUtils.isEqual(props.state,this.props.state);
	},

	abscissa: function(){
		return _.map(this.props.state.abs, (p) => {return p.show ? <Axe key={p.key} state={p}/> : null;});
	},

	ordinate: function(){
		return _.map(this.props.state.ord, (p) => {return p.show ? <Axe key={p.key} state={p}/> : null;});
	},

	render: function(){

		return <g>
				{this.abscissa()}
				{this.ordinate()}
			</g>;
	}

});

module.exports = Axes;
