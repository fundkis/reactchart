var React = require('react');
var Label = require('./Label.jsx');
var utils = require('../core/utils.js');
var imUtils = require('../core/im-utils.js');

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
		return !imUtils.isEqual(props.state,this.props.state);
	},

	axis: function(){
		var lprops = this.props.state.line;

		var lp = this.props.css ? null: {
			stroke: lprops.color,
			strokeWidth: lprops.width
		};

		switch(lprops.CS){
			case 'cart':
				return <line className={this.props.className} {...lp}
					x1={lprops.start.x} x2={lprops.end.x} y1={lprops.start.y} y2={lprops.end.y}/>;
			case 'polar':
				return <ellipse className={this.props.className} {...lp}
					cx={lprops.origin.x} cy={lprops.origin.y} rx={lprops.radius.x} ry={lprops.radius.y}/>;
			default:
				throw new Error('Unknown coordinate system: "' + this.props.state.CS + '"' );
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
		var props = this.props.state.comFac;
		if(utils.isNil(props.factor) || props.factor === 1){
			return null;
		}

		var dir = utils.direction(this.props.state.line);
		dir.x = Math.sqrt(dir.x / dir.line);
		dir.y = Math.sqrt(dir.y / dir.line);

		var offset = this.textOffset(props.Fsize,'10-10',dir); // if more than that, there are questions to be asked...

		var fac = {
			x:   props.offset.x + this.props.state.line.end.x + dir.x * ( offset.x + 10 ),
			y: - props.offset.y + this.props.state.line.end.y + dir.y * ( offset.y + 10 )
		};
    let trans = 'translate('+fac.x+','+fac.y+')';

		var mgr = utils.mgr(props.factor);
		var om = mgr.orderMag(props.factor);
    return <g transform={trans}>
      <circle x='0' y='0' r='1'/>
      <text x='0' y='0' fill={props.color} textAnchor='end' fontSize={props.Fsize}>10</text>
      <text x='0' y={-0.5*props.Fsize} fontSize={props.Fsize} textAnchor='start'>{om}</text>
    </g>;
	},

	render: function(){

    var labName = this.props.className + 'Label';

		return this.props.state.show === false ? null : <g>
			{this.axis()}
			<Label className={labName} css={this.props.css} state={this.props.state.label}/>
			{this.factor()}
		</g>;
	}

});

module.exports = AxisLine;
