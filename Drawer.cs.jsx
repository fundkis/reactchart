var React = require('react');
var Axes = require('./Axes.cs.jsx');
var Curves = require('./Curves.cs.jsx');
var Cadre = require('./Cadre.cs.jsx');
var Background = require('./Background.cs.jsx');
var Foreground = require('./Foreground.cs.jsx');
var Title = require('./Title.cs.jsx');

var imUtils = require('./core/im-utils.cs.js');

/*
	{
		width: ,
		height: ,
		cadre: Cadre,
		background: Background,
		title: Title,
		axes: Axes,
		curves: Curves,
		foreground: Foreground
	}
*/

var Graph = React.createClass({

	shouldComponentUpdate: function(props){
		return !imUtils.isEqual(props.state,this.props.state);
	},

	orderAG: function(){
		return this.props.axisOnTop === true ? <g>
			<Curves state={this.props.state.curves} />
			<Axes state={this.props.state.axes}/>
		</g> : <g>
			<Axes state={this.props.state.axes}/>
			<Curves state={this.props.state.curves} />
		</g>;
					
	},

	render: function(){
		var state = this.props.state;
		return <svg width={state.width} height={state.height}>
			<Cadre cadre={state.cadre}/>
			<Background state={state.background}/>
			<Title state={state.title} />
					{this.orderAG()}
			<Foreground state={state.foreground} />
			</svg>;

	}
});

module.exports = Graph;
