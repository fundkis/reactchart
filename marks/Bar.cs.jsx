var React = require('react');
var dataScale = require('../core/space-transf.cs.js');
var utils = require('../core/utils.cs.js');

var BarMark = React.createClass({
  getDefaultProps: function() {
	 return {
		dsx: {}, // see space-mgr for details
		dsy: {}, // see space-mgr for details
		x:0,
		y:0,
		drop:{x:null, y:0},
		draw: false,
		width: 0,
		span:0.5,
		offset: {
			x: 0,
			y: 0
		},
		shade: 1
	 };
  },
  render : function() {

	var mgr = {
		x: utils.mgr(this.props.x),
		y: utils.mgr(this.props.y)
	};

	var ds = {
		x: this.props.dsx,
		y: this.props.dsy
	};

	var span = {
		x: utils.isNil(this.props.drop.y) ? 0 : this.props.span,
		y: utils.isNil(this.props.drop.x) ? 0 : this.props.span 
	};

	var drop = {
		x: utils.isNil(this.props.drop.x) ? this.props.x : this.props.drop.x,
		y: utils.isNil(this.props.drop.y) ? this.props.y : this.props.drop.y 
	};

	var props = this.props;

	// 

	var toC = (dir) => {
		return dataScale.toC(ds[dir], mgr[dir].add( props[dir], props.offset[dir])); // all in dataSpace
	};

	var x = toC('x');
	var y = toC('y');

	var toCwidth = (dir) => {
		return dataScale.toCwidth(ds[dir], mgr[dir].add(mgr[dir].distance(drop[dir],props[dir]), span[dir]));
	};

	var height = toCwidth('y');
	var width  = toCwidth('x');

	var color = this.props.color || this.props.fill || 'none';
	var stroke = this.props.draw ? color : null;
	if(drop.y > this.props.y){
		y -= height;
	}

	 return <rect x={x} y={y} height={height} width={width}
			stroke={stroke} strokeWidth={this.props.strokeWidth} 
			fill={color} opacity={this.props.shade}/>;
  }
});

module.exports = BarMark;
