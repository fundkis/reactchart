var React = require('react');
var marker = require('../marks/marker.cs.jsx');
var _ = require('underscore');
var defProps = require('../core/proprieties.cs.js');

var BarChart = React.createClass({
  getDefaultProps: function() {
	 return defProps.defaults('BarChart');
  },

	drop: function(dir){
		var drop = 0;
		if(!!this.props.drop){ 
			drop = this.props.drop[dir] || drop;
		}
		return this.props.dir[dir] ? drop : undefined;
	},

  render : function() {

	if(this.props.points.length === 0){
		return null;
	}

	var props = {
		dsx:    this.props.dsx,
		dsy:    this.props.dsy,
		color:  this.props.markColor || this.props.color,
		draw:   this.props.markProps.draw || false,
		width:  this.props.width,
		span:   this.props.span,
		offset: this.props.offset,
		drop:   {
			x: this.drop('x'),
			y: this.drop('y')
		}
	};

	var datas = _.map(this.props.points,function(point){
		return {
			x: point.x, 
			y: point.y
		};
	});
	// marks
	props.markprops = this.props.markProps;
	
	props.name = this.props.key + '.b';
	var bars = marker.marks(datas,props,this.props.markType);

	 return <g>{bars}</g>;
  }
});

module.exports = BarChart;
