var React = require('react');
var Axes = require('./Axes.jsx');
var Curves = require('./Curves.jsx');
var Cadre = require('./Cadre.jsx');
var Background = require('./Background.jsx');
var Foreground = require('./Foreground.jsx');
var Title = require('./Title.jsx');

var imUtils = require('./core/im-utils.js');

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
		return this.props.state.axisOnTop === true ? <g>
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
			{state.cadre ? <Cadre width={state.width} height={state.height}/> : null }
			<Background state={state.background}/>
			<Title state={state.title} />
					{this.orderAG()}
			<Foreground state={state.foreground} pWidth={state.width} pHeight={state.height}/>
			</svg>;

	}
});

module.exports = Graph;
