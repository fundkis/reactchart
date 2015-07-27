var React = require('react');
var _ = require('underscore');
var dataScale = require('../core/space-transf.cs.js');

module.exports = React.createClass({
  getDefaultProps: function() {
	 return {
		dsx: {}, // see space-mgr for details
		dsy: {}, // see space-mgr for details
		x:0,
		y:0,
		color:'none',
		stroke: 'none',
		strokeWidth: 0,
		span:0,
		dir:90
	 };
  },
  render : function() {

	var dirr = this.props.dir * Math.PI / 180;
	var yContrib = Math.sin(dirr);
	var xContrib = Math.cos(dirr);

	var height = dataScale.toC(this.props.dsy,this.props.y * yContrib)    + dataScale.toC(this.props.dsx,this.props.x * xContrib);
	var width  = dataScale.toC(this.props.dsx,this.props.span * xContrib) + dataScale.toC(this.props.dsy,this.props.span * yContrib);

	var x = dataScale.toC(this.props.dsx,(this.props.x - 0.5 * yContrib * span) - (this.props.x - this.props.dx.d.min) * xContrib); // all in dataSpace
	var y = dataScale.toC(this.props.dsy,(this.props.y - 0.5 * xContrib * span) - (this.props.y - this.props.dy.d.min) * yContrib); // all in dataSpace

	// rotation
	var xr = dataScale.toC(this.props.dsx,this.props.x - (this.props.x - this.props.dx.d.min) * xContrib); // all in dataSpace
	var yr = dataScale.toC(this.props.dsy,this.props.y - (this.props.y - this.props.dy.d.min) * yContrib); // all in dataSpace

	var rotate = 'rotate(' + this.props.dir + ' ' + xr + ' ' + yr + ')';

	 return (
		  <rect x={x} y={y} height={height} width={width} transform={rotate}
			stroke={this.props.stroke} strokeWidth={this.props.strokeWidth} 
			fill={this.props.color}/>
	 );
  }
});
