let React = require('react');
let Label = require('./Label.jsx');

let sp = require('../core/space-transf.js');
let imUtils = require('../core/im-utils.js');

/*
	{
		// long thin grey line
		grid: {
			show: true || false,
			color: '',
			length: ,
			width: 
		},

	// tick
		tick: {
			show: true || false,
			color: '',
			position: {x, y},
			ds: {x, y},
			length: ,
			dir: {x, y},
			width: ,
			out:
		},

	// tick label
		label: Label
	}
*/

class Tick extends React.Component {

	shouldComponentUpdate(props){
		return !imUtils.isEqual(props.state,this.props.state);
	}

	// grid
	grid(){

		let gprops = this.props.state.grid;

		if(gprops.show === false){
			return null;
		}

		let start = {
			x: sp.toC(this.props.state.tick.ds.x, this.props.state.tick.position.x),
			y: sp.toC(this.props.state.tick.ds.y, this.props.state.tick.position.y)
		};

		let end = {
			x: start.x + this.props.state.tick.dir.x * sp.toCwidth(this.props.state.tick.ds.x,gprops.length),
			y: start.y - this.props.state.tick.dir.y * sp.toCwidth(this.props.state.tick.ds.y,gprops.length)
		};

		let gridName = this.props.className + 'Grid';
		let tickProps = this.props.css ? null : {
			stroke: gprops.color, 
			strokeWidth: gprops.width
		};


		return <line className={gridName} x1={start.x} x2={end.x} y1={start.y} y2={end.y} {...tickProps} />;
	}

	tick(){

		let tprops = this.props.state.tick;

		if(tprops.show === false){
			return null;
		}

		let x1 = sp.toC(tprops.ds.x, tprops.position.x) - tprops.dir.x * tprops.length * tprops.out;
		let y1 = sp.toC(tprops.ds.y, tprops.position.y) + tprops.dir.y * tprops.length * tprops.out; // beware about y sign!!
		let x2 = x1 + tprops.dir.x * tprops.length;
		let y2 = y1 - tprops.dir.y * tprops.length; // beware about y sign!!

		let linePar = this.props.css ? null : {
			stroke: tprops.color, 
			strokeWidth: tprops.width
		};

		return <line className={this.props.className} x1={x1} x2={x2} y1={y1} y2={y2} {...linePar}/>;
	}

	label(){
		if(this.props.state.label.show === false){
			return null;
		}
		let labelName = this.props.className + 'Label';
		return <Label className={labelName} css={this.props.css} state={this.props.state.label}/>;
	}

	noShow(){
		return !( this.props.state.tick.show || this.props.state.grid.show || this.props.state.label.show);
	}

	render(){

		return this.noShow() ? null : <g>
				{this.grid()}
				{this.tick()}
				{this.label()}
		</g>;
	}
}

module.exports = Tick;
