var React = require('react');

var Tick = React.createClass({
	PropTypes:{
		draw: React.PropTypes.bool,
		label: React.PropTypes.string,
		fontSize: React.PropTypes.number
	},
	getDefaultProps: function(){
		return {
			// common whatever tick
			draw: true,
			where: {x: 0, y: 0}, // where the tick is
			dir: 0,						// direction of tick
		// grid
			grid: false,
			gridLength: 0,
		// label
			label: '',
			labelFSize: 10,
			labelColor: 'black',
		// default for major tick
			major: {
				width: 0.5,
				color: 'black',
				length: 15,					// length of tick
				out: 0.25,					// proportion that is outside (-dir)
		// label
				offset: {x:0, y:0}
			},
		// default for minor tick
			minor: {
				width: 0.3,
				color: 'gray',
				length: 7,					// length of tick
				out: 0,						// proportion that is outside (-dir)
		// label
				offset: {x:0, y:3.75}
			},
		// major/minor
			isMajor: true
		};
	},
	render: function(){
		// choice major/minor
		var details = (this.props.isMajor)?this.props.major:this.props.minor;


		var theta =  this.props.dir * Math.PI / 180;
		var x1 = this.props.where.x - Math.cos(theta) * details.length * details.out;
		var y1 = this.props.where.y + Math.sin(theta) * details.length * details.out; // beware about y sign!!
		var x2 = x1 + Math.cos(theta) * details.length;
		var y2 = y1 - Math.sin(theta) * details.length; // beware about y sign!!

		var fs = this.props.labelFSize;
		// label is out, further away by fontsize in y dir
		var xt = x1;
		var yt = y1;
		var textAnchor;
		// adding a little margin
		// anchoring the text
		var testdir = this.props.dir; // type is such an annoyance...
		switch(testdir){
			// --|-->
			// label
		case 90: 
			yt += 5 + Math.sin(theta) * fs;  // font size in the way (baseline is at the bottom of label)
			textAnchor = 'middle';
			break;
			// label -|--
		case 0:
			xt -= 5;
			yt += fs/3; // baseline adjustment (until I know how to retrieve the depth of the label)
			textAnchor = 'end';
			break;
			// label
			// --|-->
		case -90:
			yt -= 5;
			textAnchor = 'middle';
			break;
			// --|- label
		case 180:
			xt += 5;
			yt += fs/3; // baseline adjustment (until I know how to retrieve the depth of the label)
			textAnchor = 'start';
			break;
		}

		// offset
		var xoff = details.offset.x || 0;
		var yoff = details.offset.y || 0;
		xt += ( (testdir === 0)?-1:1 ) * xoff;
		yt += ( (testdir === -90)?-1:1 ) * yoff;

	// grid
		var gridColor = 'white';
		var gridWidth = 2 / 3 * details.width;
		var xG2 = x1;
		var yG2 = y1;
		if(this.props.grid){
			gridColor = 'gray';
			xG2 = x1 + this.props.gridLength * Math.cos(theta);
			yG2 = y1 + this.props.gridLength * Math.sin(theta);
		}

		var width = (this.props.draw)?this.props.width:0;

		return <g>
				<line x1={x1} x2={xG2} y1={y1} y2={yG2} stroke={gridColor} strokeWidth={gridWidth}/>
				<line x1={x1} x2={x2} y1={y1} y2={y2} stroke={details.color} strokeWidth={width}/>
				<text x={xt} y={yt} textAnchor={textAnchor} fontSize={fs} fill={this.props.labelColor}>{this.props.label}</text>
		</g>;
	}
});

module.exports = Tick;
