var React = require('react');
var marker = require('../marks/marker.cs.jsx');
var _ = require('underscore');

var BarChart = React.createClass({
  getDefaultProps: function() {
	 return {
		dsx: {}, // see space-mgr for details
		dsy: {}, // see space-mgr for details
		color: 'none',
		width: 0,
		span: 0.5, // in dataSpace
		dir: {
			x: false,
			y: true
		},
		points: [],
		markColor: null,
		markType: 'bar',
		markProps: {
			width: 0,
			draw: false
		},
		offset: {x: 0, y: 0}
	 };
  },
  render : function() {

	var props = {
		dsx:    this.props.dsx,
		dsy:    this.props.dsy,
		color:  this.props.markColor || this.props.color,
		draw:   this.props.markProps.draw || false,
		width:  this.props.width,
		span:   this.props.span,
		dir:    this.props.dir,
		offset: this.props.offset,
		drop:   {
			x: this.props.dir.x ? 0 : null,
			y: this.props.dir.y ? 0 : null
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
