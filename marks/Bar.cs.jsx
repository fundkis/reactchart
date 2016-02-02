var React = require('react');
var dataScale = require('../core/space-transf.cs.js');
var utils = require('../core/utils.cs.js');
var imUtils = require('../core/im-utils.cs.js');

/*
	{
		draw: false,
		ds: {
			x: {}, // see space-mgr for details
			y: {}
		}, // see space-mgr for details
		position:{
			x:0,
			y:0
		},
		drop:{
			x:null, 
			y:0
		},
		width: 0,
		span: 0.5,
		color: '',
		fill: '',
		shade: 1
	}
*/

var BarMark = React.createClass({

	shouldComponentUpdate: function(props){
		return !imUtils.isEqual(props,this.props);
	},

  render : function() {

	var mgr = {
		x: utils.mgr(this.props.position.x),
		y: utils.mgr(this.props.position.y)
	};

	var ds = this.props.ds;

	var position = this.props.position;

	var span = {
		x: utils.isNil(this.props.drop.y) ? 0 : this.props.span,
		y: utils.isNil(this.props.drop.x) ? 0 : this.props.span 
	};

	var drop = {
		x: utils.isNil(this.props.drop.x) ? this.props.position.x : this.props.drop.x,
		y: utils.isNil(this.props.drop.y) ? this.props.position.y : this.props.drop.y 
	};

	var toC = (dir) => {
		return dataScale.toC(ds[dir], mgr[dir].subtract(position[dir],mgr[dir].divide(span[dir],2))); // all in dataSpace
	};

	var x = toC('x');
	var y = toC('y');

	var toCwidth = (dir) => {
		return dataScale.toCwidth(ds[dir], mgr[dir].add(mgr[dir].distance(drop[dir],position[dir]), span[dir]));
	};

	var height = toCwidth('y');
	var width  = toCwidth('x');
	if(mgr.y.lowerThan(position.y,drop.y)){
		y -= height;
	}

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
