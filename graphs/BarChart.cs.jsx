var React = require('react');
var marker = require('../marks/marker.cs.jsx');
var Bar = require('./Bar.cs.jsx');

module.exports = React.createClass({
  getDefaultProps: function() {
	 return {
		dsx: {}, // see space-mgr for details
		dsy: {}, // see space-mgr for details
		color:'none',
		stroke: 'none',
		strokeWidth: 0,
		span:10,
		dir:90,
		points: [],
		mark: true,
		markType: 'dot',
		markProps: {}
	 };
  },
  render : function() {

	var props = {
		dsx: this.props.dsx,
		dsy:  this.props.dsy,
		color: this.props.color,
		stroke:  this.props.stroke,
		strokeWidth:  this.props.strokeWidth,
		span: this.props.span,
		dir: this.props.dir
	};

	var bars = [];
	for(var i = 0; i < points.length; i++){
		var key = this.props.key + '.b' + i;
		bars.push(<Bar key={key} x={points[i].x} y={points[i].y} {...props}/>);
	}

	 return <g>{bars}
			{marker.marks(this.props.points,this.props.markProps,this.props.mark,this.props.markType)}
			</g>;
  }
});
