let React = require('react');

let { FKComponent, Slider, LabelObj, binding } = require('fk-react-base');
let { NumberInput } = binding;
let Graph = require('fk-graph');

class OneGraph extends FKComponent {

	componentWillMount(){
		this.props.state.launch();
	}

	render(){
		let state = this.props.state;
		return <div>
			{ LabelObj.render('# points', () => <NumberInput state={state.points}/>)}
			<Graph {...state.graph}/>
			<Slider state={state.slide}/>
		</div>;
	}

}

module.exports = OneGraph;
