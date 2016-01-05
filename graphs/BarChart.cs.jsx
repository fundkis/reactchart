var React = require('react');
var marker = require('../marks/marker.cs.jsx');
var _ = require('underscore');

var BarChart = React.createClass({
  getDefaultProps: function() {
	 return {
		dsx: {}, // see space-mgr for details
		dsy: {}, // see space-mgr for details
		color:'none',
		width: 0,
		span: 0.5, // in dataSpace
		dir: 90,
		points: [],
		mark: true,
		markColor: 'black',
		markType: 'bar',
		markProps: {},
		xoffset: 0
	 };
  },
  render : function() {

	var props = this.props.markProps;
	var toAdd = {
		dsx: this.props.dsx,
		dsy:  this.props.dsy,
		color: this.props.markColor,
		stroke:  this.props.color,
		strokeWidth:  this.props.width,
		span: this.props.span,
		dir: this.props.dir,
		xoffset: this.props.xoffset
	};

	var adder = function(toAdd){
		for(var thing in toAdd){
			if(!props[thing]){
				props[thing] = toAdd[thing];
			}
		}
	};

	adder(toAdd);

	var datas = _.map(this.props.points,function(point){
		return {
			x: point.x, 
			y: point.y, 
			drop:{
				x: point.dropx, 
				y: point.dropy
			}
		};
	});
	// marks
	props.markprops = this.props.markProps;
	
	props.name = this.props.key + '.b';
   var bars = marker.marks(datas,props,this.props.mark,this.props.markType);

	 return <g>{bars}</g>;
  }
});

module.exports = BarChart;
