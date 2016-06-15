var React = require('react');
var Drawer = require('./Drawer.cs.jsx');

var core = require('./core/process.cs.js');
var _ = require('underscore');

var Graph = React.createClass({

	render: function(){

		var props = this.props.preprocessed === true ? this.props : core.process(this.props).get() ;

		return <Drawer state={props} />;
	}
});

Graph.Legend = React.createClass({

	getDefaultProps: function(){
		return {
			state: null
		};
	},

	line: function(line,idx){
		return <tr key={idx}><td>{line.icon}</td><td>{line.label}</td></tr>;
	},

	legend: function(tab){
		return <table>
			{_.map(tab, (line,idx) => this.line(line,idx))}
		</table>;
	},

	render: function(){
		var legend = this.props.preprocessed === true ? this.props.legend() : core.processLegend(this.props);
		return !!legend ? this.legend(legend) : null;
	}
});

module.exports = Graph;
