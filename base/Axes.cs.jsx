var React = require('react');
var Axe = require('./Axe.cs.jsx');

/*
 * The Axes environment basically just
 * manage the axis' details and pass
 * them to the Axe environment.
 *
 * It contains all the props, it is
 * explicit.
 *
 */
module.exports = React.createClass({
	getDefaultProps: function(){
		return {
			// per axis
			majorGrid: {x:false, y: false},
			minorGrid: {x:false, y: false},
			stroke:    {x:'black', y:'black'},
			strokeWidth: {x: 1, y: 1},
			label: {x:'', y:''},
			labelDist: {x: 20, y: 20},
			labelFSize: {x: 20, y: 20},
			barTicksLabel: {x: [], y: []},
			tickProps: {x:{}, y:{}},
			placement: {x:'bottom', y:'left'},
			ds: {x:{}, y:{}}, // see space-mgr for details
			type: {}
		};
	},
	render: function(){

		var origin = {};
		var ds = this.props.ds;
		switch(this.props.placement.x){
			case 'bottom':
				origin.x = {x:ds.x.c.min, y:ds.y.c.min};
				break;
			case 'top':
				origin.x = {x:ds.x.c.min, y:ds.y.c.max};
				break;
			default:
				throw 'Error in x axis placement';
		}
		switch(this.props.placement.y){
			case 'left':
				origin.y = {x:ds.x.c.min, y:ds.y.c.min};
				break;
			case 'right':
				origin.y = {x:ds.x.c.max, y:ds.y.c.max};
				break;
			default:
				throw 'Error in y axis placement';
		}

		var gridXlength = ds.y.c.max - ds.y.c.min;
		var gridYlength = ds.x.c.max - ds.x.c.min;

		return <g>
				<Axe key='axe x' dir='0' placement={this.props.placement.x} origin={origin.x} {...this.props.tickProps.x}
					majorGrid={this.props.majorGrid.x} minorGrid={this.props.minorGrid.x}
					stroke={this.props.stroke.x} strokeWidth={this.props.strokeWidth.x} label={this.props.label.x} 
					ticksLabel={this.props.barTicksLabel.x} labelDist={this.props.labelDist.x}
					labelFSize={this.props.labelFSize.x} ds={this.props.ds.x} type={this.props.type.x} gridLength={gridXlength}/>
				<Axe key='axe y' dir='90' placement={this.props.placement.y} origin={origin.y} {...this.props.tickProps.y}
					majorGrid={this.props.majorGrid.y} minorGrid={this.props.minorGrid.y}
					stroke={this.props.stroke.y} strokeWidth={this.props.strokeWidth.y} label={this.props.label.y}
					ticksLabel={this.props.barTicksLabel.y} labelDist={this.props.labelDist.y}
					labelFSize={this.props.labelFSize.y} ds={this.props.ds.y} type={this.props.type.y[0]} gridLength={gridYlength}/>
			</g>;
}
});
