let React = require('react');

class TimerLaunch extends React.Component {

	componentWillMount(){
		this.state = {to: 50};
	}

	render(){
		return <div className="input-group">
			<div className='input-group-btn'>
				<button className='btn btn-primary' onClick={() => this.props.launch(this.state.to)}>Animate</button>
			</div>
			<input type="text" className="form-control" value={this.state.to} onChange={(e) => this.setState({to: e.target.value})}/>
			<span className="input-group-addon">ms</span>
		</div>;
	}

}

module.exports = TimerLaunch;
