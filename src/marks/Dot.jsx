let React = require('react');
let dataScale = require('../core/space-transf.js');
let imUtils = require('../core/im-utils.js');

/*
	{
		draw: true || false,
		ds: {
			x: {}, 
			y:{}
		},
		position: {
			x: 0,
			y: 0
		},
		radius: ,
		color: '',
		width: ,
		fill: ,
		size: ,
		shade: 1
	}
*/

class DotMark extends React.Component {

	shouldComponentUpdate(props){
		return !imUtils.isEqual(props.state,this.props.state);
	}

	render(){
		let { ds, position, size, color, radius, fill, shade, width } = this.props.state;

		let x = dataScale.toC(ds.x,position.x);
		let y = dataScale.toC(ds.y,position.y);
		let r = radius || size;
		let f = fill || color;

		return <circle cx={x} cy={y} r={r} fill={f} opacity={shade} stroke={color} strokeWidth={width}/>;
	}
}

module.exports = DotMark;
