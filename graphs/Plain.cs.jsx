var React = require('react');
var _ = require('underscore');
var marker = require('../marks/marker.cs.jsx');
var space = require('../core/space-transf.cs.js');
var defProps = require('../core/proprieties.cs.js');
var utils = require('../core/utils.cs.js');

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
		var baseLine = this.props.baseLine;
		var dropsy = _.map(this.props.points,function(point){return point.dropy || baseLine.y;});
		var dropsx = _.map(this.props.points,function(point){return point.dropx || baseLine.x;});

		var doDropx = !!this.props.fill && this.props.fill !== 'none' && utils.isNil( _.find(dropsx, (val) => {return utils.isNil(val);}));
		var doDropy = !!this.props.fill && this.props.fill !== "none" && utils.isNil( _.find(dropsy, (val) => {return utils.isNil(val);})); 

		var datas = _.map(this.props.points, function(point){
			return {
				x: space.toC(dsx,point.x), 
				y: space.toC(dsy,point.y)
			};
		});


		var dropLinex = !!this.props.dropLine && this.props.dropLine.x === true;
		var dropLiney = !!this.props.dropLine && this.props.dropLine.y === true;
		var base = {
			x: utils.isNil(this.props.baseLine.x) ? dsx.c.min : this.props.baseLine.x,
			y: utils.isNil(this.props.baseLine.y) ? dsy.c.min : this.props.baseLine.y
		};

		var line = (this.props.onlyMarks)?' M ':' L ';
		var points = 'M '+ datas[0].x + ' ' + datas[0].y; // init
		for(var i = 1; i < this.props.points.length; i++){
			points += line + datas[i].x + ' ' + datas[i].y;
			if(dropLiney){
				points += line + datas[i].x + ' ' + base.y + ' L ' +  datas[i].x + ' ' + datas[i].y;
			}
			if(dropLinex){
				points += line + base.x + ' ' + datas[i].y + ' L ' +  datas[i].x + ' ' + datas[i].y;
			}
		}

		// we close the curve if wanted
		// y dir has prevalence
		if(doDropy){
			for(i = dropsy.length - 1; i >= 0; i--){
				points += ' L ' + datas[i].x + ' ' + space.toC(dsy,dropsy[i]);
			}
		}else if(doDropx){
			for(i = dropsx.length - 1; i >= 0; i--){
				points += ' L ' + space.toC(dsx,dropsx[i]) + ' ' + datas[i].y;
			}
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

		var shade = this.props.shade || 1;
		return <g>
			<path
				d={this.path()} 
				stroke={this.props.color} 
				strokeWidth={this.props.width}
				opacity={shade}
				fill={this.props.fill}/>
			{this.marks()}
			</g>;
}
});

module.exports = PlainChart;
