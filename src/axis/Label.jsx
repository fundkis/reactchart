let React = require('react');

let space = require('../core/space-transf.js');
let imUtils = require('../core/im-utils.js');

/*
	{
		ds: {x: , y:},
		position: {x: , y:},
		label: '',
		FSize: ,
		offset: {x, y},
		anchor: '',
		color: '',
		dir: {x, y},
		rotate: true || false,
		transform: true || false
	},
*/

class Label extends React.Component {

	shouldComponentUpdate(props){
		return !imUtils.isEqual(props.state,this.props.state);
	}

	render(){

		if(this.props.state.label.length === 0){
			return null;
		}

// label
		// => theta = arctan(y/x) [-90,90]

		let state = this.props.state;

		let xL = ( state.transform ? space.toC(state.ds.x,state.position.x) : state.position.x ) + state.offset.x;
		let yL = ( state.transform ? space.toC(state.ds.y,state.position.y) : state.position.y ) + state.offset.y;

		let theta = state.rotate ? Math.floor( Math.atan( - Math.sqrt( state.dir.y / state.dir.x ) ) * 180 / Math.PI ) : 0; // in degrees

		let rotate = 'rotate(' + theta + ' ' + xL + ' ' + yL + ')';

		let labProps = this.props.css ? null :
			{
				fill: state.color,
				fontSize: state.FSize
			};

		return <text className={this.props.className} x={xL} y={yL} transform={rotate} textAnchor={state.anchor} {...labProps}>
			{state.label}
		</text>;
	}
}

module.exports = Label;
