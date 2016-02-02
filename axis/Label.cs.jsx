var React = require('react');

var space = require('../core/space-transf.cs.js');
var imUtils = require('../core/im-utils.cs.js');

/*
	{
		ds: {x: , y:},
		position: {x: , y:},
		label: '',
		FSize: ,
		offset: {x, y},
		anchor: '',
		color: '',
		dir: {x, y},
		rotate: true || false,
		transform: true || false
	},
*/

var Label = React.createClass({
	shouldComponentUpdate: function(props){
		return !imUtils.isEqual(props,this.props);
	},

	render: function(){
		if(this.props.label.length === 0){
			return null;
		}

// label
		// => theta = arctan(y/x) [-90,90]

		var xL = ( this.props.transform ? space.toC(this.props.ds.x,this.props.position.x) : this.props.position.x ) + this.props.offset.x;
		var yL = ( this.props.transform ? space.toC(this.props.ds.y,this.props.position.y) : this.props.position.y ) + this.props.offset.y;

		var theta = this.props.rotate ? Math.floor( Math.atan( - Math.sqrt( this.props.dir.y / this.props.dir.x ) ) * 180 / Math.PI ) : 0; // in degrees

		var rotate = 'rotate(' + theta + ' ' + xL + ' ' + yL + ')';

		return <text fill={this.props.color} x={xL} y={yL} transform={rotate} textAnchor={this.props.anchor} fontSize={this.props.FSize}>
			{this.props.label}
		</text>;
	}
});

module.exports = Label;
