var React = require('react');
var _ = require('underscore');
var marker = require('../marks/marker.cs.jsx');
var space = require('../core/space-transf.cs.js');
var defProps = require('../core/proprieties.cs.js');

var PlainChart = React.createClass({
	propTypes: {
		mark: React.PropTypes.bool
	},
	getDefaultProps: function(){
		return defProps.defaults('Plain');
	},

	path: function(){
    if(this.props.points.length === 0){
      return null;
    }
		// getting values, easier
		var dsx = this.props.dsx;
		var dsy = this.props.dsy;
		var dropsy = _.map(this.props.points,function(point){return point.dropy || dsy.d.min;});

		var datas = _.map(this.props.points, function(point){
			return {
				x: space.toC(dsx,point.x), 
				y: space.toC(dsy,point.y)
			};
		});

		var line = (this.props.onlyMarks)?' M ':' L ';
		var points = 'M '+ datas[0].x + ' ' + datas[0].y; // init
		for(var i = 1; i < this.props.points.length; i++){
			points += line + datas[i].x + ' ' + datas[i].y;
		}

		// we close the curve, nothing is printed
		for(i = dropsy.length - 1; i >= 0; i--){
			points += ' M ' + datas[i].x + ' ' + space.toC(dsy,dropsy[i]);
		}

		return points;
	},

	marks: function(){
    if(this.props.points.length === 0 || this.props.mark === false){
      return null;
    }
		var markprops = this.props.markProps;
		var markCol = this.props.markColor || this.props.color;
		if(!markprops.color){
			markprops.color = markCol;
		}
		if(!markprops.size){
			markprops.size = this.props.markSize;
		}
		markprops.name = this.props.name + 'm';
		markprops.dsx = this.props.dsx;
		markprops.dsy = this.props.dsy;
		if(!!this.props.span){
		 markprops.span = this.props.span;
		}
		if(!!this.props.xoffset){
		 markprops.xoffset = this.props.xoffset;
		}
		return marker.marks(this.props.points,markprops,this.props.markType);
	},

	render: function(){

		return <g>
			<path
				d={this.path()} 
				stroke={this.props.color} 
				strokeWidth={this.props.width}
				fill={this.props.fill}/>
			{this.marks()}
			</g>;
}
});

module.exports = PlainChart;
