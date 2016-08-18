var React = require('react');
var Drawer = require('./Drawer.jsx');

var core = require('./core/process.js');
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

	table: function(tab){

		var tabline = (line,idx) => {
			var icon = {
				width: line.icon.props.width
			};
			return <tr key={idx}><td style={icon}>{line.icon}</td><td>{line.label}</td></tr>;
		}

		return <table {...this.props}>
			<tbody>{_.map(tab, (line,idx) => tabline(line,idx))}</tbody>
		</table>;
	},

	line: function(leg){
		var print = (l,idx) => {
			return <span key={idx}>{l.icon}{l.label}</span>;
		};

		return <div {...this.props}>{_.map(leg, (l, idx) => print(l,idx) )}</div>;
	},

	legend: function(leg){
		return !!this.props.line ? this.line(leg) : this.table(leg);
	},

	render: function(){
		var legend = this.props.preprocessed === true ? this.props.legend() : core.processLegend(this.props);
		return !!legend ? this.legend(legend) : null;
	}
});

module.exports = Graph;
