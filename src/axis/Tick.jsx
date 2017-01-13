var React = require('react');
var Label = require('./Label.jsx');

var sp = require('../core/space-transf.js');
var imUtils = require('../core/im-utils.js');

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
		return !imUtils.isEqual(props.state,this.props.state);
	},


	// grid
	grid: function(){

		var gprops = this.props.state.grid;

		if(gprops.show === false){
			return null;
		}

		var start = {
			x: sp.toC(this.props.state.tick.ds.x, this.props.state.tick.position.x),
			y: sp.toC(this.props.state.tick.ds.y, this.props.state.tick.position.y)
		};

		var end = {
			x: start.x + this.props.state.tick.dir.x * sp.toCwidth(this.props.state.tick.ds.x,gprops.length),
			y: start.y - this.props.state.tick.dir.y * sp.toCwidth(this.props.state.tick.ds.y,gprops.length)
		};

		var gridName = this.props.className + 'Grid';
		var tickProps = this.props.css ? null : {
			stroke: gprops.color, 
			strokeWidth: gprops.width
		};


		return <line className={gridName} x1={start.x} x2={end.x} y1={start.y} y2={end.y} {...tickProps} />;
	},

	tick: function(){

		var tprops = this.props.state.tick;

		if(tprops.show === false){
			return null;
		}

		var x1 = sp.toC(tprops.ds.x, tprops.position.x) - tprops.dir.x * tprops.length * tprops.out;
		var y1 = sp.toC(tprops.ds.y, tprops.position.y) + tprops.dir.y * tprops.length * tprops.out; // beware about y sign!!
		var x2 = x1 + tprops.dir.x * tprops.length;
		var y2 = y1 - tprops.dir.y * tprops.length; // beware about y sign!!

		var linePar = this.props.css ? null : {
			stroke: tprops.color, 
			strokeWidth: tprops.width
		};

		return <line className={this.props.className} x1={x1} x2={x2} y1={y1} y2={y2} {...linePar}/>;
	},

	label: function(){
		if(this.props.state.label.show === false){
			return null;
		}
		var labelName = this.props.className + 'Label';
		return <Label className={labelName} css={this.props.css} state={this.props.state.label}/>;
	},

	noShow: function(){
		return !( this.props.state.tick.show || this.props.state.grid.show || this.props.state.label.show);
	},

	render: function(){

		return this.noShow() ? null : <g>
				{this.grid()}
				{this.tick()}
				{this.label()}
		</g>;
	}
});

module.exports = Tick;
