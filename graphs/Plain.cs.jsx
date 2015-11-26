var React = require('react');
var _ = require('underscore');
var marker = require('../marks/marker.cs.jsx');
var space = require('../core/space-transf.cs.js');

var PlainChart = React.createClass({
	propTypes: {
		mark: React.PropTypes.bool
	},
	getDefaultProps: function(){
		return {
			stroke: 'black',
			strokeWidth: 1,
			fill: 'none',
			// mark props, explicit at heigh level
			// overwritten if present in markProps
			mark: true,
			markColor: 'black',
			markSize: 3,
			markType: 'dot',
			onlyMarks: false,
			// contains low-level description,
			// i.e. specific things like radius
			// for a dot, or anything.
			// overrides high-level if conflicts
			markProps: {},
			points: [],
			dsx: {}, // see space-mgr for details
			dsy: {}  // see space-mgr for details
			};
	},
	render: function(){
		// getting values, easier
		var dsx = this.props.dsx;
		var dsy = this.props.dsy;
		var dropsy = _.map(this.props.points,function(point){return point.dropy || dsy.d.min;});

		var datas = [{x:0,y:0}]; // dealing with empty values
		var Dpoints = [{x:0,y:0}]; // dealing with empty values
		if(this.props.points.length > 0){
			datas = _.map(this.props.points, function(point){
				return {
					x: space.toC(dsx,point.x), 
					y: space.toC(dsy,point.y)
				};
			});
			Dpoints = _.map(this.props.points, function(point){
				return {
					x: point.x,
					y: point.y,
					shade: point.shade,
				//	span: point.span,
					drop: {
						x: point.dropx,
						y: point.dropy
					}
				};
			});
		}

		var line = (this.props.onlyMarks)?' M ':' L ';
		var points = 'M '+ datas[0].x + ' ' + datas[0].y; // init
		for(var i = 1; i < this.props.points.length; i++){
			points += line + datas[i].x + ' ' + datas[i].y;
		}

		// we close the curve, nothing is printed
		for(i = dropsy.length - 1; i >= 0; i--){
			points += ' M ' + datas[i].x + ' ' + space.toC(dsy,dropsy[i]);
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
		markprops.dsx = dsx;
		markprops.dsy = dsy;
			if(!!this.props.span){
			 markprops.span = this.props.span;
			}
			if(!!this.props.xoffset){
			 markprops.xoffset = this.props.xoffset;
			}
		var marks = marker.marks(Dpoints,markprops,this.props.mark,this.props.markType);

		return <g>
			<path
				d={points} 
				stroke={this.props.stroke} 
				strokeWidth={this.props.strokeWidth}
				fill={this.props.fill}/>
			<g>{marks}</g>
			</g>;
}
});

module.exports = PlainChart;
