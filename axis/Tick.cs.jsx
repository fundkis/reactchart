var React = require('react');
var Label = require('./Label.cs.jsx');

var sp = require('../core/space-transf.cs.js');
var imUtils = require('./core/im-utils.cs.js');

/*
	{
		// long thin grey line
		grid: {
			show: true || false,
			color: '',
			length: ,
			width: 
		},

	// tick
		tick: {
			show: true || false,
			color: '',
			position: {x, y},
			ds: {x, y},
			length: ,
			dir: {x, y},
			width: ,
			out:
		},

	// tick label
		label: Label
	}
*/

var Tick = React.createClass({
	shouldComponentUpdate: function(props){
		return !imUtils.isEqual(props,this.props);
	},


	// grid
	grid: function(){

		var gprops = this.props.grid;

		if(gprops.show === false){
			return null;
		}

		var start = {
			x: sp.toC(this.props.tick.ds.x, this.props.tick.position.x),
			y: sp.toC(this.props.tick.ds.y, this.props.tick.position.y)
		};

		var end = {
			x: start.x + this.props.tick.dir.x * sp.toCwidth(this.props.tick.ds.x,gprops.length),
			y: start.y - this.props.tick.dir.y * sp.toCwidth(this.props.tick.ds.y,gprops.length)
		};

		return <line x1={start.x} x2={end.x} y1={start.y} y2={end.y} 
			stroke={gprops.color} strokeWidth={gprops.width}/>;
	},

	tick: function(){

		var tprops = this.props.tick;

		if(tprops.show === false){
			return null;
		}

		var x1 = sp.toC(tprops.ds.x, tprops.position.x) - tprops.dir.x * tprops.length * tprops.out;
		var y1 = sp.toC(tprops.ds.y, tprops.position.y) + tprops.dir.y * tprops.length * tprops.out; // beware about y sign!!
		var x2 = x1 + tprops.dir.x * tprops.length;
		var y2 = y1 - tprops.dir.y * tprops.length; // beware about y sign!!

		return <g>
			<line x1={x1} x2={x2} y1={y1} y2={y2} stroke={tprops.color} strokeWidth={tprops.width}/>
			<Label {...this.props.label}/>
		</g>;
	},

	noShow: function(){
		return !(this.props.tick.show || this.props.grid.show);
	},

	render: function(){

		return this.noShow() ? null : <g>
				{this.grid()}
				{this.tick()}
		</g>;
	}
});

module.exports = Tick;
