var React = require('react');
var Axe = require('./axis/Axe.jsx');
var imUtils = require('./core/im-utils.js');
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
    var css = this.props.state.css;
		return _.map(this.props.state.abs, (p) => {return p.show ? <Axe className='xAxis' key={p.key} css={css} state={p}/> : null;});
	},

	ordinate: function(){
    var css = this.props.state.css;
		return _.map(this.props.state.ord, (p) => {return p.show ? <Axe className='yAxis' key={p.key} css={css} state={p}/> : null;});
	},

	render: function(){

		return <g>
				{this.abscissa()}
				{this.ordinate()}
			</g>;
	}

});

module.exports = Axes;
