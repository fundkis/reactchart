var React = require('react');

/*
	{
		label: '',
		FSize: ,
		offset: {x, y},
		anchor: '',
		color: '',
		dir: {x, y}
	},
*/

var Label = React.createClass({
	shouldComponentUpdate: function(props){
		return props !== this.props;
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
			x: this.props.dir.x !== 0 ? labelHeightOff(dir.x) : labelWidthOff ,
			y: this.props.dir.y !== 0 ? labelHeightOff(dir.y) : labelWidthOff
		};
	},

	render: function(){
		if(this.props.label.length === 0){
			return null;
		}

// label
		// => theta = arctan(y/x) [-90,90]

		var offset = this.textOffset(this.props.FSize,this.props.label,this.props.dir);
		var xL = this.props.position.x + this.props.dir.x * offset.x;
		var yL = this.props.position.y + this.props.dir.y * offset.y;

		var theta = Math.floor( Math.atan( - Math.sqrt( this.props.dir.y / this.props.dir.x ) ) * 180 / Math.PI ); // in degrees

		var rotate = 'rotate(' + theta + ' ' + xL + ' ' + yL + ')';

		return <text fill={this.props.color} x={xL} y={yL} transform={rotate} textAnchor={this.props.anchor} fontSize={this.props.FSize}>
			{this.props.label}
		</text>;
	}
});

module.exports = Label;
