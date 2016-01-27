var React = require('react');
var marker = require('../marks/marker.cs.jsx');
var space = require('../core/space-transf.cs.js');
var _ = require('underscore');
var defProps = require('../core/proprieties.cs.js');

var StairsChart = React.createClass({
	getDefaultProps: function(){
		return defProps.defaults('Stairs');
	},
<<<<<<< HEAD

	marks: function(){
		if(this.props.points.length === 0 || this.props.mark === false){
			return null;
		}
			// marks
		var markprops = this.props.markProps;
		if(!markprops.fill){
			markprops.fill = this.props.markColor || this.props.color;
		}
		if(!markprops.size){
			markprops.size = this.props.markSize;
		}

		markprops.name = this.props.name + 'm';
		markprops.dsx = this.props.dsx;
		markprops.dsy = this.props.dsy;
		return marker.marks(this.props.points,markprops,this.props.mark,this.props.markType);
	},

	render: function(){
=======
>>>>>>> develop

	marks: function(){
		if(this.props.points.length === 0 || this.props.mark === false){
			return null;
		}
			// marks
		var markprops = this.props.markProps;
		if(!markprops.fill){
			markprops.fill = this.props.markColor || this.props.color;
		}
		if(!markprops.size){
			markprops.size = this.props.markSize;
		}

		markprops.name = this.props.name + 'm';
		markprops.dsx = this.props.dsx;
		markprops.dsy = this.props.dsy;
		return marker.marks(this.props.points,markprops,this.props.mark,this.props.markType);
	},

	bin: function(start,point,delta,drop,idx){
		var path = '';
		switch(this.props.stairs){
			case 'right':
				var pr1 = point.x + ' ' + drop.y;
				var pr2 = point.x + ' ' + point.y;
				var pr3 = (point.x + delta.x) + ' ' + point.y;
				var pr4 = (point.x + delta.x) + ' ' + drop.y;
				path = 'M ' + pr1 + ' L ' + pr2 + ' L ' + pr3 + ' L ' + pr4;
				break;
			case 'left':
				var pl1 = (point.x - delta.x) + ' ' + drop.y;
				var pl2 = (point.x - delta.x) + ' ' + point.y;
				var pl3 = point.x + ' ' + point.y;
				var pl4 = point.x + ' ' + drop.y;
				path = 'M ' + pl1 + ' L ' + pl2 + ' L ' + pl3 + ' L ' + pl4;
				break;
		}

		var color = this.props.points[idx].fill || this.props.fill;
		var shade = this.props.shade || 1;

		return <path key={idx} d={path} strokeWidth={0} fill={color} opacity={shade}/>;
	},

	compute: function(){

		var dsx = this.props.dsx;
		var dsy = this.props.dsy;

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


		var drops = _.map(this.props.points, (point) => {
			return {
				x: space.toC(dsx,point.dropx) || dsx.c.min,
				y: space.toC(dsy,point.dropy) || dsy.c.min
			};}
		);

		var delta = {
			x: datas[1].x - datas[0].x,
			y: datas[1].y - datas[0].y
		};

		var dropLine = {
			x: !!this.props.dropLine && this.props.dropLine.x === true,
			y: !!this.props.dropLine && this.props.dropLine.y === true
		};

		return {
			datas: datas,
			delta: delta,
			drops: drops,
			dropLine: dropLine
		};

	},

		// treated as marks, for shader capacities
	bins: function(){

		var comp = this.compute();

		var out = [];
		// right or left
		var start = this.props.stairs === 'right' ? {x: comp.datas[0].x, y: comp.drops[0].y || this.props.dsy.c.min} : 
			{x: comp.datas[0].x - comp.delta.x, y: comp.drops[0].y || this.props.dsy.c.min} ;

		for(var p = 0; p < comp.datas.length; p++){
				out[p] = this.bin(start,comp.datas[p],comp.delta,comp.drops[p],p);
				start = comp.datas[p];
		}

		return out;
	},

	path: function(){
		if(this.props.color === this.props.fill){
			return null;
		}

		var comp = this.compute();

		var data = '';
		var Nd = comp.datas.length;
		switch(this.props.stairs){
			case 'right':
			// right stairs
				data = + comp.datas[0].x + ',' + comp.drops[0].y + ' ';
				for(var i = 0; i < Nd - 1; i++){
					data += comp.datas[i].x + ',' + comp.datas[i].y + ' ' + comp.datas[i+1].x + ',' + comp.datas[i].y + ' ';
					if(comp.dropLine.y){
						data += comp.datas[i + 1].x + ',' + comp.drops[i + 1].y + ' ';
					}
					if(comp.dropLine.x){
						data += comp.datas[i + 1].x + ',' + comp.datas[i].y + ' ' + comp.drops[i].x + ',' + comp.datas[i].y  + ' ' + comp.datas[i + 1].x + ',' + comp.datas[i].y + ' ';
					}
				}
				data += comp.datas[Nd - 1].x + ',' + comp.datas[Nd - 1].y + ' ' + (comp.datas[Nd - 1].x + comp.delta.x) + ',' + comp.datas[Nd - 1].y; // last bin
				data += ' ' + (comp.datas[Nd - 1].x + comp.delta.x) + ',' + comp.drops[Nd-1].y; // closing
				break;
			case 'left':
				// left stairs
				data =(comp.datas[0].x - comp.delta.x) + ',' + comp.drops[0].y + ' ' + (comp.datas[0].x - comp.delta.x) + ',' + comp.datas[0].y + ' ' + comp.datas[0].x + ',' + comp.datas[0].y + ' ';
				for(i = 0; i < Nd - 1; i++){
					if(comp.dropLine.x){
						data += comp.drops[i].x + ',' + comp.datas[i].y  + ' ' + comp.datas[i].x + ',' + comp.datas[i].y + ' ';
					}
					if(comp.dropLine.y){
						data += comp.datas[i].x + ',' + comp.drops[i].y + ' ';
					}
					data +=  comp.datas[i].x + ',' + comp.datas[i+1].y + ' ' + ' ' + comp.datas[i+1].x + ',' + comp.datas[i+1].y + ' ';
				}
				data += comp.datas[Nd - 1].x + ',' + comp.drops[Nd - 1].y; // closing
				break;
			default:
					throw 'Stairs are either right or left';
		}

<<<<<<< HEAD
		return <g>
					<polyline points={data} stroke={this.props.color} strokeWidth={this.props.width} fill={this.props.fill} opacity={this.props.opacity}/>
=======
		return <polyline points={data} stroke={this.props.color} strokeWidth={this.props.width} fill='none'/>;

	},

	render: function(){

		return <g>
					{this.bins()}
					{this.path()}
>>>>>>> develop
					<g>{this.marks()}</g>
				</g>;
}
});

module.exports = StairsChart;
