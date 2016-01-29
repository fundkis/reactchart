var React = require('react');
var Label = require('./Label.cs.jsx');
var utils = require('../core/utils.cs.js');

/*
	{
		show: true || false,

	///// line part
		line: {
			CS: ''
			start: {x,y},
			end: {x, y},
			origin: {x,y},
			radius: {x, y},
			color: '',
			width:,
		},

	/// label part
		label: Label 

 /// common factor part
		comFac: {
			factor: ,
			offset: {x, y},
			FSize: ,
			anchor: '',
			color: ''
		}

	}

*/


var AxisLine = React.createClass({
	shouldComponentUpdate: function(props){
		return this.props !== props;
	},

	axis: function(){
		var lprops = this.props.line;

		switch(lprops.CS){
			case 'cart':
				return <line 
					x1={lprops.start.x} x2={lprops.end.x} y1={lprops.start.y} y2={lprops.end.y} 
					stroke={lprops.color} strokeWidth={lprops.width} />;
			case 'polar':
				return <ellipse cx={lprops.origin.x} cy={lprops.origin.y} rx={lprops.radius.x} ry={lprops.radius.y}
					stroke={lprops.color} strokeWidth={lprops.width}/>;
			default:
				throw new Error('Unknown coordinate system: "' + this.props.CS + '"' );
		}
	},

	textOffset: function(fs,text,dir){

		var fd = 0.25 * fs; // font depth, 25 %
		var fh = 0.75 * fs; // font height, 75 %

		// arbitrary values, from some font:
		// width "m" = 40 px
		// width "M" = 45 px => used
		var labelWidthOff = - text.length * 22.5;
		var labelHeightOff = (dir) => {
			return dir > 0 ? fh : fd;
		};

		return {
			x: dir.x !== 0 ? labelHeightOff(dir.x) : labelWidthOff ,
			y: dir.y !== 0 ? labelHeightOff(dir.y) : labelWidthOff
		};
	},

	factor: function(){
		var props = this.props.comFac;
		if(utils.isNil(props.factor) || props.factor === 1){
			return null;
		}

		var dir = utils.direction(this.props.line);
		dir.x = Math.sqrt(dir.x / dir.axe);
		dir.y = Math.sqrt(dir.y / dir.axe);

		var offset = this.textOffset(props.FSize,'10-10',dir); // if more than that, there are questions to be asked...

		var fac = {
			x:   props.offset.x + this.props.line.end.x + dir.y * ( offset.x + 10 ),
			y: - props.offset.y + this.props.line.end.y + dir.x * ( offset.y + 10 )
		};

		var mgr = utils.mgr(props.factor);
		var om = mgr.orderMag(props.factor);
		return <text {...fac} textAnchor={props.anchor} fill={props.color} fontSize={props.FSize}>
				10<sup>{om}</sup>
			</text>;
	},

	render: function(){

		return this.props.show === false ? null : <g>
			{this.axis()}
			<Label {...this.props.label}/>
			{this.factor()}
		</g>;
	}

});

module.exports = AxisLine;
