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
var Axes = React.createClass({
	getDefaultProps: function(){
		return {
			// per axis
			majorGrid:     {x: false, y: false},
			minorGrid:     {x: false, y: false},
			majorTicks:    {x: true,  y: true},
			minorTicks:    {x: false, y: false},
			stroke:        {x: 'black', y:'black'},
			strokeWidth:   {x: 1, y: 1},
			label:         {x: '', y: ''},
			labelDist:     {x: 20, y: 20},
			labelFSize:    {x: 20, y: 20},
			labelize:      {x: {major: null, minor: null}, y:{major: null, minor: null}},
			barTicksLabel: {x: [], y: []},
			tickProps:     {x: {}, y: {}},
			subTickProps:  {x: {}, y: {}},
			placement:     {x: 'bottom', y:'left'},
			ds:            {x: {}, y: {}}, // see space-mgr for details
			type:          {},
			empty:         true
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
		var xAxeProps = Axe.getDefaultProps(); // we always start fresh
		var yAxeProps = Axe.getDefaultProps(); // we always start fresh
		var prop;
		for (prop in this.props){
			switch(prop){
			case 'empty':
				continue;
			case 'barTicksLabel':
				xAxeProps.ticksLabel = this.props[prop].x; 
				yAxeProps.ticksLabel = this.props[prop].y;
				break;
			default:
				xAxeProps[prop] = this.props[prop].x; 
				yAxeProps[prop] = (prop === 'type')?this.props[prop].y[0]:this.props[prop].y;
				break;
			}
		}
		xAxeProps.origin = origin.x;
		yAxeProps.origin = origin.y;
		xAxeProps.gridLength = gridXlength;
		yAxeProps.gridLength = gridYlength;
		xAxeProps.empty = this.props.empty;
		yAxeProps.empty = this.props.empty;

		xAxeProps.name = this.props.name + "x";
		yAxeProps.name = this.props.name + "y";
		xAxeProps.dir = 0;
		yAxeProps.dir = 90;

		return <g>
				<Axe {...xAxeProps} />
				<Axe {...yAxeProps} />
			</g>;
	}

});

module.exports = Axes;
