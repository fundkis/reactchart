var React = require('react');
var _ = require('underscore');
var grapher = require('./graphs/grapher.cs.jsx');
var imUtils = require('./core/im-utils.cs.js');

/*
	{
		curves: [{
			key: '', 
			points: [{}],
			props: {
			}
		}]
	}
*/

var Curves = React.createClass({
	
	shouldComponentUpdate: function(props){
		return !imUtils.isEqual(props.state,this.props.state);
	},

	render: function(){
		return <g>{_.map(this.props.state, (curve) => {return grapher(curve.type,curve);})}</g>;
	}

});

module.exports = Curves;
