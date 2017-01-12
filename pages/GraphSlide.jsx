let React = require('react');
let Slide = require('./Slide.jsx');
let Graph = require('../src/Graph.jsx');

class GS extends React.Component {
	render(){
		let state = this.props.state;
		return <div>
			<Graph {...state.graph}/>
			<Slide onChange={state.changeSL}/>
		</div>;
	}
}

module.exports = GS;
