let React = require('react');

let _ = require('underscore');
let space = require('../core/space-transf.js');
let imUtils = require('../core/im-utils.js');
let utils = require('../core/utils.js');

/*
	{
		ds: {
			x: {},
			y: {}
		},
		color: '',
		fill: '',
		width: ,
		stairs: '',
		positions: [{x: , y: , fill: ''}], // start or end
		drops: [{x: , y: }],
		dropLine: {
			x: true || false,
			y: true || false
		}
	}
*/


class Bins extends React.Component {
	
	shouldComponentUpdate(props) {
	 return !imUtils.isEqual(props.state,this.props.state);
	}

	bin(point,drop,delta,idx){

		let state = this.props.state;

		let p = {
			x: space.toC(state.ds.x,point.x),
			y: space.toC(state.ds.y,point.y),
		};

		let d = {
			x: space.toC(state.ds.x,drop.x),
			y: space.toC(state.ds.y,drop.y),
		};

		let del = space.toCwidth(state.ds.x,delta);

		let path = '';
		switch(state.stairs){
			case 'right':
				let pr1 = p.x + ' ' + d.y;
				let pr2 = p.x + ' ' + p.y;
				let pr3 = (p.x + del) + ' ' + p.y;
				let pr4 = (p.x + del) + ' ' + d.y;
				path = 'M ' + pr1 + ' L ' + pr2 + ' L ' + pr3 + ' L ' + pr4;
				break;
			case 'left':
				let pl1 = (p.x - del) + ' ' + d.y;
				let pl2 = (p.x - del) + ' ' + p.y;
				let pl3 = p.x + ' ' + p.y;
				let pl4 = p.x + ' ' + d.y;
				path = 'M ' + pl1 + ' L ' + pl2 + ' L ' + pl3 + ' L ' + pl4;
				break;
		}

		let color = point.fill || state.fill;
		let shade = state.shade || 1;

		return <path key={idx} d={path} strokeWidth={0} fill={color} opacity={shade}/>;
	}

	path(){

		let state = this.props.state;
		if(state.positions.length === 0){
			return null;
		}
		let positions = state.positions;
		let ds = state.ds;
		let drops = state.drops;

		let coord = (idx,idy) => {
			idy = utils.isNil(idy) ? idx : idy;
			return space.toC(ds.x,positions[idx].x) + ',' + space.toC(ds.y,positions[idy].y);
		};

		let dropy = (idx) => space.toC(ds.x,positions[idx].x) + ',' + space.toC(ds.y,drops[idx].y);

		let dropx = (idx) => space.toC(ds.x,drops[idx].x) + ',' + space.toC(ds.y,positions[idx].y);

		let Nd = state.positions.length;
		let data = '';
		let delta = state.positions.length > 1 ? space.toCwidth(ds.x,positions[1].x -  positions[0].x) : 10;
		switch(state.stairs){
			case 'right':
			// right stairs
				data = ( state.dropLine.y ? dropy(0) + ' ' : '' ) + coord(0);
				for(let i = 1; i < Nd; i++){
					data += ' ' + coord(i,i-1) + ' ' + coord(i);
					if(state.dropLine.y){
						data += ' ' + dropy(i) + ' ' + coord(i);
					}
					if(state.dropLine.x){
						data += ' ' + dropx(i) + ' ' + coord(i);
					}
				}
				data += ' ' + (space.toC(ds.x,positions[Nd - 1].x) + delta) + ',' + space.toC(ds.y,positions[Nd - 1].y); // point
				if(state.dropLine.y){
					data += ' ' + (space.toC(ds.x,positions[Nd - 1].x) + delta) + ',' + space.toC(ds.y,drops[Nd - 1].y); // drop
				}
				break;
			case 'left':
				// left stairs
				if(state.dropLine.y){
					data +=  (space.toC(ds.x,positions[0].x) - delta) + ',' + space.toC(ds.y,drops[0].y); // drop
				}
				data += ' ' + (space.toC(ds.x,positions[0].x) - delta) + ',' + space.toC(ds.y,positions[0].y); // point
				data += ' ' + coord(0);
				for(let i = 1; i < Nd; i++){
					if(state.dropLine.x){
						data += ' ' + dropx(i - 1) + ' ' + coord(i-1);
					}
					if(state.dropLine.y){
						data += ' ' + dropy(i - 1) + ' ' + coord(i-1);
					}
					data +=  ' ' + coord(i-1,i) + ' ' + coord(i);
				}
				data += state.dropLine.y ? ' ' + dropy(Nd - 1) : '';
				break;
			default:
					throw 'Stairs are either right or left';
		}

		return <polyline points={data} stroke={state.color} strokeWidth={state.width} fill='none'/>;

	}

	render(){

		let state = this.props.state;
		let delta = state.positions.length > 1 ? state.positions[1].x -  state.positions[0].x : 1;
		let me = this;

		return <g>
			{_.map(state.positions,(pos,idx) => me.bin(pos,state.drops[idx],delta,idx))}
			{this.path()}
		</g>;
	}
}

module.exports = Bins;
