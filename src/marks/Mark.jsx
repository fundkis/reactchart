let React = require('react');

let Dot = require('./Dot.jsx');
let Bar = require('./Bar.jsx');
let Square = require('./Square.jsx');

let imUtils = require('../core/im-utils.js');

class Mark extends React.Component {

	shouldComponentUpdate(props){
		return !imUtils.isEqual(props.state,this.props.state);
	}

	mark(state){
		switch(this.props.type){
			case 'square':
			case 'Square':
			case 'opensquare':
			case 'OpenSquare':
				return <Square state={state} />;
			case 'dot':
			case 'Dot':
			case 'opendot':
			case 'OpenDot':
				return <Dot state={state} />;
			case 'bar':
			case 'Bar':
				return <Bar state={state} />;
			default:
				throw new Error('unrecognized mark type: "' + this.props.type + '"');
		}
	}

	pin(pinS){
		return !!pinS.path ? <g>
			<path strokeWidth='1' stroke={pinS.pinColor} fill='none' d={pinS.path}/>
			<text fontSize={pinS.labelFS} style={{textAnchor: pinS.labelAnc}} fill={pinS.color} x={pinS.xL} y={pinS.yL}>{pinS.label}</text>
		</g> : 
		<text fontSize={pinS.labelFS} style={{textAnchor: pinS.labelAnc}} fill={pinS.color} x={pinS.xL} y={pinS.yL}>{pinS.label}</text>;
	}

	render(){
		return this.props.state.pin ? <g>
			{this.mark(this.props.state)}
			{this.pin(this.props.state.pin)}
		</g> : this.mark(this.props.state);
	}
}

module.exports = Mark;
