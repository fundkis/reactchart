var React = require('react');
var dataScale = require('../core/space-transf.cs.js');

module.exports = React.createClass({
  getDefaultProps: function() {
	 return {
		dsx: {}, // see space-mgr for details
		dsy: {}, // see space-mgr for details
		x:0,
		y:0,
		drop:0,
		color:'none',
		stroke: 'none',
		strokeWidth: 0,
		span:0,
		dir:90
	 };
  },
  render : function() {

	// y dir
	var dirr = this.props.dir * Math.PI / 180;
	var yContrib = Math.sin(dirr);
	var xContrib = Math.cos(dirr);

	// x dir
	var sdir = ( (this.props.dir + 90)%180 ) * Math.PI / 180;
	var ysContrib = Math.sin(sdir);
	var xsContrib = Math.cos(sdir);

	// 
	var x = dataScale.toC(this.props.dsx, this.props.x - 0.5 * xsContrib * this.props.span); // all in dataSpace
	var y = dataScale.toC(this.props.dsy, this.props.y * yContrib);

	var height = dataScale.toCwidth(this.props.dsy,(this.props.y - this.props.drop) * yContrib);
	var width  = dataScale.toCwidth(this.props.dsx,this.props.span * xsContrib) + dataScale.toCwidth(this.props.dsy,this.props.span * ysContrib);

	// rotation
	var xr = dataScale.toC(this.props.dsx,this.props.x - (this.props.x - this.props.dsx.d.min) * xsContrib); // all in dataSpace
	var yr = dataScale.toC(this.props.dsy,this.props.y - (this.props.y - this.props.dsy.d.min) * yContrib); // all in dataSpace

	var rotate = 'rotate(' + (this.props.dir - 90) + ' ' + xr + ' ' + yr + ')';

	 return (
			<rect x={x} y={y} height={height} width={width} transform={rotate}
			stroke={this.props.stroke} strokeWidth={this.props.strokeWidth} 
			fill={this.props.color}/>
	 );
  }
});
