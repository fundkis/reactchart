let React = require('react');
let Label = require('./Label.jsx');
let utils = require('../core/utils.js');
let imUtils = require('../core/im-utils.js');
let { defMargins } = require('../core/proprieties.js');

/*
	{
		show: true || false,

	///// line part
		line: {
			CS: ''
			start: {x,y},
			end: {x, y},
			origin: {x,y},
			radius: {x, y},
			color: '',
			width:,
		},

	/// label part
		label: Label 

 /// common factor part
		comFac: {
			factor: ,
			offset: {x, y},
			FSize: ,
			anchor: '',
			color: ''
		}

	}

*/


class AxisLine extends React.Component {

	shouldComponentUpdate(props){
		return !imUtils.isEqual(props.state,this.props.state);
	}

	axis(){
		let lprops = this.props.state.line;

		let lp = this.props.css ? null: {
			stroke: lprops.color,
			strokeWidth: lprops.width
		};

		switch(lprops.CS){
			case 'cart':
				return <line className={this.props.className} {...lp}
					x1={lprops.start.x} x2={lprops.end.x} y1={lprops.start.y} y2={lprops.end.y}/>;
			case 'polar':
				return <ellipse className={this.props.className} {...lp}
					cx={lprops.origin.x} cy={lprops.origin.y} rx={lprops.radius.x} ry={lprops.radius.y}/>;
			default:
				throw new Error('Unknown coordinate system: "' + this.props.state.CS + '"' );
		}
	}

	factor(){
		let { state } = this.props;
		let { comFac, line } = state;
		let { factor, Fsize, offset, color, ds } = comFac;
		if(utils.isNil(factor) || factor === 1){
			return null;
		}

		let dir = utils.direction(line, ds);
		dir.x = Math.sqrt(dir.x / dir.line);
		dir.y = Math.sqrt(dir.y / dir.line);

		let mgr = utils.mgr(factor);
		let om = mgr.orderMag(factor);

		let labMar = defMargins.outer.label.bottom; // = top, left, right
		let width  = 5 * (3 + ( om > 100 ? 0.8 : om > 10 ? 0.5 : 0.2 )); // 5px for 10^(123)
		let height = Fsize;

		let off = {x: 0, y: 0};
		switch(dir.corner){
			case '01':
				off.x = - width;
				off.y = - height;
				break;
			case '11':
				off.x = width  * ( dir.y - dir.x) + dir.y * labMar;
				off.y = height * ( dir.y - dir.x) - dir.x * labMar - dir.y * labMar * 0.5;
				break;
			case '10':
				off.x = width;
				off.y = height + labMar;
		}

		let pos = {
			x: offset.x + line.end.x + off.x,
			y: offset.y + line.end.y + off.y
		};

		return <text {...pos} fill={color} fontSize={Fsize}>
			<tspan textAnchor='end'>&#183;10</tspan>
			<tspan dy={-0.5 * Fsize} textAnchor='start'>{om}</tspan>
		</text>;
	}

	render(){

		let labName = this.props.className + 'Label';

		return this.props.state.show === false ? null : <g>
			{this.axis()}
			{this.factor()}
			<Label className={labName} css={this.props.css} state={this.props.state.label}/>
		</g>;
	}

}

module.exports = AxisLine;
