var React = require('react');
var Axes = require('./axis/Axes.cs.jsx');

var grapher = require('./graphs/grapher.cs.jsx');
var core = require('./core/process.cs.js');
var gProps = require('./core/proprieties.cs.js');
var utils = require('./core/utils.cs.js');
var shader = require('./core/colorMgr.cs.js');
var _ = require('underscore');

var Graph = React.createClass({

	shouldComponentUpdate: function(props){
		return props !== this.props;
	},

	orderAG: function(){
		return this.props.axisOnTop === 'true' ? <g><Curves {..this.props.curves} /><Axes {...this.props.axes}/></g> :
			<g><Axes {...this.props.axes}/><Curves {..this.props.curves} /></g>;
					
	},

	render: function(){

		return <svg width={this.props.width} height={this.props.height}>
			<Cadre cadre={this.props.cadre}/>
			<Background {...this.props.background}/>
			<Title title={this.props.title} width={this.props.width} titleFSize={this.props.titleFSize}/>
					{this.orderAG()}
			<Foreground {...this.props.foreground} />
			</svg>;

	}
});

module.exports = Graph;
