var React = require('react');
var marker = require('../marks/marker.cs.jsx');
var space = require('../core/space-transf.cs.js');
var _ = require('underscore');

module.exports = React.createClass({
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
			drops: {x:[], y:[]},
         stairs: 'right',
			dsx: {}, // see space-mgr for details
			dsy: {}  // see space-mgr for details
		};
	},
	render: function(){

		var Nd = this.props.points.length;
		var dsx = this.props.dsx;
		var dsy = this.props.dsy;

		if(Nd < 2){
			throw 'stairs defined with less than 2 points!!';
		}
		var props = this.props;
		var dropsx = (this.props.drops.x.length === 0)?_.map(this.props.points,function(/*point*/){return 0.0;}):this.props.drops.x;
		var dropsy = (this.props.drops.y.length === 0)?_.map(this.props.points,function(/*point*/){return 0.0;}):this.props.drops.y;

		var datas = [{x:0,y:0}]; // dealing with empty values
		if(this.props.points.length > 0){
			datas = _.map(this.props.points, function(point,index){
				return {
					x: space.toC(dsx,point.x + dropsx[index]), 
					y: space.toC(dsy,point.y + dropsy[index])
				};}
			);
		}

		var dx = datas[1].x - datas[0].x;

		var data = '';
		switch(this.props.stairs){
			case 'right':
	// right stairs
				data = + datas[0].x + ',' + space.toC(dsy,dsy.d.min + dropsy[0]) + ' ';
				for(var i = 0; i < Nd - 1; i++){
					data += datas[i].x + ',' + datas[i].y + ' ' + datas[i+1].x + ',' + datas[i].y + ' ';
				}
				data += datas[Nd - 1].x + ',' + datas[Nd - 1].y + ' ' + (datas[Nd - 1].x + dx) + ',' + datas[Nd - 1].y; // last bin
				data += ' ' + (datas[Nd - 1].x + dx) + ',' + space.toC(dsy, dsy.d.min + dropsy[Nd-1]); // closing
				break;
			case 'left':
   // left stairs
				data =(datas[0].x - dx) + ',' + this.props.dsx.c.min + ' ' + (datas[0].x - dx) + ',' + datas[0].y + ' ' + datas[0].x + ',' + datas[0].y + ' ';
				for(i = 0; i < Nd; i++){
					data +=  datas[i].x + ',' + datas[i+1].y + ' ' + ' ' + datas[i+1].x + ',' + datas[i+1].y + ' ';
				}
				data += data[Nd - 1].x  + ',' +  space.toC(dsy, dsy.d.min + dropsy[Nd - 1]); // closing
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
      var marks = marker.marks(datas,markprops,this.props.mark,this.props.markType);

		var key = this.props.name + 'p';
		var keyg = this.props.name + 'g';
		var keym = this.props.name + 'm';

		return <g key={keyg}>
					<polyline key={key} points={data} stroke={this.props.stroke} strokeWidth={this.props.strokeWidth} fill={this.props.fill} opacity={this.props.opacity}/>
					<g key={keym}>{marks}</g>
				</g>;
}
});
