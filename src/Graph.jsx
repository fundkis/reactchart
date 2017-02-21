let React = require('react');
let Drawer = require('./Drawer.jsx');

let core = require('./core/process.js');
let _ = require('underscore');

class Graph extends React.Component {

	componentWillMount(){
		if(this.props.__preprocessed){
			this.props.updateGraph(this);
		}
	}

	render(){

		let props = this.props.__preprocessed ? this.props.props() : core.process(this.props).get() ;

		return <Drawer state={props} />;
	}
}

class Legend extends React.Component {

	table(tab){

		let tabline = (line,idx) => {
			let icon = {
				width: line.icon.props.width
			};
			return <tr key={idx}><td style={icon}>{line.icon}</td><td>{line.label}</td></tr>;
		};

		return <table {...this.props}>
			<tbody>{_.map(tab, (line,idx) => tabline(line,idx))}</tbody>
		</table>;
	}

	line(leg){
		let print = (l,idx) => {
			// a little depth to the icon
			// a little space to breathe
			// here to avoid use of CSS, easyness of use
			// for a third party
			let margin = {
				style: {
					marginRight: '10pt'
				}
			};
			return <span key={idx} {...margin}>
				<span verticalAlign='sub'>{l.icon}</span>
				<span>{l.label}</span>
			</span>;
		};

		return <div {...this.props}>{_.map(leg, (l, idx) => print(l,idx) )}</div>;
	}

	legend(leg){
		return !!this.props.line ? this.line(leg) : this.table(leg);
	}

	render(){
		let legend = this.props.preprocessed === true ? this.props.legend() : core.processLegend(this.props);
		return !!legend ? this.legend(legend) : null;
	}
}

Graph.Legend = Legend;

module.exports = Graph;
