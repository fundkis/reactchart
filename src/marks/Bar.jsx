let React = require('react');
let dataScale = require('../core/space-transf.js');
let utils = require('../core/utils.js');
let imUtils = require('../core/im-utils.js');

/*
	{
		draw: false,
		ds: {
			x: {}, // see space-mgr for details
			y: {}
		}, // see space-mgr for details
		position:{
			x:0,
			y:0
		},
		drop:{
			x:null, 
			y:0
		},
		width: 0,
		span: 0.5,
		color: '',
		fill: '',
		shade: 1
	}
*/

class BarMark extends React.Component {

	shouldComponentUpdate(props){
		return !imUtils.isEqual(props.state,this.props.state);
	}

	render() {

	let { state } = this.props;

	let mgr = {
		x: utils.mgr(state.position.x),
		y: utils.mgr(state.position.y)
	};

	let ds = state.ds;

	let position = state.position;

	let span = {
		x: utils.isNil(state.span.x) ? 0 : state.span.x,
		y: utils.isNil(state.span.y) ? 0 : state.span.y 
	};

	let drop = {
		x: utils.isNil(state.drop.x) ? state.position.x : state.drop.x,
		y: utils.isNil(state.drop.y) ? state.position.y : state.drop.y 
	};

	let toC = (dir) => {
		let op = dir === 'y' ? 'add' : 'subtract';
		return dataScale.toC(ds[dir], mgr[dir][op](position[dir],mgr[dir].divide(span[dir],2))); // all in dataSpace
	};

	let x = toC('x');
	let y = toC('y');

	let toCwidth = (dir) => dataScale.toCwidth(ds[dir], mgr[dir].add(mgr[dir].distance(drop[dir],position[dir]), span[dir]));

	let height = toCwidth('y');
	let width  = toCwidth('x');
	if(mgr.y.lowerThan(position.y,drop.y)){
		y -= height;
	}
	if(mgr.x.greaterThan(position.x,drop.x)){
		x -= width;
	}

	let color = state.color || state.fill || 'none';
	let stroke = state.draw ? color : null;
	if(drop.y > state.y){
		y -= height;
	}

	 return <rect x={x} y={y} height={height} width={width}
			stroke={stroke} strokeWidth={state.strokeWidth} 
			fill={color} opacity={state.shade}/>;
	}
}

module.exports = BarMark;
