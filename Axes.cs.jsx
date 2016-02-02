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
		return !imUtils.isEqual(props,this.props);
	},

	abscissa: function(){
		return _.map(this.props.abs, (p,idx) => {return p.show ? <Axe {...p}/> : null;});
	},

	ordinate: function(){
		return _.map(this.props.ord, (p,idx) => {return p.show ? <Axe {...p}/> : null;});
	},

	render: function(){

		return <g>
				{this.abscissa()}
				{this.ordinate()}
			</g>;
	}

});

module.exports = Axes;
