var React = require('react');
var dataScale = require('../core/space-transf.cs.js');

module.exports = React.createClass({
  getDefaultProps: function() {
	 return {
		dsx: {}, // see space-mgr for details
		dsy: {}, // see space-mgr for details
		x:0,
		y:0,
		drop:{x:0, y:0},
		color:'none',
		stroke: 'none',
		strokeWidth: 0,
		span:0.5,
		dir:90,
		xoffset: 0
	 };
  },
  render : function() {

	// 
	var x = dataScale.toC(this.props.dsx, this.props.x - 0.5 * this.props.span + this.props.xoffset); // all in dataSpace
	var y = dataScale.toC(this.props.dsy, this.props.y + this.props.drop.y );

	var height = dataScale.toCwidth(this.props.dsy, this.props.y - this.props.dsy.d.min);
	var width  = dataScale.toCwidth(this.props.dsx, this.props.span);

	// rotation
	var xr = dataScale.toC(this.props.dsx, 0.5 * width  + this.props.x ); // all in dataSpace
	var yr = dataScale.toC(this.props.dsy, 0.5 * height + this.props.y ); // all in dataSpace

	var rotate = 'rotate(' + (this.props.dir - 90) + ' ' + xr + ' ' + yr + ')';
	var xt = dataScale.toC(this.props.dsx, this.props.x + 0.5 * this.props.span); // all in dataSpace
	 return (
			<rect x={x} y={y} height={height} width={width} transform={rotate}
			stroke={this.props.stroke} strokeWidth={this.props.strokeWidth} 
			fill={this.props.color}/>
	 );
  }
});
