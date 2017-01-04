var React = require('react');

var Dot = require('./Dot.jsx');
var Bar = require('./Bar.jsx');
var Square = require('./Square.jsx');

var imUtils = require('../core/im-utils.js');

var Mark = React.createClass({

	shouldComponentUpdate: function(props){
		return !imUtils.isEqual(props.state,this.props.state);
	},

	mark: function(state){
		switch(this.props.type){
			case 'square':
			case 'Square':
				return <Square state={state} />;
			case 'dot':
			case 'Dot':
				return <Dot state={state} />;
			case 'bar':
			case 'Bar':
				return <Bar state={state} />;
			default:
				throw new Error('unrecognized mark type: "' + this.props.type + '"');
		}
	},

	pin: function(pinS){
		return !!pinS.path ? <g>
			<path strokeWidth='1' stroke={pinS.pinColor} fill='none' d={pinS.path}/>
			<text fontSize={pinS.labelFS} style={{textAnchor: pinS.labelAnc}} fill={pinS.color} x={pinS.xL} y={pinS.yL}>{pinS.label}</text>
		</g> : 
		<text fontSize={pinS.labelFS} style={{textAnchor: pinS.labelAnc}} fill={pinS.color} x={pinS.xL} y={pinS.yL}>{pinS.label}</text>;
	},

	render: function(){
		return this.props.state.pin ? <g>
			{this.mark(this.props.state)}
			{this.pin(this.props.state.pin)}
		</g> : this.mark(this.props.state);
	}
});

module.exports = Mark;
