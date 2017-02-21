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

	power(label, labProps, props){
		let { base, power } = label;
		return <text {...props} {...labProps}>
			<tspan>{base}</tspan>
			{ power !== 0 ? <tspan>&#183;10</tspan> : null }
			{ power !== 0 ? <tspan dy={-0.5 * labProps.fontSize}>{power}</tspan> : null }
		</text>;
	}

	render(){

		if(this.props.state.label.length === 0){
			return null;
		}

// label
		// => theta = arctan(y/x) [-90,90]

		let { transform, ds, position, offset, rotate, dir, color, FSize, anchor, label } = this.props.state;

		let xL = ( transform ? space.toC(ds.x,position.x) : position.x ) + offset.x;
		let yL = ( transform ? space.toC(ds.y,position.y) : position.y ) + offset.y;

		let theta = rotate ? Math.floor( Math.atan( - Math.sqrt( dir.y / dir.x ) ) * 180 / Math.PI ) : 0; // in degrees

		let rotation = 'rotate(' + theta + ' ' + xL + ' ' + yL + ')';

		let labProps = this.props.css ? null :
			{
				fill: color,
				fontSize: FSize
			};

		let props = {
			className: this.props.className,
			x: xL,
			y: yL,
			transform: rotation,
			textAnchor: anchor
		};

		return typeof label === 'string' ? <text {...props} {...labProps}>
			{label}</text> : this.power(label,labProps, props);
	}
}

module.exports = Label;
