var React = require('react');
var utils = require('../core/utils.cs.js');


/*
	{
	///// line part
		CS: ''
		start: {x,y},
		end: {x, y},
		origin: {x,y},
		radius: {x, y},
		lineColor: '',
		lineWidth:,

	/// label part
		label: {
			label: '',
			FSize: ,
			dir: {x, y},
			offset: {x, y},
			anchor: ''
		},

 /// common factor part
		comFac: {
			factor: ,
			offset: {x, y},
			FSize: ,
			anchor
		}

	}

*/


var AxisLine = React.createClass({
	shouldComponentUpdate: function(props){
		return this.props !== props;
	},

	axis: function(){
		switch(this.props.CS){
			case 'cart':
				return <line 
					x1={this.props.start.x} x2={this.props.end.x} y1={this.props.start.y} y2={this.props.end.y} 
					stroke={this.props.lineColor} strokeWidth={this.props.lineWidth} />;
			case 'polar':
				return <ellipse cx={this.props.origin.x} cy={this.props.origin.y} rx={this.props.radius.x} ry={this.props.radius.y}
					stroke={this.props.lineColor} strokeWidth={this.props.lineWidth}/>;
			default:
				throw new Error('Unknown coordinate system: "' + this.props.CS + '"' );
		}
	},

	dir: function(){
		// axe is AC
		//
		//             C
		//            /|
		//          /  |
		//        /    |
		//      /      |
		//    /        |
		//	A -------- B
		//

		var distSqr = (p1,p2) => {return (p2.x - p1.x) * (p2.x - p1.x) + (p2.y - p1.y) * (p2.y - p1.y);};
		var B = {x: this.props.end.x, y: this.start.y};
		var AB = distSqr(this.props.start,B);
		var BC = distSqr(B,this.props.end);

		return {x: AB, y: AC, axe: distSqr(this.props.end,this.props.start)};

	},

	label: function(){
		var props = this.props.label;
		if(utils.isNil(props.label) || props.label.length === 0){
			return null;
		}

// label
		// => theta = arctan(y/x) [-90,90]
		var dir = this.dir();

		var theta = Math.floor( Math.atan( - Math.sqrt( dir.y / dir.x ) ) * 180 / Math.PI ); // in degrees

		var fs = props.FSize; // font size
		var fd = 0.25 * fs; // font depth, 25 %
		var fh = 0.75 * fs; // font height, 75 %

		// arbitrary values, from some font:
		// width "m" = 40 px
		// width "M" = 45 px => used
		var labelWidthOff = - props.label.length * 22.5;
		var labelHeightOff = (dir) => {
			return dir > 0 ? fh : fd;
		};

		var xoffset = props.dir.x !== 0 ? labelHeightOff(props.dir.x) : labelWidthOff ;
		var yoffset = props.dir.y !== 0 ? labelHeightOff(props.dir.y) : labelWidthOff ;

		var xL = (this.props.end.x + this.props.start.x)/2 + props.dir.x * ( xoffset + props.offset.x);
		var yL = (this.props.end.y + this.props.start.y)/2 + props.dir.y * ( yoffset + props.offset.y); 


		// shifting from axis

		var rotate = 'rotate(' + theta + ' ' + xL + ' ' + yL + ')';

		return <text x={xL} y={yL} transform={rotate} textAnchor={props.anchor} fontSize={props.FSize}>{props.label}</text>;
	},

	factor: function(){
		var props = this.props.comFac;
		if(utils.isNil(props.factor) || props.factor === 1){
			return null;
		}

		var dir = this.dir();
		dir.x = Math.sqrt(dir.x / dir.axe);
		dir.y = Math.sqrt(dir.y / dir.axe);

		var fac = {
			x:   dir.y * this.props.offset + this.props.end.x,
			y: - dir.x * this.props.offset + this.props.end.y
		};

		var mgr = utils.mgr(props.factor);
		var om = mgr.orderMag(props.factor);
		return <text {...fac} textAnchor={props.anchor} fontSize={props.FSize}>
				10<sup>{om}</sup>
			</text>;
	},

	render: function(){

		return <g>
			{this.axis()}
			{this.label()}
			{this.factor()}
		</g>;
	}

});

module.exports = AxisLine;
