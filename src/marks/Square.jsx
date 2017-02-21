let React = require('react');
let dataScale = require('../core/space-transf.js');
let imUtils = require('../core/im-utils.js');

/*
	{
		draw: false,
		ds: {
			x: {},
			y: {}
		},
		position:{
			x: 0,
			y: 0
		},
		color: 'black',
		width: 0,
		fill: undefined,
		size: 0,
		shade: 1
	}
*/

class SquareMark extends React.Component {

	shouldComponentUpdate(props){
		return !imUtils.isEqual(props.state,this.props.state);
	}

	render(){
		let { ds, position, size, fill, color, shade, width} = this.props.state;

		let x = dataScale.toC(ds.x,position.x) - size;
		let y = dataScale.toC(ds.y,position.y) - size;
		let f = fill || color;

		return <rect x={x} y={y} width={2 * size} height={2 * size} fill={f} opacity={shade} stroke={color} strokeWidth={width}/>;
	}
}

module.exports = SquareMark;
