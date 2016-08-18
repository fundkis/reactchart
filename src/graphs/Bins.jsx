var React = require('react');

var _ = require('underscore');
var space = require('../core/space-transf.js');
var imUtils = require('../core/im-utils.js');
var utils = require('../core/utils.js');

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


var Bins = React.createClass({
	
  shouldComponentUpdate: function(props) {
	 return !imUtils.isEqual(props.state,this.props.state);
  },

	bin: function(point,drop,delta,idx){

		var state = this.props.state;

		var p = {
			x: space.toC(state.ds.x,point.x),
			y: space.toC(state.ds.y,point.y),
		};

		var d = {
			x: space.toC(state.ds.x,drop.x),
			y: space.toC(state.ds.y,drop.y),
		};

		var del = space.toCwidth(state.ds.x,delta);

		var path = '';
		switch(state.stairs){
			case 'right':
				var pr1 = p.x + ' ' + d.y;
				var pr2 = p.x + ' ' + p.y;
				var pr3 = (p.x + del) + ' ' + p.y;
				var pr4 = (p.x + del) + ' ' + d.y;
				path = 'M ' + pr1 + ' L ' + pr2 + ' L ' + pr3 + ' L ' + pr4;
				break;
			case 'left':
				var pl1 = (p.x - del) + ' ' + d.y;
				var pl2 = (p.x - del) + ' ' + p.y;
				var pl3 = p.x + ' ' + p.y;
				var pl4 = p.x + ' ' + d.y;
				path = 'M ' + pl1 + ' L ' + pl2 + ' L ' + pl3 + ' L ' + pl4;
				break;
		}

		var color = point.fill || state.fill;
		var shade = state.shade || 1;

		return <path key={idx} d={path} strokeWidth={0} fill={color} opacity={shade}/>;
	},

	path: function(){

		var state = this.props.state;
    if(state.positions.length === 0){
      return null;
    }
		var positions = state.positions;
		var ds = state.ds;
		var drops = state.drops;

		var coord = (idx,idy) => {
			idy = utils.isNil(idy) ? idx : idy;
			return space.toC(ds.x,positions[idx].x) + ',' + space.toC(ds.y,positions[idy].y);
		};

		var dropy = (idx) => {
			return space.toC(ds.x,positions[idx].x) + ',' + space.toC(ds.y,drops[idx].y);
		};

		var dropx = (idx) => {
			return space.toC(ds.x,drops[idx].x) + ',' + space.toC(ds.y,positions[idx].y);
		};

		var Nd = state.positions.length;
		var data = '';
		var delta = state.positions.length > 1 ? space.toCwidth(ds.x,positions[1].x -  positions[0].x) : 10;
		switch(state.stairs){
			case 'right':
			// right stairs
				data = dropy(0) + ' ' + coord(0) + ' ';
				for(var i = 1; i < Nd; i++){
					data += coord(i,i-1) + ' ' + coord(i) + ' ';
					if(state.dropLine.y){
						data += dropy(i) + ' ' + coord(i) + ' ';
					}
					if(state.dropLine.x){
						data += dropx(i) + ' ' + coord(i) + ' ';
					}
				}
				data += (space.toC(ds.x,positions[Nd - 1].x) + delta) + ',' + space.toC(ds.y,positions[Nd - 1].y); // point
				data += ' ' + (space.toC(ds.x,positions[Nd - 1].x) + delta) + ',' + space.toC(ds.y,drops[Nd - 1].y); // drop
				break;
			case 'left':
				// left stairs
				data =  (space.toC(ds.x,positions[0].x) - delta) + ',' + space.toC(ds.y,drops[0].y); // drop
				data += ' ' + (space.toC(ds.x,positions[0].x) - delta) + ',' + space.toC(ds.y,positions[0].y); // point
				data += coord(0);
				for(i = 1; i < Nd; i++){
					if(state.dropLine.x){
						data += dropx(i - 1) + ' ' + coord(i-1) + ' ';
					}
					if(state.dropLine.y){
						data += dropy(i - 1) + ' ' + coord(i-1) + ' ';
					}
					data +=  coord(i-1,i) + ' ' + coord(i) + ' ';
				}
				data += dropy(Nd - 1);
				break;
			default:
					throw 'Stairs are either right or left';
		}

		return <polyline points={data} stroke={state.color} strokeWidth={state.width} fill='none'/>;

	},

	render: function(){

		var state = this.props.state;
		var delta = state.positions.length > 1 ? state.positions[1].x -  state.positions[0].x : 1;
		var me = this;

		return <g>
			{_.map(state.positions,(pos,idx) => {return me.bin(pos,state.drops[idx],delta,idx);})}
			{this.path()}
		</g>;
	}
});

module.exports = Bins;
