var React = require('react');
var marker = require('../marks/marker.cs.jsx');
var space = require('../core/space-transf.cs.js');
var _ = require('underscore');

var StairsChart = React.createClass({
	getDefaultProps: function(){
		return {
			stroke: 'black',
			strokeWidth: 1,
			fill: 'none',
			opacity: 1,
			mark: true,
			markColor: 'black',
			markSize: 3,
			markType: 'dot',
			markProps: {},
			points: [],
			stairs: 'right',
			dsx: {}, // see space-mgr for details
			dsy: {}  // see space-mgr for details
		};
	},
	render: function(){

		var Nd = this.props.points.length;
		var dsx = this.props.dsx;
		var dsy = this.props.dsy;

		var dropsy = _.map(this.props.points,function(point){return point.dropy || dsy.d.min;});

		var datas = [{x:0,y:0},{x:0,y:0}]; // dealing with empty values
		if(this.props.points.length > 0){
			datas = _.map(this.props.points, function(point){
				return {
					x: space.toC(dsx,point.x), 
					y: space.toC(dsy,point.y)
				};}
			);
		}

		// in case of Dirac
		if(datas.length === 1){
			datas.push({
				x: datas[0].x,
				y: datas[0].y
			});
		}

		var dx = datas[1].x - datas[0].x;

		var data = '';
		switch(this.props.stairs){
			case 'right':
	// right stairs
				data = + datas[0].x + ',' + space.toC(dsy,dropsy[0]) + ' ';
				for(var i = 0; i < Nd - 1; i++){
					data += datas[i].x + ',' + datas[i].y + ' ' + datas[i+1].x + ',' + datas[i].y + ' ';
				}
				data += datas[Nd - 1].x + ',' + datas[Nd - 1].y + ' ' + (datas[Nd - 1].x + dx) + ',' + datas[Nd - 1].y; // last bin
				data += ' ' + (datas[Nd - 1].x + dx) + ',' + space.toC(dsy, dropsy[Nd-1]); // closing
				break;
			case 'left':
	 // left stairs
				data =(datas[0].x - dx) + ',' + space.toC(dsy,dropsy[0]) + ' ' + (datas[0].x - dx) + ',' + datas[0].y + ' ' + datas[0].x + ',' + datas[0].y + ' ';
				for(i = 0; i < Nd - 1; i++){
					data +=  datas[i].x + ',' + datas[i+1].y + ' ' + ' ' + datas[i+1].x + ',' + datas[i+1].y + ' ';
				}
				data += datas[Nd - 1].x	+ ',' +  space.toC(dsy,dropsy[Nd - 1]); // closing
				break;
			default:
				throw 'Stairs are either right or left';
		}

			// marks
		var markprops = this.props.markProps;
		if(!markprops.fill){
			markprops.fill = this.props.markColor;
		}
		if(!markprops.size){
			markprops.size = this.props.markSize;
		}

		markprops.name = this.props.name + 'm';
		markprops.dsx = this.props.dsx;
		markprops.dsy = this.props.dsy;
		var marks = marker.marks(this.props.points,markprops,this.props.mark,this.props.markType);

		return <g>
					<polyline points={data} stroke={this.props.stroke} strokeWidth={this.props.strokeWidth} fill={this.props.fill} opacity={this.props.opacity}/>
					<g>{marks}</g>
				</g>;
}
});

module.exports = StairsChart;
