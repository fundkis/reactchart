let React      = require('react');
let line       = require('./line.jsx');
let TL         = require('./TimerLaunch.jsx');
let GraphSlide = require('./GraphSlide.jsx');

class Dynamic extends React.Component {
	render(){
		let state = this.props.state;
		return <div>
			{line(state,[
				{graph: 'dyn1', extra: <TL launch={(to) => state.dynLaunch(0,to)}/>},
				{graph: 'dyn2', extra: <TL launch={(to) => state.dynLaunch(1,to)}/>},
				{graph: 'dyn3', extra: <TL launch={(to) => state.dynLaunch(2,to)}/>},
				{graph: 'dyn4', extra: <TL launch={(to) => state.dynLaunch(3,to)}/>}
			])}
			{line(state,['dynC', {key: 'dynS', obj: <GraphSlide state={state.slide}/>}])}
		</div>;
	}
}
module.exports = Dynamic;
