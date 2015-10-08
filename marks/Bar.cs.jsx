var React = require('react');
var dataScale = require('../core/space-transf.cs.js');

module.exports = React.createClass({
  getDefaultProps: function() {
	 return {
		dsx: {}, // see space-mgr for details
		dsy: {}, // see space-mgr for details
		x:0,
		y:0,
		drop:{x:undefined, y:undefined},
		markColor: undefined,
		stroke: 'none',
		strokeWidth: 0,
		span:0.5,
		dir:90,
		xoffset: 0,
		shade: 1
	 };
  },
  render : function() {

	var drop = this.props.drop.y;
	if(drop === undefined || drop === null){
		drop = this.props.dsy.d.min;
	}
	// 
	var x = dataScale.toC(this.props.dsx, this.props.x - 0.5 * this.props.span + this.props.xoffset); // all in dataSpace
	var y = dataScale.toC(this.props.dsy, this.props.y);

	var height = dataScale.toCwidth(this.props.dsy, this.props.y - drop);
	var width  = dataScale.toCwidth(this.props.dsx, this.props.span);

	if(this.props.y < drop){
		y -= height;
	}

	// rotation
	var xr = dataScale.toC(this.props.dsx, 0.5 * width  + this.props.x ); // all in dataSpace
	var yr = dataScale.toC(this.props.dsy, 0.5 * height + this.props.y ); // all in dataSpace

	var rotate = 'rotate(' + (this.props.dir - 90) + ' ' + xr + ' ' + yr + ')';
	var key = this.props.name + 'r';
	var color = this.props.markColor || this.props.fill || 'none';

	 return (
			<rect key={key}  x={x} y={y} height={height} width={width} transform={rotate}
			stroke={this.props.stroke} strokeWidth={this.props.strokeWidth} 
			fill={color} opacity={this.props.shade}/>
	 );
  }
});
