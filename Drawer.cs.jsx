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
		return !imUtils.isEqual(props,this.props);
	},

	orderAG: function(){
		return this.props.axisOnTop === true ? <g>
			<Curves {...this.props.curves} />
			<Axes {...this.props.axes}/>
		</g> : <g>
			<Axes {...this.props.axes}/>
			<Curves {...this.props.curves} />
		</g>;
					
	},

	render: function(){

		return <svg width={this.props.width} height={this.props.height}>
			<Cadre cadre={this.props.cadre}/>
			<Background {...this.props.background}/>
			<Title {...this.props.title} />
					{this.orderAG()}
			<Foreground {...this.props.foreground} />
			</svg>;

	}
});

module.exports = Graph;
